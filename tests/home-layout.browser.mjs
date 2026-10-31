// Optional browser checks; uses the same runtime overrides as the Cretile checks.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const home = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), '../index.html')).href;
let browser;
before(async () => {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
});
after(async () => { await browser?.close(); });

test('desktop introduction shares one left edge and follows the top contact navigation', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    await page.goto(home);
    const title = await page.locator('h1').boundingBox();
    const copy = await page.locator('.hero-sub').boundingBox();
    assert.ok(Math.abs(title.x - copy.x) < 2, 'introduction must not stagger into a second column');
    assert.ok(copy.y >= title.y + title.height, 'supporting copy follows the heading');
    const contact = page.getByRole('link', { name: 'Get in touch', exact: true });
    assert.equal(await contact.count(), 1);
    const bounds = await contact.boundingBox();
    assert.ok(bounds.y + bounds.height < title.y);
    await contact.click();
    assert.ok(page.url().endsWith('#contact'));
  } finally { await page.close(); }
});

test('project cards open the matching case studies from the image, title and button', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    await page.goto(home);
    const cards = page.locator('#work article');
    assert.equal(await cards.count(), 2, 'two independently linked project cards');
    for (const [index, target] of ['superstash.html', 'whatsapp-campaigns.html'].entries()) {
      const card = cards.nth(index);
      await card.getByRole('link', { name: 'View case study', exact: true }).click();
      assert.ok(page.url().endsWith(target));
      await page.goto(home);
      await card.getByRole('heading').getByRole('link').click();
      assert.ok(page.url().endsWith(target));
      await page.goto(home);
      await cards.nth(index).locator('a.feature-media').click();
      assert.ok(page.url().endsWith(target));
      await page.goto(home);
    }
  } finally { await page.close(); }
});

test('desktop projects stack one after another with alternating image sides', async () => {
  const page = await browser.newPage();
  try {
    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1080 });
      await page.goto(home);
      const cards = page.locator('#work article');
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      assert.ok(second.y >= first.y + first.height, `${width}px viewport: projects follow one another`);
      const side = async index => {
        const image = await cards.nth(index).locator('.feature-media').boundingBox();
        const copy = await cards.nth(index).locator('.feature-text').boundingBox();
        return image.x > copy.x ? 'right' : 'left';
      };
      assert.equal(await side(0), 'right', 'first image sits right of its text');
      assert.equal(await side(1), 'left', 'second image sits left of its text');
      assert.ok(await page.locator('h1').evaluate(el => parseFloat(getComputedStyle(el).fontSize) <= 48), 'hero must stay within the size cap');
    }
  } finally { await page.close(); }
});

