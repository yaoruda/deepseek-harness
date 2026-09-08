---
name: hotel-map
description: Plot known hotel addresses and optionally compare free driving and public-transport routes to one destination.
whenToUse: Use after hotel candidates and their complete addresses are known, when a map or destination travel comparison would help the user decide.
---

# Hotel map

Use `hotel_map` only after collecting the hotel names and complete addresses from reliable sources. This Skill does not search hotel inventory, prices, or availability.

Pass every candidate in one call so the map can fit and compare the complete set. Include coordinates when a reliable source already supplied them; otherwise let the configured geocoder resolve the address. Do not invent coordinates.

Add `destination` only when the user names a comparison point such as a station, airport, office, or attraction. Use an ISO 8601 `departure_time` relevant to the user's trip when public-transport timing matters. If the date or time is unknown, omit it and describe transit results as an execution-time estimate.

Treat `unavailable` transit as missing open coverage, not proof that no public transport exists. Treat a failed provider request as unknown. Preserve unresolved hotels in the written comparison and ask for a more complete address when necessary.

After the tool returns, summarize the most decision-relevant differences. The interactive map already carries markers, route geometry, duration, distance, and attribution; do not reproduce every field as a long table unless the user asks.
