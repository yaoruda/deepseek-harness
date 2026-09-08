---
description: "Package map for travel presentation tools that turn researched places and routes into durable interactive results."
kind: "package-group"
---

# travel/ — interactive travel results

English | [中文](README.zh.md)

## Summary

The travel group turns an already researched set of places into replayable interactive results. Its hotel-map package geocodes known hotel addresses through configurable free providers, optionally compares each hotel with one destination, and stores the complete map payload in the owning Session. It does not search hotel prices, availability, photos, or bookings.

## Table of Contents

- [Packages](#packages)
- [Related documentation](#related-documentation)
- [Dev Note](#dev-note)

-----

<a id="packages"></a>
## Packages

| Package | Role | ctx key |
|---|---|---|
| [`tool-hotel-map/`](tool-hotel-map/README.md) | Builds durable hotel markers and optional driving or transit route comparisons | registers `hotel_map` on `ctx.tools` |

<a id="related-documentation"></a>
## Related documentation

- [Hotel-map browser renderer](../client/ui-hotel-map/README.md) — presents the durable map event without replaying provider requests.
- [Generated tool catalog](../../docs/tool-catalog.md) — records the model-visible tool schema.

<a id="dev-note"></a>
## Dev Note

None.
