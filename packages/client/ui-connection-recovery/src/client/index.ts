/** Connection recovery browser plugin: frame control plus foreground repair. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { RecoveryControl, type RecoveryControlInjected } from './RecoveryControl.tsx'
import { en, NS, zh, type ConnectionRecoveryKey } from './locales.ts'

const FOREGROUND_RECOVERY_MIN_HIDDEN_MS = 10_000

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Copy for the frame-wide connection recovery control. */
    'connectionRecovery': ConnectionRecoveryKey
  }
}

export type { RecoveryControlInjected, RecoveryControlProps } from './RecoveryControl.tsx'
export type { ConnectionRecoveryKey } from './locales.ts'

/** Services used for state, locale copy, and the frame-wide slot. */
export const inject = ['connection', 'slots', 'locale']

/**
 * Register the recovery control and retire stale sockets when an installed
 * app returns after a material background interval.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  const connection = ctx.get('connection') as ConnectionHandle
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-connection-recovery: dictionaries')
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'connection-recovery',
    order: 10,
    locale: NS,
    inject: (): RecoveryControlInjected => ({
      hooks: { connectionState: connection.state },
      recover: () => { connection.recover() },
      reload: () => { location.reload() },
    }),
  }, RecoveryControl))

  if (typeof document === 'undefined') return
  let hiddenAt: number | undefined
  const onVisibilityChange = (): void => {
    if (document.hidden) {
      hiddenAt = Date.now()
      return
    }
    if (hiddenAt !== undefined && Date.now() - hiddenAt >= FOREGROUND_RECOVERY_MIN_HIDDEN_MS) {
      connection.recover()
    }
    hiddenAt = undefined
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  ctx.effect(() => () => { document.removeEventListener('visibilitychange', onVisibilityChange) }, 'ui-connection-recovery: foreground listener')
}
