/** Fixed skin presets plugin, node half. */
import type { Context } from '@deepseek-ai/cordis'
import type { IndexInjection } from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-host-webserver'
import z from '@deepseek-ai/schemastery'
import { SKIN_PRESET_BOOT_GLOBAL, type HostnameSkinDefault } from './types.ts'

export type { HostnameSkinDefault, SkinPreset } from './types.ts'

/** Public plugin configuration type. */
export interface Config {
  /** Exact hostname defaults; unknown hosts use Default. */
  hostnameDefaults?: HostnameSkinDefault[]
}

/** Validated deployment config for browser hostname defaults. */
export const Config: z<Config> = z.object({
  hostnameDefaults: z.array(z.object({
    hostname: z.string().required(),
    preset: z.union([z.const('default'), z.const('cyberpunk'), z.const('morandi')]).required(),
  })).default([]),
})

/**
 * Publish validated hostname defaults into the browser bootstrap document.
 * @param ctx - Host Cordis context carrying the webserver injection event.
 * @param config - Validated defaults consumed by the browser entry.
 */
export function apply(ctx: Context, config: Config): void {
  ctx.on('webserver/index-inject', (table: IndexInjection[]) => {
    table.push({ kind: 'global', name: SKIN_PRESET_BOOT_GLOBAL, value: config })
  })
}
