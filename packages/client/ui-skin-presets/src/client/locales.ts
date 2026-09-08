/** `settings.skinPresets` dictionaries. */

/** Locale namespace owned by this plugin. */
export const NS = 'settings.skinPresets'

/** Simplified Chinese dictionary and key-set source. */
export const zh = {
  'title': '界面皮肤',
  'description': '切换整套页面配色，仅保存在当前浏览器。',
  'default': '默认',
  'defaultHint': '跟随原生明暗主题',
  'cyberpunk': '机械未来',
  'cyberpunkHint': '冷黑、青色与紫色光感',
  'morandi': '自然莫兰迪',
  'morandiHint': '柔和、清新与低饱和',
} satisfies Record<string, string>

/** Fixed-skin locale key union. */
export type SkinPresetKey = keyof typeof zh

/** English dictionary, complete against the Chinese key set. */
export const en = {
  'title': 'Interface skin',
  'description': 'Switch the whole-page palette for this browser only.',
  'default': 'Default',
  'defaultHint': 'Use the native light or dark theme',
  'cyberpunk': 'Cyberpunk',
  'cyberpunkHint': 'Dark machinery with cyan and violet glow',
  'morandi': 'Natural Morandi',
  'morandiHint': 'Soft, fresh, and low-saturation',
} satisfies Record<SkinPresetKey, string>
