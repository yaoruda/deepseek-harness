# Mobile display density design

English | [中文](2026-08-24-mobile-display-density-design.zh.md)

## Outcome

Conversation content defaults to a compact density on phone-width browsers while preserving the current desktop presentation. A person can choose Standard, Compact, or Extra compact in General settings; the choice applies only to the current browser profile and survives reloads.

The first release changes conversation text, table text and cell padding, user-bubble padding, and vertical message rhythm. It does not scale the application shell, maps, code blocks, tool-specific views, or the composer input below 16 px.

## Ownership and data flow

A client-only display-density plugin owns the preference, browser storage, validation, and `data-dsh-display-density` document attribute. With no saved preference, a viewport at or below 720 CSS pixels resolves to Compact and a wider viewport resolves to Standard. Selecting a density stores only the enum value in `localStorage`; it stores no Session or message data and does not synchronize through the server.

The plugin contributes one row to `settings.general.item`. Conversation and Markdown renderers consume density CSS variables rather than importing the plugin, so their package boundaries remain one-way. The Standard values preserve existing metrics. Compact uses 14/22 px assistant and user text, 13/20 px table text, tighter table and bubble padding, and a 12 px transcript gap. Extra compact uses 13/20 px conversation text and 12/18 px table text.

The composer remains 16/24 px in every mode because iOS enlarges pages when a focused form control has text below 16 CSS pixels. The viewport metadata continues to permit user zoom.

## Failure handling

Unknown or malformed stored values are ignored and replaced by the width-derived default. Browser-storage read or write failures leave the in-memory selection usable for the current document. Plugin disposal removes its slot entry and document attribute without touching another feature's state.

## Verification

Unit tests cover width-derived defaults, valid and invalid persistence, storage failure, document projection, setting-row gestures, and lifecycle disposal. An assembled keyless browser scenario at 390 px verifies Compact as the default, confirms the rendered conversation and table metrics, switches to Standard, reloads, and confirms that the current-device choice persists. Existing desktop table and settings scenarios protect the unchanged wide-screen presentation.
