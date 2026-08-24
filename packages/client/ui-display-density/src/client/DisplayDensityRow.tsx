/** General settings row for one browser's conversation display density. */
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { DisplayDensity } from './density.ts'
import type { createDisplayDensityStore } from './store.ts'
import type { DisplayDensityKey } from './locales.ts'
import css from './DisplayDensityRow.module.css'

/** Business actions injected by the display-density plugin. */
export interface DisplayDensityRowInjected {
  /** Apply and persist a preset for this browser profile. */
  setDensity: (density: DisplayDensity) => void
}

/** Full component props derived from the General item slot and row store. */
export type DisplayDensityRowProps =
  PropsRuntime<'settings.general.item'>
  & PropsStore<ReturnType<typeof createDisplayDensityStore>>
  & PropsLocale<'settings.displayDensity'>
  & DisplayDensityRowInjected

const OPTIONS: readonly { density: DisplayDensity; key: DisplayDensityKey }[] = [
  { density: 'standard', key: 'standard' },
  { density: 'compact', key: 'compact' },
  { density: 'extra-compact', key: 'extraCompact' },
]

/**
 * Render the current-device density selector.
 * @param props - Framework shares plus the density write action.
 * @returns One labeled segmented control.
 */
export function DisplayDensityRow({ t, useStore, setDensity }: DisplayDensityRowProps) {
  const density = useStore(state => state.density)
  return (
    <div className={css.group}>
      <div className={css.title}>{t('title')}</div>
      <div className={css.description}>{t('description')}</div>
      <div className={css.options} role="group" aria-label={t('title')}>
        {OPTIONS.map(option => (
          <button
            key={option.density}
            type="button"
            className={css.option}
            data-selected={density === option.density || undefined}
            aria-pressed={density === option.density}
            onClick={() => { setDensity(option.density) }}
          >
            {t(option.key)}
          </button>
        ))}
      </div>
    </div>
  )
}
