# @deepseek-ai/dsh-client-ui-skin-presets

English | [中文](README.zh.md)

Browser-local fixed whole-page skin plugin. It registers Cyberpunk and Natural Morandi definitions through `ThemeRuntime`, projects the current selection through `body[data-dsh-skin]`, and contributes a Default, Cyberpunk, and Natural Morandi selector to General settings. ThemeRuntime and ui-layout remain the only owners of theme state, `--dsw-*` token projection, color-scheme metadata, and DOM palette application.

The plugin accepts `hostnameDefaults`, a list of exact hostname and preset pairs. Its Host half publishes the validated list in the page bootstrap, so the browser plugin does not depend on Loader config forwarding. The shipped Web bundle configures `assistant.ruda.work`, `localhost`, `127.0.0.1`, and `[::1]` for Cyberpunk and `ailin.ruda.work` for Natural Morandi; every other hostname starts in Default. A saved Default is an explicit opt-out from the hostname choice and resolves through ThemeRuntime's `system` preference. Selecting Light, Dark, or System in the existing Appearance row also returns the fixed-skin row to Default.

The validated preference is stored under `dsh.skin-preset.v1` in the current browser profile. It is intentionally separate from the privileged Host settings API, so a remote browser can switch skins without access to credentials or provider configuration. Storage denial or malformed data falls back to the hostname default without preventing the current document from working.

## Model Experience

None, as skin selection changes browser presentation only and adds no model input, tool schema, prompt, or Session event.

#### KV Cache effect

None. Switching skins neither starts a turn nor rebuilds a model request.

## Known Limitations and Deferred Work

- The preference is browser-profile local and does not synchronize across devices or between the two authenticated sites.
- The framework loading screen uses its built-in light or dark palette until Client plugins activate; the fixed skin applies when ThemeRuntime registers it.
- Feature-owned literal media colors, including map tiles and external images, are not recolored by semantic UI tokens.
