// Optional real-browser checks: provide PLAYWRIGHT_MODULE and CHROME_PATH when
// using a bundled browser runtime instead of a local Playwright installation.
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

test('both overview links return to the top after visiting the long case study', async () => {
  for (const name of ['Overview', 'Back to overview']) {
    const page = await browser.newPage();
    try {
      await page.goto(url('whatsapp-campaigns.html'));
      await page.getByRole('link', { name: 'Learn More', exact: true }).click();
      await page.getByRole('link', { name, exact: true }).click();
      assert.ok(page.url().includes('whatsapp-campaigns.html'));
      await page.waitForFunction(() => scrollY < 2, null, { timeout: 3000 });
    } finally { await page.close(); }
  }
});

test('videos have one centred toggle instead of a native control bar', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    await page.goto(url('cretile-case-study.html'));
    const video = page.locator('video').first();
    const player = page.locator('.wa-video-player').first();
    assert.equal(await player.count(), 1, 'video must have its minimal player');
    await page.evaluate(() => document.fonts.ready);
    await video.evaluate(v => v.readyState > 0 ? undefined : new Promise(resolve => v.addEventListener('loadedmetadata', resolve, { once: true })));
    await player.scrollIntoViewIfNeeded();
    assert.equal(await video.evaluate(v => v.controls), false);
    const button = player.getByRole('button', { name: 'Play video', exact: true });
    // Read both rectangles in one frame, after fonts and media have sized the page.
    const { bounds, control } = await player.evaluate(el => ({
      bounds: el.getBoundingClientRect().toJSON(),
      control: el.querySelector('button').getBoundingClientRect().toJSON()
    }));
    assert.ok(Math.abs(control.x + control.width / 2 - bounds.x - bounds.width / 2) < 2);
    assert.ok(Math.abs(control.y + control.height / 2 - bounds.y - bounds.height / 2) < 2);
    await button.click();
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await player.getByRole('button', { name: 'Pause video', exact: true }).focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('video').paused);
    // The paused property changes before the browser dispatches its pause event.
    await player.getByRole('button', { name: 'Play video', exact: true }).waitFor({ state: 'visible' });
    assert.equal(await player.getByRole('button', { name: 'Play video', exact: true }).count(), 1);
  } finally { await page.close(); }
});

test('pausing a gallery clip remains respected when changing views', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url('whatsapp-campaigns.html'));
    await page.getByRole('tab', { name: 'Campaign creation', exact: true }).click();
    const video = page.locator('video');
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.getByRole('button', { name: 'Pause video', exact: true }).click();
    await page.getByRole('tab', { name: 'Workspace', exact: true }).click();
    assert.equal(await video.evaluate(v => v.paused), true);
    await page.getByRole('tab', { name: 'Campaign creation', exact: true }).click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await video.evaluate(v => v.paused), true);
    await page.getByRole('button', { name: 'Play video', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('video').paused);
  } finally { await page.close(); }
});

test('native playback controls remain available without JavaScript', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url('cretile-case-study.html'));
    const states = await page.locator('video').evaluateAll(videos => videos.map(v => v.controls));
    assert.ok(states.length > 0);
    assert.ok(states.every(Boolean));
  } finally { await context.close(); }
});

test('mobile preview tabs stay in one full-width scrolling row and reveal keyboard selection', async () => {
  const page = await browser.newPage({ viewport: { width: 442, height: 884 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url('whatsapp-campaigns.html'));
    const strip = page.getByRole('tablist');
    const layout = await strip.evaluate(el => ({
      tops: [...el.children].map(tab => tab.offsetTop),
      width: el.clientWidth, content: el.scrollWidth,
      left: el.getBoundingClientRect().left, available: document.documentElement.clientWidth
    }));
    assert.equal(new Set(layout.tops).size, 1, 'tabs must not wrap');
    assert.ok(layout.content > layout.width, 'mobile strip must scroll to fit every tab');
    assert.ok(Math.abs(layout.left) < 1 && Math.abs(layout.width - layout.available) < 1, 'strip should span the mobile viewport');
    await page.getByRole('tab', { name: 'Workspace', exact: true }).focus();
    await page.keyboard.press('End');
    const last = page.getByRole('tab', { name: 'Results', exact: true });
    assert.equal(await last.getAttribute('aria-selected'), 'true');
    const visible = await last.evaluate(el => {
      const tab = el.getBoundingClientRect();
      const row = el.parentElement.getBoundingClientRect();
      return tab.left >= row.left && tab.right <= row.right + 1;
    });
    assert.ok(visible, 'keyboard-selected tab must scroll into view');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally { await page.close(); }
});

test('Learn More is an underlined text link that still opens the full case study', async () => {
  const page = await browser.newPage({ viewport: { width: 442, height: 884 } });
  try {
    await page.goto(url('whatsapp-campaigns.html'));
    const link = page.getByRole('link', { name: 'Learn More', exact: true });
    const appearance = await link.evaluate(el => ({ underline: getComputedStyle(el).textDecorationLine, background: getComputedStyle(el).backgroundColor }));
    assert.ok(appearance.underline.includes('underline'));
    assert.equal(appearance.background, 'rgba(0, 0, 0, 0)');
    await link.click();
    assert.ok(page.url().endsWith('cretile-case-study.html'));
  } finally { await page.close(); }
});

test('project detail labels sit close to their values on mobile and desktop', async () => {
  const page = await browser.newPage();
  try {
    for (const width of [442, 1440]) {
      await page.setViewportSize({ width, height: 884 });
      await page.goto(url('whatsapp-campaigns.html'));
      await page.evaluate(() => document.fonts.ready);
      const gaps = await page.locator('.wa-project-details > div').evaluateAll(rows => rows.map(row => row.querySelector('dd').getBoundingClientRect().top - row.querySelector('dt').getBoundingClientRect().bottom));
      assert.ok(gaps.length > 0);
      assert.ok(gaps.every(gap => gap >= 0 && gap <= 3), 'label-to-value gap must be compact without overlap');
    }
  } finally { await page.close(); }
});
