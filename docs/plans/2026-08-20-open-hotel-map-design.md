# Open hotel map design

English | [中文](2026-08-20-open-hotel-map-design.zh.md)

## Outcome

One model tool turns hotel names and addresses into a durable map result. The Web client plots every resolved hotel and, when the caller supplies one destination, shows free driving and public-transport estimates from each hotel. Missing transit coverage does not remove hotel markers or driving results.

The first release does not search hotel inventory, quote prices, show availability, or book rooms.

## Components

The Host package owns one `hotel_map` tool and its durable event. The tool accepts a destination and a bounded hotel list, resolves missing coordinates through a configured geocoder, requests driving and transit routes through configured providers, and appends one complete `travel-map/show` event after all work settles. Its canonical result reports each input as resolved or unresolved and distinguishes unavailable transit coverage from provider failure.

The Web client package folds each `travel-map/show` event into one keyed Chat node. It renders OpenStreetMap-compatible tiles through MapLibre, numbered hotel markers, an optional destination marker, selectable driving or transit route geometry, and a compact result list. The renderer performs no network I/O during replay; route geometry, durations, distances, provider attribution, and status are durable event fields.

Provider base URLs are deployment configuration rather than constants hidden in execution. The defaults target low-volume community services: Nominatim-compatible geocoding, OSRM-compatible driving routes, and Transitous MOTIS public-transport routing. A deployment may point each interface at a self-hosted service without changing the tool or Skill.

## Data flow and limits

The tool trims and validates every address before network access, rejects an empty hotel list, and caps the list at a configured maximum. Geocoding runs serially at the configured interval and caches successful address results in process memory. Requests identify the application, carry cancellation and timeouts, and never expose provider responses directly to the model or client.

The destination is geocoded once when it lacks coordinates. Each resolved hotel is preserved even when either route provider fails. Driving and transit outcomes use explicit statuses: `available`, `unavailable`, or `failed`. `unavailable` means the provider returned no usable itinerary; `failed` means the request did not complete successfully. User-facing copy does not claim that a route is absent when only the provider failed.

All map data required for session replay is appended as one bounded event. The event records attribution strings and source URLs so the client can meet provider and OpenStreetMap attribution requirements. It does not persist provider credentials or unrestricted raw responses.

## User experience

The node initially fits all markers. Selecting a hotel highlights its marker and list row. When route data exists, the user can switch between driving and transit and see the selected route with its duration and distance. On narrow screens the map sits above the list; on wide screens the list and map share a row. Keyboard users can select every hotel without interacting with the map canvas.

Unresolved addresses remain visible in a separate list with their diagnostic. No transit coverage produces a neutral unavailable state. A total provider outage leaves a replayable result containing the original hotel names and addresses plus failures, rather than silently omitting the map request.

## Verification

Host unit tests cover schema limits, serial geocoding, caching, cancellation, provider response normalization, partial success, and event append timing. A real Loader composition test mounts the plugin with local HTTP fixtures and verifies the model-visible result and durable event.

Client tests replay a complete event, verify marker/list selection and route-mode fallback, and prove plugin disposal removes the Definition and renderer. A Web snapshot or end-to-end fixture verifies the assembled node on desktop and mobile widths. A bounded smoke test against the configured free public endpoints validates current integration without treating community uptime as a deterministic repository test.

## Distribution

The feature ships as opt-in Host and Client plugins plus a Skill that describes when and how to call `hotel_map`. The Skill does not contain API keys. Its installation documentation states the public-service limits, attribution requirements, configurable endpoints, and self-hosting path.
