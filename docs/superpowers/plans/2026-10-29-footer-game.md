# Footer Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable "game stage" oval above the homepage footer. It plays a penalty shootout demo by itself, and expands in place into a playable 5-shot round when clicked.

**Architecture:** `game-stage.js` owns the oval: shape, height, expand and collapse, focus, pausing off-screen. It gives each registered game a container element and drives it through `idle / play / resize / pause / resume / stop`. The penalty game is split in two: `games/penalty-rules.js` holds the pure rules, tested in Node, and `games/penalty.js` draws the scene on a canvas.

**Tech Stack:** Plain ES5-style JavaScript (`var`, IIFEs, like `site.js`), Canvas 2D, CSS in `styles.css`, tests with `node:test` (Node 24). No build step, no dependencies.

**Spec:** `docs/superpowers/specs/2026-10-29-footer-game-design.md`

## Global Constraints

- Work only in the worktree `C:/Users/SamuelJoseph/Documents/claude/portfolio-footer-game` on branch `feature/footer-game`. Never touch `C:/Users/SamuelJoseph/Documents/claude/portfolio` (Codex is working there).
- No libraries, no CDN scripts, no build step. Scripts are loaded with plain `<script src>` tags at the end of `<body>`.
- Match `site.js` style: `var`, function expressions, IIFE wrapper, one-line comment at the top of each file.
- Canvas text font: `Inter, sans-serif` (Inter is already loaded by the page).
- Pill label: `⚽ Take a penalty`. Accessible name: `Play a penalty shootout`. Close button label: `Close game`.
- Shots per round: 5. Timings: run-up 400 ms, flight 500 ms, result 1000 ms, idle gap 1500 ms, expand 450 ms.
- Collapsed aspect ratio: 2.4:1 (viewport ≥ 640px) and 1.6:1 (< 640px). Expanded: 16:9 and 4:5, with the height capped at 80% of the viewport height. Expanded corner radius: 24px.
- No sound.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

All commands below run from the worktree root.

---

### Task 1: Penalty rules

**Files:**
- Create: `games/penalty-rules.js`
- Test: `tests/penalty-rules.test.mjs`

**Interfaces:**
- Produces: `window.PenaltyRules` (the global `this` of a classic script), containing:
  - `SHOTS`: `5`
  - `toTarget(x, y) → {x, y} | null`: normalised goal coordinates (x 0 = left post, 1 = right post; y 0 = ground, 1 = crossbar). Returns `null` when the point is more than 0.15 outside the goal on any side. Clamps `y < 0` to `0`.
  - `pickDive(history, rand) → 'left' | 'centre' | 'right'`: `history` is an array of earlier `{x, y}` targets this round, and `rand` is a function returning a number in [0, 1).
  - `resolveShot(target, dive) → 'goal' | 'save' | 'miss'`
  - `scoreLine(results) → string`: `results` is an array of outcomes.
  - `randomTarget(rand) → {x, y}`: target for the idle AI striker. Always within the click margin.

- [ ] **Step 1: Write the failing test**

