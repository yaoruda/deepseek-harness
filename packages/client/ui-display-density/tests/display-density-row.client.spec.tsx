// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createSnapshotStore, type SessionListState, type WorkspaceListState,
} from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-test-runtime'
import { DisplayDensityRow } from '../src/client/DisplayDensityRow.tsx'
import type { DisplayDensityRowProps } from '../src/client/DisplayDensityRow.tsx'
import { createDisplayDensityStore } from '../src/client/store.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  title: '显示密度',
  description: '仅影响当前设备上的会话文字和表格。',
  standard: '标准',
  compact: '紧凑',
  extraCompact: '超紧凑',
}

function emptySessions() {
  return bindSnapshotSelector(createSnapshotStore<SessionListState>({
    ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {},
    jobsBySession: {}, currentAddress: undefined,
  }))
}

function emptyWorkspaces() {
  return bindSnapshotSelector(createSnapshotStore<WorkspaceListState>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
    baselinesReady: true, recentWorkspaceId: undefined,
  }))
}

describe('DisplayDensityRow', () => {
  it('renders three presets and sends the selected density through its injected action', () => {
    const store = createDisplayDensityStore('compact').create()
    const setDensity = vi.fn()
    const props: DisplayDensityRowProps = {
      useSessions: emptySessions(),
      useWorkspaces: emptyWorkspaces(),
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      t: key => COPY[key] ?? key,
      setDensity,
    }
    render(<DisplayDensityRow {...props} />)
    expect(screen.getByText('仅影响当前设备上的会话文字和表格。')).toBeDefined()
    expect(screen.getByRole('button', { name: '紧凑' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: '标准' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: '超紧凑' }))
    expect(setDensity).toHaveBeenCalledWith('extra-compact')
  })
})
