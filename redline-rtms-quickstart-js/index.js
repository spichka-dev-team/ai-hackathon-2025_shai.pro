// Load environment variables from .env (works under PM2 as well)
import "dotenv/config";
// Import the RTMS SDK
import rtms from "@zoom/rtms";

// Use global fetch (Node 18+) or fallback to node-fetch
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  const { default: nodeFetch } = await import("node-fetch");
  fetchFn = nodeFetch;
}

// Environment configuration
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "");
const BACKEND_AUTH_TOKEN = process.env.BACKEND_AUTH_TOKEN;
const CALLS_COLLECTION = process.env.CALLS_COLLECTION || "Calls";
const TRANSCRIPT_COLLECTION = process.env.TRANSCRIPT_COLLECTION || "Transcripts";

// In-memory meeting state
const clients = new Map(); // streamId -> client
// meetingState value shape:
// {
//   callId: string|null,
//   lines: Array<{timestamp:any,userName:string,message:string}>,
//   payload: any,                 // original webhook payload for retries
//   flushedCount: number,         // number of lines already posted to backend
//   createInFlight: boolean,      // prevent duplicate create attempts
// }
const meetingState = new Map();

function toIsoTimestamp(raw) {
  // Heuristic normalization: ns -> µs -> ms
  const n = Number(raw);
  if (!Number.isFinite(n)) return new Date().toISOString();
  if (n > 1e15) return new Date(Math.floor(n / 1e6)).toISOString(); // ns -> ms
  if (n > 1e12) return new Date(Math.floor(n / 1e3)).toISOString(); // µs -> ms
  return new Date(n).toISOString(); // assume ms
}

function makeHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (BACKEND_AUTH_TOKEN) headers["Authorization"] = `Bearer ${BACKEND_AUTH_TOKEN}`;
  return headers;
}

