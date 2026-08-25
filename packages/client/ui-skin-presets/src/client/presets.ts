/** Fixed skin definitions, hostname defaults, and browser persistence. */

import type { HostnameSkinDefault, SkinPreset } from '../types.ts'

export type { SkinPreset } from '../types.ts'

/** Browser-local storage key for one explicit whole-page skin choice. */
export const SKIN_PRESET_STORAGE_KEY = 'dsh.skin-preset.v1'

/** Theme registry id owned by the cyberpunk preset. */
export const CYBERPUNK_THEME_ID = 'skin-cyberpunk'

/** Theme registry id owned by the Morandi preset. */
export const MORANDI_THEME_ID = 'skin-morandi'

/** Mechanical-futurist dark palette for assistant.ruda.work and local testing. */
export const CYBERPUNK_THEME = Object.freeze({
  id: CYBERPUNK_THEME_ID,
  colorScheme: 'dark' as const,
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#050914',
    '--dsw-alias-bg-layer-1': '#08101f',
    '--dsw-alias-bg-layer-2': '#0b162a',
    '--dsw-alias-bg-layer-3': '#10203a',
    '--dsw-alias-bg-module-platform': '#0d1b31',
    '--dsw-alias-bg-multi-select': '#12243e',
    '--dsw-alias-bg-overlay': '#142641',
    '--dsw-alias-border-l1': 'rgba(57, 247, 255, 0.10)',
    '--dsw-alias-border-l2': 'rgba(57, 247, 255, 0.22)',
    '--dsw-alias-border-l3': 'rgba(57, 247, 255, 0.34)',
    '--dsw-alias-border-l4': 'rgba(57, 247, 255, 0.48)',
    '--dsw-alias-brand-primary': '#39f7ff',
    '--dsw-alias-brand-primary-invert': '#021014',
    '--dsw-alias-brand-text': '#67f9ff',
    '--dsw-alias-button-primary-fill': '#1fd8e3',
    '--dsw-alias-button-primary-hover': '#55f8ff',
    '--dsw-alias-button-elevated-fill': '#10233d',
    '--dsw-alias-button-floating-fill': '#10233d',
    '--dsw-alias-button-floating-hover': '#173452',
    '--dsw-alias-interactive-bg-active': 'rgba(57, 247, 255, 0.18)',
    '--dsw-alias-interactive-bg-hover': 'rgba(57, 247, 255, 0.09)',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(178, 91, 255, 0.18)',
    '--dsw-alias-label-primary': '#e9fcff',
    '--dsw-alias-label-secondary': '#9bc6d3',
    '--dsw-alias-label-tertiary': '#6f98a8',
    '--dsw-alias-label-caption': '#54798a',
    '--dsw-alias-label-primary-foreground': '#031013',
    '--dsw-alias-markdown-code-block': '#061426',
    '--dsw-alias-markdown-code-block-banner': '#0d2038',
    '--dsw-alias-markdown-inline-code': '#122a43',
    '--dsw-alias-markdown-tag': '#142e49',
    '--dsw-alias-scrollbar-bg-l1': '#11243b',
    '--dsw-alias-scrollbar-bg-l2': '#17304d',
    '--dsw-alias-scrollbar-hover-l1': '#1f4d68',
    '--dsw-alias-scrollbar-hover-l2': '#26708c',
    '--dsw-alias-state-business-primary': '#b25bff',
    '--dsw-alias-state-business-tertiary': '#291b48',
    '--dsw-specific-bubble': '#102d45',
    '--dsw-specific-bubble-highlight': '#174d66',
    '--dsw-specific-input-major': '#09182b',
    '--dsw-specific-menu': '#10203a',
    '--dsw-specific-selector': '#10243c',
    '--dsw-specific-sidebar-fill': '#060d1b',
    '--dsw-specific-sidebar-nav-item-active': '#10283f',
    '--dsw-specific-sidebar-nav-item-active-accent': '#20345e',
    '--dsw-specific-sidebar-nav-item-hover': '#0d2035',
    '--dsw-specific-tip': '#0d2037',
  }),
})

