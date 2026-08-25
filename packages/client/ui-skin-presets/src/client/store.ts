/** Fixed-skin settings row store. */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { SkinPreset } from '../types.ts'

/** State rendered by the General settings row. */
export interface SkinPresetState {
  /** Active fixed skin or Default when a built-in theme is active. */
  preset: SkinPreset
}

type SkinPresetActions = {
  setPreset: (draft: SkinPresetState, preset: SkinPreset) => void
}

/**
 * Declare the fixed-skin row state and complete write set.
 * @param initial - Validated browser choice resolved during plugin apply.
 * @returns Root-scoped store handle.
 */
export function createSkinPresetStore(
  initial: SkinPreset,
): EngineStoreHandle<SkinPresetState, SkinPresetActions> {
  return defineStore({
    init: (): SkinPresetState => ({ preset: initial }),
    actions: {
      setPreset: (draft, preset: SkinPreset) => { draft.preset = preset },
    },
  })
}
