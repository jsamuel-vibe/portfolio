# WhatsApp Case Study Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not dispatch subagents; the project instructions explicitly prohibit multi-agent work. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current WhatsApp case study with a truthful, strategy-led 0→1 narrative presented in three final-quality visual treatments behind a temporary local comparison switcher.

**Architecture:** Keep the site static and dependency-free. Use one semantic HTML story shared by all treatments, code-native SVG/HTML illustrations, and scoped CSS selected through `data-case-view="1|2|3"` on the document root; a small ES module owns query-string parsing and the accessible temporary switcher. Built-in Node tests protect the content claims, HTML contract, and switcher logic without adding a package manager or framework.

**Tech Stack:** HTML5, CSS3, inline SVG, vanilla JavaScript ES modules, Node.js 24 built-in test runner, Python static server, Microsoft Edge headless screenshots

**Spec:** `docs/superpowers/specs/2026-10-23-whatsapp-case-study-redesign.md`

## Global Constraints

- Work directly in the existing checkout; do not use subagents.
- Preserve the static-site architecture and add no runtime or development dependencies.
- Keep the homepage and Superstash case study unchanged.
- Use the same factual narrative in all three treatments; differences are visual and compositional, not factual.
- Version 3, the hybrid treatment, is the default.
- The comparison switcher is temporary and must be labelled `Temporary comparison`.
- Do not publish unverified claims about Interakt selling customer data, eliminating Meta messaging charges, `₹0/month`, `4,000+ contacts reached`, `5–10 campaigns`, or `8%+ reply rate`.
- Do not claim formal user research for the first version, an improved basic workflow over Interakt, a reconstructed previous contact-import flow, or a completed future sales platform.
- Clearly distinguish the live WhatsApp product from the proposed lead-to-qualified-opportunity direction.
- Use code-native SVG or HTML/CSS for characters and explanatory diagrams; do not add generic stock illustration assets.
- Decorative SVGs use `aria-hidden="true"`; explanatory diagrams have an accessible label or adjacent text equivalent.
- Respect `prefers-reduced-motion`; no meaning may depend on autoplay or animation.
- Keep `.superpowers/` ignored by Git.

## File Map

- Modify `whatsapp-campaigns.html`: final narrative, shared semantic sections, real product media, vector/character modules, temporary switcher, and module script include.
- Modify `styles.css`: shared WhatsApp art direction plus scoped editorial, character-led, and hybrid treatment rules and responsive states.
- Create `case-study-view.mjs`: pure view normalization/query helpers and browser initialization for the temporary switcher.
- Create `tests/case-study-view.test.mjs`: unit tests for view parsing, URL updates, and accessible button state.
- Create `tests/whatsapp-case-study.test.mjs`: static content/structure tests that prevent unsupported claims and verify all treatment hooks and local media paths.
- Preserve `site.js`: existing toggles, section rail, carousel, lightbox, contact copy, and back-to-top behaviour continue to operate on the shared case-study DOM.

---

### Task 1: Add the Tested Temporary View Switcher

**Files:**
- Create: `case-study-view.mjs`
- Create: `tests/case-study-view.test.mjs`
- Modify: `whatsapp-campaigns.html:23-33`

**Interfaces:**
- Produces: `normalizeCaseStudyView(value: unknown): "1" | "2" | "3"`
- Produces: `readCaseStudyView(search: string): "1" | "2" | "3"`
- Produces: `writeCaseStudyView(search: string, view: unknown): string`
- Produces: `applyCaseStudyView(root: HTMLElementLike, buttons: ButtonLike[], view: unknown): "1" | "2" | "3"`
- Produces: `pauseAutoplayForReducedMotion(doc: DocumentLike, reduceMotion: boolean): void`
- Produces: `initCaseStudyView(doc?: Document, win?: Window): void`
- Consumes: `[data-case-view-switcher]`, `[data-case-view-choice]`, and `<html data-case-view="3">`

- [ ] **Step 1: Write failing unit tests for normalization, query strings, and button state**