Create `tests/penalty-rules.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'games/penalty-rules.js'), 'utf8');
const sandbox = {};
vm.runInNewContext(source, sandbox);
const Rules = sandbox.PenaltyRules;

// Objects made inside the vm have another realm's prototype; copy before deepEqual.
const plain = (value) => (value ? { ...value } : value);
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test('a round is five shots', () => {
  assert.equal(Rules.SHOTS, 5);
});

test('a top-corner shot beats a keeper who dived the right way', () => {
  assert.equal(Rules.resolveShot({ x: 0.95, y: 0.9 }, 'right'), 'goal');
});

test('a low centre shot is saved by a keeper who stayed in the middle', () => {
  assert.equal(Rules.resolveShot({ x: 0.5, y: 0.2 }, 'centre'), 'save');
});

test('a keeper who guessed the wrong side concedes', () => {
  assert.equal(Rules.resolveShot({ x: 0.2, y: 0.3 }, 'right'), 'goal');
});

test('shots wide or over the bar are misses whatever the dive', () => {
  for (const dive of ['left', 'centre', 'right']) {
    assert.equal(Rules.resolveShot({ x: -0.05, y: 0.5 }, dive), 'miss');
    assert.equal(Rules.resolveShot({ x: 1.05, y: 0.5 }, dive), 'miss');
    assert.equal(Rules.resolveShot({ x: 0.5, y: 1.05 }, dive), 'miss');
  }
});

test('clicks count within a margin around the goal, and grass clicks shoot along the ground', () => {
  assert.deepEqual(plain(Rules.toTarget(-0.1, 0.5)), { x: -0.1, y: 0.5 });
  assert.deepEqual(plain(Rules.toTarget(0.5, -0.1)), { x: 0.5, y: 0 });
  assert.equal(Rules.toTarget(-0.2, 0.5), null);
  assert.equal(Rules.toTarget(1.2, 0.5), null);
  assert.equal(Rules.toTarget(0.5, 1.2), null);
  assert.equal(Rules.toTarget(0.5, -0.2), null);
});

test('with no history the keeper picks by base weights 0.4 / 0.2 / 0.4', () => {
  assert.equal(Rules.pickDive([], () => 0.1), 'left');
  assert.equal(Rules.pickDive([], () => 0.5), 'centre');
  assert.equal(Rules.pickDive([], () => 0.9), 'right');
});

test('the keeper leans toward the side the shooter keeps using', () => {
  const right = [{ x: 0.9, y: 0.5 }, { x: 0.85, y: 0.2 }, { x: 0.8, y: 0.7 }];
  // Weights become 0.4 / 0.2 / 0.7 (total 1.3); 0.5 * 1.3 = 0.65 lands on right.
  assert.equal(Rules.pickDive(right, () => 0.5), 'right');

  const rand = seeded(42);
  const counts = { left: 0, centre: 0, right: 0 };
  for (let i = 0; i < 2000; i++) counts[Rules.pickDive(right, rand)]++;
  assert.ok(counts.right > counts.left * 1.5, JSON.stringify(counts));
});

test('shots into the middle third add no bias', () => {
  assert.equal(Rules.pickDive([{ x: 0.5, y: 0.5 }], () => 0.5), 'centre');
});

test('scoreLine reports goals out of five with a line for each score', () => {
  const round = (goals) => Array.from({ length: 5 }, (_, i) => (i < goals ? 'goal' : 'save'));
  assert.equal(Rules.scoreLine(round(5)), '5 / 5: Perfect');
  assert.equal(Rules.scoreLine(round(4)), '4 / 5: Nice finish');
  assert.equal(Rules.scoreLine(round(3)), '3 / 5: Not bad');
  assert.equal(Rules.scoreLine(round(2)), '2 / 5: Unlucky');
  assert.equal(Rules.scoreLine(round(1)), "1 / 5: The keeper's having a day");
  assert.equal(Rules.scoreLine(round(0)), '0 / 5: Try another corner');
  assert.equal(Rules.scoreLine(['goal', 'miss', 'goal', 'save', 'goal']), '3 / 5: Not bad');
});

test('idle targets always land inside the click margin', () => {
  const rand = seeded(7);
  for (let i = 0; i < 500; i++) {
    const t = Rules.randomTarget(rand);
    assert.notEqual(Rules.toTarget(t.x, t.y), null, JSON.stringify(t));
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/penalty-rules.test.mjs`
Expected: FAIL with `ENOENT: no such file or directory ... games/penalty-rules.js`

- [ ] **Step 3: Write the implementation**

Create `games/penalty-rules.js`:

```js
// Penalty shootout rules: the keeper's dive and whether a shot scores. No DOM, so tests can run it in Node.
// Coordinates are normalised to the goal mouth: x 0 = left post, 1 = right post; y 0 = ground, 1 = crossbar.
(function (root) {
  var SHOTS = 5;
  var MARGIN = 0.15;
  var DIVE_X = { left: 0.22, centre: 0.5, right: 0.78 };
  var REACH = { y: 0.3, rx: 0.2, ry: 0.45 };
  var LINES = ['Try another corner', "The keeper's having a day", 'Unlucky', 'Not bad', 'Nice finish', 'Perfect'];

  function sideOf(x) {
    return x < 1 / 3 ? 'left' : x > 2 / 3 ? 'right' : 'centre';
  }

  // A click on the goal, or null if it's too far outside to count as a shot.
  function toTarget(x, y) {
    if (x < -MARGIN || x > 1 + MARGIN || y < -MARGIN || y > 1 + MARGIN) return null;
    return { x: x, y: Math.max(0, y) };
  }

  // The keeper commits before seeing the ball, leaning toward the side used most this round.
  function pickDive(history, rand) {
    var w = { left: 0.4, centre: 0.2, right: 0.4 };
    history.forEach(function (t) {
      var side = sideOf(t.x);
      if (side !== 'centre') w[side] += 0.1;
    });
    var r = rand() * (w.left + w.centre + w.right);
    if (r < w.left) return 'left';
    if (r < w.left + w.centre) return 'centre';
    return 'right';
  }

  // Outside the frame is a miss; inside the keeper's reach (an ellipse around the dive) is a save.
  function resolveShot(target, dive) {
    if (target.x < 0 || target.x > 1 || target.y > 1) return 'miss';
    var dx = (target.x - DIVE_X[dive]) / REACH.rx;
    var dy = (target.y - REACH.y) / REACH.ry;
    return dx * dx + dy * dy <= 1 ? 'save' : 'goal';
  }

  function scoreLine(results) {
    var goals = results.filter(function (r) { return r === 'goal'; }).length;
    return goals + ' / ' + SHOTS + ': ' + LINES[goals];
  }

  // The idle striker mostly hits the target, sometimes wide or over.
  function randomTarget(rand) {
    if (rand() < 0.85) return { x: 0.05 + rand() * 0.9, y: rand() * 0.95 };
    var side = rand();
    if (side < 0.4) return { x: -0.02 - rand() * 0.1, y: rand() * 0.9 };
    if (side < 0.8) return { x: 1.02 + rand() * 0.1, y: rand() * 0.9 };
    return { x: 0.1 + rand() * 0.8, y: 1.02 + rand() * 0.1 };
  }

  root.PenaltyRules = {
    SHOTS: SHOTS,
    toTarget: toTarget,
    pickDive: pickDive,
    resolveShot: resolveShot,
    scoreLine: scoreLine,
    randomTarget: randomTarget
  };
})(this);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/penalty-rules.test.mjs`
Expected: all 11 tests pass, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add games/penalty-rules.js tests/penalty-rules.test.mjs
git commit -m "feat: add penalty shootout rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Game stage (markup, CSS, stage script)

