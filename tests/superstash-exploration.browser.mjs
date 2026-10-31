// Optional browser checks for the real-screen exploration section.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = pathToFileURL(resolve('superstash.html')).href;
let browser;
before(async () => {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
});
after(async () => { await browser?.close(); });

test('research excerpts replace the placeholder and stay in bounds at mobile and desktop widths', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    for (const width of [320, 442, 900, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url);
      assert.equal(await page.locator('[data-media-slot="SS-04"]').count(), 0, 'supplied research must replace the missing-media slot');
      const board = page.locator('#research');
      assert.equal(await board.count(), 1, 'research needs a discoverable section');
      const excerpts = board.locator('figure');
      assert.equal(await excerpts.count(), 5);
      for (const excerpt of await excerpts.all()) {
        assert.ok((await excerpt.locator('figcaption').innerText()).length > 20, 'each excerpt needs readable context');
        const image = excerpt.locator('img');
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(el => el.decode());
        const bounds = await image.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'research must not overflow');
        const ratios = await image.evaluate(el => ({ source: el.naturalWidth / el.naturalHeight, shown: el.clientWidth / el.clientHeight }));
        assert.ok(Math.abs(ratios.source - ratios.shown) < 0.02, 'show the complete cropped excerpt');
        if (width <= 640) assert.ok(bounds.width >= width - 100, 'mobile excerpts must use the available width');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
  } finally { await page.close(); }
});

test('every research crop opens its own full-size source and returns keyboard focus', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url);
    const triggers = page.locator('#research button[data-lightbox]');
    assert.equal(await triggers.count(), 5);
    for (const trigger of await triggers.all()) {
      const source = await trigger.locator('img').getAttribute('src');
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });
      assert.ok((await dialog.locator('img').getAttribute('src')).endsWith(source));
      assert.ok((await dialog.locator('.lb-caption').innerText()).length > 20);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
    }
  } finally { await page.close(); }
});

test('drafts and the working screen remain uncropped and readable at mobile and desktop widths', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    for (const width of [320, 442, 900, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url);
      const section = page.locator('#home-exploration');
      assert.equal(await section.count(), 1, 'home exploration must be available without a carousel');
      await section.scrollIntoViewIfNeeded();
      const drafts = section.locator('.ss-exploration-board img');
      assert.ok(await drafts.count() >= 4, 'show genuinely different layout explorations');
      for (const image of await section.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(el => el.decode());
        const bounds = await image.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'images must stay within the page');
        const ratio = await image.evaluate(el => ({ source: el.naturalWidth / el.naturalHeight, displayed: el.clientWidth / el.clientHeight }));
        assert.ok(Math.abs(ratio.source - ratio.displayed) < 0.02, 'preserve every edge of each screen');
        if (width <= 640) assert.ok(bounds.width >= width - 100, 'do not shrink the exploration board into illegible mobile thumbnails');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
  } finally { await page.close(); }
});

test('each exploration opens its own full-resolution screen and closes back to its trigger', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url);
    const triggers = page.locator('#home-exploration button[data-lightbox]');
    assert.ok(await triggers.count() >= 5, 'both explorations and the working screen must open full size');
    for (const trigger of await triggers.all()) {
      const source = await trigger.locator('img').getAttribute('src');
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });
      assert.ok((await dialog.locator('img').getAttribute('src')).endsWith(source));
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
    }
  } finally { await page.close(); }
});