Create `tests/case-study-view.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCaseStudyView,
  readCaseStudyView,
  writeCaseStudyView,
  applyCaseStudyView,
  pauseAutoplayForReducedMotion
} from '../case-study-view.mjs';

test('normalizes unknown views to the hybrid default', () => {
  assert.equal(normalizeCaseStudyView('1'), '1');
  assert.equal(normalizeCaseStudyView('2'), '2');
  assert.equal(normalizeCaseStudyView('3'), '3');
  assert.equal(normalizeCaseStudyView('4'), '3');
  assert.equal(normalizeCaseStudyView(null), '3');
});

test('reads view from a query string', () => {
  assert.equal(readCaseStudyView('?view=1'), '1');
  assert.equal(readCaseStudyView('?source=portfolio&view=2'), '2');
  assert.equal(readCaseStudyView('?source=portfolio'), '3');
});

test('writes view without deleting unrelated query parameters', () => {
  assert.equal(writeCaseStudyView('?source=portfolio', '1'), '?source=portfolio&view=1');
  assert.equal(writeCaseStudyView('?view=1&source=portfolio', '2'), '?view=2&source=portfolio');
  assert.equal(writeCaseStudyView('', 'invalid'), '?view=3');
});

test('applies the normalized view and exposes one pressed button', () => {
  const root = { dataset: {} };
  const buttons = ['1', '2', '3'].map((choice) => ({
    dataset: { caseViewChoice: choice },
    attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; }
  }));

  assert.equal(applyCaseStudyView(root, buttons, '2'), '2');
  assert.equal(root.dataset.caseView, '2');
  assert.deepEqual(buttons.map((button) => button.attrs['aria-pressed']), ['false', 'true', 'false']);
});

test('pauses autoplay media when reduced motion is requested', () => {
  const videos = [
    { removed: false, paused: false, removeAttribute() { this.removed = true; }, pause() { this.paused = true; } },
    { removed: false, paused: false, removeAttribute() { this.removed = true; }, pause() { this.paused = true; } }
  ];
  const doc = { querySelectorAll() { return videos; } };
  pauseAutoplayForReducedMotion(doc, false);
  assert.deepEqual(videos.map((video) => video.paused), [false, false]);
  pauseAutoplayForReducedMotion(doc, true);
  assert.deepEqual(videos.map((video) => [video.removed, video.paused]), [[true, true], [true, true]]);
});
```

- [ ] **Step 2: Run the unit test and confirm it fails because the module does not exist**

Run:

```powershell
node --test tests/case-study-view.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `case-study-view.mjs`.

- [ ] **Step 3: Implement the pure helpers and browser initializer**

Create `case-study-view.mjs`:

```js
const DEFAULT_VIEW = '3';
const VALID_VIEWS = new Set(['1', '2', '3']);

export function normalizeCaseStudyView(value) {
  const candidate = String(value ?? '');
  return VALID_VIEWS.has(candidate) ? candidate : DEFAULT_VIEW;
}

export function readCaseStudyView(search) {
  return normalizeCaseStudyView(new URLSearchParams(search).get('view'));
}

export function writeCaseStudyView(search, view) {
  const params = new URLSearchParams(search);
  params.set('view', normalizeCaseStudyView(view));
  return `?${params.toString()}`;
}

export function applyCaseStudyView(root, buttons, view) {
  const activeView = normalizeCaseStudyView(view);
  root.dataset.caseView = activeView;
  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.caseViewChoice === activeView));
  });
  return activeView;
}

export function pauseAutoplayForReducedMotion(doc, reduceMotion) {
  if (!reduceMotion) return;
  doc.querySelectorAll('video[autoplay]').forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
  });
}

export function initCaseStudyView(doc = document, win = window) {
  pauseAutoplayForReducedMotion(doc, Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const switcher = doc.querySelector('[data-case-view-switcher]');
  if (!switcher) return;
  const buttons = Array.from(switcher.querySelectorAll('[data-case-view-choice]'));
  const setView = (view, updateUrl) => {
    const activeView = applyCaseStudyView(doc.documentElement, buttons, view);
    if (updateUrl) {
      const next = `${win.location.pathname}${writeCaseStudyView(win.location.search, activeView)}${win.location.hash}`;
      win.history.replaceState({}, '', next);
    }
  };
  buttons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.caseViewChoice, true));
  });
  setView(readCaseStudyView(win.location.search), false);
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initCaseStudyView();
}
```

- [ ] **Step 4: Add the temporary comparison control and module include**

Set the root default and place this control immediately after `.topnav` in `whatsapp-campaigns.html`:

```html
<html lang="en" data-case-view="3">
```

```html
<aside class="case-viewer" aria-label="Temporary case study comparison">
  <div class="case-viewer-inner">
    <span class="case-viewer-label">Temporary comparison</span>
    <div class="case-viewer-options" data-case-view-switcher aria-label="Case study presentation">
      <button type="button" data-case-view-choice="1" aria-pressed="false"><span>1</span><span>Editorial</span></button>
      <button type="button" data-case-view-choice="2" aria-pressed="false"><span>2</span><span>Character</span></button>
      <button type="button" data-case-view-choice="3" aria-pressed="true"><span>3</span><span>Hybrid</span></button>
    </div>
  </div>
