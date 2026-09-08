---
description: "Replayable MapLibre presentation for durable hotel markers, route geometry, travel times, and provider attribution."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-hotel-map

English | [中文](README.zh.md)

## Summary

Browser renderer for durable `travel-map/show` events. The plugin registers one `hotel-map` Chat Conversation Node and renders its complete payload through MapLibre without replay-time provider requests.

## Table of Contents

- [Presentation](#presentation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="presentation"></a>

## Presentation

The responsive node shows numbered hotel markers, an optional destination marker, a selectable driving or transit route, duration and distance, unresolved addresses, and provider attribution. Wide layouts place the list beside the map; narrow layouts place the map above a touch-friendly list. List selection remains available to keyboard users who cannot operate the map canvas.

The browser requests OpenStreetMap raster tiles for the visible viewport. Coordinates and routes come only from the durable event. Unloading the client plugin removes its Conversation Definition, renderer, dictionaries, and injected CSS.

<a id="model-experience"></a>
## Model Experience

### Durable map node

#### What the model sees

The renderer adds no model-visible content. `@deepseek-ai/dsh-tool-hotel-map` owns the `hotel_map` tool and durable event.

#### Token effect

Zero direct token effect; the owning Host tool contributes the schema and result text.

#### KV Cache effect

The browser-only renderer has no direct token or KV-cache effect.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Raster tile endpoint is fixed** — the initial renderer uses the OpenStreetMap public tile endpoint; a publishable high-volume deployment needs a configurable or self-hosted tile source.
- **MapLibre bundle size** — the client plugin inlines MapLibre so it adds about 1.5 MB before transfer compression when enabled.
- **No offline tiles** — replay avoids geocoding and routing requests but still needs tile access to draw the basemap.

<a id="dev-note"></a>
### Dev Note

None.
