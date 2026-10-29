import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const overview = await readFile(resolve(root, 'whatsapp-campaigns.html'), 'utf8');
const storyPath = resolve(root, 'cretile-case-study.html');
const attributes = (source, name) => [...source.matchAll(new RegExp('\\b' + name + '=["\x27]([^"\x27]+)["\x27]', 'g'))].map(match => match[1]);
const pages = ['index.html', 'superstash.html', 'whatsapp-campaigns.html', 'cretile-case-study.html'];

test('the overview leads to a separate readable story and the story links back', async () => {
  const overviewLinks = attributes(overview, 'href');
  assert.ok(overviewLinks.includes('cretile-case-study.html'), 'overview must link to the full case-study page');
  const story = await readFile(storyPath, 'utf8');
  assert.ok(attributes(story, 'href').some(href => href.split('#')[0] === 'whatsapp-campaigns.html'), 'full story needs a return route');
  assert.match(story, /<h1\b/);
  assert.match(story, /<main\b/);
});

test('local media, posters, styles, scripts and page destinations resolve', async () => {
  for (const page of pages) {
    const html = await readFile(resolve(root, page), 'utf8');
    for (const source of ['src', 'href', 'poster'].flatMap(name => attributes(html, name))) {
      if (/^(?:https?:|mailto:|tel:|#)/.test(source)) continue;
      const target = source.split(/[?#]/)[0];
      await assert.doesNotReject(access(resolve(root, target)), page + ' has a broken local reference: ' + target);
    }
  }
});

test('page fragments resolve on their destination page', async () => {
  for (const page of pages) {
    const html = await readFile(resolve(root, page), 'utf8');
    for (const href of attributes(html, 'href')) {
      if (/^(?:https?:|mailto:|tel:)/.test(href) || !href.includes('#')) continue;
      const [relative, fragment] = href.split('#');
      if (!fragment) continue;
      const target = relative ? await readFile(resolve(root, relative.split('?')[0]), 'utf8') : html;
      assert.ok(attributes(target, 'id').includes(decodeURIComponent(fragment)), page + ' has a missing fragment destination: ' + href);
    }
  }
});

test('both Cretile pages have unique IDs and valid accessibility references', async () => {
  for (const page of ['whatsapp-campaigns.html', 'cretile-case-study.html']) {
    const html = await readFile(resolve(root, page), 'utf8');
    const ids = attributes(html, 'id');
    assert.equal(ids.length, new Set(ids).size, page + ' has duplicate IDs');
    for (const reference of ['aria-controls', 'aria-labelledby'].flatMap(name => attributes(html, name))) {
      for (const id of reference.split(/\s+/)) assert.ok(ids.includes(id), page + ' has a missing accessible reference: ' + id);
    }
  }
});

test('each gallery tab has a distinct, labelled panel and local media', () => {
  const tabMarkup = [...overview.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map(match => match[0]);
  assert.ok(tabMarkup.length > 1, 'preview needs multiple selectable views');
  const controls = tabMarkup.map(tab => attributes(tab, 'aria-controls')[0]);
  assert.equal(controls.length, new Set(controls).size, 'tabs must not share a panel');
  for (let i = 0; i < controls.length; i++) {
    const panel = overview.match(new RegExp('<figure\\b[^>]*id="' + controls[i] + '"[^>]*>([\\s\\S]*?)<\\/figure>'));
    assert.ok(panel, 'tab must point to an available panel');
    assert.ok(attributes(panel[0], 'aria-labelledby').includes(attributes(tabMarkup[i], 'id')[0]), 'panel must be named by its tab');
    assert.ok(attributes(panel[0], 'src').some(source => source.startsWith('assets/')), 'panel must contain usable media');
  }
});
