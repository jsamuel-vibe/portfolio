import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'whatsapp-campaigns.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');

test('opens with the product, its value, and Samuel’s role', () => {
  assert.match(html, /Product designer and builder/i);
  assert.match(html, /A sales platform built around how Cretile actually works\./i);
  assert.match(html, /manage WhatsApp contacts, launch campaigns, handle replies and create AI-assisted follow-ups/i);
  assert.match(html, /live internal product/i);
});

test('contains the simplified, independently understandable narrative sections', () => {
  for (const id of ['overview', 'at-a-glance', 'need', 'strategy', 'shipped', 'decisions', 'automation', 'today', 'direction', 'reflection']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
});

test('does not make the failed assumption the case-study narrative', () => {
  assert.doesNotMatch(html, /The reason I started building disappeared/i);
  assert.doesNotMatch(html, /wrong assumption|assumption that failed|cost-saving idea/i);
  assert.doesNotMatch(html, /roughly 4,000 leads|₹3,500/i);
});

test('keeps live work separate from future direction', () => {
  assert.match(html, /Live today/i);
  assert.match(html, /Next direction[^<]*not yet built/i);
  assert.match(html, /Website enquiry[\s\S]*Lead record[\s\S]*Qualification/i);
});

test('does not publish rejected or unsupported claims', () => {
  for (const claim of [/₹0\s*\/\s*mo/i, /4,000\+/, /5[–-]10 campaigns/i, /8%\+/, /Interakt[^.]{0,80}sell/i, /loophole/i]) {
    assert.doesNotMatch(html, claim);
  }
});

test('contains all three comparison controls and the hybrid default', () => {
  assert.match(html, /data-case-view=["']3["']/);
  assert.equal((html.match(/data-case-view-choice=/g) || []).length, 3);
  assert.match(html, /Temporary comparison/);
});

test('all local image, video, stylesheet, and script paths exist', async () => {
  const sources = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((source) => !/^(?:https?:|mailto:|#)/.test(source))
    .map((source) => source.split(/[?#]/)[0]);
  await Promise.all(sources.map((source) => access(resolve(root, source))));
});

test('provides semantic visual hooks for story, explanation and proof', () => {
  for (const className of ['wa-story-beats', 'wa-character-scene', 'wa-system-map', 'wa-proof-grid', 'wa-decision-grid', 'wa-reflection']) {
    assert.match(html, new RegExp(`class=["'][^"']*${className}`), `missing .${className}`);
  }
});

test('marks decorative vectors as hidden and labels the explanatory journey', () => {
  const decorativeSvgs = [...html.matchAll(/<svg[^>]*class=["'][^"']*(?:wa-person|wa-claude)[^"']*["'][^>]*>/g)];
  assert.ok(decorativeSvgs.length >= 2);
  decorativeSvgs.forEach(([svg]) => assert.match(svg, /aria-hidden=["']true["']/));
  assert.match(html, /aria-label=["']Proposed journey from website enquiry to qualification["']/);
});

test('keeps explanatory captions next to every shipped product medium', () => {
  for (const asset of ['wa-hero.jpg', 'wa-preview.mp4', 'wa-audience.jpg', 'wa-undo.mp4', 'wa-warmup.jpg']) {
    const index = html.indexOf(asset);
    assert.notEqual(index, -1, `missing ${asset}`);
    assert.match(html.slice(index, index + 700), /(?:figcaption|wa-media-note)/, `missing caption near ${asset}`);
  }
});

test('defines all three visual treatments', () => {
  for (const view of ['1', '2', '3']) {
    assert.match(css, new RegExp(`\\[data-case-view=["']${view}["']\\]`), `missing view ${view} styles`);
  }
});

test('uses forward movement instead of the removed uncertainty motif', () => {
  const characterHero = css.match(/\[data-case-view="2"\] \.wa-hero::after \{[\s\S]*?\}/)?.[0] ?? '';
  assert.match(characterHero, /content:\s*"→"/);
  assert.doesNotMatch(characterHero, /content:\s*"\?"/);
});

test('includes mobile and reduced-motion treatment rules', () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.case-viewer/);
  assert.match(css, /\.wa-character-scene/);
  assert.match(css, /\.wa-system-map/);
});
