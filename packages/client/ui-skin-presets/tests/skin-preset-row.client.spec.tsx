// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceSnapshot } from '@deepseek-ai/dsh-api-workspace-controller/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-test-runtime'
import { SkinPresetRow, type SkinPresetRowProps } from '../src/client/SkinPresetRow.tsx'
import { createSkinPresetStore } from '../src/client/store.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  title: '界面皮肤',
  description: '切换整套页面配色，仅保存在当前浏览器。',
  default: '默认',
  defaultHint: '跟随原生明暗主题',
  cyberpunk: '机械未来',
  cyberpunkHint: '冷黑、青色与紫色光感',
  morandi: '自然莫兰迪',
  morandiHint: '柔和、清新与低饱和',
}

function emptySessions() {
  return bindSnapshotSelector(createSnapshotStore<SessionListState>({
    ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {},
    jobsBySession: {}, currentAddress: undefined,
  }))
}

function emptyWorkspaces() {
  return bindSnapshotSelector(createSnapshotStore<WorkspaceSnapshot>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
  }))
}

type AttentionSnapshot = Parameters<Parameters<SkinPresetRowProps['useSessionPendingInteraction']>[0]>[0]
const noAttention: AttentionSnapshot = new Map()
const useSessionPendingInteraction: SkinPresetRowProps['useSessionPendingInteraction'] = selector => selector(noAttention)

describe('SkinPresetRow', () => {
  it('renders three whole-page presets and routes one gesture through its action', () => {
    const store = createSkinPresetStore('cyberpunk').create()
    const setPreset = vi.fn()
    const props: SkinPresetRowProps = {
      useSessions: emptySessions(),
      useSessionPendingInteraction,
      useWorkspaces: emptyWorkspaces(),
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      t: key => COPY[key] ?? key,
      setPreset,
    }
    render(<SkinPresetRow {...props} />)
    expect(screen.getByText('切换整套页面配色，仅保存在当前浏览器。')).toBeDefined()
    expect(screen.getByRole('button', { name: /机械未来/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /自然莫兰迪/ }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: /自然莫兰迪/ }))
    expect(setPreset).toHaveBeenCalledWith('morandi')
  })
})
