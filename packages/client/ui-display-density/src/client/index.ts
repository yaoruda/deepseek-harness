/** Browser-local display density and General settings contribution. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { DisplayDensityRow, type DisplayDensityRowInjected } from './DisplayDensityRow.tsx'
import {
  browserIsNarrow, browserStorage, readDisplayDensity, writeDisplayDensity,
  type DisplayDensity,
} from './density.ts'
import { en, NS, zh, type DisplayDensityKey } from './locales.ts'
import { createDisplayDensityStore } from './store.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Copy for the current-device display-density row. */
    'settings.displayDensity': DisplayDensityKey
  }
}

export type { DisplayDensityRowInjected, DisplayDensityRowProps } from './DisplayDensityRow.tsx'
export type { DisplayDensityState } from './store.ts'
export { createDisplayDensityStore } from './store.ts'

/** Slot and locale services used by the browser presentation. */
export const inject = ['slots', 'locale']

/**
 * Apply a validated current-device density and register its General row.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  const storage = browserStorage()
  const initial = readDisplayDensity(storage, browserIsNarrow())
  const store = createDisplayDensityStore(initial)
  let current = initial

  const project = (density: DisplayDensity): void => {
    current = density
    if (typeof document !== 'undefined') document.body.dataset.dshDisplayDensity = density
  }
  project(initial)
  ctx.effect(() => () => {
    if (typeof document !== 'undefined' && document.body.dataset.dshDisplayDensity === current) {
      delete document.body.dataset.dshDisplayDensity
    }
  }, 'ui-display-density: document projection')

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-display-density: dictionaries')
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'display-density',
    order: 15,
    store,
    locale: NS,
    inject: (actions): DisplayDensityRowInjected => ({
      setDensity: (density) => {
        actions.setDensity(density)
        project(density)
        writeDisplayDensity(storage, density)
      },
    }),
  }, DisplayDensityRow))
}
