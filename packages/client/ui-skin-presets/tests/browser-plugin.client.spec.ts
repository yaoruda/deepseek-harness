// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import InvariantRegistry from '@deepseek-ai/dsh-invariants'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { stubSettingsScope } from '@deepseek-ai/dsh-client-test-runtime'
import { apply as applyLocale, inject as localeInject } from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type { IndexInjection } from '@deepseek-ai/dsh-host-webserver'
import { apply, inject } from '../src/client/index.ts'
import { Config as SkinConfig, apply as applyNode } from '../src/index.ts'
import * as SkinInvariant from '../src/invariant.ts'
import { SkinPresetRow, type SkinPresetRowInjected } from '../src/client/SkinPresetRow.tsx'
import {
  CYBERPUNK_THEME_ID, MORANDI_THEME_ID, SKIN_PRESET_STORAGE_KEY,
} from '../src/client/presets.ts'
import { en, NS, zh } from '../src/client/locales.ts'
import type { createSkinPresetStore } from '../src/client/store.ts'
import { SKIN_PRESET_BOOT_GLOBAL } from '../src/types.ts'

const CONFIG = {
  hostnameDefaults: [
    { hostname: 'localhost', preset: 'cyberpunk' as const },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  delete document.body.dataset.dshSkin
  delete window.__DSH_SKIN_PRESETS__
})

function themeFixture(ctx: Context) {
  const definitions = new Map<string, { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }>()
  const setTheme = vi.fn((id: string) => {
    const active = id === 'system'
      ? { id: 'light', colorScheme: 'light' as const, tokens: {} }
      : definitions.get(id) ?? { id, colorScheme: 'dark' as const, tokens: {} }
    ctx.emit('theme/change', {
      preference: 'system', active, themes: [...definitions.values()], revision: setTheme.mock.calls.length,
    })
  })
  return {
    definitions,
    service: {
      register: vi.fn((definition: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }) => {
        definitions.set(definition.id, definition)
        return () => { definitions.delete(definition.id) }
      }),
      setTheme,
    },
  }
}

async function bench(saved?: string, config?: typeof CONFIG) {
  if (saved !== undefined) localStorage.setItem(SKIN_PRESET_STORAGE_KEY, saved)
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.slots.register({
    name: 'root',
    children: { 'settings.general.item': { kind: 'list', scope: 'root' } },
  } as never, () => null)
  ctx.provide('connection', {
    api: { settings: { describe: () => Promise.resolve({
      rpcId: 'skin-test' as never,
      result: { ok: true, value: { writable: true, hasDocument: false, namespaces: [] } },
    }) } },
    isLoopback: true,
  } as never)
  ctx.provide('remote', { $on: () => () => {} } as never)
  ctx.provide('settingsScope', { bind: () => stubSettingsScope().scope } as never)
  await ctx.plugin({ inject: localeInject, apply: applyLocale }).await()
  ctx.locale.setLocale('zh')
  const theme = themeFixture(ctx)
  ctx.provide('theme', theme.service as never)
  const fiber = config === undefined
    ? ctx.plugin({ inject: [...inject], apply })
    : ctx.plugin({ inject: [...inject], apply }, config)
  await fiber.await()
  return { ctx, fiber, theme }
}

