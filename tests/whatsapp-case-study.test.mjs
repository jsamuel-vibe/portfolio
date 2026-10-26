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

test('moves from firsthand context to strategy, use cases, and direction', () => {
  const sections = ['overview', 'scenarios', 'strategy', 'audience', 'launch', 'reply-state', 'analytics', 'follow-up', 'product', 'direction', 'takeaway'];

  for (const id of sections) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }

  const positions = sections.map((id) => html.indexOf(`id="${id}"`));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'case-study sections are out of narrative order');

  for (const removed of ['summary', 'at-a-glance', 'need', 'today', 'reflection', 'problem', 'scope', 'confidence', 'automation', 'rules', 'constraints', 'shipped', 'decisions']) {
    assert.doesNotMatch(html, new RegExp(`id=["']${removed}["']`), `still contains #${removed}`);
  }
});

test('introduces the product decisions with one contextual scenario section', () => {
  const scenarios = html.slice(html.indexOf('id="scenarios"'), html.indexOf('id="strategy"'));
  assert.match(scenarios, /class=["'][^"']*wa-job-map/);
  assert.match(scenarios, /Before designing/i);
  assert.match(scenarios, /I was already creating campaigns/i);
  assert.equal((scenarios.match(/<small>/g) || []).length, 5, 'each scenario needs a plain-language explanation');
  assert.equal((html.match(/class=["'][^"']*wa-decision/g) || []).length, 5);
  assert.ok(html.indexOf('id="scenarios"') < html.indexOf('id="audience"'));
});

test('shows the flexible audience paths as a consequential design decision', () => {
  const audience = html.slice(html.indexOf('id="audience"'), html.indexOf('id="launch"'));
  assert.match(audience, /class=["'][^"']*wa-audience-paths/);
  assert.match(audience, /Reusable group/i);
  assert.match(audience, /One-off group/i);
  assert.match(audience, /Direct manipulation/i);
  assert.match(audience, /Flexibility and efficiency of use/i);
});

test('ties selected product decisions to principles and evidence', () => {
  assert.ok((html.match(/class=["'][^"']*wa-principle(?:\s|["'])/g) || []).length >= 4);
  assert.ok((html.match(/class=["'][^"']*wa-principle-icon/g) || []).length >= 4);

  for (const principle of [
    'Error prevention',
    'User control and freedom',
    'Cognitive offloading',
    'Visibility of system status',
    'Actionable feedback'
  ]) {
    assert.match(html, new RegExp(principle, 'i'), `missing ${principle}`);
  }
});

test('uses campaign results to support a next action', () => {
  const analytics = html.slice(html.indexOf('id="analytics"'), html.indexOf('id="follow-up"'));
  assert.match(analytics, /wa-analytics\.png/);
  assert.match(analytics, /resend/i);
  assert.match(analytics, /inform the team/i);
});

test('grounds the reconstructed automation flow in existing product evidence', () => {
  const followUp = html.slice(html.indexOf('id="follow-up"'), html.indexOf('id="product"'));
  assert.match(followUp, /Simplified reconstruction/i);
  assert.match(followUp, /roughly 40 follow-ups/i);
  assert.match(followUp, /Cognitive offloading/i);
});

test('uses varied editorial compositions instead of a repeated screenshot list', () => {
  assert.match(html, /class=["'][^"']*wa-process/);
  assert.match(html, /class=["'][^"']*wa-choice-grid/);
  assert.match(html, /class=["'][^"']*wa-job-map/);
  assert.match(html, /class=["'][^"']*wa-audience-paths/);
  assert.match(html, /class=["'][^"']*wa-media-pair/);
  assert.match(html, /class=["'][^"']*wa-response-map/);
  assert.match(html, /class=["'][^"']*wa-principle-grid/);
  assert.match(html, /class=["'][^"']*wa-product-board/);
});

test('keeps the case study concise', () => {
  const caseStudy = html.slice(html.indexOf('<header'), html.indexOf('<section class="sec">'));
  const visibleText = caseStudy
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .trim();
  const words = visibleText.split(/\s+/).filter(Boolean);
  assert.ok(words.length <= 650, `case study has ${words.length} visible words`);
});

test('keeps the live product separate from the next direction', () => {
  assert.match(html, /The product today/i);
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
  for (const asset of ['wa-hero.jpg', 'wa-preview.mp4', 'wa-audience.jpg', 'wa-undo.mp4', 'wa-analytics.png']) {
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

test('does not ship tool-output truncation artifacts in the stylesheet', () => {
  assert.doesNotMatch(css, /tokens truncated/i);
});
