// Keyless assembled-browser acceptance for the current-device density
// preference. A cold-seeded closed turn supplies both message roles and a
// four-column table; Chromium supplies the real font, padding, and overflow
// calculations at an iPhone-width viewport.
import { fileURLToPath } from 'node:url'
import type { Browser, BrowserContext, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, onTestFailed } from 'vitest'
import { createMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { SESSION_FORMAT_VERSION, Session, SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-title'
import {
  assertFixtureInventory, compareOrRefreshGolden, launchWebScaffold, seedSession,
  watchConsole, webSnapshotMode, type WebScaffold,
} from './scaffold.ts'
import { saveFailureShot } from './support.ts'

const SNAPSHOT_DIR = fileURLToPath(new URL('./snapshots/mobile-display-density', import.meta.url))
const METRICS_EXPECTED = fileURLToPath(
  new URL('./snapshots/mobile-display-density/metrics.expected.md', import.meta.url),
)
const MODE = webSnapshotMode()
const SEED_ID = 'mobile-display-density-web-e2e'
const USER_MARKER = 'MOBILE_DENSITY_USER'
const ASSISTANT_MARKER = 'MOBILE_DENSITY_ASSISTANT'
const TABLE_MARKER = 'Hotel'

/** Closed turn with phone-relevant prose and a compact four-column table. */
function densityFixture(): string {
  const session = Session.create(SessionId('mobile-display-density-source'))
  session.append('turn/start', { turn: 1 })
  const user = session.append('user/message', createUserMessage({
    content: [{ type: 'text', text: `${USER_MARKER}: compare these hotels.` }],
    source: { kind: 'user' },
  }), { surfaceOp: 'append' })
  session.append('session/title', {
    title: 'Mobile display density',
    messageSeqs: [user.seq],
    source: { kind: 'fallback' },
  })
  session.append('step/start', { turn: 1, step: 1 })
  session.append('assistant/message', {
    turn: 1,
    step: 1,
    message: createMessage({
      role: 'assistant',
      content: [{
        type: 'text',
        text: [
          `${ASSISTANT_MARKER}: compact conversation sample.`,
          '',
          `| ${TABLE_MARKER} | Area | Transit | Price |`,
          '| --- | --- | --- | --- |',
          '| Pine | Central | 12 min | 680 |',
          '| Bay | Harbor | 18 min | 590 |',
        ].join('\n'),
      }],
      source: { kind: 'model', provider: 'fixture', model: 'fixture' },
    }),
  }, { surfaceOp: 'append' })
  session.append('step/end', { turn: 1, step: 1 })
  session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
  return [
    JSON.stringify({
      type: 'session', version: SESSION_FORMAT_VERSION, id: '{{sessionId}}', createdAt: 0, cwd: '{{cwd}}',
    }),
    ...session.events.map(event => JSON.stringify(event)),
    '',
  ].join('\n')
}

interface DensityMetrics {
  density: string | undefined
  assistant: string
  user: string
  table: string
  cellPadding: string
  messageGap: string
  visibleColumns: number
  composer: string
}

/** Read user-visible density metrics from the assembled conversation. */
function readMetrics(page: Page): Promise<DensityMetrics> {
  return page.evaluate(({ userMarker, assistantMarker, tableMarker }) => {
    const user = [...document.querySelectorAll<HTMLElement>('[class*="bubble"]')]
      .find(element => element.textContent?.includes(userMarker) ?? false)
    const markdown = [...document.querySelectorAll<HTMLElement>('[class*="markdown"]')]
      .find(element => element.textContent?.includes(assistantMarker) ?? false)
    const table = [...document.querySelectorAll<HTMLTableElement>('table')]
      .find(element => element.textContent?.includes(tableMarker) ?? false)
    if (user === undefined || markdown === undefined || table === undefined) {
      throw new Error('mobile density fixture did not render every message target')
    }
    const wrapper = table.parentElement
    const column = markdown.closest('[class*="column"]')
    const composer = document.querySelector<HTMLTextAreaElement>('textarea')
    const firstCell = table.querySelector<HTMLElement>('th')
    if (wrapper === null || column === null || composer === null || firstCell === null) {
      throw new Error('mobile density fixture did not render every geometry target')
    }
    const textMetric = (element: HTMLElement): string => {
      const style = getComputedStyle(element)
      return `${style.fontSize}/${style.lineHeight}`
    }
    const wrapperRect = wrapper.getBoundingClientRect()
    const visibleColumns = [...table.querySelectorAll('th')].filter((cell) => {
      const rect = cell.getBoundingClientRect()
      const center = rect.left + rect.width / 2
      return center >= wrapperRect.left && center <= wrapperRect.right
    }).length
    const cellStyle = getComputedStyle(firstCell)
    return {
      density: document.body.dataset.dshDisplayDensity,
      assistant: textMetric(markdown),
      user: textMetric(user),
      table: textMetric(firstCell),
      cellPadding: `${cellStyle.paddingTop} ${cellStyle.paddingRight}`,
      messageGap: getComputedStyle(column).gap,
      visibleColumns,
      composer: textMetric(composer),
    }
  }, { userMarker: USER_MARKER, assistantMarker: ASSISTANT_MARKER, tableMarker: TABLE_MARKER })
}

/** Stable Markdown snapshot of exact selected metrics. */
function renderMetrics(compact: DensityMetrics, standard: DensityMetrics): string {
  return [
    '# Mobile display density metrics',
    '',
    '| mode | attribute | assistant | user | table | cell padding | message gap | visible columns | composer |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    `| compact default | ${compact.density ?? ''} | ${compact.assistant} | ${compact.user} | ${compact.table} | ${compact.cellPadding} | ${compact.messageGap} | ${String(compact.visibleColumns)} | ${compact.composer} |`,
    `| selected standard | ${standard.density ?? ''} | ${standard.assistant} | ${standard.user} | ${standard.table} | ${standard.cellPadding} | ${standard.messageGap} | ${String(standard.visibleColumns)} | ${standard.composer} |`,
  ].join('\n')
}

describe.skipIf(MODE === 'record')('web e2e: mobile display density', () => {
  let scaffold: WebScaffold
  let browser: Browser
  let context: BrowserContext
  let page: Page
  let tripwire: ReturnType<typeof watchConsole>

  beforeAll(async () => {
    scaffold = await launchWebScaffold({})
    await seedSession(scaffold, densityFixture(), SEED_ID)
    browser = await chromium.launch()
    context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US' })
    page = await context.newPage()
    tripwire = watchConsole(page)
    await page.goto(scaffold.baseUrl, { waitUntil: 'load' })
    await page.waitForSelector('[class*="frame"]', { timeout: 30_000 })
    await page.getByRole('button', { name: 'Open sidebar' }).click()
    await page.locator('[role="treeitem"]').first().click()
    const session = page.locator('[role="treeitem"]').nth(1)
    await session.waitFor({ timeout: 10_000 })
    await session.click()
    const closeSidebar = page.getByRole('button', { name: 'Collapse sidebar' })
    if (await closeSidebar.isVisible()) {
      await closeSidebar.click()
      await page.getByRole('button', { name: 'Open sidebar' }).waitFor({ timeout: 5_000 })
      await page.getByText('Workspaces', { exact: true }).waitFor({ state: 'hidden', timeout: 5_000 })
    }
    await page.getByText(ASSISTANT_MARKER, { exact: false }).waitFor({ timeout: 15_000 })
  }, 120_000)

  afterAll(async () => {
    await browser?.close()
    await scaffold?.close()
  })

  it('defaults the phone viewport to Compact and preserves an explicit Standard choice after reload', async () => {
    onTestFailed(() => saveFailureShot(page, 'web-e2e-mobile-display-density'))
    const compact = await readMetrics(page)
    expect(compact).toMatchObject({
      density: 'compact', assistant: '14px/22px', user: '14px/22px',
      table: '13px/20px', cellPadding: '7px 9px', messageGap: '12px', composer: '16px/24px',
    })
    expect(compact.visibleColumns).toBeGreaterThanOrEqual(3)

    await page.getByRole('button', { name: 'Open sidebar' }).click()
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.getByText('Display density', { exact: true }).waitFor({ timeout: 10_000 })
    expect(await dialog.getByRole('button', { name: 'Compact', exact: true }).getAttribute('aria-pressed')).toBe('true')
    await dialog.getByRole('button', { name: 'Standard', exact: true }).click()
    await expect.poll(() => page.evaluate(() => document.body.dataset.dshDisplayDensity)).toBe('standard')
    await page.keyboard.press('Escape')
    const standard = await readMetrics(page)
    expect(standard).toMatchObject({
      density: 'standard', assistant: '16px/28px', user: '16px/24px',
      table: '15px/25px', cellPadding: '10px 16px', messageGap: '16px', composer: '16px/24px',
    })

    const snapshot = renderMetrics(compact, standard)
    await compareOrRefreshGolden(METRICS_EXPECTED, snapshot, MODE)

    await page.reload({ waitUntil: 'load' })
    await page.getByText(ASSISTANT_MARKER, { exact: false }).waitFor({ timeout: 20_000 })
    expect((await readMetrics(page)).density).toBe('standard')
    expect(tripwire.pageErrors).toEqual([])
  }, 90_000)

  it('keeps its snapshot inventory closed', async () => {
    await assertFixtureInventory(SNAPSHOT_DIR, ['metrics.expected.md'])
  })
})
