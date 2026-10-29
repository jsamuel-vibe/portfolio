# Cretile Two-Page Story Implementation Plan

> Execute inline with the executing-plans skill. Do not use sub-agents. Continue in the current feature checkout so the existing reviewed media and uncommitted work are preserved.

**Goal:** Replace the inline feature tour and disclosure with an overview that links to a separate, complete text-and-imagery case study.

**Architecture:** Keep the static GitHub Pages structure. `whatsapp-campaigns.html` remains the entry URL; `cretile-case-study.html` contains the full narrative. Both use the shared styles and image viewer, with the existing accessible preview tabs on the overview.

**Tech stack:** Static HTML, CSS and vanilla JavaScript; Node's test runner; local Playwright browser verification.

**Spec:** `docs/superpowers/specs/2026-10-28-cretile-case-study-narrative.md`.

## Constraints

- Real screenshots and recordings only. No vector graphics, infographic diagrams or reconstructed interfaces.
- Preserve native media ratios, full interface edges, existing type scale and selected landscape where framing is used. Preview gallery has no landscape.
- Keep private recordings and source frames outside public assets. New exported stills must have opaque privacy redactions and be inspected before integration.
- State ease-of-use feedback qualitatively; keep projected costs conditional and separate from observed results.
- No deployment, merge or unrelated Superstash redesign in this checkpoint.

## Tasks

### 1. Protect navigation and prepare media

- [x] Replace obsolete prose/diagram assertions with local link, anchor, asset and accessible gallery-reference checks in `tests/whatsapp-case-study.test.mjs`.
- [x] Run `node --test`; confirm the overview-to-story navigation fails before implementation.
- [x] Create and visually review privacy-redacted mapping, audience and inbox screenshots. Do not ship raw recordings.

### 2. Build both pages

- [x] Update the overview from the approved copy; keep the gallery and replace the feature tour/disclosure with a normal Learn More link.
- [x] Add `cretile-case-study.html` using the approved full narrative, real media and return navigation.
- [x] Replace obsolete page-specific illustrated/demo styles with readable story layouts in `cretile-overview.css`.
- [x] Simplify `cretile-overview.js` to gallery/playback behavior; preserve old deep-link destinations by redirecting them to the relevant story sections.
- [x] Update the README and narrative implementation status without changing the approved story.

### 3. Verify and hand off

- [x] Run `node --test`, JavaScript syntax checks and `git diff --check`.
- [x] Verify Learn More and return navigation; legacy fragments; image viewer; tab keyboard control; local media paths; no browser errors.
- [x] Inspect desktop and mobile layouts, native image ratios, reduced-motion behavior and no-JavaScript access to the full story.
- [x] Confirm both URLs respond successfully on the existing local preview. Open the overview for review; leave changes local and uncommitted.

## Verification record

- Five local navigation, destination, asset and accessible-reference checks pass. The initial navigation check failed against the old inline story before implementation.
- Both pages inspected at 1440, 900, 390 and 320px; no horizontal overflow, out-of-bounds media or page JavaScript errors observed.
- Six preview tabs show one panel at a time; keyboard wrap and Home work. Image viewer opens and closes. Learn More and return navigation work.
- Legacy audience, launch, follow-up and design-story fragments reach corresponding sections on the full page.
- Without JavaScript, all six preview panels and all nine story sections remain available; inactive tab controls are hidden. Reduced motion leaves recordings paused with controls.
- Local server returns HTTP 200 for both pages, the page stylesheet and the corrected import-method image.
- Media self-review caught a wrong source frame in the manual/import illustration. It was replaced with the actual method-choice screen at four seconds, which contains no customer data. New stills were visually inspected after opaque redaction.
- Raw private recordings and source frames were not copied to public assets; local processing scripts and reference captures remain ignored under `.superpowers/`.
- Changes remain uncommitted on the existing feature branch, ready for Samuel's visual review. No deployment performed.
