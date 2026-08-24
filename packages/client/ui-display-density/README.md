# @deepseek-ai/dsh-client-ui-display-density

English | [中文](README.zh.md)

Browser-local conversation density plugin. It resolves a first-run phone-width viewport (at most 720 CSS pixels) to Compact and wider viewports to Standard, projects the active preset through `body[data-dsh-display-density]`, and registers a Standard, Compact, and Extra compact selector in General settings.

The validated preference is stored under `dsh.display-density.v1` in the current browser profile. It is not written to Host settings and therefore does not synchronize between devices or users. Storage denial or malformed data falls back to the width-derived default without preventing the current document from working.

The plugin selects shared density variables owned and globally loaded by [ui-theme](../ui-theme/README.md); conversation and Markdown components map the applicable variables into their own typography and table styles. Standard preserves the existing desktop metrics. Compact reduces conversation text, table text, table cells, user bubbles, and transcript spacing. Extra compact reduces those values one step further. Composer text remains 16 px in every mode to avoid iOS focus zoom, and the document viewport continues to allow manual zoom.

## Model Experience

None, as display density changes browser presentation only and adds no model input, tool schema, prompt, or Session event.

#### KV Cache effect

None. Switching density neither starts a turn nor rebuilds a model request.

## Known Limitations and Deferred Work

- The preference is browser-profile local and does not synchronize across devices.
- Tool-specific cards, maps, code blocks, and application chrome keep their feature-owned metrics.
- The first-run default is resolved at plugin activation; resizing across the phone breakpoint does not replace the active choice until reload.
