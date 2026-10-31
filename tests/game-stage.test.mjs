import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');

test('ends the footer with the penalty stage, below the contact links', () => {
  const footer = html.slice(html.indexOf('<footer class="contact'), html.indexOf('</footer>'));
  const stage = footer.indexOf('class="game-stage"');
  assert.ok(stage > -1, 'stage is inside the footer');
  assert.ok(stage > footer.indexOf('class="footer-links"'), 'stage comes after the contact links');
  assert.ok(stage > footer.indexOf('class="t-small muted contact-note"'), 'stage comes after the copyright line');
  assert.match(footer, /data-game="penalty"/);
  assert.match(footer, /aria-label="Penalty game: tap the goal to shoot"/);
  assert.doesNotMatch(footer, /data-label=/, 'no "Take a penalty" button');
});

test('loads the rules, then the stage, then the game', () => {
  const order = ['games/penalty-rules.js', 'game-stage.js', 'games/penalty.js']
    .map((src) => html.search(new RegExp(`<script src="${src.replace('.', '\\.')}(\\?v=[^"]+)?"></script>`)));
  assert.ok(order.every((i) => i > -1), JSON.stringify(order));
  assert.ok(order[0] < order[1] && order[1] < order[2], JSON.stringify(order));
});

// Browsers cache versioned assets until the label changes; a stale stylesheet with
// fresh game scripts left the canvas unstyled over the footer. Ship them under one label.
test('versions the stylesheet and game scripts with the same label', () => {
  const css = html.match(/href="styles\.css\?v=([^"]+)"/);
  assert.ok(css, 'stylesheet has a version label');
  for (const src of ['games/penalty-rules.js', 'game-stage.js', 'games/penalty.js']) {
    assert.ok(html.includes(`<script src="${src}?v=${css[1]}"></script>`), src);
  }
});

test('keeps the stage hidden until the script mounts it', () => {
  assert.match(css, /\.game-stage\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.game-stage\.is-ready\s*\{\s*display:\s*block/);
});
