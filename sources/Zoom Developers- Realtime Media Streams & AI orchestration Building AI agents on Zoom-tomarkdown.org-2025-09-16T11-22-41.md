Realtime Media Streams & AI orchestration: Building AI agents on Zoom

\===============

[Now available: Realtime Media Streams, a pipeline to audio, video, and transcript data](https://developers.zoom.us/docs/rtms/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)

*   Docs
    
*   APIs
    
*   Blog
    
*   Changelog
    
*   Search
    
*   Help
    
*   Globe
    

[Developer Blog](https://developers.zoom.us/blog/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)

RTMS Tutorial AI Getting started

# Realtime Media Streams & AI orchestration: Building AI agents on Zoom

![Image 1](https://developers.zoom.us/img/blog/ojussave/nextImageExportOptimizer/avatar-opt-1920.WEBP)

Ojus Save

June 26, 2025 · 5 min read

![Image 2](https://developers.zoom.us/img/blog/ojussave/realtime/nextImageExportOptimizer/rtms-orchestration-opt-1920.WEBP)

We recently released **[Realtime Media Streams (RTMS)](https://developers.zoom.us/docs/rtms/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)** at [Zoom Developer Summit 2025](https://www.youtube.com/watch?v=Q0DpdqCHEf8). Purpose built for AI developers, RTMS allows you to receive real-time audio, video, and transcript data from a Zoom meeting through WebSockets. This unlocks immense possibilities for AI-driven applications that can move beyond basic integration towards dynamic agents that can listen, interpret, and respond instantly as conversations unfold.

In this blog, I will show how you can use RTMS to pipe live data from Zoom Meetings into AI orchestration frameworks. We'll walk through practical design patterns for building powerful, real-time AI agents, enabling use cases like instant summarization, automated task extraction, and conversational assistants.

## [Use cases for realtime media](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#use-cases-for-realtime-media)

Before diving into the technical details, let's imagine what this enables:

*   **Sales Teams:** Imagine an AI agent that listens to your sales calls, automatically identifies when prospects raise objections, and instantly suggests proven responses in your CRM. No more scrambling through notes after the call.
*   **Customer Support:** An AI that processes support calls in real-time, automatically creates tickets, schedules follow-ups, and even suggests knowledge base articles to agents mid-conversation.
*   **Executive Meetings:** An assistant that tracks action items as they're discussed, assigns them to the right people, and sends automated follow-ups before the meeting even ends.

## [What is "AI orchestration"?](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#what-is-ai-orchestration)

Orchestration frameworks are responsible for:

*   **Managing context:** Keeping track of what's been said so far.
*   **Making decisions:** Choosing when and how to respond or act.
*   **Calling tools or APIs:** Calling APIs, updating databases, sending chat messages/mails, or triggering workflows.
*   **Interfacing with LLMs:** Structuring prompts, routing inputs, managing outputs.
*   **Maintaining memory:** Short-term (last few utterances) or long-term (vector stores, RAG).

Without orchestration, your agent is just a raw LLM stuck in a loop of disconnected prompts. With it, you get structure, flow, and reasoning.

So why do you need AI orchestration? RTMS gives you the raw data feed from the meeting: live transcripts, audio, and video. But raw data isn't intelligence. To transform real-time meeting streams into something useful, you need an orchestration layer.

## [Workflow for AI orchestration and realtime data](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#workflow-for-ai-orchestration-and-realtime-data)

The core idea of what we are building is very simple:

1.  [Receive](https://developers.zoom.us/docs/rtms/notifications/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) Zoom RTMS events via a webhook.
2.  [Establish](https://developers.zoom.us/docs/rtms/signal-connection/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) a WebSocket connection to Zoom's media servers.
3.  [Stream](https://developers.zoom.us/docs/rtms/receive-media-streams/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) real-time media (audio, video, transcript, or all) data directly into your AI orchestration layer.
4.  Process incoming data with your chosen AI orchestration framework to deliver real-time insights.

You can use any orchestration stack that fits your workflow. For example: You can use **[Langflow](https://langflow.org/)** to visually map out logic, or **[LlamaIndex](https://www.llamaindex.ai/)** when you need structured document indexing or want to augment live transcripts with external knowledge, or **[LangChain](https://www.langchain.com/)** for fine-grained control. Whichever orchestration stack you choose, the pipeline is the same: real-time data in, orchestration logic out.

Here is what AI orchestration looks like in practice. We will use python to demonstrate.

### [1\. Build webhook and WebSocket connections](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#1-build-webhook-and-websocket-connections)

Your backend needs two key things set up first:

*   A webhook to handle Zoom RTMS events.
*   Two WebSocket clients to connect to Zoom's signaling handshake and media stream.

Zoom sends an event, [`meeting.rtms_started`](https://developers.zoom.us/docs/rtms/notifications/#meetingrtms_started), whenever an RTMS session starts in a meeting. Your handler then initiates a secure WebSocket connection back to Zoom's infrastructure.

**Webhook handler:**

python

```python
@app.post("/webhook")
async def webhook(request: Request):
    body = await request.json()
    event = body.get("event")
    payload = body.get("payload", {})

    # Zoom URL validation challenge (security handshake)
    if event == "endpoint.url_validation":
        # Respond securely
        pass

    # RTMS session starts
    if event == "meeting.rtms_started":
        meeting_uuid = payload.get("meeting_uuid")
        rtms_stream_id = payload.get("rtms_stream_id")
        server_urls = payload.get("server_urls")
        # Start WebSocket connection asynchronously
        asyncio.create_task(handle_signaling_connection(meeting_uuid, rtms_stream_id, server_urls))

    # RTMS session stops
    if event == "meeting.rtms_stopped":
        # Close active connections cleanly
        pass

    return {"status": "ok"}
```

### [2\. Connecting to Zoom's media servers](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#2-connecting-to-zooms-media-servers)

Establishing the WebSocket handshake securely looks like this:

python

```python
async with websockets.connect(server_url, ssl=ssl_context) as ws:
    handshake_payload = {
        "msg_type": 1,
        "protocol_version": 1,
        "meeting_uuid": meeting_uuid,
        "rtms_stream_id": stream_id,
        "signature": generate_signature(...)
    }
    await ws.send(json.dumps(handshake_payload))

    # Listen and respond to messages (keep-alives, stream state updates)
```

Once connected, Zoom streams data continuously through this secure channel. Your application now receives real-time audio, video, or transcripts.

### [3\. Routing RTMS data into your AI orchestration layer](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#3-routing-rtms-data-into-your-ai-orchestration-layer)

Each time new transcript data arrives, pass it to your AI orchestration framework:

python

```python
# Inside WebSocket listener loop
if msg["msg_type"] == 17:  # MEDIA_DATA_TRANSCRIPT
    transcript_text = msg["content"]["data"]
    transcript_processor.process_new_transcript_chunk(transcript_text)
```

The `transcript_processor` is your gateway to AI logic. It takes transcript chunks, adds context, and extracts insights instantly using your chosen orchestration tool.

Once RTMS delivers the transcript chunk, your orchestration layer takes over:

python

```python
# Simplified agent interface
context_window.append(transcript_chunk)
merged_context = " ".join(context_window)
response = orchestration_chain.invoke({"transcript_chunk": merged_context})
```

You can wire this orchestration layer however you want. Under the hood, you're still calling an LLM. We are using Anthropic Claude, but you can plug in any model that supports chat-style input.

#### [Example with Claude, Anthropic, and LlamaIndex](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#example-with-claude-anthropic-and-llamaindex)

python

```python
from llama_index.llms.anthropic import Anthropic

llm = Anthropic(model="claude-3-sonnet-20240229", api_key=os.getenv("ANTHROPIC_API_KEY"))
response = await llm.acomplete("Summarize this transcript chunk:\n" + merged_context)
```

And viola! Now you've got a working setup: All you need to do is start a Zoom meeting and Zoom will send live meeting data through RTMS, your backend catches it, connects over WebSockets, and pipes it straight into your AI logic as shown here.

![Image 3: Example of real-time AI orchestration with Zoom RTMS](https://developers.zoom.us/img/blog/ojussave/realtime/nextImageExportOptimizer/example-opt-2048.WEBP) The combination of Zoom's [Realtime Media Streams](https://developers.zoom.us/docs/rtms/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) and modern AI orchestration frameworks opens up a world of possibilities for creating intelligent, responsive applications that can transform how we interact with meeting data. Start small, experiment with different use cases, and gradually build more sophisticated agents as you learn what works best for your specific needs. And with [Zoom Apps](https://developers.zoom.us/docs/zoom-apps/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274), you can even bring your own custom [UI and interactive experiences directly into Zoom Meetings](https://success.zoom.us/clips/share/2wGiPZfhTTeYoZ5aZBy1ug?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274), enabling seamless collaboration and engagement right where your users are.

The future of meetings is here, and it's intelligent, responsive, and real-time.

**What have you decided to build?**

## [Resources to get started](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#resources-to-get-started)

### Get access to Realtime Media Streams

Start building agents with video, audio, and transcripts.

[Sign up](https://www.zoom.com/en/realtime-media-streams/#form)

To help you get started building your own real-time AI agents with RTMS, here are some valuable resources:

### [LlamaIndex integration](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#llamaindex-integration)

Check out [Tuana Çelik](https://www.linkedin.com/in/tuanacelik/)'s blog post [Create a Meeting Notetaker Agent for Notion with LlamaIndex and Zoom RTMS](https://www.llamaindex.ai/blog/create-a-meeting-notetaker-agent-for-notion-with-llamaindex-and-zoom-rtms) ([GitHub repository](https://github.com/TuanaCelik/llama_index_zoom_assistant/tree/main)) from LlamaIndex.

### [Langflow integration](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#langflow-integration)

Explore the [Zoom RTMS Langflow sample implementation](https://github.com/melienherrera/zoom_rtms_langflow_sample) by [Melissa Herrera](https://www.linkedin.com/in/herrera-melissa/) for a complete visual workflow example.

### [Langchain integration](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/#langchain-integration)

Here is a LangChain example [Real-Time Meeting Transcript Processor with Action Item Extraction](https://github.com/ojusave/zoom_rtms_langchain_sample) by me, [Ojus Save](https://www.linkedin.com/in/ojus/).

Visit the [Zoom Developer Forum](https://devforum.zoom.us/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) to discuss with Developer Advocates and community developers. For prioritized assistance, take advantage of [Premier Developer Support plans](https://explore.zoom.us/en/support-plans/developer/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274).

[](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F&ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)[](https://www.twitter.com/intent/tweet?&url=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F&text=Realtime%20Media%20Streams%20%26%20AI%20orchestration%3A%20Building%20AI%20agents%20on%20Zoom&ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)[](https://www.linkedin.com/shareArticle?url=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F&title=Realtime%20Media%20Streams%20%26%20AI%20orchestration%3A%20Building%20AI%20agents%20on%20Zoom&mini=true&ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)[](mailto:?subject=Realtime%20Media%20Streams%20%26%20AI%20orchestration%3A%20Building%20AI%20agents%20on%20Zoom&body=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F&ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)

[GitHub](https://github.com/zoom)

[Youtube](https://www.youtube.com/@ZoomDevelopers)

[Developer Forum](https://devforum.zoom.us/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)

[Help](https://developers.zoom.us/support/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)

Copyright ©2025 Zoom Communications, Inc. All rights reserved.

[Terms](https://zoom.us/terms?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) · [Privacy Policy](https://zoom.us/privacy?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) · [API Terms of Use](https://explore.zoom.us/docs/en-us/zoom_api_license_and_tou.html?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) · [Marketplace Developer Agreement](https://explore.zoom.us/en/marketplace-developer-agreement/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274) · [Do Not Sell My Personal Information](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/) · [Cookies Settings](https://developers.zoom.us/blog/realtime-media-streams-ai-orchestration/)

![Image 6](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate

{{language}}

![Image 7](https://t.co/1/i/adsct?bci=4&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%264%2624%26800%26600%260%26na&eci=3&event=%7B%7D&event_id=5af9c76a-7825-45fa-a66f-afa8bdd157e4&integration=gtm&p_id=Twitter&p_user_id=0&pl_id=9c292799-7a4d-41c4-ab8b-57a015fdebbe&pt=Realtime%20Media%20Streams%20%26%20AI%20orchestration%3A%20Building%20AI%20agents%20on%20Zoom&tw_document_href=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F%235oqfisv3si&tw_iframe_status=0&txn_id=o5np0&type=javascript&version=2.3.34)![Image 8](https://analytics.twitter.com/1/i/adsct?bci=4&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%264%2624%26800%26600%260%26na&eci=3&event=%7B%7D&event_id=5af9c76a-7825-45fa-a66f-afa8bdd157e4&integration=gtm&p_id=Twitter&p_user_id=0&pl_id=9c292799-7a4d-41c4-ab8b-57a015fdebbe&pt=Realtime%20Media%20Streams%20%26%20AI%20orchestration%3A%20Building%20AI%20agents%20on%20Zoom&tw_document_href=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F%235oqfisv3si&tw_iframe_status=0&txn_id=o5np0&type=javascript&version=2.3.34)![Image 9](https://id.rlcdn.com/464526.gif)

### Cookie Preference Center

Cookies and other similar technologies (“Cookies”) are important to the proper functioning of a site and to provide visitors with a seamless and customized experience. Zoom uses Cookies to enable you to use our site. We also use cookies to enable you to personalize your use of our site, to provide you enhanced functionality and to continuously improve the performance of our site. If you have Targeting cookies enabled below and depending on your account type or login state, we may allow third-party advertisers to show you advertising relevant to you on our website or products, using their Cookies on our site.

You can accept or decline all but Strictly Necessary Cookies, or customize your cookie settings below. You can change your cookie settings at any time. Some Strictly Necessary Cookies may transfer personal data to the United States. To learn more about how Zoom processes personal data, please visit our [privacy statement](https://explore.zoom.us/en/privacy/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274).

For California Residents, you may exercise your right to “Opt-Out of the Sale/Sharing of Personal Information” by toggling the button labeled “Targeting” below to off.

[More information](https://explore.zoom.us/en/cookie-policy/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274)

Accept All Cookies

### Manage Consent Preferences

#### Targeting Cookies

*   [x]  Targeting Cookies

These cookies may be set through our site by our advertising partners. They may be used by those companies to track your usage of our website and, depending on their policies, may combine that information with other information to show you relevant advertisements on our site and other sites. If you do not allow these cookies, you will not see personalized advertising on Zoom’s website or products.

Cookies Details‎

#### Functional Cookies

*   [x]  Functional Cookies

These cookies enable the website to provide enhanced functionality and customization. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies then some or all of these services may not function properly.

Cookies Details‎

#### Performance Cookies

*   [x]  Performance Cookies

These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.

Cookies Details‎

#### Strictly Necessary Cookies

Always Active

These cookies are strictly necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work.

Cookies Details‎

### Performance Cookies

Vendor Search

Clear

*   [x]  checkbox label label

Apply Cancel

Consent Leg.Interest

*    checkbox label label
    
*    checkbox label label
    
*    checkbox label label
    

*   #### View Cookies
    
    *   Name cookie name

Confirm My Choices

[](https://www.onetrust.com/products/cookie-consent/)

Zoom uses cookies and similar technologies as described in our [cookie statement](https://explore.zoom.us/en/cookie-policy/?ampDeviceId=85a4da38-6131-4b48-8b85-88df09a5740b&ampSessionId=1758021731274). You can manage your cookie settings or exercise your rights related to cookies through our Cookies Settings.

Cookies Settings

![Image 10](https://bat.bing.com/action/0?ti=5901490&Ver=2&mid=0d0147f8-923c-4d27-9a50-9e65e8b9c11a&bo=1&sid=630b36a092ef11f084bab11bdfd7e596&vid=630bb07092ef11f0a7de01349afc3aff&vids=1&msclkid=N&pi=918639831&lg=en-US&sw=800&sh=600&sc=24&tl=Realtime%20Media%20Streams%20%26%20AI%20orchestration%3A%20Building%20AI%20agents%20on%20Zoom&kw=zoom,%20marketplace.zoom.us,%20api,%20sdk,%20jwt,%20oauth,%20rest,%20develop,%20developer,%20zoom%20developer,%20video%20conferencing,%20video%20conference,%20online%20meetings,%20web%20meeting,%20video%20meeting,%20cloud%20meeting,%20cloud%20video,%20group%20video%20call,%20group%20video%20chat,%20screen%20share,%20application%20share&p=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F%235oqfisv3si&r=https%3A%2F%2Fdevelopers.zoom.us%2Fblog%2Frealtime-media-streams-ai-orchestration%2F&lt=520&evt=pageLoad&sv=2&cdb=AQER&rn=559126)