</aside>
```

Add before the existing `site.js` include:

```html
<script type="module" src="case-study-view.mjs"></script>
<script src="site.js"></script>
```

- [ ] **Step 5: Run the switcher tests and confirm they pass**

Run:

```powershell
node --test tests/case-study-view.test.mjs
```

Expected: 4 tests pass, 0 fail.

- [ ] **Step 6: Commit the isolated switcher foundation**

```powershell
git add -- case-study-view.mjs tests/case-study-view.test.mjs whatsapp-campaigns.html
git commit -m "feat: add case study comparison switcher"
```

---

### Task 2: Replace the Unsupported Story with the Approved Narrative

**Files:**
- Create: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html:6-214`

**Interfaces:**
- Consumes: the switcher markup and `data-case-view` contract from Task 1
- Produces: one shared article with section IDs `story`, `turning-point`, `reframe`, `shipped`, `decisions`, `automation`, `today`, `direction`, and `reflection`
- Produces: visual hooks `.wa-story-card`, `.wa-character-scene`, `.wa-system-map`, `.wa-proof-grid`, `.wa-decision`, and `.wa-reflection`
- Preserves: current `.topnav`, `.contact`, `.next-project`, `.media`, `.media-strip`, and existing product asset paths

- [ ] **Step 1: Write failing static content and structure tests**

Create `tests/whatsapp-case-study.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the content tests and verify the narrative assertions fail**

Run:

```powershell
node --test tests/whatsapp-case-study.test.mjs
```

Expected: failures for the new headline, role, section IDs, live/future labels, and unsupported current statistics.

- [ ] **Step 3: Update metadata and hero copy**

Use this metadata and opening content:

```html
<title>Cretile sales platform · Samuel Joseph, Product Designer</title>
<meta name="description" content="I began building Cretile's WhatsApp tool for the wrong reason. When that assumption failed, I reframed it as the first module of an internal sales platform.">
<meta property="og:title" content="Cretile sales platform · Samuel Joseph">
<meta property="og:description" content="A candid 0→1 product design case study about a failed assumption, a strategic pivot and a live internal messaging product.">
```

```html
<header class="wa-hero" id="story">
  <div class="wa-hero-copy">
    <span class="wa-kicker">Cretile · 0→1 internal product</span>
    <h1>The reason I started building disappeared before I finished.</h1>
    <p>I began with a cost-saving idea. When the assumption failed, I had to decide whether the product still deserved to exist.</p>
  </div>
  <dl class="wa-meta">
    <div><dt>Role</dt><dd>Product designer and builder</dd></div>
    <div><dt>Responsibilities</dt><dd>Product strategy, workflow design, interaction design, prototyping and development</dd></div>
    <div><dt>Timeline</dt><dd>Two weeks for the first version</dd></div>
    <div><dt>Users</dt><dd>Campaign operator and salesperson</dd></div>
    <div><dt>Status</dt><dd>Live internal product</dd></div>
  </dl>
</header>
```

- [ ] **Step 4: Write the shared narrative sections with approved facts**

Use these section-level messages as the final copy source:

```text
Long story short
1. Cretile lost access to its Meta account. A new number meant rebuilding the campaign setup anyway.
2. I believed our provider was adding roughly ₹3,500 to every campaign. After development began, I learned Meta was charging it.
3. The cost argument disappeared, but a larger opportunity remained: an internal system Cretile could shape around its own sales workflow.

The situation
I ran Cretile's WhatsApp campaigns. Lead data lived in Excel, so each campaign began with another export as new contacts were added. Interakt itself was not difficult to use. The question was whether reconnecting a new number to another monthly tool was the right long-term decision.

The assumption that failed
With roughly 4,000 leads, I believed building internally would remove about ₹3,500 in campaign charges. I started designing and developing around that belief. Then I checked the pricing more carefully with Claude: Meta charged for the messages, not Interakt. Building our own interface would not make that cost disappear.

That left an uncomfortable question: if the product was not meaningfully cheaper, why should Cretile own it?

