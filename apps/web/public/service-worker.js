const SHELL_CACHE = 'dsh-shell-v1'
const SHELL_CACHE_PREFIX = 'dsh-shell-'

self.addEventListener('install', () => {
  void self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names
      .filter(name => name.startsWith(SHELL_CACHE_PREFIX) && name !== SHELL_CACHE)
      .map(name => caches.delete(name)))
    await self.clients.claim()
  })())
})

function isShellAsset(url) {
  return url.pathname.startsWith('/assets/')
    || (url.pathname.startsWith('/plugins/') && url.pathname !== '/plugins/events')
    || url.pathname === '/manifest.webmanifest'
    || url.pathname === '/favicon.svg'
    || url.pathname === '/apple-touch-icon.png'
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || request.mode === 'navigate' || url.pathname.startsWith('/api/')) return
  if (!isShellAsset(url)) return

  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE)
    const cached = await cache.match(request)
    if (cached !== undefined) return cached
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  })())
})
