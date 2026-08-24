/** `settings.displayDensity` dictionaries. */

/** Locale namespace owned by this plugin. */
export const NS = 'settings.displayDensity'

/** Simplified Chinese dictionary and key-set source. */
export const zh = {
  'title': '显示密度',
  'description': '仅影响当前设备上的会话文字和表格。',
  'standard': '标准',
  'compact': '紧凑',
  'extraCompact': '超紧凑',
} satisfies Record<string, string>

/** Display-density locale key union. */
export type DisplayDensityKey = keyof typeof zh

/** English dictionary, complete against the Chinese key set. */
export const en = {
  'title': 'Display density',
  'description': 'Affects conversation text and tables on this device only.',
  'standard': 'Standard',
  'compact': 'Compact',
  'extraCompact': 'Extra compact',
} satisfies Record<DisplayDensityKey, string>
