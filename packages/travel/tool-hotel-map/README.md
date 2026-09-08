---
description: "Free-provider hotel geocoding and route comparison tool with complete durable map events."
kind: "package-reference"
---

# @deepseek-ai/dsh-tool-hotel-map

English | [中文](README.zh.md)

## Summary

Free-provider hotel address maps for an owning Agent session. The plugin registers `hotel_map`, resolves a bounded hotel list, optionally compares every resolved hotel with one destination, and appends one complete `travel-map/show` event after provider work settles.

## Table of Contents

- [Configuration](#configuration)
- [Result and durability](#result-and-durability)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="configuration"></a>

## Configuration

`userAgent` is required and must identify the deployment and a contact URL or address. `geocoderBaseUrl`, `drivingBaseUrl`, and `transitBaseUrl` select Nominatim-, OSRM-, and Transitous MOTIS-compatible services. `requestTimeoutMs`, `geocodeIntervalMs`, and `maxHotels` bound network work. The shipped composition uses low-volume community endpoints; a higher-volume deployment points the same fields at self-hosted services.

<a id="result-and-durability"></a>
## Result and durability

Each hotel remains in the result when geocoding or routing fails. Route status distinguishes a valid itinerary (`available`), no usable itinerary (`unavailable`), and provider failure (`failed`). The event persists markers, route geometry, duration, distance, diagnostics, and attribution so replay performs no provider I/O.

The geocoder runs serially, respects the configured interval, and caches successful coordinates in process memory. Every request carries cancellation, timeout, and the configured User-Agent. Provider credentials and unrestricted raw responses are never persisted.

<a id="model-experience"></a>
## Model Experience

### `hotel_map` tool

#### What the model sees

The model sees a bounded hotel-address map tool with required `hotels` and optional `destination` and `departure_time` fields. Its result reports `mapId`, `resolvedHotels`, `unresolvedHotels`, and `destinationResolved`; the durable map event is client-facing rather than additional model context.

#### Token effect

The tool schema is present while the plugin is active. Each successful call adds one short rendered result to retained tool history.

#### KV Cache effect

The fixed tool schema preserves a reusable prefix. Calls append ordinary tool history without replacing earlier request tokens.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Community service capacity** — public defaults are best-effort, require attribution, and are unsuitable for uncoordinated high-volume use.
- **Open-data coverage** — public transport depends on published schedule feeds; `unavailable` does not prove that no public transport exists.
- **Process-local geocode cache** — restart loses cached coordinates; deployments that need durable deduplication must add a provider-side cache.
- **No hotel commerce data** — the tool accepts known hotels and does not search prices, inventory, availability, photos, or bookings.

<a id="dev-note"></a>
### Dev Note

None.
