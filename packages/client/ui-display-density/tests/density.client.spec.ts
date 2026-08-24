// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  browserIsNarrow,
  browserStorage,
  COMPACT_DEFAULT_MEDIA,
  defaultDisplayDensity,
  DISPLAY_DENSITY_STORAGE_KEY,
  isDisplayDensity,
  readDisplayDensity,
  writeDisplayDensity,
} from '../src/client/density.ts'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('display density browser persistence', () => {
  it('accepts only supported enum values and resolves width-derived defaults', () => {
    expect(['standard', 'compact', 'extra-compact'].map(isDisplayDensity)).toEqual([true, true, true])
    expect(isDisplayDensity('dense')).toBe(false)
    expect(isDisplayDensity(null)).toBe(false)
    expect(defaultDisplayDensity(false)).toBe('standard')
    expect(defaultDisplayDensity(true)).toBe('compact')
  })

  it('reads valid storage and rejects malformed durable values', () => {
    localStorage.setItem(DISPLAY_DENSITY_STORAGE_KEY, 'extra-compact')
    expect(readDisplayDensity(localStorage, false)).toBe('extra-compact')
    localStorage.setItem(DISPLAY_DENSITY_STORAGE_KEY, '{broken')
    expect(readDisplayDensity(localStorage, true)).toBe('compact')
    localStorage.removeItem(DISPLAY_DENSITY_STORAGE_KEY)
    expect(readDisplayDensity(localStorage, false)).toBe('standard')
    expect(readDisplayDensity(undefined, true)).toBe('compact')
  })

  it('keeps the current document usable when storage reads or writes fail', () => {
    const error = new Error('denied')
    const noisy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const storage = {
      getItem: vi.fn(() => { throw error }),
      setItem: vi.fn(() => { throw error }),
    } as unknown as Storage
    expect(readDisplayDensity(storage, true)).toBe('compact')
    writeDisplayDensity(storage, 'standard')
    expect(noisy).toHaveBeenNthCalledWith(1, 'display density preference read failed:', error)
    expect(noisy).toHaveBeenNthCalledWith(2, 'display density preference write failed:', error)
    writeDisplayDensity(undefined, 'compact')
  })

  it('acquires browser storage and reads the declared phone media query', () => {
    expect(browserStorage()).toBe(localStorage)
    const match = vi.fn(() => ({ matches: true }) as MediaQueryList)
    vi.stubGlobal('matchMedia', match)
    expect(browserIsNarrow()).toBe(true)
    expect(match).toHaveBeenCalledWith(COMPACT_DEFAULT_MEDIA)
    vi.stubGlobal('matchMedia', undefined)
    expect(browserIsNarrow()).toBe(false)
  })

  it('treats a denied localStorage getter as unavailable', () => {
    const error = new Error('getter denied')
    const noisy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw error })
    expect(browserStorage()).toBeUndefined()
    expect(noisy).toHaveBeenCalledWith('display density browser storage unavailable:', error)
  })

  it('returns no storage when the browser global is unavailable', () => {
    vi.stubGlobal('window', undefined)
    expect(browserStorage()).toBeUndefined()
  })
})
