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
    await player.scrollIntoViewIfNeeded();
    assert.equal(await video.evaluate(v => v.controls), false);
    const button = player.getByRole('button', { name: 'Play video', exact: true });
    const bounds = await player.boundingBox();
    const control = await button.boundingBox();
    assert.ok(Math.abs(control.x + control.width / 2 - bounds.x - bounds.width / 2) < 2);
    assert.ok(Math.abs(control.y + control.height / 2 - bounds.y - bounds.height / 2) < 2);
    await button.click();
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await player.getByRole('button', { name: 'Pause video', exact: true }).focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('video').paused);
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
