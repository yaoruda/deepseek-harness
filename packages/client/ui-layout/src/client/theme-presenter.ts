/**
 * Global theme DOM applier: projects the resolved ThemeSnapshot onto the
 * document — `html { color-scheme }` for native UA chrome (scrollbars, form
 * controls), `body[data-ds-dark-theme]` for the token palette, the active
 * theme's alias-token overrides as inline CSS variables on body, and one
 * `meta[name="theme-color"]` for surrounding browser UI. Pure DOM writes, no
 * React involvement; an existing PWA metadata node is reused and restored,
 * while a presenter-created node is removed on disposal.
 */
import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Body attribute selecting the dark base palette in the token stylesheets. */
export const DARK_ATTRIBUTE = 'data-ds-dark-theme'

/** Applies theme snapshots to the document; one instance per plugin fiber. */
export class ThemePresenter {
  /** Token names this presenter wrote in the last apply (its retraction set). */
  private appliedTokens: string[] = []
  /** The single metadata node this presenter updates. */
  private readonly themeColorMeta: HTMLMetaElement
  /** Original content when the document supplied the metadata node. */
  private readonly originalThemeColor: string | undefined

  /** Reuse PWA metadata when present, otherwise create the presenter-owned node. */
  constructor() {
    const existing = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    this.themeColorMeta = existing ?? document.createElement('meta')
    this.originalThemeColor = existing?.content
    if (existing === null) this.themeColorMeta.name = 'theme-color'
  }

  /**
   * Project a snapshot onto the document: set root `color-scheme` and the body
   * palette attribute from `active.colorScheme` (never the id — `system` is
   * resolved upstream), then replace the previously applied token variables
   * with `active.tokens`. Browser theme-color metadata follows the computed
   * body background after those writes, so the rendered palette remains the
   * color authority.
   * @param snapshot - resolved theme snapshot from ctx.theme.
   */
  apply(snapshot: ThemeSnapshot): void {
    const scheme = snapshot.active.colorScheme
    document.documentElement.style.colorScheme = scheme
    const body = document.body
    if (scheme === 'dark') body.setAttribute(DARK_ATTRIBUTE, '')
    else body.removeAttribute(DARK_ATTRIBUTE)
    for (const name of this.appliedTokens) body.style.removeProperty(name)
    this.appliedTokens = []
    for (const [name, value] of Object.entries(snapshot.active.tokens)) {
      body.style.setProperty(name, value)
      this.appliedTokens.push(name)
    }
    this.themeColorMeta.content = getComputedStyle(body).backgroundColor
    if (!this.themeColorMeta.isConnected) document.head.append(this.themeColorMeta)
  }

  /** Retract theme writes, restoring document-owned metadata or removing the presenter-owned node. */
  dispose(): void {
    document.documentElement.style.removeProperty('color-scheme')
    const body = document.body
    body.removeAttribute(DARK_ATTRIBUTE)
    for (const name of this.appliedTokens) body.style.removeProperty(name)
    this.appliedTokens = []
    if (this.originalThemeColor === undefined) this.themeColorMeta.remove()
    else this.themeColorMeta.content = this.originalThemeColor
  }
}
