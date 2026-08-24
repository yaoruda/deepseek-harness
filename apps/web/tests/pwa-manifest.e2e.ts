import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const DIST_ROOT = fileURLToPath(new URL('../dist', import.meta.url))

it('ships install metadata with the built web application', async () => {
  const index = await readFile(join(DIST_ROOT, 'index.html'), 'utf8')
  expect(index).toContain('<link rel="manifest" href="/manifest.webmanifest" />')
  expect(index).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />')

  const manifest: unknown = JSON.parse(await readFile(join(DIST_ROOT, 'manifest.webmanifest'), 'utf8'))
  expect(manifest).toEqual({
    id: '/',
    name: 'DeepSeek Harness',
    short_name: 'DSH',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    icons: [{
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    }, {
      src: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
      purpose: 'any',
    }],
  })
  expect(await readFile(join(DIST_ROOT, 'apple-touch-icon.png'))).not.toHaveLength(0)
})

it('ships a recovery service worker without caching navigations or API responses', async () => {
  const assets = await readdir(join(DIST_ROOT, 'assets'))
  const scripts = await Promise.all(assets
    .filter(name => name.endsWith('.js'))
    .map(name => readFile(join(DIST_ROOT, 'assets', name), 'utf8')))
  expect(scripts.join('\n')).toMatch(/serviceWorker\.register\(["']\/service-worker\.js["']\)/)

  const worker = await readFile(join(DIST_ROOT, 'service-worker.js'), 'utf8')
  expect(worker).toContain("request.mode === 'navigate'")
  expect(worker).toContain("url.pathname.startsWith('/api/')")
  expect(worker).toContain("url.pathname.startsWith('/plugins/')")
  expect(worker).toContain("url.pathname.startsWith('/assets/')")
})

it('ships a favicon that switches to a light mark under dark color scheme', async () => {
  const favicon = await readFile(join(DIST_ROOT, 'favicon.svg'), 'utf8')
  // The light fill must live inside the dark-scheme media query, so the icon
  // stays black in light mode and only turns white under a dark scheme.
  expect(favicon).toMatch(/@media \(prefers-color-scheme: dark\)\s*{\s*path\s*{[^}]*fill:\s*#fff/i)
  expect(favicon).toContain('fill="#000"')
})
