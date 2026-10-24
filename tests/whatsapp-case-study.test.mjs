import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'whatsapp-campaigns.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');

test('uses the portfolio case-study type system', () => {
  assert.match(html, /class=["'][^"']*project-intro-inner/);
  assert.match(html, /<h1 class=["']t-display["']/);
  assert.ok((html.match(/class=["'][^"']*t-h24/g) || []).length >= 6);
  assert.ok((html.match(/class=["'][^"']*t-body/g) || []).length >= 8);
});

test('publishes one editorial presentation without comparison machinery', () => {
  assert.doesNotMatch(html, /data-case-view|case-viewer|case-study-view\.mjs/);
  assert.doesNotMatch(html, /wa-person|wa-claude|Temporary comparison/);
  assert.doesNotMatch(css, /data-case-view|\.case-viewer|\.wa-character-scene/);
});

test('contains only the streamlined narrative sections', () => {
  for (const id of ['overview', 'problem', 'strategy', 'shipped', 'decisions', 'automation', 'direction', 'takeaway']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  for (const removed of ['at-a-glance', 'need', 'today', 'reflection']) {
    assert.doesNotMatch(html, new RegExp(`id=["']${removed}["']`), `still contains #${removed}`);
  }
});

test('keeps the case study concise', () => {
  const caseStudy = html.slice(html.indexOf('<header'), html.indexOf('<section class="sec">'));
  const visibleText = caseStudy
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .trim();
  const words = visibleText.split(/\s+/).filter(Boolean);
  assert.ok(words.length <= 560, `case study has ${words.length} visible words`);
});

test('keeps the live product separate from the next direction', () => {
  assert.match(html, /What shipped/i);
  assert.match(html, /Next direction[^<]*not yet built/i);
  assert.match(html, /Website enquiry[\s\S]*Qualification/i);
});

test('does not publish rejected or unsupported claims', () => {
  for (const claim of [/₹0\s*\/\s*mo/i, /4,000\+/, /5[–-]10 campaigns/i, /8%\+/, /Interakt[^.]{0,80}sell/i, /loophole/i, /wrong assumption|cost-saving idea/i]) {
    assert.doesNotMatch(html, claim);
  }
});

test('all local image, video, stylesheet, and script paths exist', async () => {
  const sources = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((source) => !/^(?:https?:|mailto:|#)/.test(source))
    .map((source) => source.split(/[?#]/)[0]);
  await Promise.all(sources.map((source) => access(resolve(root, source))));
});

test('keeps captions with each product-design example', () => {
  for (const asset of ['wa-hero.jpg', 'wa-preview.mp4', 'wa-audience.jpg', 'wa-undo.mp4', 'wa-warmup.jpg']) {
    const index = html.indexOf(asset);
    assert.notEqual(index, -1, `missing ${asset}`);
    assert.match(html.slice(index, index + 700), /figcaption/, `missing caption near ${asset}`);
  }
});

test('retains responsive and reduced-motion support', () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
