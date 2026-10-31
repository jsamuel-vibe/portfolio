import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = name => pathToFileURL(resolve(root, name)).href;
let browser;
before(async () => { browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) }); });
after(async () => { await browser?.close(); });

test('the overview continues into the complete story and old story links land on the same page', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    await page.goto(url('superstash.html'));
    assert.equal(await page.getByRole('link', { name: 'Learn More', exact: true }).count(), 0);
    assert.equal(await page.locator('.ss-exploration-board .ss-ex').count(), 12, 'preserve the complete reviewed board');
    await page.goto(url('superstash-case-study.html'));
    await page.waitForURL('**/superstash.html');
  } finally { await page.close(); }
});

test('mobile gallery scrolls on one row, supports keyboard selection and shows finished media in every tab', async () => {
  const page = await browser.newPage({ viewport: { width: 442, height: 884 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url('superstash.html'));
    const strip = page.getByRole('tablist');
    const layout = await strip.evaluate(el => ({ tops: [...el.children].map(tab => tab.offsetTop), width: el.clientWidth, scroll: el.scrollWidth }));
    assert.equal(new Set(layout.tops).size, 1);
    assert.ok(layout.scroll > layout.width);
    const tabs = page.getByRole('tab');
    assert.equal(await tabs.count(), 5);
    for (const tab of await tabs.all()) {
      await tab.click();
      const panel = page.locator('#' + await tab.getAttribute('aria-controls'));
      assert.equal(await panel.isVisible(), true);
      assert.equal(await page.getByRole('tabpanel').filter({ visible: true }).count(), 1);
      assert.equal(await panel.locator('[data-media-slot]').count(), 0, 'every tab shows finished media, not a placeholder');
      assert.equal(await panel.locator('img.media, video.media').count(), 1, 'each tab shows exactly one image or video');
    }
    await tabs.first().focus();
    await page.keyboard.press('End');
    assert.equal(await tabs.last().getAttribute('aria-selected'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally { await page.close(); }
});

test('old exploration and saving links still reach the corresponding story sections', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    for (const id of ['home-exploration', 'more-decisions']) {
      await page.goto(url('superstash-case-study.html') + '#' + id);
      await page.waitForURL('**/superstash.html#' + id);
      assert.equal(await page.locator('#' + id).count(), 1);
    }
  } finally { await page.close(); }
});

test('without JavaScript the full story, preview media slots and native video controls remain available', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url('superstash.html'));
    assert.equal(await page.locator('[role="tabpanel"]').count(), 5);
    for (const panel of await page.locator('[role="tabpanel"]').all()) assert.equal(await panel.isVisible(), true);
    assert.ok(await page.locator('.wa-story-section').count() >= 8);
    assert.equal(await page.locator('.ss-exploration-board').isVisible(), true);
    for (const video of await page.locator('video').all()) assert.equal(await video.evaluate(el => el.controls), true);
  } finally { await context.close(); }
});
