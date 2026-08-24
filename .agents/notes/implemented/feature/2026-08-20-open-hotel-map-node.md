# Agent Note: Open hotel map node

Status: implemented

English | [中文](2026-08-20-open-hotel-map-node.zh.md)

## Problem

Text-only hotel recommendations cannot show spatial relationships or compare every candidate against one destination. A Skill can coordinate calls but cannot add a replayable interactive map, and prose route estimates lose their source status and geometry.

## Decision

`@deepseek-ai/dsh-tool-hotel-map` registers one bounded `hotel_map` tool over configurable Nominatim-, OSRM-, and Transitous-compatible endpoints. The tool accepts known hotel addresses, optionally resolves one destination, and appends one complete `travel-map/show` event only after every provider request settles. Each hotel survives partial failure. Route results distinguish `available`, `unavailable`, and `failed`; public-transport gaps never become claims that no transit exists.

`@deepseek-ai/dsh-client-ui-hotel-map` contributes a keyed Chat Conversation Node. It renders markers, the selected driving or transit geometry, duration, distance, unresolved addresses, and provider attribution from the durable event. Replay performs no geocoding or routing requests. Map tiles remain a browser request because the event does not persist third-party raster data.

The shipped composition selects low-volume public community endpoints, serializes geocoding at a configurable interval, sends an identifying User-Agent, and caches successful coordinates in process memory. Every endpoint is configurable so a deployment can self-host without changing the tool or Skill.

## Alternatives considered

**Paid global APIs.** Google Maps Platform provides stronger integrated coverage but requires credentials and usage billing, which prevents a zero-key distributable Skill.

**A Skill without product code.** Instructions can make an Agent collect addresses and call generic web tools, but they cannot introduce a typed result, durable map event, or browser renderer.

**A generic tool card or Markdown iframe.** Existing cards do not own a map render intent. An iframe would depend on external page state, weaken replay, and provide no typed relationship between hotels and routes.

**Self-hosted OpenTripPlanner as the only transit provider.** It provides stronger deployment control but requires regional OpenStreetMap and GTFS graphs. The provider-compatible configuration keeps self-hosting available without making it the first-use prerequisite.

## Consequences

The feature works without API keys and can be distributed with an open Skill, but community services remain best-effort and their usage policies constrain volume. Transit coverage follows published timetable feeds. The client bundle grows because MapLibre is inlined, and its initial raster tile URL requires a later configuration path before high-volume distribution.

Focused provider tests pin normalization and missing-itinerary behavior. Client Definition coverage pins replay from the complete event. Package README limitations preserve the community-capacity, coverage, cache-lifetime, commerce-data, tile, bundle-size, and offline-map gaps.