describe('fixed skin browser half', () => {
  it('defaults localhost to cyberpunk, composes its row, and retracts every registration', async () => {
    const { ctx, fiber, theme } = await bench(undefined, CONFIG)
    expect(inject).toEqual(['slots', 'locale', 'theme'])
    expect(theme.definitions.has(CYBERPUNK_THEME_ID)).toBe(true)
    expect(theme.definitions.has(MORANDI_THEME_ID)).toBe(true)
    expect(theme.service.setTheme).toHaveBeenCalledWith(CYBERPUNK_THEME_ID)
    expect(document.body.dataset.dshSkin).toBe('cyberpunk')
    const entry = ctx.slots.entries('settings.general.item').find(candidate => candidate.component === SkinPresetRow)!
    expect(entry.options).toMatchObject({ id: 'skin-presets', order: 12 })
    expect(entry.locale).toBe(NS)
    const store = entry.store as ReturnType<typeof createSkinPresetStore>
    const instance = store.create()
    const injected = (entry.inject as unknown as (
      actions: typeof instance.actions,
    ) => SkinPresetRowInjected)(instance.actions)
    expect(instance.getSnapshot().preset).toBe('cyberpunk')
    injected.setPreset('morandi')
    expect(document.body.dataset.dshSkin).toBe('morandi')
    expect(instance.getSnapshot().preset).toBe('morandi')
    expect(localStorage.getItem(SKIN_PRESET_STORAGE_KEY)).toBe('morandi')
    const t = ctx.locale.bind(NS)
    expect(t('cyberpunk')).toBe(zh.cyberpunk)
    ctx.locale.setLocale('en')
    expect(t('cyberpunk')).toBe(en.cyberpunk)

    await fiber.dispose()
    expect(theme.definitions.size).toBe(0)
    expect(ctx.slots.entries('settings.general.item').some(candidate => candidate.component === SkinPresetRow)).toBe(false)
    expect(document.body.hasAttribute('data-dsh-skin')).toBe(false)
  })

  it('loads without forwarded client config and falls back to Default', async () => {
    const { fiber, theme } = await bench()
    expect(theme.service.setTheme).toHaveBeenCalledWith('system')
    expect(document.body.dataset.dshSkin).toBe('default')
    await fiber.dispose()
  })

  it('reads hostname defaults from the Host bootstrap global', async () => {
    Object.assign(window, { [SKIN_PRESET_BOOT_GLOBAL]: CONFIG })
    const { fiber, theme } = await bench()
    expect(theme.service.setTheme).toHaveBeenCalledWith(CYBERPUNK_THEME_ID)
    expect(document.body.dataset.dshSkin).toBe('cyberpunk')
    await fiber.dispose()
  })

  it('honors explicit Default and relinquishes a skin when Appearance selects a built-in theme', async () => {
    const { ctx, fiber, theme } = await bench('default')
    expect(theme.service.setTheme).toHaveBeenCalledWith('system')
    expect(document.body.dataset.dshSkin).toBe('default')
    theme.service.setTheme('dark')
    expect(localStorage.getItem(SKIN_PRESET_STORAGE_KEY)).toBe('default')
    const entry = ctx.slots.entries('settings.general.item').find(candidate => candidate.component === SkinPresetRow)!
    const store = entry.store as ReturnType<typeof createSkinPresetStore>
    const instance = store.create()
    const attach = entry.inject as unknown as (actions: typeof instance.actions) => SkinPresetRowInjected
    attach(instance.actions)
    expect(instance.getSnapshot().preset).toBe('default')
    await fiber.dispose()
  })

  it('keeps both dictionaries key-identical and validates Host configuration', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
    expect(SkinConfig({})).toEqual({ hostnameDefaults: [] })
    expect(SkinConfig(CONFIG)).toEqual(CONFIG)
    expect(() => SkinConfig({ hostnameDefaults: [{ hostname: 'example.com', preset: 'unknown' }] } as never))
      .toThrow()
  })

  it('publishes validated hostname defaults until Host disposal', async () => {
    const ctx = new Context()
    const fiber = ctx.plugin({ apply: applyNode }, SkinConfig(CONFIG))
    await fiber.await()
    const table: IndexInjection[] = []
    ctx.emit('webserver/index-inject', table)
    expect(table).toEqual([{ kind: 'global', name: SKIN_PRESET_BOOT_GLOBAL, value: CONFIG }])
    await fiber.dispose()
    const disposed: IndexInjection[] = []
    ctx.emit('webserver/index-inject', disposed)
    expect(disposed).toEqual([])
  })
})

describe('fixed skin invariant companion', () => {
  it('reserves package ownership', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantRegistry, { enabled: true })
    const fiber = ctx.plugin(SkinInvariant)
    await fiber.await()
    expect(SkinInvariant.name).toBe('client-ui-skin-presets-invariant')
    expect(SkinInvariant.inject).toEqual(['invariants'])
    await fiber.dispose()
  })
})
