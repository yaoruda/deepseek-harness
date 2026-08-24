import { useEffect, useState, type ReactNode } from 'react'
import type { ConnectionState, ConnectionStateSource } from '@deepseek-ai/dsh-client-connection/client'
import { IconRefreshOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { NS } from './locales.ts'
import css from './RecoveryControl.module.css'

const RELOAD_FALLBACK_MS = 6_000

/** Business face injected into the frame-wide recovery control. */
export interface RecoveryControlInjected {
  hooks: {
    /** Coarse state from the sole connection controller. */
    connectionState: ConnectionStateSource
  }
  /** Retire the current connection generation and retry immediately. */
  recover(): void
  /** Perform a full document reload when logical recovery cannot complete. */
  reload(): void
}

/** Full props for the frame-wide recovery control. */
export type RecoveryControlProps =
  PropsRuntime<'shell.overlay'>
  & PropsLocale<typeof NS>
  & InjectFace<RecoveryControlInjected>

/**
 * Frame-wide PWA recovery affordance. Connected desktop pages keep it hidden;
 * narrow or installed pages retain a compact 44 px target, and connection
 * loss expands it into an explicit recovery notice.
 * @param props - state source, recovery actions, and localized copy.
 * @returns the compact button or expanded recovery notice.
 */
export function RecoveryControl({ useConnectionState, recover, reload, t }: RecoveryControlProps): ReactNode {
  const state = useConnectionState((value: ConnectionState | undefined) => value)
  const [requested, setRequested] = useState(false)
  const recovering = state === 'reconnecting' || requested
  const [showReload, setShowReload] = useState(false)

  useEffect(() => {
    if (state === 'connected') {
      setRequested(false)
      setShowReload(false)
    }
  }, [state])

  useEffect(() => {
    if (!recovering) return
    const timer = setTimeout(() => { setShowReload(true) }, RELOAD_FALLBACK_MS)
    return () => { clearTimeout(timer) }
  }, [recovering])

  const onRecover = (): void => {
    setRequested(true)
    setShowReload(false)
    recover()
  }

  if (!recovering) {
    return (
      <button type="button" className={css.compact} aria-label={t('action.compact')} onClick={onRecover}>
        <IconRefreshOutline16 />
      </button>
    )
  }

  return (
    <div className={css.notice} role="status" aria-live="polite">
      <IconRefreshOutline16 className={css.spinning} />
      <span>{t(showReload ? 'status.waiting' : 'status.reconnecting')}</span>
      <button type="button" className={css.action} onClick={onRecover}>{t('action.recover')}</button>
      {showReload
        ? <button type="button" className={css.action} onClick={reload}>{t('action.refresh')}</button>
        : null}
    </div>
  )
}
