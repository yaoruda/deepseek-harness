// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import type { ConnectionState } from '@deepseek-ai/dsh-client-connection/client'
import { RecoveryControl, type RecoveryControlProps } from '../src/client/RecoveryControl.tsx'
import { zh } from '../src/client/locales.ts'

let snapshot: ConnectionState | undefined
const recover = vi.fn()
const reload = vi.fn()

function props(): RecoveryControlProps {
  const useConnectionState: RecoveryControlProps['useConnectionState'] = selector => selector(snapshot)
  return {
    useConnectionState,
    recover,
    reload,
    t: makeTranslate(zh),
  } as RecoveryControlProps
}

beforeEach(() => {
  snapshot = 'connected'
  recover.mockReset()
  reload.mockReset()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('RecoveryControl', () => {
  it('keeps a compact recovery target while connected and retries through the shared controller', () => {
    const { rerender } = render(<RecoveryControl {...props()} />)
    fireEvent.click(screen.getByRole('button', { name: zh['action.compact'] }))
    expect(recover).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toContain(zh['status.reconnecting'])

    snapshot = 'reconnecting'
    rerender(<RecoveryControl {...props()} />)
    snapshot = 'connected'
    rerender(<RecoveryControl {...props()} />)
    expect(screen.getByRole('button', { name: zh['action.compact'] })).toBeDefined()
  })

  it('offers full reload only after logical recovery remains unavailable', () => {
    snapshot = 'reconnecting'
    render(<RecoveryControl {...props()} />)
    expect(screen.queryByRole('button', { name: zh['action.refresh'] })).toBeNull()

    act(() => { vi.advanceTimersByTime(6_000) })
    expect(screen.getByRole('status').textContent).toContain(zh['status.waiting'])
    fireEvent.click(screen.getByRole('button', { name: zh['action.refresh'] }))
    expect(reload).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: zh['action.recover'] }))
    expect(recover).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: zh['action.refresh'] })).toBeNull()
  })

  it('treats the unresolved initial handshake as a compact, non-alarming state', () => {
    snapshot = undefined
    render(<RecoveryControl {...props()} />)
    expect(screen.getByRole('button', { name: zh['action.compact'] })).toBeDefined()
    expect(screen.queryByRole('status')).toBeNull()
  })
})
