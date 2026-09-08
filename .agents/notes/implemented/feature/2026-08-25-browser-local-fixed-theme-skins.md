# Agent Note: Browser-local fixed theme skins

Status: implemented

English | [中文](2026-08-25-browser-local-fixed-theme-skins.zh.md)

## Problem

The Web client exposes Light, Dark, and System appearance choices, but both authenticated deployments still present the same neutral product palette. The personal assistant and Ailin sites need distinct default identities, while remote browsers must not gain access to the privileged Host settings API merely to save presentation choices. A user also needs an explicit way to return either deployment to the product default.

## Decision

`@deepseek-ai/dsh-client-ui-skin-presets` owns two fixed ThemeRuntime definitions and one browser-local preference. Cyberpunk is a dark mechanical palette with cyan and violet accents. Natural Morandi is a light low-saturation palette built from warm neutral and botanical colors. Both override semantic `--dsw-*` tokens only; ThemeRuntime and the ui-layout presenter retain ownership of resolved state, DOM token application, native `color-scheme`, and browser theme-color metadata.

The preference uses the validated string key `dsh.skin-preset.v1` with `default`, `cyberpunk`, or `morandi`. The plugin accepts a validated `hostnameDefaults` list rather than embedding deployment names. Its Host half serializes that list through the structured index-injection table because the Client module graph intentionally carries package identity and dependencies, not Loader configuration. The shipped Web bundle maps `assistant.ruda.work` and loopback hosts to Cyberpunk and `ailin.ruda.work` to Natural Morandi; unknown hosts use Default. A stored Default is explicit and maps to ThemeRuntime's `system` preference instead of reapplying the hostname choice.

The plugin registers a feature-owned row in `settings.general.item`. Selecting a fixed skin calls `ThemeRuntime.setTheme()` with its registered id. When the existing Appearance row selects Light, Dark, or System, the `theme/change` projection moves the fixed-skin state to Default and persists that opt-out. The plugin removes its row, definitions, and `body[data-dsh-skin]` projection with its Cordis fiber.

ThemeRuntime treats a registered in-process theme as the active browser choice, so a later Host adoption of the last built-in preference cannot replace it. An explicit Appearance gesture still calls `setTheme()` with a built-in id and takes control immediately. The ui-layout presenter reuses the PWA shell's existing `meta[name="theme-color"]` node and restores its original content on disposal instead of creating duplicate browser-chrome metadata.

## Alternatives considered

**Store the skin in Host settings.** Remote browsers cannot use the loopback-only settings transport. Broadening that API would mix harmless presentation state with provider credentials and authorization-sensitive configuration.

**Fork the two Web applications or maintain deployment-specific CSS.** Two builds would drift and make every upstream update and local migration more expensive. Bundle-configured hostname defaults keep one artifact and one settings surface.

**Replace the built-in Appearance row.** Light, Dark, and System remain useful independent choices and are owned by ui-theme. The fixed-skin row composes beside it and listens to the same authoritative runtime.

**Add component-specific style overrides.** Layout, typography, and feature CSS would make each skin expensive to maintain. Semantic theme tokens produce a whole-page identity while preserving component contracts.

## Consequences

The same Web artifact starts with a cyberpunk identity on the assistant and local sites and a Morandi identity on the Ailin site. Each browser can switch among all three choices without a privileged RPC, and an explicit Default survives reload. The choice does not synchronize between devices. Fixed tokens apply after the Client plugin tree activates, the PWA metadata remains singular across theme changes, and literal external media such as map tiles remains outside the palette.