**Files:**
- Create: `game-stage.js`
- Modify: `index.html`: footer (the `<footer class="contact sec">` block) and the script tags before `</body>`
- Modify: `styles.css`: add a block right after the contact styles (after the `@media (max-width: 640px)` block containing `.contact-main`, around line 299)
- Test: `tests/game-stage.test.mjs`

**Interfaces:**
- Consumes: nothing from Task 1. It loads `games/penalty-rules.js` via a script tag only.
- Produces:
  - `window.GameStage.register(name, factory)`: `factory(container: HTMLElement)` returns `{ idle(), play(), resize(w, h), pause(), resume(), stop() }`. `w` and `h` are in CSS pixels.
  - `window.GameStage.reduceMotion`: boolean.
  - DOM inside each `.game-stage`: `.game-screen` (the container passed to the game), `.game-cta`, `button.game-close`.
  - Classes: `.is-ready` (mounted), `.is-open` (expanded).
  - Order of calls: on mount → `idle()`. On open → `play()`. On close → `stop()` then `idle()`. Off-screen → `pause()`; back on screen → `resume()`. Any size change of `.game-screen` → `resize(w, h)`.

- [ ] **Step 1: Write the failing test**

Create `tests/game-stage.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');

test('puts the penalty stage in the footer, above the rule', () => {
  const footer = html.slice(html.indexOf('<footer class="contact'), html.indexOf('</footer>'));
  const stage = footer.indexOf('class="game-stage"');
  assert.ok(stage > -1, 'stage is inside the footer');
  assert.ok(stage < footer.indexOf('class="rule"'), 'stage comes before the rule');
  assert.match(footer, /data-game="penalty"/);
  assert.match(footer, /data-label="⚽ Take a penalty"/);
  assert.match(footer, /aria-label="Play a penalty shootout"/);
});

test('loads the rules, then the stage, then the game', () => {
  const order = ['games/penalty-rules.js', 'game-stage.js', 'games/penalty.js']
    .map((src) => html.indexOf(`<script src="${src}"></script>`));
  assert.ok(order.every((i) => i > -1), JSON.stringify(order));
  assert.ok(order[0] < order[1] && order[1] < order[2], JSON.stringify(order));
});

test('keeps the stage hidden until the script mounts it', () => {
  assert.match(css, /\.game-stage\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.game-stage\.is-ready\s*\{\s*display:\s*block/);
});

test('turns stage motion off for reduced motion', () => {
  assert.match(css, /prefers-reduced-motion: reduce\)\s*\{[^}]*\.game-stage/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/game-stage.test.mjs`
Expected: FAIL. All 4 tests fail (`stage is inside the footer`, the script order, and both CSS regexes).

- [ ] **Step 3: Add the markup**

In `index.html`, change the start of the footer from:

```html
    <footer class="contact sec">
      <div class="rule"></div>
```

to:

```html
    <footer class="contact sec">
      <div class="game-stage" data-game="penalty" data-label="⚽ Take a penalty" aria-label="Play a penalty shootout"></div>
      <div class="rule"></div>
```

and change:

```html
<script src="site.js"></script>
</body>
```

to:

```html
<script src="site.js"></script>
<script src="games/penalty-rules.js"></script>
<script src="game-stage.js"></script>
<script src="games/penalty.js"></script>
</body>
```

(`games/penalty.js` is created in Task 3. Until then the browser logs a 404 for it and the stage stays hidden, because no game is registered.)

- [ ] **Step 4: Add the CSS**

In `styles.css`, directly after this block:

```css
@media (max-width: 640px) {
  .contact-main { grid-template-columns: minmax(0, 1fr); }
  .contact-email { font-size: 18px; overflow-wrap: anywhere; }
}
```

