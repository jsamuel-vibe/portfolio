import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'whatsapp-campaigns.html'), 'utf8');

test('positions the project as product design work', () => {
  assert.match(html, /Product designer and builder/i);
  assert.match(html, /The reason I started building disappeared before I finished\./i);
  assert.match(html, /live internal product/i);
});

test('contains every approved narrative section', () => {
  for (const id of ['story', 'turning-point', 'reframe', 'shipped', 'decisions', 'automation', 'today', 'direction', 'reflection']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
});

test('keeps live work separate from future direction', () => {
  assert.match(html, /What exists today/i);
  assert.match(html, /Proposed direction/i);
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