test('all main pages load the approved Crimson Pro headings without a remote font service', async () => {
  const page = await browser.newPage();
  try {
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    for (const name of ['index.html', 'superstash.html', 'whatsapp-campaigns.html']) {
      await page.goto(new URL(name, home).href);
      await page.evaluate(() => document.fonts.ready);
      // Superstash's small story labels are deliberately sans serif (superstash.css).
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(elements => elements.filter(el => !el.matches('.ss-story .wa-story-label')).map(el => ({
        text: el.textContent.trim(), family: getComputedStyle(el).fontFamily
      })));
      assert.ok(headings.length > 0);
      for (const heading of headings) assert.match(heading.family, /^['"]?Crimson Pro['"]?(?:,|$)/, `${name}: ${heading.text}`);
      assert.equal(await page.evaluate(() => [...document.fonts].some(font => font.family.replace(/["']/g, '') === 'Crimson Pro' && font.status === 'loaded')), true, `${name}: local heading font must actually load`);
    }
  } finally { await page.close(); }
});

test('homepage introduction has a narrower measure and clear space before the projects', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  try {
    await page.goto(home);
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const portrait = document.querySelector('.site-portrait').getBoundingClientRect();
      const title = document.querySelector('h1').getBoundingClientRect();
      const copy = document.querySelector('.hero-sub').getBoundingClientRect();
      const project = document.querySelector('.home-projects').getBoundingClientRect();
      return { titleWidth: title.width, portraitGap: title.top - portrait.bottom, projectGap: project.top - copy.bottom, copySize: parseFloat(getComputedStyle(document.querySelector('.hero-sub')).fontSize) };
    });
    assert.ok(layout.titleWidth <= 600, 'heading should wrap within a 600px measure');
    assert.ok(layout.portraitGap >= 96, 'portrait needs more breathing room above the heading');
    assert.ok(layout.projectGap >= 192, 'projects should have a generous gap after the introduction');
    assert.equal(layout.copySize, 18, 'preserve the approved supporting-text scale');
  } finally { await page.close(); }
});

test('supporting copy, project details and controls share the approved font', async () => {
  const page = await browser.newPage();
  try {
    for (const name of ['index.html', 'superstash.html', 'whatsapp-campaigns.html']) {
      await page.goto(new URL(name, home).href);
      await page.evaluate(() => document.fonts.ready);
      const copy = await page.locator('.t-body, .meta dt, .meta dd, .wa-project-details dt, .wa-project-details dd').evaluateAll(elements => elements.map(el => ({ text: el.textContent.trim(), font: getComputedStyle(el).fontFamily })));
      for (const item of copy) assert.match(item.font, /^['"]?Crimson Pro['"]?(?:,|$)/, `${name}: ${item.text}`);
      const controlFont = await page.locator('.btn').first().evaluate(el => getComputedStyle(el).fontFamily);
      assert.match(controlFont, /^['"]?Crimson Pro['"]?(?:,|$)/);
    }
  } finally { await page.close(); }
});

test('intro paragraph keeps compact leading at mobile and desktop sizes', async () => {
  const page = await browser.newPage();
  try {
    for (const [width, fontSize] of [[390, 18], [1440, 18]]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(home);
      const type = await page.locator('.hero-sub').evaluate(el => ({
        size: parseFloat(getComputedStyle(el).fontSize),
        leading: parseFloat(getComputedStyle(el).lineHeight)
      }));
      assert.equal(type.size, fontSize, 'tightening the leading must not shrink the text');
      assert.ok(Math.abs(type.leading / type.size - 1.3) < 0.01, 'intro leading should be 1.3');
    }
  } finally { await page.close(); }
});

test('Superstash opening shares the paragraph scale and preserves its reviewed metadata and hero treatment', async () => {
  const page = await browser.newPage();
  const type = el => {
    const style = getComputedStyle(el);
    return { family: style.fontFamily, size: style.fontSize, leading: style.lineHeight, weight: style.fontWeight, spacing: style.letterSpacing };
  };
  try {
    for (const width of [320, 442, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL('whatsapp-campaigns.html', home).href);
      await page.evaluate(() => document.fonts.ready);
      const expectedTitle = await page.locator('h1').evaluate(type);
      const expectedCopy = await page.locator('.wa-summary-copy .t-body').first().evaluate(type);
      const expectedValue = await page.locator('.wa-project-details dd').first().evaluate(type);
      await page.goto(new URL('superstash.html', home).href);
      await page.evaluate(() => document.fonts.ready);
      const summary = page.getByRole('heading', { name: 'Long story short', exact: true });
      assert.equal(await summary.count(), 1, 'the opening needs an accessible short summary');
      assert.deepEqual(await page.locator('h1').evaluate(type), expectedTitle);
      for (const paragraph of await page.locator('.case-title-block > .t-body, .case-summary-copy .t-body').all()) {
        assert.deepEqual(await paragraph.evaluate(type), expectedCopy, 'reuse the current paragraph scale');
      }
      const label = await page.locator('.case-project-details dt').first().evaluate(type);
      assert.match(label.family, /^['"]?Inter['"]?(?:,|$)/, 'preserve the reviewed sans-serif small labels');
      assert.ok(parseFloat(label.size) < parseFloat(expectedValue.size), 'metadata labels remain subordinate to their values');
      assert.deepEqual(await page.locator('.case-project-details dd').first().evaluate(type), expectedValue);
      const image = page.locator('header .interface-stage img');
      assert.equal(await image.evaluate(el => el.complete && el.naturalWidth > 0), true);
      const imageBounds = await page.locator('header .interface-viewport').boundingBox();
      const titleBounds = await page.locator('h1').boundingBox();
      const detailsBounds = await page.locator('.case-project-details').boundingBox();
      const summaryBounds = await page.locator('.case-summary').boundingBox();
      assert.ok(imageBounds.y + imageBounds.height <= titleBounds.y, 'lead with the product image');
      assert.ok(detailsBounds.y >= titleBounds.y + titleBounds.height, 'details follow the title');
      assert.ok(detailsBounds.y + detailsBounds.height <= summaryBounds.y, 'details sit above the summary');
      if (width > 900) {
        const rowTops = await page.locator('.case-project-details > div').evaluateAll(items => new Set(items.map(item => Math.round(item.getBoundingClientRect().top))).size);
        assert.equal(rowTops, 1, 'desktop details run as one row');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
  } finally { await page.close(); }
});

test('Cretile intro and summary paragraphs use the same typography on mobile and desktop', async () => {
  const page = await browser.newPage();
  try {
    for (const width of [442, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL('whatsapp-campaigns.html', home).href);
      await page.evaluate(() => document.fonts.ready);
      const paragraphs = await page.locator('.wa-title-block > .t-body, .wa-summary-copy .t-body').evaluateAll(elements => elements.map(el => {
        const style = getComputedStyle(el);
        return { family: style.fontFamily, size: style.fontSize, leading: style.lineHeight, weight: style.fontWeight, spacing: style.letterSpacing };
      }));
      assert.equal(paragraphs.length, 3);
      for (const summary of paragraphs.slice(1)) assert.deepEqual(summary, paragraphs[0], 'intro and summary need one consistent paragraph style');
    }
  } finally { await page.close(); }
});

test('mobile project screens sit within the margins without cropping images or overflowing', async () => {
  const page = await browser.newPage();
  try {
    for (const width of [320, 442, 640]) {
      await page.setViewportSize({ width, height: 884 });
      await page.goto(home);
      const available = await page.evaluate(() => document.documentElement.clientWidth);
      for (const card of await page.locator('#work article').all()) {
        const frame = await card.locator('.feature-media').boundingBox();
        assert.ok(frame.x >= 16 && frame.x + frame.width <= available - 16, 'screen sits inside the page margins');
        assert.equal(await card.locator('.feature-media').evaluate(el => getComputedStyle(el).backgroundImage), 'none', 'no backdrop behind the screen');
        const text = await card.locator('.feature-text').boundingBox();
        assert.ok(text.x >= 24, 'project text keeps its reading margin');
        const image = card.locator('img');
        const bounds = await image.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= available + 1);
        assert.equal(await image.evaluate(el => el.complete && el.naturalWidth > 0), true);
        assert.ok(await image.evaluate(el => Math.abs(el.clientWidth / el.clientHeight - el.naturalWidth / el.naturalHeight) < 0.02));
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
  } finally { await page.close(); }
});
