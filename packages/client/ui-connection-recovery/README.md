# @deepseek-ai/dsh-client-ui-connection-recovery

English | [中文](README.zh.md)

Frame-wide recovery UI for narrow browsers and installed web apps. It observes the shared connection controller, expands into a reconnect notice on transport loss, and reveals a full-page reload only after logical recovery remains unavailable. Narrow and standalone displays retain a compact 44 px recovery target while connected.

Returning from a background interval retires the existing connection generation before reconnecting. The controller remains the only owner of the two transport streams, so repeated taps cannot create parallel WebSocket pairs. A full reload restores the selected session and text draft from their existing runtime-owned browser stores; runtime-only image drafts cannot survive document replacement.

The package stores no session or message content. It registers one `shell.overlay` entry and removes both the slot entry and document lifecycle listener with its Cordis fiber.

## Model Experience

None, as the browser-side recovery UI changes no model request, tool schema, prompt, or Session event.

#### KV Cache effect

None. Reconnecting resynchronizes the existing Session without resending a user message or starting a new turn.

## Known Limitations and Deferred Work

- The Service Worker does not make agent work, history, tools, or model calls available offline.
- A full reload preserves text drafts but cannot preserve runtime-only image attachments.
- iOS can still terminate the Web App process; recovery begins only after the application is opened again.
- Cache format changes require a new Service Worker cache name.
