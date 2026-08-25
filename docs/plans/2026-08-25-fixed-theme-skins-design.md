# Fixed Theme Skins Design

English | [中文](2026-08-25-fixed-theme-skins-design.zh.md)

## Goal

Add three whole-page skin choices to the Web application: Harness default, Cyberpunk, and Morandi. Cyberpunk is the first-run choice on `assistant.ruda.work` and loopback hosts; Morandi is the first-run choice on `ailin.ruda.work`; other hosts retain Harness default. The same behavior applies at phone, installed PWA, and desktop widths.

## Package ownership

A new client plugin owns the fixed definitions, browser-local preference, hostname default resolver, and General settings row. It registers Cyberpunk and Morandi through `ThemeRuntime.register()` and switches them through `ThemeRuntime.setTheme()`. The existing ui-theme package remains the owner of theme state, DOM presentation, semantic color tokens, and the built-in light, dark, and system preferences.

The skin plugin does not import conversation, map, settings, or layout components. Those packages continue to consume semantic `--dsw-*` variables. A small plugin-owned stylesheet may add skin-specific background treatments selected by `body[data-dsh-skin]`; it must not replace component layout or typography rules.

## Preference semantics

The versioned browser key `dsh.skin-preset.v1` accepts `default`, `cyberpunk`, or `morandi`. A missing key resolves from the current hostname. A stored `default` is an explicit opt-out from the hostname default and selects the built-in `system` preference. Invalid values, denied storage, and unknown hosts fall back without preventing the client tree from loading.

The selection is local to one browser origin. The two public domains therefore remain independent without weakening the loopback-only Host settings API. Local and public deployments use the same plugin and build; only the first-run hostname resolver differs.

## Visual definitions

Cyberpunk uses a dark graphite and blue-black base, layered mechanical surfaces, cyan and electric-blue interaction accents, restrained magenta status accents, cool borders, and a static low-contrast grid or radial glow. It has no continuous animation. Morandi uses warm off-white, sage grey-green, mist blue, sand, and muted terracotta with low-contrast elevation and readable text.

Both definitions cover the semantic variables used by the application base, sidebar, raised surfaces, overlays, borders, primary and secondary text, brand actions, states, bubbles, code, tables, and scrollbars. Map tiles keep their source colors; surrounding controls and panels follow the selected skin. Display-density variables and the 16 px mobile composer rule remain independent.

## Lifecycle and failure handling

The plugin validates storage before use, registers both themes before selecting one, and updates its store, the theme runtime, local storage, and `data-dsh-skin` from one user action. Disposal removes only the registrations and document attribute that the plugin still owns. If the active registered theme disappears, ThemeRuntime restores its built-in default.

The General settings row presents three fixed choices and a short current-device description. Switching is immediate and starts no Session turn or model request.

## Verification

Unit tests cover hostname resolution, explicit default, storage failures, registration order, selection, persistence, and disposal. Keyless assembled-browser tests cover the three settings choices, computed semantic colors at desktop and 390 px widths, reload persistence, explicit restoration of Harness default, density compatibility, and clean console output. The production build, typecheck, documentation gates, focused UI tests, and real local HTTP response form the local release evidence.

Server deployment reuses the local build artifacts and activates one commit for both Harness services. Acceptance checks require both loopback services and the new client plugin to return HTTP 200, both public domains to redirect unauthenticated requests to Authelia, and ports 3080 and 3081 to remain unreachable publicly.