Reframing the product
Recreating Interakt was not enough. Ownership would matter only if the system could behave differently for Cretile. I started treating WhatsApp as the first working module of a larger sales platform—one place for leads, campaigns, replies, ownership, qualification and follow-up.

What exists today
I use the product to add contacts and run campaigns. One salesperson uses the inbox to reply. The basic campaign workflow is not yet clearly better than Interakt. Its most promising advantage is that Cretile can create automations around the way the company actually works.

Where ownership became useful
In one campaign, I asked people to choose between four kinds of support. Each answer needed a different follow-up. Instead of watching the inbox and opening every conversation, I asked Claude to monitor the replies and send the matching response. It handled approximately 40 follow-ups while I was away.

Proposed direction
The next opportunity is not another campaign feature. It is connecting the journey from a website enquiry to a qualified sales conversation. I developed the direction by examining our workflow, speaking with the salesperson and founders, exploring it with Claude, and aligning the team around a shared structure.

Reflection
I should have verified the pricing model before I started building. But being wrong exposed a better test for the product: ownership is useful only when it lets the system behave differently. The most meaningful difference so far did not come from rebuilding the campaign screens. It came when Claude became part of the product workflow itself.
```

- [ ] **Step 5: Preserve only verifiable product decisions**

Create five `.wa-decision` blocks with these exact titles and meanings:

```text
Tag at the point of entry — Every imported contact needs a tag, so an audience already has structure when a campaign is created.
Opt-outs stay locked — A person who asks to stop cannot be accidentally added back to a campaign.
A few seconds to undo — Sending waits briefly so the operator can catch the wrong audience or a typo.
Make the reply window visible — The inbox shows whether WhatsApp's 24-hour free-reply window is still open.
Warm the number without babysitting it — Sending starts slowly, increases over time and stops if Meta reports a warning.
```

Pair the existing media with the relevant sections:

```text
assets/wa-hero.jpg → shipped system overview
assets/wa-preview.mp4 → campaign preview
assets/wa-audience.jpg → opt-out protection
assets/wa-undo.mp4 → undo decision
assets/wa-warmup.jpg → number warm-up
assets/wa-screen.jpg → next-project preview only
```

- [ ] **Step 6: Add the proposed future journey as labelled semantic HTML**

Use an ordered list so the meaning remains available without styling:

```html
<section class="wa-section wa-direction" id="direction" aria-labelledby="direction-title">
  <span class="wa-section-label">Proposed direction · Not yet built</span>
  <h2 id="direction-title">From website enquiry to a qualified conversation</h2>
  <ol class="wa-system-map" aria-label="Proposed journey from website enquiry to qualification">
    <li><span>01</span><strong>Website enquiry</strong></li>
    <li><span>02</span><strong>Lead record</strong></li>
    <li><span>03</span><strong>Brochure delivery</strong></li>
    <li><span>04</span><strong>WhatsApp conversation</strong></li>
    <li><span>05</span><strong>Salesperson ownership</strong></li>
    <li><span>06</span><strong>Qualification</strong></li>
  </ol>
</section>
```

- [ ] **Step 7: Run both test files and confirm the content contract passes**

Run:

```powershell
node --test tests/case-study-view.test.mjs tests/whatsapp-case-study.test.mjs
```

Expected: all tests pass.

- [ ] **Step 8: Commit the truthful shared story**

```powershell
git add -- whatsapp-campaigns.html tests/whatsapp-case-study.test.mjs
git commit -m "content: rewrite WhatsApp case study narrative"
```

---

### Task 3: Build the Shared Visual Story Components

**Files:**
- Modify: `whatsapp-campaigns.html`
- Modify: `styles.css:132-187,246-287,306-388`
- Modify: `tests/whatsapp-case-study.test.mjs`

**Interfaces:**
- Consumes: shared narrative and section IDs from Task 2
- Produces: reusable components `.wa-story-beats`, `.wa-character-scene`, `.wa-pivot-card`, `.wa-system-map`, `.wa-proof-grid`, `.wa-decision-grid`, `.wa-live-card`, and `.wa-reflection`
- Produces: inline character SVGs using `.wa-person` and `.wa-claude`, unified by `currentColor`, `--wa-accent`, and a consistent 2px stroke

- [ ] **Step 1: Extend static tests for visual semantics and accessibility**

Append to `tests/whatsapp-case-study.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and confirm the new visual hooks fail**

Run:

```powershell
node --test tests/whatsapp-case-study.test.mjs
```

