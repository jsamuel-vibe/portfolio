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

test('Learn More opens the complete story and both return links reset the overview to its top', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    for (const label of ['Overview', 'Back to overview']) {
      await page.goto(url('superstash.html'));
      assert.equal(await page.locator('.ss-exploration-board').count(), 0, 'the overview must not contain the full exploration story');
      await page.getByRole('link', { name: 'Learn More', exact: true }).click();
      assert.ok(page.url().endsWith('superstash-case-study.html'));
      assert.equal(await page.locator('.ss-exploration-board .ss-ex').count(), 12, 'preserve the complete reviewed board');
      await page.getByRole('link', { name: label, exact: true }).click();
      assert.ok(page.url().endsWith('superstash.html#top'));
      await page.waitForFunction(() => scrollY < 2);
    }
  } finally { await page.close(); }
});

test('mobile gallery scrolls on one row, supports keyboard selection and shows useful media instructions', async () => {
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
      const slot = panel.locator('[data-media-slot]');
      if (await slot.count()) {
        assert.ok((await slot.innerText()).length > 140, 'placeholder must explain the real capture needed');
        assert.equal(await slot.locator('img').count(), 0, 'a missing asset must not be represented by a broken image');
      }
    }
    await tabs.first().focus();
    await page.keyboard.press('End');
    assert.equal(await tabs.last().getAttribute('aria-selected'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally { await page.close(); }
});

test('old exploration and saving links still reach the corresponding full-story sections', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    for (const id of ['home-exploration', 'more-decisions']) {
      await page.goto(url('superstash.html') + '#' + id);
      await page.waitForURL('**/superstash-case-study.html#' + id);
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
    await page.getByRole('link', { name: 'Learn More', exact: true }).click();
    assert.ok(await page.locator('.wa-story-section').count() >= 8);
    assert.equal(await page.locator('.ss-exploration-board').isVisible(), true);
    for (const video of await page.locator('video').all()) assert.equal(await video.evaluate(el => el.controls), true);
  } finally { await context.close(); }
});
