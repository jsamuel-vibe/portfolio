# Superstash Completion Implementation Plan

> Execute inline using the executing-plans workflow. Never use sub-agents. Continue in the existing workspace to preserve Samuel and Claude's uncommitted changes; do not create a clean checkout that loses them. No commits or publishing in this task.

**Goal:** Complete the Superstash overview and full case study, with replaceable media slots and truthful implementation claims.

**Architecture:** Keep the static HTML site and approved two-page Cretile pattern. Reuse the existing gallery, video and story components through additive shared selectors; preserve the exploration board as-is on the full-story page.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node tests, local Playwright/Chrome.

**Spec:** `docs/superpowers/specs/2026-10-30-superstash-case-study.md`.

## Global constraints

Preserve Claude's design changes and the approved opening. The application code is read-only. No invented research or outcomes. External AI integration is planned. New media gaps must have stable visible instructions. Leave all changes local.

### Task 1: Protect the two-page contract

**Files:** `tests/whatsapp-case-study.test.mjs`, `tests/superstash-exploration.browser.mjs`, `tests/superstash-case-study.browser.mjs`.

- [x] Add `superstash-case-study.html` to destination/asset/fragment/accessibility checks and assert the overview links to it with a return route to `superstash.html#top`.
- [x] Point exploration browser checks at the story route, preserving image opening, mobile readability and natural media proportions.
- [x] Add real-browser checks for the Superstash Learn More/return flow, all five gallery panels, keyboard navigation, legacy anchors and no-JavaScript availability.
- [x] Run `node --test tests/whatsapp-case-study.test.mjs` and confirm the new missing-page/navigation contract fails before implementation.

### Task 2: Build the reviewed content and media handoff

**Files:** `superstash.html`, `superstash-case-study.html`, `superstash.css`, `cretile-overview.css`, `cretile-overview.js`, `docs/superpowers/media/2026-10-30-superstash-media-brief.md`, `README.md`.

- [x] Preserve the exact existing opening, navigation/footer and full exploration markup before replacing the overview body.
- [x] Build the short overview with two purpose-led product explanations, five-view gallery, honest status and underlined Learn More.
- [x] Build the full narrative from the reviewed copy, preserving all twelve exploration drafts, the dotted board and its animation; remove the obsolete feature disclosure and standalone diagram.
- [x] Reuse current library and AI-tags stills. Label the existing right-click clip as an iteration. Provide SS-01 browser capture, SS-02 quick notes, SS-03 finding references and SS-04 research-excerpt placeholders, each with matching handoff instructions.
- [x] Extend shared selectors to `.case-study` and `.case-story`, extend video selection and add data-driven legacy-story forwarding. Keep Cretile paths and behavior unchanged.
- [x] Add only layout/placeholder styles to `superstash.css`, leaving its current board and legibility styles intact.
- [x] Document all routes, media-slot replacements and the code evidence supporting product claims.

### Task 3: Verify and hand off

- [x] Run `node --test`, `node --check cretile-overview.js`, `node --check site.js` and text-scoped `git diff --check` (see verification record).
- [x] Run `node --test tests/superstash-case-study.browser.mjs tests/superstash-exploration.browser.mjs tests/cretile-controls.browser.mjs` with the bundled Playwright/Chrome runtime.
- [x] Run homepage browser checks and review any failures against the preserved Claude design, rather than reverting user changes to satisfy stale tests.
- [x] Inspect both Superstash routes at 320, 442, 900 and 1440px. Check media bounds, placeholder text, visible board, reduced motion, image lightbox, return-to-top and absence of page errors.
- [x] Open the overview for Samuel; report the media brief and any verification limitations without claiming the placeholders are finished screenshots.

## Verification record, 2026-10-31

- Fresh `node --test`: 24 passed, 0 failed.
- Fresh browser run across homepage, Cretile controls, Superstash navigation/gallery and exploration suites: 23 passed, 0 failed.
- `node --check cretile-overview.js` and `node --check site.js` passed.
- Text-scoped `git diff --check -- '*.html' '*.css' '*.js' '*.mjs' '*.md'` passed, with existing line-ending warnings only. The unrelated user-modified resume PDF was excluded because Git treats its binary contents as text.
- Visual review during implementation covered both Superstash routes at 320, 442, 900 and 1440px, reduced motion and no JavaScript. Fresh browser checks reconfirmed mobile/desktop media bounds, keyboard navigation, full-resolution image opening and overview return links.
- Preserved the approved opening, Claude's current typography/hero treatment and complete twelve-draft exploration board. Application sources were inspected read-only.
- Four visible media slots remain intentionally unfilled: SS-01 browser capture, SS-02 quick notes, SS-03 retrieval and SS-04 an existing research excerpt. Exact capture and replacement instructions are in `docs/superpowers/media/2026-10-30-superstash-media-brief.md`.
- Requested the overview to open in Codex; the UI returned queued. No commit, push or publishing was performed.
