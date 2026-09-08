/** General settings row for fixed whole-page skin presets. */
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { SkinPresetKey } from './locales.ts'
import type { SkinPreset } from '../types.ts'
import type { createSkinPresetStore } from './store.ts'
import css from './SkinPresetRow.module.css'

/** Business action injected by the skin preset plugin. */
export interface SkinPresetRowInjected {
  /** Apply and persist a whole-page skin for this browser profile. */
  setPreset: (preset: SkinPreset) => void
}

/** Full component props derived from the General item slot and row store. */
export type SkinPresetRowProps =
  PropsRuntime<'settings.general.item'>
  & PropsStore<ReturnType<typeof createSkinPresetStore>>
  & PropsLocale<'settings.skinPresets'>
  & SkinPresetRowInjected

const OPTIONS: readonly {
  preset: SkinPreset
  label: SkinPresetKey
  hint: SkinPresetKey
}[] = [
  { preset: 'default', label: 'default', hint: 'defaultHint' },
  { preset: 'cyberpunk', label: 'cyberpunk', hint: 'cyberpunkHint' },
  { preset: 'morandi', label: 'morandi', hint: 'morandiHint' },
]

/**
 * Render the fixed-skin selector.
 * @param props - Framework shares plus the skin write action.
 * @returns One labeled three-preset control.
 */
export function SkinPresetRow({ t, useStore, setPreset }: SkinPresetRowProps) {
  const selected = useStore(state => state.preset)
  return (
    <div className={css.group}>
      <div className={css.title}>{t('title')}</div>
      <div className={css.description}>{t('description')}</div>
      <div className={css.options} role="group" aria-label={t('title')}>
        {OPTIONS.map(option => (
          <button
            key={option.preset}
            type="button"
            className={css.option}
            data-skin={option.preset}
            data-selected={selected === option.preset || undefined}
            aria-pressed={selected === option.preset}
            onClick={() => { setPreset(option.preset) }}
          >
            <span className={css.swatch} aria-hidden="true" />
            <span className={css.optionCopy}>
              <span className={css.optionTitle}>{t(option.label)}</span>
              <span className={css.optionHint}>{t(option.hint)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
