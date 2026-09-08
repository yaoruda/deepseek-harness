// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  browserHostname, CYBERPUNK_THEME, CYBERPUNK_THEME_ID, defaultSkinPreset,
  MORANDI_THEME, MORANDI_THEME_ID, presetForThemeId, readSkinPreset,
  SKIN_PRESET_STORAGE_KEY, skinBrowserStorage, themeIdForPreset, writeSkinPreset,
} from '../src/client/presets.ts'

const HOST_DEFAULTS = [
  { hostname: 'assistant.ruda.work', preset: 'cyberpunk' as const },
  { hostname: 'localhost', preset: 'cyberpunk' as const },
  { hostname: '127.0.0.1', preset: 'cyberpunk' as const },
  { hostname: '[::1]', preset: 'cyberpunk' as const },
  { hostname: 'ailin.ruda.work', preset: 'morandi' as const },
]

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('fixed skin presets', () => {
  it('maps deployment hostnames and theme ids without a port dependency', () => {
    expect(defaultSkinPreset('assistant.ruda.work', HOST_DEFAULTS)).toBe('cyberpunk')
    expect(defaultSkinPreset('LOCALHOST', HOST_DEFAULTS)).toBe('cyberpunk')
    expect(defaultSkinPreset('127.0.0.1', HOST_DEFAULTS)).toBe('cyberpunk')
    expect(defaultSkinPreset('[::1]', HOST_DEFAULTS)).toBe('cyberpunk')
    expect(defaultSkinPreset('ailin.ruda.work', HOST_DEFAULTS)).toBe('morandi')
    expect(defaultSkinPreset('example.com', HOST_DEFAULTS)).toBe('default')
    expect(themeIdForPreset('default')).toBe('system')
    expect(themeIdForPreset('cyberpunk')).toBe(CYBERPUNK_THEME_ID)
    expect(themeIdForPreset('morandi')).toBe(MORANDI_THEME_ID)
    expect(presetForThemeId('light')).toBe('default')
    expect(presetForThemeId(CYBERPUNK_THEME_ID)).toBe('cyberpunk')
    expect(presetForThemeId(MORANDI_THEME_ID)).toBe('morandi')
  })

  it('defines complete contrasting light and dark palettes', () => {
    expect(CYBERPUNK_THEME.colorScheme).toBe('dark')
    expect(MORANDI_THEME.colorScheme).toBe('light')
    expect(Object.keys(CYBERPUNK_THEME.tokens)).toEqual(Object.keys(MORANDI_THEME.tokens))
    expect(CYBERPUNK_THEME.tokens['--dsw-alias-bg-base']).toBe('#050914')
    expect(MORANDI_THEME.tokens['--dsw-alias-bg-base']).toBe('#f3f1eb')
    expect(CYBERPUNK_THEME.tokens['--dsw-alias-label-primary'])
      .not.toBe(MORANDI_THEME.tokens['--dsw-alias-label-primary'])
  })

  it('keeps an explicit Default choice instead of reapplying the hostname default', () => {
    expect(readSkinPreset(localStorage, 'assistant.ruda.work', HOST_DEFAULTS)).toBe('cyberpunk')
    localStorage.setItem(SKIN_PRESET_STORAGE_KEY, 'default')
    expect(readSkinPreset(localStorage, 'assistant.ruda.work', HOST_DEFAULTS)).toBe('default')
    localStorage.setItem(SKIN_PRESET_STORAGE_KEY, 'future-skin')
    expect(readSkinPreset(localStorage, 'ailin.ruda.work', HOST_DEFAULTS)).toBe('morandi')
    writeSkinPreset(localStorage, 'cyberpunk')
    expect(localStorage.getItem(SKIN_PRESET_STORAGE_KEY)).toBe('cyberpunk')
  })

  it('contains browser storage denial and supports node composition', () => {
    const denied = new Error('denied')
    const noisy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const storage = {
      getItem: vi.fn(() => { throw denied }),
      setItem: vi.fn(() => { throw denied }),
    } as unknown as Storage
    expect(readSkinPreset(storage, 'ailin.ruda.work', HOST_DEFAULTS)).toBe('morandi')
    writeSkinPreset(storage, 'default')
    expect(noisy).toHaveBeenCalledWith('skin preset preference read failed:', denied)
    expect(noisy).toHaveBeenCalledWith('skin preset preference write failed:', denied)

    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw denied })
    expect(skinBrowserStorage()).toBeUndefined()
    expect(noisy).toHaveBeenCalledWith('skin preset browser storage unavailable:', denied)
    vi.stubGlobal('location', undefined)
    expect(browserHostname()).toBe('')
    vi.stubGlobal('window', undefined)
    expect(skinBrowserStorage()).toBeUndefined()
  })
})
