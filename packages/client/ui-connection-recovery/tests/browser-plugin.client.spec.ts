// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import InvariantRegistry from '@deepseek-ai/dsh-invariants'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { stubSettingsScope } from '@deepseek-ai/dsh-client-test-runtime'
import { apply as applyLocale, inject as localeInject } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index.ts'
import { apply as applyNode } from '../src/index.ts'
import * as RecoveryInvariant from '../src/invariant.ts'
import { en, NS, zh } from '../src/client/locales.ts'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.slots.register({
    name: 'root',
    children: { 'shell.overlay': { kind: 'list', scope: 'root' } },
  } as never, () => null)
  const recover = vi.fn()
  ctx.provide('connection', {
    api: { settings: {} },
    isLoopback: false,
    state: { getSnapshot: () => 'connected', subscribe: () => () => {} },
    recover,
  } as never)
  ctx.provide('remote', { $on: () => () => {} } as never)
  ctx.provide('settingsScope', { bind: () => stubSettingsScope().scope } as never)
  await ctx.plugin({ inject: localeInject, apply: applyLocale }).await()
  ctx.locale.setLocale('zh')
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, recover }
}

describe('connection recovery browser half', () => {
  it('registers localized overlay UI and removes it with the fiber', async () => {
    const { ctx, fiber, recover } = await bench()
    expect(inject).toEqual(['connection', 'slots', 'locale'])
    expect(ctx.slots.entries('shell.overlay').map(entry => entry.options.id)).toContain('connection-recovery')
    const entry = ctx.slots.entries('shell.overlay')[0]!
    const injected = entry.inject as unknown as () => import('../src/client/index.ts').RecoveryControlInjected
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })
    expect(injected().hooks.connectionState.getSnapshot()).toBe('connected')
    injected().recover()
    injected().reload()
    expect(recover).toHaveBeenCalledTimes(1)
    expect(reload).toHaveBeenCalledTimes(1)
    const t = ctx.locale.bind(NS)
    expect(t('action.recover')).toBe(zh['action.recover'])
    ctx.locale.setLocale('en')
    expect(t('action.recover')).toBe(en['action.recover'])
    await fiber.dispose()
    expect(ctx.slots.entries('shell.overlay').map(entry => entry.options.id)).not.toContain('connection-recovery')
  })

  it('recovers after returning from a material background interval and disposes the listener', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_700_000_000_000)
    const hidden = vi.spyOn(document, 'hidden', 'get')
    const { fiber, recover } = await bench()

    hidden.mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    vi.setSystemTime(1_700_000_010_000)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(recover).toHaveBeenCalledTimes(1)

    // A brief background visit remains below the product recovery interval.
    hidden.mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    vi.setSystemTime(1_700_000_019_999)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(recover).toHaveBeenCalledTimes(1)

    await fiber.dispose()
    hidden.mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    vi.setSystemTime(1_700_000_040_000)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(recover).toHaveBeenCalledTimes(1)
  })

  it('registers the overlay without a document lifecycle in non-browser rendering', async () => {
    vi.stubGlobal('document', undefined)
    const { ctx, fiber } = await bench()
    expect(ctx.slots.entries('shell.overlay')).toHaveLength(1)
    await fiber.dispose()
  })

  it('keeps both dictionaries key-identical', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  })
})

describe('connection recovery node half and invariant', () => {
  it('adds no Host behavior', () => {
    expect(applyNode).not.toThrow()
  })

  it('reserves package ownership', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantRegistry, { enabled: true })
    const fiber = ctx.plugin(RecoveryInvariant)
    await fiber.await()
    expect(RecoveryInvariant.name).toBe('client-ui-connection-recovery-invariant')
    expect(RecoveryInvariant.inject).toEqual(['invariants'])
    await fiber.dispose()
  })
})
