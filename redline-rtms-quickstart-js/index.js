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
let clients = new Map(); // streamId -> client
let meetingState = new Map(); // streamId -> { callId, lines: [] }

function toIsoTimestamp(raw) {
  // Heuristic normalization: ns -> µs -> ms
  const n = Number(raw);
  if (!Number.isFinite(n)) return new Date().toISOString();
  if (n > 1e15) return new Date(Math.floor(n / 1e6)).toISOString(); // ns -> ms
  if (n > 1e12) return new Date(Math.floor(n / 1e3)).toISOString(); // µs -> ms
  return new Date(n).toISOString(); // assume ms
}

async function backendRequest(path, method, body) {
  if (!BACKEND_BASE_URL) {
    console.warn("BACKEND_BASE_URL not set; skipping backend POST");
    return null;
  }
  const url = `${BACKEND_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
  };
  if (BACKEND_AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${BACKEND_AUTH_TOKEN}`;
  }
  const res = await fetchFn(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend ${method} ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

async function createCall(payload) {
  // Minimal fields we know exist: transcript (text), summary (text)
  // We'll store basic context in transcript initially.
  const initTranscript = `RTMS started for meeting ${payload.meeting_uuid} (stream ${payload.rtms_stream_id})`;
  const body = {
    transcript: initTranscript,
    summary: null,
    meeting_uuid: payload.meeting_uuid || null,
    rtms_stream_id: payload.rtms_stream_id || null,
    server_urls: Array.isArray(payload.server_urls)
      ? payload.server_urls.join(",")
      : (payload.server_urls || null),
    started_at: new Date().toISOString(),
  };
  // Directus create item endpoint
  return backendRequest(`/items/${CALLS_COLLECTION}`, "POST", body);
}

async function appendTranscript(callId, { timestamp, userName, message }) {
  // Create Transcript item; schema fields: timestamp, username, message
  const body = {
    timestamp: toIsoTimestamp(timestamp),
    username: userName || "unknown",
    message,
    // Link to parent Call via M2O
    call_id: callId || null,
  };
  return backendRequest(`/items/${TRANSCRIPT_COLLECTION}`, "POST", body);
}

async function finalizeCall(callId, lines) {
  const aggregated = lines
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
      console.log(`Received meeting.rtms_stopped event without stream ID`);
      return;
    }

    const client = clients.get(streamId);
    const state = meetingState.get(streamId);
    if (!client) {
      console.log(`Received meeting.rtms_stopped for unknown stream ID: ${streamId}`);
    } else {
      try {
        if (state?.callId && state?.lines?.length) {
          await finalizeCall(state.callId, state.lines);
          console.log(`Finalized call ${state.callId} with ${state.lines.length} transcript lines`);
        }
      } catch (e) {
        console.error("Failed to finalize call:", e.message);
      }

      client.leave();
    }

    clients.delete(streamId);
    meetingState.delete(streamId);
    return;
  }

  if (event !== "meeting.rtms_started") {
    console.log(`Ignoring unknown event: ${event}`);
    return;
  }

  // Create a new RTMS client for the stream
  const client = new rtms.Client();
  clients.set(streamId, client);

  // Create Calls record in backend
  try {
    const created = await createCall(payload);
    const callId = created?.data?.id || created?.id || created?.data || null;
    meetingState.set(streamId, { callId, lines: [] });
    console.log(`Created call record: ${callId ?? "<none>"}`);
  } catch (e) {
    meetingState.set(streamId, { callId: null, lines: [] });
    console.warn("Could not create call record:", e.message);
  }

  client.onTranscriptData(async (data, size, timestamp, metadata) => {
    const message = typeof data === "string" ? data : Buffer.from(data).toString("utf8");
    const userName = metadata?.userName || "unknown";
    console.log(`[${timestamp}] -- ${userName}: ${message}`);

    // Update in-memory lines
    const state = meetingState.get(streamId);
    if (state) state.lines.push({ timestamp, userName, message });

  // POST Transcript row to backend (fire-and-forget)
    try {
      await appendTranscript(state?.callId, { timestamp, userName, message });
    } catch (e) {
      console.warn("Failed to append transcript:", e.message);
    }
  });

  // Join the meeting using the webhook payload directly
  client.join(payload);
});
