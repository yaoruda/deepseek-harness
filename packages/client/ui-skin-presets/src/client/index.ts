/** Browser-local fixed whole-page skin presets and General settings row. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { SKIN_PRESET_BOOT_GLOBAL, type ClientConfig, type SkinPreset } from '../types.ts'
import { en, NS, zh, type SkinPresetKey } from './locales.ts'
import {
  browserHostname, CYBERPUNK_THEME, MORANDI_THEME, presetForThemeId,
  readSkinPreset, skinBrowserStorage, themeIdForPreset, writeSkinPreset,
} from './presets.ts'
import { SkinPresetRow, type SkinPresetRowInjected } from './SkinPresetRow.tsx'
import { createSkinPresetStore } from './store.ts'

declare global {
  interface Window {
    /** Validated hostname defaults emitted by the skin preset Host half. */
    __DSH_SKIN_PRESETS__?: ClientConfig
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Copy for the current-browser fixed-skin row. */
    'settings.skinPresets': SkinPresetKey
  }
}

export type { SkinPresetRowInjected, SkinPresetRowProps } from './SkinPresetRow.tsx'
export type { SkinPresetState } from './store.ts'
export { createSkinPresetStore } from './store.ts'

/** Slot, locale, and theme services used by the browser presentation. */
export const inject = ['slots', 'locale', 'theme']

/**
 * Register both fixed palettes, apply the browser choice, and compose its row.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext, config?: ClientConfig): void {
  const storage = skinBrowserStorage()
  const bootConfig = typeof window === 'undefined'
    ? undefined
    : window[SKIN_PRESET_BOOT_GLOBAL]
  const initial = readSkinPreset(
    storage,
    browserHostname(),
    config?.hostnameDefaults ?? bootConfig?.hostnameDefaults ?? [],
  )
  const store = createSkinPresetStore(initial)
  let projected = initial

  const project = (preset: SkinPreset): void => {
    projected = preset
    if (typeof document !== 'undefined') document.body.dataset.dshSkin = preset
  }
  project(initial)
  ctx.effect(() => () => {
    if (typeof document !== 'undefined' && document.body.dataset.dshSkin === projected) {
      delete document.body.dataset.dshSkin
    }
  }, 'ui-skin-presets: document projection')

  ctx.effect(() => ctx.theme.register(CYBERPUNK_THEME), 'ui-skin-presets: cyberpunk theme')
  ctx.effect(() => ctx.theme.register(MORANDI_THEME), 'ui-skin-presets: Morandi theme')
  ctx.theme.setTheme(themeIdForPreset(initial))

  let bound: ReturnType<typeof store.create>['actions'] | undefined
  let current = initial
  const sync = (activeId: string): void => {
    const preset = presetForThemeId(activeId)
    if (preset === current) return
    current = preset
    bound?.setPreset(preset)
    project(preset)
    writeSkinPreset(storage, preset)
  }
  ctx.on('theme/change', (snapshot) => { sync(snapshot.active.id) })

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-skin-presets: dictionaries')
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'skin-presets',
    order: 12,
    store,
    locale: NS,
    inject: (actions): SkinPresetRowInjected => {
      bound = actions
      actions.setPreset(current)
      return {
        setPreset: (preset) => { ctx.theme.setTheme(themeIdForPreset(preset)) },
      }
    },
  }, SkinPresetRow))
}
