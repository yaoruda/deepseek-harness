/** Dictionary namespace owned by the connection-recovery control. */
export const NS = 'connectionRecovery'

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'status.reconnecting': '连接已中断，正在恢复…',
  'status.waiting': '连接仍未恢复',
  'action.recover': '立即重连',
  'action.refresh': '刷新页面',
  'action.compact': '恢复连接',
} as const

/** English dictionary, key-identical to the Chinese source. */
export const en: Record<ConnectionRecoveryKey, string> = {
  'status.reconnecting': 'Connection lost. Recovering…',
  'status.waiting': 'The connection is still unavailable',
  'action.recover': 'Reconnect now',
  'action.refresh': 'Reload page',
  'action.compact': 'Recover connection',
}

/** Key domain of the connection-recovery namespace. */
export type ConnectionRecoveryKey = keyof typeof zh
