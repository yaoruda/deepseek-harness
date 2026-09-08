// Keyless assembled-app acceptance for the mobile recovery path. The test
// severs the real browser transport, recovers it through the overlay control,
// and then proves a full reload returns to the selected session with its
// unsent text draft.
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import type { Browser, BrowserContext, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, onTestFailed } from 'vitest'
import {
  assertFixtureInventory, captureStableAria, compareOrRefreshGolden,
  launchWebScaffold, seedSession, webSnapshotMode, type WebScaffold,
} from './scaffold.ts'
import { saveFailureShot } from './support.ts'

const FIXTURE = fileURLToPath(new URL('./snapshots/fresh-round-trip/session.jsonl', import.meta.url))
const SNAPSHOT_DIR = fileURLToPath(new URL('./snapshots/pwa-recovery', import.meta.url))
const OUTAGE_EXPECTED = join(SNAPSHOT_DIR, 'outage.expected.md')
const MODE = webSnapshotMode()
const SEED_ID = 'pwa-recovery-session'
const DRAFT = 'Keep this unsent draft across recovery.'

describe.skipIf(MODE === 'record')('web e2e: PWA connection recovery', () => {
  let scaffold: WebScaffold
  let browser: Browser
  let browserContext: BrowserContext
  let page: Page

  beforeAll(async () => {
    scaffold = await launchWebScaffold({})
    await seedSession(scaffold, await readFile(FIXTURE, 'utf8'), SEED_ID)
    browser = await chromium.launch()
    browserContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US' })
    page = await browserContext.newPage()
    await page.goto(scaffold.baseUrl, { waitUntil: 'load' })
    await page.waitForSelector('[class*="frame"]', { timeout: 30_000 })
  }, 120_000)

  afterAll(async () => {
    await browser?.close()
    await scaffold?.close()
  })

  it('surfaces an explicit recovery path when the installed-size page loses transport', async () => {
    onTestFailed(() => saveFailureShot(page, 'web-e2e-pwa-recovery-outage'))
    const compact = page.getByRole('button', { name: 'Recover connection' })
    await compact.waitFor({ timeout: 15_000 })
    await browserContext.setOffline(true)
    // Existing WebSockets can remain open across browser offline emulation;
    // the installed-app recovery action explicitly retires them and makes the
    // unavailable replacement generation observable.
    await compact.click()
    const notice = page.getByRole('status')
    await notice.waitFor({ timeout: 15_000 })

    const snapshot = await captureStableAria(page, '[role="status"]', scaffold.workspaceCwd)
    await compareOrRefreshGolden(OUTAGE_EXPECTED, snapshot, MODE)

    await browserContext.setOffline(false)
    await page.getByRole('button', { name: 'Reconnect now' }).click()
    await expect.poll(() => notice.count(), { timeout: 15_000 }).toBe(0)
    await page.getByRole('button', { name: 'Recover connection' }).waitFor({ timeout: 10_000 })
  }, 60_000)

  it('returns to the selected session and keeps an unsent text draft after full reload', async () => {
    onTestFailed(() => saveFailureShot(page, 'web-e2e-pwa-recovery-reload'))
    await page.getByRole('button', { name: 'Open sidebar' }).click()
    await page.locator('[role="treeitem"]').first().click()
    const session = page.locator('[role="treeitem"]').nth(1)
    await session.waitFor({ timeout: 10_000 })
    await session.click()

    const composer = page.getByRole('textbox', { name: 'Message the agent' })
    await composer.waitFor({ timeout: 15_000 })
    await composer.fill(DRAFT)
    await page.reload({ waitUntil: 'load' })

    const restored = page.getByRole('textbox', { name: 'Message the agent' })
    await restored.waitFor({ timeout: 20_000 })
    await expect.poll(() => restored.inputValue()).toBe(DRAFT)
  }, 60_000)

  it('keeps its snapshot inventory closed', async () => {
    await assertFixtureInventory(SNAPSHOT_DIR, ['outage.expected.md'])
  })
})