async function backendRequest(path, method, body) {
  if (!BACKEND_BASE_URL) {
  console.error("[backend] BACKEND_BASE_URL not set; cannot call", method, path);
  throw new Error("BACKEND_BASE_URL not set");
  }
  const url = `${BACKEND_BASE_URL}${path}`;
  const res = await fetchFn(url, {
    method,
    headers: makeHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[backend] ${method} ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
  const ctype = res.headers.get("content-type") || "";
  return ctype.includes("application/json") ? res.json() : res.text();
}

async function createCall(payload) {
  const body = {
    meeting_uuid: payload.meeting_uuid || null,
    rtms_stream_id: payload.rtms_stream_id || null,
    server_urls: Array.isArray(payload.server_urls)
      ? payload.server_urls.join(",")
      : payload.server_urls || null,
    started_at: new Date().toISOString(),
  };
  return backendRequest(`/items/${CALLS_COLLECTION}`, "POST", body);
}

async function ensureCall(streamId) {
  const state = meetingState.get(streamId);
  if (!state) return null;
  if (state.callId) return state.callId;
  if (state.createInFlight) return null;
  state.createInFlight = true;
  try {
    const created = await createCall(state.payload || {});
    const callId = created?.data?.id || created?.id || created?.data || null;
    state.callId = callId;
    console.log(`[backend] Calls POST success (retry): id=${callId ?? "<none>"}`);
    // Try flushing any buffered lines now that call exists
    await flushBufferedTranscripts(streamId);
    return callId;
  } catch (e) {
    console.warn("[backend] retry create call failed:", e.message);
    return null;
  } finally {
    state.createInFlight = false;
  }
}

async function flushBufferedTranscripts(streamId) {
  const state = meetingState.get(streamId);
  if (!state?.callId) return;
  const start = state.flushedCount || 0;
  for (let i = start; i < state.lines.length; i++) {
    const { timestamp, userName, message } = state.lines[i];
    try {
      await appendTranscript(state.callId, { timestamp, userName, message });
      state.flushedCount = i + 1;
    } catch (e) {
      console.warn("[backend] flush transcript failed:", e.message);
      break; // stop on first failure to avoid tight loop
    }
  }
}

async function appendTranscript(callId, { timestamp, userName, message }) {
  if (!callId) {
    console.warn("[backend] skip transcript append: missing callId");
    return null;
  }
  const body = {
    timestamp: toIsoTimestamp(timestamp),
    username: userName || "unknown",
    message,
    call_id: callId,
  };
  const resp = await backendRequest(`/items/${TRANSCRIPT_COLLECTION}`, "POST", body);
  const trId = resp?.data?.id || resp?.id || resp?.data || null;
  console.log(`[backend] Transcripts POST success: id=${trId ?? "<none>"} call_id=${callId}`);
  return resp;
}

async function finalizeCall(callId, lines) {
  if (!callId) return null;
  const aggregated = (Array.isArray(lines) ? lines : [])
    .map((l) => `[${toIsoTimestamp(l.timestamp)}] -- ${l.userName}: ${l.message}`)
    .join("\n");
  const body = {
    transcript: aggregated,
    ended_at: new Date().toISOString(),
  };
  return backendRequest(`/items/${CALLS_COLLECTION}/${callId}`, "PATCH", body);
}

// Set up webhook event handler to receive RTMS events from Zoom
rtms.onWebhookEvent(async ({ event, payload }) => {
  const streamId = payload?.rtms_stream_id;

  if (event === "meeting.rtms_stopped") {
    if (!streamId) {
      console.log(`[rtms] meeting.rtms_stopped without stream ID`);
      return;
    }

    const client = clients.get(streamId);
    const state = meetingState.get(streamId);
    if (!client) {
      console.log(`[rtms] meeting.rtms_stopped for unknown stream: ${streamId}`);
    } else {
      try {
        // Ensure call exists and flush any pending transcripts before finalizing
        if (!state?.callId) {
          await ensureCall(streamId);
        }
        if (state?.callId) {
          await flushBufferedTranscripts(streamId);
          const lines = Array.isArray(state.lines) ? state.lines : [];
          await finalizeCall(state.callId, lines);
          console.log(`[backend] finalized call ${state.callId} (${lines.length} lines)`);
        } else {
          console.warn("[backend] cannot finalize: callId still missing");
        }
      } catch (e) {
        console.error("[backend] finalize error:", e.message);
      }
      client.leave();
    }

    clients.delete(streamId);
    meetingState.delete(streamId);
    return;
  }

  if (event !== "meeting.rtms_started") {
    console.log(`[rtms] ignoring event: ${event}`);
    return;
  }

  // Create a new RTMS client for the stream
  const client = new rtms.Client();
  clients.set(streamId, client);

  // Create Calls record in backend
  try {
    const created = await createCall(payload);
    const callId = created?.data?.id || created?.id || created?.data || null;
    meetingState.set(streamId, {
      callId,
      lines: [],
      payload,
      flushedCount: 0,
      createInFlight: false,
    });
  console.log(`[backend] Calls POST success: id=${callId ?? "<none>"}`);
  } catch (e) {
    meetingState.set(streamId, {
      callId: null,
      lines: [],
      payload,
      flushedCount: 0,
      createInFlight: false,
    });
    console.warn("[backend] create call failed:", e.message);
  }

  client.onTranscriptData(async (data, size, timestamp, metadata) => {
    const message = typeof data === "string" ? data : Buffer.from(data).toString("utf8");
    const userName = metadata?.userName || "unknown";
    console.log(`[${timestamp}] -- ${userName}: ${message}`);

    // Update in-memory lines
    const state = meetingState.get(streamId);
    if (state) state.lines.push({ timestamp, userName, message });

    // POST Transcript row or buffer + retry create if needed
    if (!state?.callId) {
      // Attempt to create the call (retry) and flush buffer
      await ensureCall(streamId);
      await flushBufferedTranscripts(streamId);
    } else {
      try {
        await appendTranscript(state.callId, { timestamp, userName, message });
        state.flushedCount = (state.flushedCount || 0) + 1;
      } catch (e) {
        console.warn("[backend] append transcript failed:", e.message);
      }
    }
  });

  // Join the meeting using the webhook payload directly
  client.join(payload);
});