Expected: failures for missing story, character, proof, decision, and reflection hooks.

- [ ] **Step 3: Add the character turning-point sequence**

Add one three-panel `.wa-character-scene` inside `#turning-point`:

```html
<div class="wa-character-scene" aria-label="The assumption, discovery and reframing">
  <article class="wa-character-panel">
    <p>“We can avoid the campaign charge.”</p>
    <svg class="wa-person" viewBox="0 0 160 160" aria-hidden="true" focusable="false"><circle cx="80" cy="53" r="28"/><path d="M35 160c3-51 20-75 45-75s42 24 45 75"/><path d="M52 42c9-27 47-25 55 2-18-11-38-12-55-2Z"/></svg>
    <span>The assumption</span>
  </article>
  <article class="wa-character-panel">
    <p>“Meta charges it—not Interakt.”</p>
    <svg class="wa-claude" viewBox="0 0 160 160" aria-hidden="true" focusable="false"><rect x="45" y="35" width="70" height="58" rx="18"/><path d="M46 160c3-45 18-67 34-67s31 22 34 67"/><circle cx="68" cy="64" r="3"/><circle cx="92" cy="64" r="3"/></svg>
    <span>The interruption</span>
  </article>
  <article class="wa-character-panel wa-character-panel-accent">
    <p>“Then what is actually worth building?”</p>
    <svg class="wa-person" viewBox="0 0 160 160" aria-hidden="true" focusable="false"><circle cx="80" cy="53" r="28"/><path d="M35 160c3-51 20-75 45-75s42 24 45 75"/><path d="M52 42c9-27 47-25 55 2-18-11-38-12-55-2Z"/></svg>
    <span>The better question</span>
  </article>
</div>
```

- [ ] **Step 4: Add shared CSS tokens and component foundations**

Append a dedicated `/* WhatsApp redesign */` section to `styles.css` with these tokens and foundations:

```css
.wa-case {
  --wa-ink: #111111;
  --wa-paper: #f5f1e8;
  --wa-panel: #f3f3f6;
  --wa-accent: #ddff4f;
  --wa-coral: #ff806f;
  --wa-blue: #8fa1ff;
  --wa-line: rgba(17, 17, 17, .12);
  --wa-radius: 20px;
}
.wa-section { padding-top: var(--section-gap); }
.wa-section-label, .wa-kicker { font-size: 12px; font-weight: 600; line-height: 1; letter-spacing: .06em; text-transform: uppercase; }
.wa-section-heading { max-width: 660px; display: flex; flex-direction: column; gap: 14px; }
.wa-story-beats, .wa-decision-grid, .wa-proof-grid { display: grid; gap: 16px; }
.wa-story-beats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.wa-story-card, .wa-decision, .wa-live-card { border-radius: var(--wa-radius); padding: 24px; }
.wa-character-scene { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.wa-character-panel { position: relative; min-height: 320px; overflow: hidden; border-radius: var(--wa-radius); background: var(--wa-paper); padding: 20px; }
.wa-character-panel p { position: relative; z-index: 1; max-width: 190px; padding: 10px 12px; border: 2px solid currentColor; border-radius: 18px; background: white; font-weight: 600; line-height: 1.3; }
.wa-character-panel svg { position: absolute; width: 180px; height: 180px; left: 50%; bottom: -8px; transform: translateX(-50%); fill: var(--wa-blue); stroke: var(--wa-ink); stroke-width: 2; }
.wa-character-panel > span { position: absolute; z-index: 1; left: 20px; bottom: 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
.wa-character-panel-accent { background: var(--wa-accent); }
.wa-system-map { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 20px; }
.wa-system-map li { position: relative; min-height: 120px; padding: 16px; border: 1px solid currentColor; border-radius: 14px; display: flex; flex-direction: column; justify-content: space-between; }
.wa-system-map li:not(:last-child)::after { content: "→"; position: absolute; right: -17px; top: 48px; }
.wa-system-map span { color: var(--muted); font-size: 12px; }
.wa-system-map strong { font-size: 14px; line-height: 1.3; }
```

- [ ] **Step 5: Add captions and accessible labels to every media block**

Wrap each shipped product image/video in `.media-figure` and use captions that state design relevance:

```text
wa-hero.jpg — The live system combines number health, campaign history and delivery status in one view.
wa-preview.mp4 — The message changes beside the form, letting the operator check the final WhatsApp message before continuing.
wa-audience.jpg — Opted-out contacts remain visible for accountability but cannot be added back to the audience.
wa-undo.mp4 — Sending begins with a short countdown so the operator has one last chance to stop it.
wa-warmup.jpg — The system increases the daily limit gradually and stops automatically if Meta reports a warning.
```