(If the block's contents differ slightly, insert after the `@media (max-width: 640px)` block that contains `.contact-main`.) Add:

```css

/* Footer game stage: an oval that plays a demo and expands in place. game-stage.js sets the height. */
.game-stage { display: none; position: relative; width: 100%; margin-bottom: var(--block-gap); border-radius: 50%; overflow: hidden; background: #7DB956; cursor: pointer; transition: height .45s cubic-bezier(.2, .7, .2, 1), border-radius .45s cubic-bezier(.2, .7, .2, 1), transform .25s ease; -webkit-tap-highlight-color: transparent; }
.game-stage.is-ready { display: block; }
.game-stage.is-open { border-radius: 24px; cursor: default; }
.game-stage:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }
@media (hover: hover) { .game-stage.is-ready:not(.is-open):hover { transform: scale(1.01); } }
.game-screen { position: absolute; inset: 0; }
.game-screen canvas { display: block; width: 100%; height: 100%; touch-action: manipulation; }
.game-cta { position: absolute; left: 50%; bottom: 8%; z-index: 1; transform: translateX(-50%); pointer-events: none; }
.game-stage.is-open .game-cta { display: none; }
.game-close { display: none; position: absolute; top: 12px; right: 12px; z-index: 2; }
.game-stage.is-open .game-close { display: inline-flex; }
.penalty-card { position: absolute; left: 50%; top: 50%; z-index: 2; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px 28px; border-radius: 16px; background: var(--white); box-shadow: 0 8px 24px rgba(0, 0, 0, .18); cursor: default; }
.penalty-card[hidden] { display: none; }
.penalty-score { font-weight: 500; font-size: 20px; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .game-stage { transition: none; }
  .game-stage.is-ready:not(.is-open):hover { transform: none; }
}
```

- [ ] **Step 5: Write the stage script**

Create `game-stage.js`:

```js
// Footer game stage: an oval that plays a game's demo and expands in place to play it.
// Games call GameStage.register(name, factory); the stage owns shape, state, focus and lifecycle,
// and the game owns everything inside the container it's given.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var factories = {};

  window.GameStage = {
    reduceMotion: reduceMotion,
    register: function (name, factory) { factories[name] = factory; }
  };

  function mount(el) {
    var factory = factories[el.getAttribute('data-game')];
    if (!factory) return;

    var screen = document.createElement('div');
    screen.className = 'game-screen';
    var cta = document.createElement('span');
    cta.className = 'game-cta btn btn-secondary btn-sm';
    cta.setAttribute('aria-hidden', 'true');
    cta.textContent = el.getAttribute('data-label') || 'Play';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'game-close btn btn-secondary btn-round';
    close.setAttribute('aria-label', 'Close game');
    close.textContent = '×';
    el.append(screen, cta, close);

    var game = factory(screen);
    var open = false;

    function height(isOpen) {
      var w = el.clientWidth;
      var narrow = window.innerWidth < 640;
      if (!isOpen) return w / (narrow ? 1.6 : 2.4);
      return Math.min(w * (narrow ? 5 / 4 : 9 / 16), window.innerHeight * 0.8);
    }

    function size() { el.style.height = height(open) + 'px'; }

    // Collapsed, the whole oval is one button; expanded, clicks belong to the game.
    function asButton() {
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
    }

    function expand() {
      if (open) return;
      open = true;
      el.classList.add('is-open');
      el.setAttribute('role', 'group');
      el.removeAttribute('tabindex');
      size();
      // Centre the stage at its final height, not the height it's animating from.
      var top = el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - height(true)) / 2;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
      close.focus({ preventScroll: true });
      game.play();
    }

    function collapse() {
      if (!open) return;
      open = false;
      el.classList.remove('is-open');
      asButton();
      size();
      game.stop();
      game.idle();
      el.focus({ preventScroll: true });
    }

    el.addEventListener('click', expand);
    el.addEventListener('keydown', function (e) {
      if (!open && e.target === el && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        expand();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (open && e.key === 'Escape') collapse();
    });
    // Stop the click reaching the stage, which would open it again.
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      collapse();
    });
    window.addEventListener('resize', size);

    new ResizeObserver(function () {
      game.resize(screen.clientWidth, screen.clientHeight);
    }).observe(screen);
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) game.resume();
      else game.pause();
    }).observe(el);

    el.classList.add('is-ready');
    asButton();
    size();
    game.idle();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.game-stage[data-game]').forEach(mount);
  });
})();
```

- [ ] **Step 6: Run the tests and a syntax check**

Run: `node --test tests/game-stage.test.mjs tests/penalty-rules.test.mjs`
Expected: all tests pass, `fail 0`.

Run: `node --check game-stage.js`
Expected: no output, exit code 0.

- [ ] **Step 7: Commit**

```bash
git add game-stage.js index.html styles.css tests/game-stage.test.mjs
git commit -m "feat: add footer game stage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Penalty game scene

**Files:**
- Create: `games/penalty.js`

**Interfaces:**
- Consumes: `window.PenaltyRules` (Task 1): `SHOTS`, `toTarget`, `pickDive`, `resolveShot`, `scoreLine`, `randomTarget`. Also `window.GameStage.register` and `GameStage.reduceMotion` (Task 2), plus the CSS classes `.penalty-card`, `.penalty-score`, `.btn`, `.btn-primary` and `.btn-sm` (already in `styles.css`).
- Produces: registers the `'penalty'` game. Nothing else depends on it.

This task is mostly drawing code, so it isn't unit-tested. The rules it uses are covered by Task 1, and it's verified in the browser in Step 3.

- [ ] **Step 1: Write the game**

Create `games/penalty.js`:

```js
// Penalty shootout for the footer game stage. Draws the scene on a canvas from behind the striker;
// penalty-rules.js decides where the keeper dives and whether a shot scores.
(function () {
  var Rules = window.PenaltyRules;
  var RUNUP = 400, FLIGHT = 500, RESULT = 1000, IDLE_GAP = 1500;
  var SIDE = { left: -1, centre: 0, right: 1 };
  var C = {
    sky: '#F6EEDF', stand: '#3E4A5C', hedge: '#4F8A3C',
    grass: '#7DB956', grassAlt: '#72AD4C', line: '#FFFFFF',
    keeper: '#F2683C', gloves: '#FFE14D', kit: '#1F2A44',
    striker: '#2F5BD3', skin: '#E0A37A', hair: '#2B1D14', ink: '#111111',
    hit: '#7DDC6A', missed: '#FF6B5A'
  };
  var CROWD = ['#F2683C', '#FFE14D', '#FFFFFF', '#2F5BD3', '#E86A92'];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  GameStage.register('penalty', function (container) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var card = document.createElement('div');
    card.className = 'penalty-card';
    card.hidden = true;
    card.setAttribute('aria-live', 'polite');
    var score = document.createElement('p');
    score.className = 'penalty-score';
    var again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn btn-primary btn-sm';
    again.textContent = 'Play again';
    card.append(score, again);
    container.append(canvas, card);

    var W = 0, H = 0, DPR = 1, L = null;
    var mode = 'idle', phase = 'ready', t = 0, clock = 0;
    var shot = null, results = [], history = [];
    var raf = 0, last = 0, running = false, wasRunning = false;

    // Scene geometry, all derived from the goal size so it scales to any stage.
    function layout() {
      var gw = Math.min(W * (W < 560 ? 0.86 : 0.6), H * 1.2);
      var gh = gw / 3;
      var gy = H * 0.58;
      var hz = gy - gh * 0.35;
      var dot = Math.max(2.5, gh * 0.04);
      var crowd = [], seed = 7;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var row = 0; row < 3; row++) {
        for (var x = dot; x < W; x += dot * 2.8) {
          crowd.push({ x: x + rnd() * dot, y: hz - gh * (0.7 + row * 0.2), c: CROWD[Math.floor(rnd() * CROWD.length)] });
        }
      }
      return {
        gw: gw, gh: gh, gx: (W - gw) / 2, gy: gy, hz: hz, standTop: hz - gh * 1.25,
        bx: W / 2, by: gy + (H - gy) * 0.5, r0: gw * 0.028, r1: gw * 0.016,
        dot: dot, crowd: crowd
      };
    }

    function toScreen(target) {
      return { x: L.gx + target.x * L.gw, y: L.gy - target.y * L.gh };
    }

    function circle(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function rrect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    // ---- State ----

    function setPhase(p) { phase = p; t = 0; }

    function reset() {
      shot = null;
      results = [];
      history = [];
      card.hidden = true;
      setPhase('ready');
    }

    function shoot(target) {
      var dive = Rules.pickDive(mode === 'play' ? history : [], Math.random);
      shot = { target: target, dive: dive, outcome: Rules.resolveShot(target, dive) };
      if (mode === 'play') history.push(target);
      setPhase('runup');
    }

    function finish() {
      shot = null;
      setPhase('done');
      score.textContent = Rules.scoreLine(results);
      card.hidden = false;
      again.focus({ preventScroll: true });
      halt();
      draw();
    }

    function update(dt) {
      t += dt;
      if (phase === 'ready' && mode === 'idle' && t >= IDLE_GAP) {
        shoot(Rules.randomTarget(Math.random));
      } else if (phase === 'runup' && t >= RUNUP) {
        setPhase('flight');
      } else if (phase === 'flight' && t >= FLIGHT) {
        if (mode === 'play') results.push(shot.outcome);
        setPhase('result');
      } else if (phase === 'result' && t >= RESULT) {
        if (mode === 'play' && results.length === Rules.SHOTS) finish();
        else { shot = null; setPhase('ready'); }
      }
    }

    // ---- Poses ----

    function diveProgress() {
      if (phase === 'flight') return ease(clamp01(t / (FLIGHT * 0.9)));
      return phase === 'result' ? 1 : 0;
    }

    function keeperPose(p) {
      var side = shot ? SIDE[shot.dive] : 0;
      var bob = p ? 0 : Math.abs(Math.sin(clock * 0.006)) * L.gh * 0.04;
      return {
        x: L.gx + (0.5 + side * 0.08 * p) * L.gw,
        y: L.gy - bob - (side ? Math.sin(p * Math.PI * 0.6) : p * 0.5) * L.gh * 0.24,
        angle: side * p,
        reach: p > 0
      };
    }

    // Where the gloves are; a saved ball ends up here.
    function handPoint(k) {
      var d = L.gh * 0.62 * 1.15;
      return { x: k.x + d * Math.sin(k.angle), y: k.y - d * Math.cos(k.angle) };
    }

    function strikerPose() {
      var rest = { x: L.bx - L.gw * 0.14, y: L.by + (H - L.by) * 0.35 };
      var kick = { x: L.bx - L.gw * 0.06, y: L.by + (H - L.by) * 0.12 };
      var p = phase === 'runup' ? ease(clamp01(t / RUNUP)) : phase === 'flight' || phase === 'result' ? 1 : 0;
      return {
        x: lerp(rest.x, kick.x, p),
        y: lerp(rest.y, kick.y, p),
        running: phase === 'runup',
        kicked: phase === 'flight' || phase === 'result'
      };
    }

    function ballState(rp) {
      var b = { x: L.bx, y: L.by, r: L.r0, alpha: 1, ground: L.by };
      if (!shot || (phase !== 'flight' && phase !== 'result')) return b;
      var q = phase === 'flight' ? clamp01(t / FLIGHT) : 1;
      var end = shot.outcome === 'save' ? handPoint(keeperPose(1)) : toScreen(shot.target);
      var cx = (L.bx + end.x) / 2 + (shot.target.x - 0.5) * L.gw * 0.15;
      var cy = Math.min(L.by, end.y) - L.gh * 0.2;
      var u = 1 - q;
      b.x = u * u * L.bx + 2 * u * q * cx + q * q * end.x;
      b.y = u * u * L.by + 2 * u * q * cy + q * q * end.y;
      b.r = lerp(L.r0, L.r1, q);
      b.ground = lerp(L.by, L.gy, q);
      if (shot.outcome === 'goal') b.y = lerp(b.y, L.gy - L.r1, ease(rp));
      if (shot.outcome === 'miss') {
        var wide = shot.target.x < 0 ? -1 : shot.target.x > 1 ? 1 : 0;
        b.x += wide * rp * L.gw * 0.3;
        b.y -= (wide ? 0 : L.gh * 0.4) * rp;
        b.alpha = 1 - rp;
      }
      return b;
    }

    // ---- Drawing ----

    function drawPitch() {
      var g = L, i, x;
      ctx.fillStyle = C.sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.stand;
      ctx.fillRect(0, g.standTop, W, g.hz - g.standTop);
      g.crowd.forEach(function (p) { ctx.fillStyle = p.c; circle(p.x, p.y, g.dot); });
      ctx.fillStyle = C.hedge;
      var r = g.gh * 0.16;
      for (x = 0; x < W + r; x += r * 1.5) circle(x, g.hz - r * 0.4, r);
      for (i = 0; i < 7; i++) {
        var y0 = g.hz + (H - g.hz) * Math.pow(i / 7, 1.5);
        var y1 = g.hz + (H - g.hz) * Math.pow((i + 1) / 7, 1.5);
        ctx.fillStyle = i % 2 ? C.grassAlt : C.grass;
        ctx.fillRect(0, y0, W, y1 - y0 + 1);
      }
      var y6 = g.gy + (H - g.gy) * 0.16, yb = g.gy + (H - g.gy) * 0.8;
      ctx.strokeStyle = 'rgba(255, 255, 255, .85)';
      ctx.lineWidth = Math.max(1.5, g.gw * 0.006);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(0, g.gy); ctx.lineTo(W, g.gy);
      ctx.moveTo(g.gx - g.gw * 0.22, g.gy); ctx.lineTo(g.gx - g.gw * 0.3, y6);
      ctx.lineTo(g.gx + g.gw * 1.3, y6); ctx.lineTo(g.gx + g.gw * 1.22, g.gy);
      ctx.moveTo(g.gx - g.gw * 0.75, g.gy); ctx.lineTo(g.gx - g.gw * 1.1, yb);
      ctx.lineTo(g.gx + g.gw * 2.1, yb); ctx.lineTo(g.gx + g.gw * 1.75, g.gy);
      ctx.stroke();
      ctx.fillStyle = C.line;
      ctx.beginPath();
      ctx.ellipse(g.bx, g.by + g.r0 * 0.8, g.r0 * 0.5, g.r0 * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // The net mesh is pulled toward the ball when a goal goes in.
    function drawGoal(dent) {
      var g = L, top = g.gy - g.gh, cols = 24, rows = 8, i, j;
      function mesh(at, steps) {
        for (var k = 0; k <= steps; k++) {
          var p = at(k / steps);
          if (dent) {
            var dx = dent.x - p[0], dy = dent.y - p[1];
            var f = dent.k * Math.exp(-(dx * dx + dy * dy) / (g.gh * g.gh * 0.08));
            p = [p[0] + dx * f, p[1] + dy * f];
          }
          if (k) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
        }
      }
      ctx.fillStyle = 'rgba(255, 255, 255, .14)';
      ctx.fillRect(g.gx, top, g.gw, g.gh);
      ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i <= cols; i++) mesh(function (s) { return [g.gx + g.gw * i / cols, top + g.gh * s]; }, rows);
      for (j = 0; j <= rows; j++) mesh(function (s) { return [g.gx + g.gw * s, top + g.gh * j / rows]; }, cols);
      ctx.stroke();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = Math.max(3, g.gw * 0.012);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(g.gx, g.gy); ctx.lineTo(g.gx, top);
      ctx.lineTo(g.gx + g.gw, top); ctx.lineTo(g.gx + g.gw, g.gy);
      ctx.stroke();
    }

    function drawKeeper(k) {
      var u = L.gh * 0.62;
      var hx = k.reach ? 0.1 * u : 0.36 * u, hy = k.reach ? -1.15 * u : -0.5 * u;
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(k.angle);
      ctx.fillStyle = C.kit;
      ctx.fillRect(-0.15 * u, -0.38 * u, 0.1 * u, 0.38 * u);
      ctx.fillRect(0.05 * u, -0.38 * u, 0.1 * u, 0.38 * u);
      rrect(-0.18 * u, -0.52 * u, 0.36 * u, 0.18 * u, 0.04 * u);
      ctx.strokeStyle = C.keeper;
      ctx.lineWidth = 0.1 * u;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-0.16 * u, -0.8 * u); ctx.lineTo(-hx, hy);
      ctx.moveTo(0.16 * u, -0.8 * u); ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.fillStyle = C.keeper;
      rrect(-0.2 * u, -0.88 * u, 0.4 * u, 0.4 * u, 0.1 * u);
      ctx.fillStyle = C.gloves;
      circle(-hx, hy, 0.075 * u);
      circle(hx, hy, 0.075 * u);
      ctx.fillStyle = C.skin;
      circle(0, -1.0 * u, 0.12 * u);
      ctx.fillStyle = C.hair;
      ctx.beginPath();
      ctx.arc(0, -1.0 * u, 0.12 * u, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }

    // Seen from behind: back of the head, number on the shirt.
    function drawStriker(s) {
      var u = L.gh * 0.85, swing = s.running ? Math.sin(clock * 0.03) * 0.35 : 0;
      function leg(x, a) {
        ctx.save();
        ctx.translate(x * u, -0.38 * u);
        ctx.rotate(a);
        ctx.fillRect(-0.05 * u, 0, 0.1 * u, 0.3 * u);
        ctx.fillStyle = C.striker;
        ctx.fillRect(-0.05 * u, 0.22 * u, 0.1 * u, 0.16 * u);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = C.skin;
      leg(-0.09, swing);
      leg(0.09, s.kicked ? -0.9 : -swing);
      ctx.fillStyle = '#FFFFFF';
      rrect(-0.19 * u, -0.54 * u, 0.38 * u, 0.2 * u, 0.05 * u);
      ctx.strokeStyle = C.striker;
      ctx.lineWidth = 0.09 * u;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-0.17 * u, -0.84 * u); ctx.lineTo(-0.3 * u, (-0.56 + swing * 0.1) * u);
      ctx.moveTo(0.17 * u, -0.84 * u); ctx.lineTo(0.3 * u, (-0.56 - swing * 0.1) * u);
      ctx.stroke();
      ctx.fillStyle = C.striker;
      rrect(-0.21 * u, -0.92 * u, 0.42 * u, 0.42 * u, 0.1 * u);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 ' + Math.round(0.16 * u) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10', 0, -0.7 * u);
      ctx.fillStyle = C.hair;
      circle(0, -1.04 * u, 0.13 * u);
      ctx.restore();
    }

    function drawBall(b) {
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = 'rgba(17, 17, 17, .18)';
      ctx.beginPath();
      ctx.ellipse(b.x, b.ground + b.r * 0.6, b.r * 1.1, b.r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      circle(b.x, b.y, b.r);
      ctx.strokeStyle = 'rgba(17, 17, 17, .35)';
      ctx.lineWidth = Math.max(1, b.r * 0.12);
      ctx.stroke();
      ctx.fillStyle = C.ink;
      circle(b.x, b.y, b.r * 0.35);
      ctx.globalAlpha = 1;
    }

    function drawHud() {
      var r = Math.max(6, L.gh * 0.05), gap = r * 3, w = gap * (Rules.SHOTS - 1);
      var cx = W / 2, cy = L.gy - L.gh - r * 3.2;
      ctx.fillStyle = 'rgba(17, 17, 17, .55)';
      rrect(cx - w / 2 - r * 2, cy - r * 1.8, w + r * 4, r * 3.6, r * 1.8);
      for (var i = 0; i < Rules.SHOTS; i++) {
        var x = cx - w / 2 + i * gap, res = results[i];
        if (res) {
          ctx.fillStyle = res === 'goal' ? C.hit : C.missed;
          circle(x, cy, r);
        } else {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, cy, r - 0.75, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    function drawResultText(rp) {
      var text = shot.outcome === 'goal' ? 'GOAL!' : shot.outcome === 'save' ? 'Saved' : 'Miss';
      var size = L.gh * 0.32 * (0.8 + 0.2 * ease(clamp01(rp * 4)));
      ctx.globalAlpha = 1 - clamp01((rp - 0.75) * 4);
      ctx.font = '600 ' + Math.round(size) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.12;
      ctx.strokeStyle = C.ink;
      ctx.strokeText(text, W / 2, L.gy - L.gh * 0.55);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, W / 2, L.gy - L.gh * 0.55);
      ctx.globalAlpha = 1;
    }

    function draw() {
      if (!L) return;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var rp = phase === 'result' ? clamp01(t / RESULT) : 0;
      var b = ballState(rp);
      var inNet = shot && phase === 'result' && shot.outcome === 'goal';
      drawPitch();
      drawGoal(inNet ? { x: b.x, y: b.y, k: 0.4 * (1 - rp) } : null);
      if (inNet) drawBall(b);
      drawKeeper(keeperPose(diveProgress()));
      if (!inNet) drawBall(b);
      drawStriker(strikerPose());
      if (mode === 'play') drawHud();
      if (phase === 'result') drawResultText(rp);
    }

    // ---- Loop ----

    function frame(now) {
      var dt = Math.min(50, now - last);
      last = now;
      clock += dt;
      update(dt);
      draw();
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function halt() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function play() {
      mode = 'play';
      reset();
      start();
    }

    // ---- Input ----

    function goalPoint(e) {
      var r = canvas.getBoundingClientRect();
      return Rules.toTarget((e.clientX - r.left - L.gx) / L.gw, (L.gy - (e.clientY - r.top)) / L.gh);
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (mode !== 'play' || phase !== 'ready' || !L) return;
      var target = goalPoint(e);
      if (target) shoot(target);
    });
    canvas.addEventListener('pointermove', function (e) {
      canvas.style.cursor = mode === 'play' && phase === 'ready' && L && goalPoint(e) ? 'crosshair' : '';
    });
    again.addEventListener('click', play);

    return {
      // With reduced motion the demo is one still frame: keeper set, ball on the spot.
      idle: function () {
        mode = 'idle';
        reset();
        if (GameStage.reduceMotion) draw();
        else start();
      },
      play: play,
      resize: function (w, h) {
        if (!w || !h) return;
        W = w;
        H = h;
        DPR = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        L = layout();
        draw();
      },
      pause: function () {
        wasRunning = running;
        halt();
      },
      resume: function () {
        if (wasRunning) start();
      },
      stop: function () {
        halt();
        card.hidden = true;
      }
    };
  });
})();
```

- [ ] **Step 2: Syntax check and tests**

Run: `node --check games/penalty.js`
Expected: no output, exit code 0.

Run: `node --test tests/game-stage.test.mjs tests/penalty-rules.test.mjs`
Expected: `fail 0`.

- [ ] **Step 3: Check it in the browser**

Run (in the background): `python -m http.server 5173`
Open `http://localhost:5173/` and scroll to the footer. Check each item and fix anything that fails before committing:

1. The oval shows above the footer rule, with the pitch, crowd, goal, keeper, striker and ball. The "⚽ Take a penalty" pill sits near the bottom.
2. The idle demo loops: run-up, shot, keeper dive, then "GOAL!", "Saved" or "Miss", then a reset after about 1.5 s. There's no shot-dots display.
3. Clicking the oval expands it smoothly into a rounded rectangle, centres it on screen, shows ×, and starts a round with 5 empty dots.
4. Clicking inside the goal shoots there. The dots fill green (goal) or red (save or miss). Clicks during a shot are ignored, and the cursor is a crosshair over the goal area.
5. After 5 shots, a card shows something like "3 / 5: Not bad". **Play again** starts a new round.
6. × and Esc both collapse it back to the oval, the demo resumes, and focus returns to the oval (a focus ring is visible when using the keyboard).
7. Tab to the oval, then Enter, expands it. Space does too.
8. DevTools device mode at 375px wide: the oval is taller (1.6:1), the expanded view is 4:5, and goal corners can be tapped.
9. DevTools, Rendering, "Emulate prefers-reduced-motion: reduce", then reload: the oval shows a still frame, expanding is instant, and the game still plays.
10. Scroll the footer off-screen and back: the console has no errors and the animation picks up again.

If the keeper's dive visibly misses where `resolveShot` says it saved (or the reverse), adjust only `keeperPose`/`handPoint` in `games/penalty.js`. The rules in `penalty-rules.js` are the source of truth.

- [ ] **Step 4: Commit**

```bash
git add games/penalty.js
git commit -m "feat: add penalty shootout game to the footer stage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Document the stage

**Files:**
- Modify: `README.md`, the file list near the top

- [ ] **Step 1: Update the README**

In `README.md`, after the line that starts with `` - `styles.css`: ``, add:

```markdown
- `game-stage.js`: the footer game stage (the oval, expanding in place, the demo/play lifecycle). New games call `GameStage.register(name, factory)` and plug into it unchanged
- `games/`: games for the stage. Each keeps its rules in a DOM-free file (`penalty-rules.js`, tested in `tests/`) and its drawing in another (`penalty.js`)
```

Also add this under "Preview locally" if there's no test command there already:

````markdown
Run the tests:

```
node --test tests/
```
````

- [ ] **Step 2: Run the full test suite**

Run: `node --test tests/`
Expected: `tests/penalty-rules.test.mjs` and `tests/game-stage.test.mjs` pass. This work doesn't touch `tests/whatsapp-case-study.test.mjs` or the page it checks. If it fails, the failure predates this branch: report it and leave it alone.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: describe the footer game stage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