/** Soft natural light palette for ailin.ruda.work. */
export const MORANDI_THEME = Object.freeze({
  id: MORANDI_THEME_ID,
  colorScheme: 'light' as const,
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#f3f1eb',
    '--dsw-alias-bg-layer-1': '#faf8f3',
    '--dsw-alias-bg-layer-2': '#edf1eb',
    '--dsw-alias-bg-layer-3': '#e4ebe3',
    '--dsw-alias-bg-module-platform': '#e7ece5',
    '--dsw-alias-bg-multi-select': '#dde7df',
    '--dsw-alias-bg-overlay': '#dce5dc',
    '--dsw-alias-border-l1': 'rgba(89, 111, 99, 0.10)',
    '--dsw-alias-border-l2': 'rgba(89, 111, 99, 0.20)',
    '--dsw-alias-border-l3': 'rgba(89, 111, 99, 0.30)',
    '--dsw-alias-border-l4': 'rgba(89, 111, 99, 0.42)',
    '--dsw-alias-brand-primary': '#617d6c',
    '--dsw-alias-brand-primary-invert': '#f9faf6',
    '--dsw-alias-brand-text': '#526d5d',
    '--dsw-alias-button-primary-fill': '#718a7a',
    '--dsw-alias-button-primary-hover': '#607868',
    '--dsw-alias-button-elevated-fill': '#f8f6f0',
    '--dsw-alias-button-floating-fill': '#f8f6f0',
    '--dsw-alias-button-floating-hover': '#e5ebe3',
    '--dsw-alias-interactive-bg-active': 'rgba(97, 125, 108, 0.17)',
    '--dsw-alias-interactive-bg-hover': 'rgba(97, 125, 108, 0.09)',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(183, 139, 122, 0.16)',
    '--dsw-alias-label-primary': '#34413c',
    '--dsw-alias-label-secondary': '#627168',
    '--dsw-alias-label-tertiary': '#7b887f',
    '--dsw-alias-label-caption': '#97a198',
    '--dsw-alias-label-primary-foreground': '#fafbf8',
    '--dsw-alias-markdown-code-block': '#e6ece7',
    '--dsw-alias-markdown-code-block-banner': '#dce5df',
    '--dsw-alias-markdown-inline-code': '#dde7e0',
    '--dsw-alias-markdown-tag': '#e0e8e2',
    '--dsw-alias-scrollbar-bg-l1': '#d8ded7',
    '--dsw-alias-scrollbar-bg-l2': '#cbd5cd',
    '--dsw-alias-scrollbar-hover-l1': '#b9c7bd',
    '--dsw-alias-scrollbar-hover-l2': '#a8b9ad',
    '--dsw-alias-state-business-primary': '#a17668',
    '--dsw-alias-state-business-tertiary': '#eaded7',
    '--dsw-specific-bubble': '#dce8df',
    '--dsw-specific-bubble-highlight': '#cbdccf',
    '--dsw-specific-input-major': '#faf8f3',
    '--dsw-specific-menu': '#e6ece5',
    '--dsw-specific-selector': '#e1e8e1',
    '--dsw-specific-sidebar-fill': '#e7ebe4',
    '--dsw-specific-sidebar-nav-item-active': '#d7e1d8',
    '--dsw-specific-sidebar-nav-item-active-accent': '#eadbd4',
    '--dsw-specific-sidebar-nav-item-hover': '#dde5dc',
    '--dsw-specific-tip': '#e3e9e2',
  }),
})

/**
 * Resolve the first-run skin from a normalized browser hostname and config.
 * @param hostname - `location.hostname`, without a port.
 * @param defaults - Deployment-configured exact hostname mappings.
 * @returns The configured preset, or Default on unknown hosts.
 */
export function defaultSkinPreset(hostname: string, defaults: readonly HostnameSkinDefault[]): SkinPreset {
  const normalized = hostname.toLowerCase()
  return defaults.find(entry => entry.hostname.toLowerCase() === normalized)?.preset ?? 'default'
}

/**
 * Resolve one registered theme id from a skin preset.
 * @param preset - Valid skin selection.
 * @returns ThemeRuntime preference id.
 */
export function themeIdForPreset(preset: SkinPreset): string {
  if (preset === 'cyberpunk') return CYBERPUNK_THEME_ID
  if (preset === 'morandi') return MORANDI_THEME_ID
  return 'system'
}

/**
 * Resolve a skin selection from an active theme id.
 * @param themeId - Active theme definition id.
 * @returns The matching fixed skin, or Default for every other theme.
 */
export function presetForThemeId(themeId: string): SkinPreset {
  if (themeId === CYBERPUNK_THEME_ID) return 'cyberpunk'
  if (themeId === MORANDI_THEME_ID) return 'morandi'
  return 'default'
}

/**
 * Check untrusted browser text before it enters skin state.
 * @param value - Untrusted localStorage text.
 * @returns Whether the value is one supported fixed-skin choice.
 */
export function isSkinPreset(value: unknown): value is SkinPreset {
  return value === 'default' || value === 'cyberpunk' || value === 'morandi'
}

/**
 * Read the validated browser choice or apply the hostname default.
 * @param storage - Browser storage when accessible.
 * @param hostname - Current browser hostname.
 * @param defaults - Deployment-configured hostname mappings.
 * @returns Explicit saved choice or deployment default.
 */
export function readSkinPreset(
  storage: Storage | undefined,
  hostname: string,
  defaults: readonly HostnameSkinDefault[],
): SkinPreset {
  const fallback = defaultSkinPreset(hostname, defaults)
  if (storage === undefined) return fallback
  try {
    const saved = storage.getItem(SKIN_PRESET_STORAGE_KEY)
    return isSkinPreset(saved) ? saved : fallback
  } catch (error) {
    console.error('skin preset preference read failed:', error)
    return fallback
  }
}

/**
 * Persist one validated skin choice for the current browser profile.
 * @param storage - Browser storage when accessible.
 * @param preset - Valid skin choice.
 */
export function writeSkinPreset(storage: Storage | undefined, preset: SkinPreset): void {
  if (storage === undefined) return
  try {
    storage.setItem(SKIN_PRESET_STORAGE_KEY, preset)
  } catch (error) {
    console.error('skin preset preference write failed:', error)
  }
}

/**
 * Acquire localStorage without allowing a denied getter to abort Client boot.
 * @returns Browser storage when accessible.
 */
export function skinBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage
  } catch (error) {
    console.error('skin preset browser storage unavailable:', error)
    return undefined
  }
}

/**
 * Read the current hostname without requiring a browser in node composition tests.
 * @returns Current browser hostname or an empty node-composition value.
 */
export function browserHostname(): string {
  return typeof location === 'undefined' ? '' : location.hostname
}