- [ ] **Step 6: Run the full tests and confirm the visual contract passes**

Run:

```powershell
node --test tests/case-study-view.test.mjs tests/whatsapp-case-study.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Commit the shared story components**

```powershell
git add -- whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "feat: add visual storytelling components"
```

---

### Task 4: Finish All Three Final-Quality Treatments

**Files:**
- Modify: `styles.css`
- Modify: `whatsapp-campaigns.html`
- Modify: `tests/whatsapp-case-study.test.mjs`

**Interfaces:**
- Consumes: `<html data-case-view="1|2|3">` from Task 1 and the shared components from Task 3
- Produces: complete style scopes `[data-case-view="1"]`, `[data-case-view="2"]`, and `[data-case-view="3"]`
- Produces: responsive breakpoints at `900px`, `640px`, and reduced-motion overrides

- [ ] **Step 1: Add failing CSS contract tests for all views and responsive safeguards**

At the top of `tests/whatsapp-case-study.test.mjs`, add:

```js
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
```

Append:

```js
test('defines all three visual treatments', () => {
  for (const view of ['1', '2', '3']) {
    assert.match(css, new RegExp(`\\[data-case-view=["']${view}["']\\]`), `missing view ${view} styles`);
  }
});

test('includes mobile and reduced-motion treatment rules', () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.case-viewer/);
  assert.match(css, /\.wa-character-scene/);
  assert.match(css, /\.wa-system-map/);
});
```

- [ ] **Step 2: Run the static tests and verify the three treatment assertion fails**

Run:

```powershell
node --test tests/whatsapp-case-study.test.mjs
```

Expected: failure because the three `[data-case-view]` scopes are incomplete.

- [ ] **Step 3: Complete Treatment 1 — Editorial and diagram-led**

Implement these exact principles inside `[data-case-view="1"]`:

```css
[data-case-view="1"] .wa-hero { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr); gap: 64px; align-items: end; }
[data-case-view="1"] .wa-hero h1 { font-size: clamp(44px, 7vw, 82px); line-height: .96; letter-spacing: -.065em; }
[data-case-view="1"] .wa-character-scene { grid-template-columns: minmax(0, 1fr); }
[data-case-view="1"] .wa-character-panel { min-height: 0; display: grid; grid-template-columns: 160px 1fr; align-items: center; }
[data-case-view="1"] .wa-character-panel svg { position: static; transform: none; width: 120px; height: 120px; }
[data-case-view="1"] .wa-story-card { border-top: 1px solid var(--wa-line); border-radius: 0; padding-inline: 0; }
[data-case-view="1"] .wa-direction { background: var(--wa-paper); color: var(--wa-ink); border-radius: 28px; padding: 48px; }
```

Use a white page, mostly black typography, muted cool-grey product frames, thin rules, and large diagrams. Keep character panels compact so the treatment reads as mature editorial design.

- [ ] **Step 4: Complete Treatment 2 — Character-led story**

Implement these exact principles inside `[data-case-view="2"]`:

```css
[data-case-view="2"] .wa-case { --wa-paper: #fff3d9; --wa-accent: #ddff4f; }
[data-case-view="2"] .wa-hero { position: relative; overflow: hidden; min-height: 620px; border-radius: 28px; padding: clamp(28px, 6vw, 64px); background: var(--wa-paper); }
[data-case-view="2"] .wa-hero h1 { max-width: 720px; font-size: clamp(42px, 7vw, 78px); line-height: .96; }
[data-case-view="2"] .wa-character-scene { gap: 10px; transform: rotate(-.4deg); }
[data-case-view="2"] .wa-character-panel:nth-child(2) { transform: translateY(28px) rotate(.8deg); }
[data-case-view="2"] .wa-section:nth-of-type(even) { background: var(--wa-paper); border-radius: 28px; padding-inline: clamp(24px, 5vw, 48px); padding-bottom: clamp(24px, 5vw, 48px); }
[data-case-view="2"] .wa-decision { border: 2px solid var(--wa-ink); box-shadow: 5px 5px 0 var(--wa-ink); background: white; }
```

Use the Samuel and Claude characters at the assumption, discovery, reframing, and automation beats. Keep product media full-sized and unillustrated so the treatment remains credible rather than becoming a continuous comic.

- [ ] **Step 5: Complete Treatment 3 — Hybrid story system**

Implement these exact principles inside `[data-case-view="3"]`:

```css
[data-case-view="3"] .wa-hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr); overflow: hidden; border-radius: 28px; background: var(--wa-ink); color: white; }
[data-case-view="3"] .wa-hero-copy { padding: clamp(32px, 6vw, 64px); }
[data-case-view="3"] .wa-hero h1 { font-size: clamp(44px, 7vw, 80px); line-height: .94; letter-spacing: -.065em; }
[data-case-view="3"] .wa-meta { padding: clamp(28px, 4vw, 40px); background: var(--wa-accent); color: var(--wa-ink); }
[data-case-view="3"] .wa-story-card:nth-child(2),
[data-case-view="3"] .wa-live-card-accent { background: var(--wa-accent); color: var(--wa-ink); }
[data-case-view="3"] .wa-proof-grid { grid-template-columns: minmax(0, 1.35fr) minmax(240px, .65fr); }
[data-case-view="3"] .wa-reflection { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr); gap: 48px; padding: clamp(32px, 6vw, 64px); border-radius: 28px; background: var(--wa-accent); }
```

Alternate editorial statements, character turning points, vector explanations, and real interface proof. Use the shared palette and radius system to prevent visual fragmentation.

- [ ] **Step 6: Make all treatments responsive and motion-safe**

Add:

```css
@media (max-width: 900px) {
  [data-case-view] .wa-hero,
  [data-case-view] .wa-proof-grid,
  [data-case-view] .wa-reflection { grid-template-columns: minmax(0, 1fr); }
  .wa-story-beats, .wa-decision-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .wa-system-map { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .case-viewer-inner { align-items: flex-start; }
  .case-viewer-options button span:last-child { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .wa-story-beats, .wa-character-scene, .wa-decision-grid, .wa-system-map { grid-template-columns: minmax(0, 1fr); }
  .wa-system-map li:not(:last-child)::after { content: "↓"; right: auto; left: 50%; top: auto; bottom: -19px; }
  [data-case-view="1"] .wa-hero,
  [data-case-view="3"] .wa-hero { border-radius: 20px; }
  [data-case-view="2"] .wa-character-panel:nth-child(2) { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .case-viewer button, .wa-character-panel, .wa-decision, .wa-media-frame { transition: none !important; animation: none !important; }
}
```

The Task 1 module removes `autoplay` and pauses the media when reduced motion is active. Keep a useful poster and adjacent caption for every video so the meaning remains available while paused.

- [ ] **Step 7: Run all tests and inspect the stylesheet for accidental global leakage**

Run:

```powershell
node --test tests/case-study-view.test.mjs tests/whatsapp-case-study.test.mjs
rg -n "^\[data-case-view|^\.wa-|^\.case-viewer|@media" styles.css
git diff --check
```

Expected: all tests pass; treatment selectors are scoped; `git diff --check` reports no errors.

- [ ] **Step 8: Commit all three complete treatments**

```powershell
git add -- whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "feat: finish three WhatsApp case study treatments"
```

---

### Task 5: Browser QA, Accessibility, and Final Polish

**Files:**
- Modify if defects are found: `whatsapp-campaigns.html`
- Modify if defects are found: `styles.css`
- Modify if defects are found: `case-study-view.mjs`
- Modify if defects are found: `tests/case-study-view.test.mjs`
- Modify if defects are found: `tests/whatsapp-case-study.test.mjs`
- Verify unchanged: `index.html`, `superstash.html`

**Interfaces:**
- Consumes: complete treatments and switcher from Tasks 1–4
- Produces: verified desktop/mobile rendering for `?view=1`, `?view=2`, and `?view=3`
- Produces: clean Git state with only intentional committed changes

- [ ] **Step 1: Capture hashes of out-of-scope pages before QA fixes**

Run:

```powershell
Get-FileHash index.html,superstash.html -Algorithm SHA256 | Format-Table Path,Hash
```

Record the two hashes in the execution notes before making QA fixes.

- [ ] **Step 2: Run the complete automated verification suite**

Run:

```powershell
node --test tests/case-study-view.test.mjs tests/whatsapp-case-study.test.mjs
git diff --check
```

Expected: all tests pass and no whitespace errors appear.

- [ ] **Step 3: Start the static site locally**

Run in a persistent hidden process:

```powershell
$server = Start-Process python -ArgumentList @('-m','http.server','5173') -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
$server.Id
```

Expected: a process ID and a responding site at `http://localhost:5173/`.

- [ ] **Step 4: Verify all view URLs return successfully**

Run:

```powershell
@('1','2','3') | ForEach-Object {
  $response = Invoke-WebRequest "http://localhost:5173/whatsapp-campaigns.html?view=$_" -UseBasicParsing
  "view=$_ status=$($response.StatusCode) bytes=$($response.RawContentLength)"
}
```

Expected: three `status=200` lines with nonzero byte counts.

- [ ] **Step 5: Capture desktop screenshots for every treatment**

Run:

```powershell
$edgeCandidates = @('C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe','C:\Program Files\Microsoft\Edge\Application\msedge.exe')
$edge = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
New-Item -ItemType Directory -Force 'C:\tmp\portfolio-wa-qa' | Out-Null
@('1','2','3') | ForEach-Object {
  & $edge --headless --disable-gpu --hide-scrollbars --window-size=1440,1200 --screenshot="C:\tmp\portfolio-wa-qa\view-$_.png" "http://localhost:5173/whatsapp-campaigns.html?view=$_"
}
```

Expected: `view-1.png`, `view-2.png`, and `view-3.png` in `C:\tmp\portfolio-wa-qa`.

- [ ] **Step 6: Capture mobile screenshots for every treatment**

Run:

```powershell
@('1','2','3') | ForEach-Object {
  & $edge --headless --disable-gpu --hide-scrollbars --window-size=390,844 --screenshot="C:\tmp\portfolio-wa-qa\view-$($_)-mobile.png" "http://localhost:5173/whatsapp-campaigns.html?view=$_"
}
```

Expected: three mobile screenshots with no horizontal clipping.

- [ ] **Step 7: Inspect all six screenshots and correct visual defects**

Use the image viewer on each screenshot. Check:

```text
Hero hierarchy is readable at first glance.
The temporary switcher is visible but does not dominate.
No text overlaps characters, diagrams or product media.
Vector labels remain readable on mobile.
Every section has deliberate spacing and visual rhythm.
Character treatment remains professional rather than childish.
Hybrid treatment feels unified rather than assembled from unrelated styles.
Product images and videos remain the strongest visual evidence.
No horizontal page overflow appears.
```

For each defect, first add or tighten a static test when the defect can recur structurally, then make the smallest HTML/CSS/JS correction and rerun the suite.

- [ ] **Step 8: Manually verify keyboard and URL behaviour**

In the browser:

```text
Tab to the comparison buttons and activate each with Enter and Space.
Confirm exactly one button reports aria-pressed="true".
Refresh after selecting each treatment and confirm the same treatment returns.
Open ?view=99 and confirm treatment 3 appears.
Tab through All projects, media lightbox controls, View all decisions, next project, email, LinkedIn and résumé.
Enable reduced motion and confirm the narrative remains understandable without animation.
```

- [ ] **Step 9: Confirm out-of-scope pages are byte-for-byte unchanged**

Run the same hash command as Step 1:

```powershell
Get-FileHash index.html,superstash.html -Algorithm SHA256 | Format-Table Path,Hash
```

Expected: both hashes match the recorded values.

- [ ] **Step 10: Stop the local server**

Run:

```powershell
Stop-Process -Id $server.Id
```

Expected: the local test server exits; no site files are changed.

- [ ] **Step 11: Run final verification and commit polish fixes**

Run:

```powershell
node --test tests/case-study-view.test.mjs tests/whatsapp-case-study.test.mjs
git diff --check
git status --short
```

Expected: all tests pass; no whitespace errors; only intentional case-study files are modified before the final commit.

```powershell
git add -- whatsapp-campaigns.html styles.css case-study-view.mjs tests/case-study-view.test.mjs tests/whatsapp-case-study.test.mjs
git commit -m "fix: polish WhatsApp case study comparison"
```

## Final Handoff

Present Samuel with these local comparison links:

```text
http://localhost:5173/whatsapp-campaigns.html?view=1
http://localhost:5173/whatsapp-campaigns.html?view=2
http://localhost:5173/whatsapp-campaigns.html?view=3
```

Explain that all three are final-quality candidates, treatment 3 is the default, and the switcher is intentionally temporary. Ask Samuel to select the version to publish; removal of the comparison layer and rejected treatments is a separate, bounded cleanup after that selection.
