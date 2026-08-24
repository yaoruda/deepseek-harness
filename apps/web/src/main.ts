/**
 * Web application entry: thin bootstrap over the shell library. Everything —
 * module-table seeding, the boot page, and the UI-renderer handoff — lives
 * in @deepseek-ai/dsh-client-web; this file only finds the mount point.
 */
import { AppWebEntry } from '@deepseek-ai/dsh-client-web'

const el = document.getElementById('root')
if (el === null) throw new Error('web app: missing #root')
void new AppWebEntry(el).run()

const fixture = new URLSearchParams(location.search).has('fixture')
if (!fixture && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/service-worker.js').catch((error: unknown) => {
    console.warn('[web-app] service worker registration failed:', error)
  })
}
