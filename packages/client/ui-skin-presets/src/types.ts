/** Configuration and preference types for fixed whole-page skins. */

/** Skin choices exposed by the General settings row. */
export type SkinPreset = 'default' | 'cyberpunk' | 'morandi'

/** One deployment hostname and its first-run skin. */
export interface HostnameSkinDefault {
  /** Normalized browser hostname without a port. */
  hostname: string
  /** Skin used when the browser has no explicit saved choice. */
  preset: SkinPreset
}

/** Deployment-owned defaults consumed by the browser entry. */
export interface ClientConfig {
  /** Exact hostname defaults; unknown hosts use Default. */
  hostnameDefaults?: HostnameSkinDefault[]
}

/** Bootstrap global populated by the Host half before browser plugins run. */
export const SKIN_PRESET_BOOT_GLOBAL = '__DSH_SKIN_PRESETS__'
