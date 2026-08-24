# Agent Note: PWA connection recovery

Status: implemented

English | [中文](2026-08-24-pwa-connection-recovery.zh.md)

## Problem

An iOS Home Screen Web App has no browser refresh control. When WebSocket transport becomes stale after background suspension, the existing automatic retry loop can leave the user without an immediate recovery action. A full reload must also avoid losing the selected Session and an unsent text draft.

## Decision

`dsh-client-connection` exposes its coarse connection state as an observable source and adds `recover()`. Recovery marks the current generation for immediate retirement, aborts either its live streams or active retry delay, and lets the existing owner loop create the replacement generation. It never starts a second loop or a parallel WebSocket pair.

`@deepseek-ai/dsh-client-ui-connection-recovery` contributes one `shell.overlay` entry. Narrow and standalone displays keep a 44-pixel compact recovery target. A retrying connection expands into a localized status notice with an immediate reconnect action; a full page reload appears only after logical recovery remains unavailable for six seconds. Returning to the foreground after at least ten seconds also retires the old generation, covering sockets that survived iOS suspension without reporting closure.

The Web application registers a same-origin Service Worker. It cache-firsts versioned `/assets/` and `/plugins/` resources plus install metadata and icons. Navigations, `/api/` requests, and `/plugins/events` remain network-owned, so no Session response, event stream, or stale HTML application shell enters the cache. The manifest uses standalone display metadata and provides a 180-pixel Apple touch icon.

Reload recovery relies on existing state owners: `dsh.sessions.current` retains the selected Session and `dsh.conversation.chat` retains per-Session unsent text. Runtime-only image drafts remain non-recoverable because their object URLs cannot cross a document replacement.

## Alternatives considered

**Reload every time the app becomes visible.** Rejected because brief app switching would repeatedly replace a healthy document and interrupt active rendering.

**Open an independent recovery WebSocket pair from the UI.** Rejected because it would split stream ownership, duplicate frames, and make teardown races user-triggerable.

**Cache navigations or API responses for offline conversation access.** Rejected because this release is recovery-oriented rather than offline-capable. Cached Session data would introduce a second persistence owner and could display stale authenticated content.

## Consequences

Installed iOS users can recover a stale connection without leaving the app, and a full reload returns to the active Session with an unsent text draft. Static plugin bundles can reopen from the Service Worker cache, while live data always comes from the Host. The application is not an offline agent: sending, history repair, model calls, and tools still require the server. Cache schema changes must rename `dsh-shell-v1`, and runtime-only attachments need a separate durable draft design.
