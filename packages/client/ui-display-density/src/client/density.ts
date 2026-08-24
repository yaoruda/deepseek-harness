/** Valid display-density values and browser persistence. */

/** A conversation presentation preset selected for one browser profile. */
export type DisplayDensity = 'standard' | 'compact' | 'extra-compact'

/** Browser-local storage key; the value is one validated enum string. */
export const DISPLAY_DENSITY_STORAGE_KEY = 'dsh.display-density.v1'

/** Phone-width breakpoint used only when no browser preference exists. */
export const COMPACT_DEFAULT_MEDIA = '(max-width: 720px)'

/**
 * Check the durable browser value before it enters presentation state.
 * @param value - Untrusted localStorage text.
 * @returns Whether the value is a supported display density.
 */
export function isDisplayDensity(value: unknown): value is DisplayDensity {
  return value === 'standard' || value === 'compact' || value === 'extra-compact'
}

/**
 * Resolve a first-run preference from the current viewport.
 * @param narrow - Whether the phone-width media query currently matches.
 * @returns Compact for phone widths, otherwise Standard.
 */
export function defaultDisplayDensity(narrow: boolean): DisplayDensity {
  return narrow ? 'compact' : 'standard'
}

/**
 * Read one validated browser preference, falling back to viewport width.
 * Storage failures do not prevent the current document from starting.
 * @param storage - Browser storage when available.
 * @param narrow - Current phone-width media-query result.
 * @returns The stored density or the width-derived default.
 */
export function readDisplayDensity(storage: Storage | undefined, narrow: boolean): DisplayDensity {
  if (storage === undefined) return defaultDisplayDensity(narrow)
  try {
    const saved = storage.getItem(DISPLAY_DENSITY_STORAGE_KEY)
    return isDisplayDensity(saved) ? saved : defaultDisplayDensity(narrow)
  } catch (error) {
    console.error('display density preference read failed:', error)
    return defaultDisplayDensity(narrow)
  }
}

/**
 * Persist one validated preference for the current browser profile.
 * @param storage - Browser storage when available.
 * @param density - Supported display density.
 */
export function writeDisplayDensity(storage: Storage | undefined, density: DisplayDensity): void {
  if (storage === undefined) return
  try {
    storage.setItem(DISPLAY_DENSITY_STORAGE_KEY, density)
  } catch (error) {
    console.error('display density preference write failed:', error)
  }
}

/**
 * Acquire localStorage without letting a denied storage getter abort boot.
 * @returns Browser storage when accessible.
 */
export function browserStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage
  } catch (error) {
    console.error('display density browser storage unavailable:', error)
    return undefined
  }
}

/**
 * Read the current first-run breakpoint without depending on DOM layout.
 * @returns Whether the browser reports a phone-width viewport.
 */
export function browserIsNarrow(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia(COMPACT_DEFAULT_MEDIA).matches
}
