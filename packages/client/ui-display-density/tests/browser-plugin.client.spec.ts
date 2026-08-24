// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import InvariantRegistry from '@deepseek-ai/dsh-invariants'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { stubSettingsScope } from '@deepseek-ai/dsh-client-test-runtime'
import { apply as applyLocale, inject as localeInject } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index.ts'
import { apply as applyNode } from '../src/index.ts'
import * as DensityInvariant from '../src/invariant.ts'
import { DisplayDensityRow } from '../src/client/DisplayDensityRow.tsx'
import type { DisplayDensityRowInjected } from '../src/client/DisplayDensityRow.tsx'
import { DISPLAY_DENSITY_STORAGE_KEY } from '../src/client/density.ts'
import { en, NS, zh } from '../src/client/locales.ts'
import type { createDisplayDensityStore } from '../src/client/store.ts'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  delete document.body.dataset.dshDisplayDensity
})

async function bench(narrow: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: narrow }) as MediaQueryList))
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.slots.register({
    name: 'root',
    children: { 'settings.general.item': { kind: 'list', scope: 'root' } },
  } as never, () => null)
  ctx.provide('connection', {
    api: { settings: { describe: () => Promise.resolve({
      rpcId: 'density-test' as never,
      result: { ok: true, value: { writable: true, hasDocument: false, namespaces: [] } },
    }) } },
    isLoopback: true,
  } as never)
  ctx.provide('remote', { $on: () => () => {} } as never)
  ctx.provide('settingsScope', { bind: () => stubSettingsScope().scope } as never)
  await ctx.plugin({ inject: localeInject, apply: applyLocale }).await()
  ctx.locale.setLocale('zh')
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber }
}

describe('display density browser half', () => {
  it('defaults phone widths to Compact, persists gestures, and disposes every owned projection', async () => {
    const { ctx, fiber } = await bench(true)
    expect(inject).toEqual(['slots', 'locale'])
    expect(document.body.dataset.dshDisplayDensity).toBe('compact')
    const entry = ctx.slots.entries('settings.general.item').find(candidate => candidate.component === DisplayDensityRow)!
    expect(entry.options).toMatchObject({ id: 'display-density', order: 15 })
    expect(entry.locale).toBe(NS)
    const store = entry.store as ReturnType<typeof createDisplayDensityStore>
    const instance = store.create()
    expect(instance.getSnapshot().density).toBe('compact')
    const injected = (entry.inject as unknown as (
      actions: typeof instance.actions,
    ) => DisplayDensityRowInjected)(instance.actions)
    injected.setDensity('standard')
    expect(instance.getSnapshot().density).toBe('standard')
    expect(document.body.dataset.dshDisplayDensity).toBe('standard')
    expect(localStorage.getItem(DISPLAY_DENSITY_STORAGE_KEY)).toBe('standard')
    const t = ctx.locale.bind(NS)
    expect(t('compact')).toBe(zh.compact)
    ctx.locale.setLocale('en')
    expect(t('compact')).toBe(en.compact)

    await fiber.dispose()
    expect(ctx.slots.entries('settings.general.item').some(candidate => candidate.component === DisplayDensityRow)).toBe(false)
    expect(document.body.hasAttribute('data-dsh-display-density')).toBe(false)
  })

  it('uses a validated saved preference instead of the desktop default', async () => {
    localStorage.setItem(DISPLAY_DENSITY_STORAGE_KEY, 'extra-compact')
    const { fiber } = await bench(false)
    expect(document.body.dataset.dshDisplayDensity).toBe('extra-compact')
    await fiber.dispose()
  })

  it('does not remove a document projection replaced by another owner', async () => {
    const { fiber } = await bench(false)
    document.body.dataset.dshDisplayDensity = 'compact'
    await fiber.dispose()
    expect(document.body.dataset.dshDisplayDensity).toBe('compact')
  })

  it('registers its setting without document presentation in non-browser rendering', async () => {
    vi.stubGlobal('document', undefined)
    const { ctx, fiber } = await bench(false)
    expect(ctx.slots.entries('settings.general.item').some(candidate => candidate.component === DisplayDensityRow)).toBe(true)
    await fiber.dispose()
  })

  it('keeps both dictionaries key-identical', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  })
})

describe('display density node half and invariant', () => {
  it('adds no Host behavior', () => {
    expect(applyNode).not.toThrow()
  })

  it('reserves package ownership', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantRegistry, { enabled: true })
    const fiber = ctx.plugin(DensityInvariant)
    await fiber.await()
    expect(DensityInvariant.name).toBe('client-ui-display-density-invariant')
    expect(DensityInvariant.inject).toEqual(['invariants'])
    await fiber.dispose()
  })
})
