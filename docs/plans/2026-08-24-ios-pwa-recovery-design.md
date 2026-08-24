# iOS PWA recovery design

## Outcome

The installed Web application gives a person an explicit recovery path when iOS suspends or strands its live connection. Recovery keeps the selected Session and unsent text draft, reconnects without resending input, and escalates to a full reload when a fresh connection generation cannot settle.

The first release does not run agent work offline, cache API responses or Session history, or keep JavaScript executing after iOS terminates the Web application.

## Connection recovery

The connection service publishes its current `connecting`, `connected`, or `reconnecting` state and exposes one operation that retires the current WebSocket generation. The normal connection controller remains the only owner of the two downstream streams and their resynchronization. A recovery request never creates a second controller, sends a prompt, cancels a turn, or mutates Session history.

A root-scoped Client Plugin contributes a compact recovery control to `shell.overlay`. The control is always reachable in standalone display mode and appears with status text whenever the connection is not ready. Its first action requests a fresh connection generation. If the connection remains unavailable for a bounded interval, the control offers a full page reload. Returning from the background requests a fresh generation after a non-trivial hidden interval; a brief notification shade or app-switcher visit does not churn the connection.

The Session runtime already persists the current Session selection, and the conversation store already persists text drafts per Session. Reload recovery uses those owners rather than adding a second persistence format. Runtime-only image drafts remain excluded because browser `File` objects and object URLs cannot be restored safely.

## Application shell cache

The Web build ships a Service Worker and registers it after the application starts. The worker caches versioned frontend assets, plugin bundles with revisioned URLs, the manifest, and icons. Navigation and every `/api` request remain network-only, so authentication, Session history, model responses, and connection state never come from the cache.

Activating a new worker removes cache generations it does not own. A failed cache write does not block installation or application startup. The recovery control reloads through the normal network navigation path and therefore reaches the current authenticated deployment instead of serving cached HTML.

## Mobile presentation

The recovery control respects the iOS safe area, uses a touch target of at least 44 CSS pixels, and does not cover the composer. Its connected form is a small icon button; reconnecting and reload-required forms expand into labeled status bars. The component uses the existing theme tokens and provides Chinese and English copy through the locale service.

## Verification

Connection tests prove an explicit recovery retires one generation and reaches a newly connected generation without starting a second loop. Client tests cover the connected, reconnecting, foreground-recovery, timeout, and reload states. Web build tests verify the manifest, Service Worker, registration, and network-only exclusions. An assembled browser fixture verifies that a forced stream loss shows recovery UI, reconnects, retains the selected Session and draft, and remains usable at an iPhone viewport.
