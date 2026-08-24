/** Display-density row store: one browser-local viewing preference. */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { DisplayDensity } from './density.ts'

/** State rendered by the General settings row. */
export interface DisplayDensityState {
  /** Active presentation preset for this document. */
  density: DisplayDensity
}

type DisplayDensityActions = {
  setDensity: (draft: DisplayDensityState, density: DisplayDensity) => void
}

/**
 * Declare the display-density state and complete write set.
 * @param initial - Validated browser preference resolved during plugin apply.
 * @returns The root-scoped store handle.
 */
export function createDisplayDensityStore(
  initial: DisplayDensity,
): EngineStoreHandle<DisplayDensityState, DisplayDensityActions> {
  return defineStore({
    init: (): DisplayDensityState => ({ density: initial }),
    actions: {
      setDensity: (draft, density: DisplayDensity) => { draft.density = density },
    },
  })
}
