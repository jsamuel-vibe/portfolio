# Superstash: remaining media to capture

The content and two-page structure are implemented. Real existing images and the reviewed exploration board are already placed. Four visible slots need replacement. Do not rewrite the case study or recreate the interface to fill them.

## Source of truth

- Application: `C:/Users/SamuelJoseph/Documents/GitHub/stash-extension`.
- Overview: `superstash.html`.
- Full narrative: `superstash-case-study.html`.
- The existing board in the full narrative is Claude's reviewed implementation. Preserve its twelve drafts, dotted background, captions, layout and animation.
- The external connection to Claude/other AI tools is planned. Do not create a mock chat, fake API demonstration or fabricated result for this portfolio.

## Capture list

| Slot | Location | Deliverables | What to show |
| --- | --- | --- | --- |
| SS-01 | Overview, Browser capture tab | `assets/superstash-browser-capture-clean.mp4` and `assets/superstash-browser-capture-poster.webp` | 15–20 seconds: open a harmless public reference, save through the currently working extension action, show confirmation, then show that same item in the library. Choose the actual available action; do not claim an old prototype is the current flow. |
| SS-02 | Overview, Quick notes tab | `assets/superstash-quick-note-clean.mp4` and `assets/superstash-quick-note-poster.webp` | 10–15 seconds: start with New quick note in the gallery, enter a short fictional design observation, complete the existing save flow and reopen the note. Example note: “Try a quieter navigation rail so references keep most of the space.” |
| SS-03 | Overview, Finding references tab | `assets/superstash-find-reference-clean.mp4` and `assets/superstash-find-reference-poster.webp` | 10–15 seconds: show a mixed library, search for a term that genuinely matches an existing harmless reference, use a content-type filter if it helps, and open the result. Show current search/filter behavior, not semantic reasoning or a simulated external AI integration. |
| SS-04 | Full story, Who I designed for | `assets/superstash-research-excerpt.webp` | Export a readable close view of an existing competitor comparison or one competitor journey from Samuel's actual design file. Include the original observations and meaningful labels. Do not use the unreadable whole-board overview or manufacture interviews, survey findings or new research evidence. |

## Replacement steps

1. Find the element with the matching `data-media-slot="SS-01"` (or other slot ID). Replace that entire placeholder element, not its surrounding tabpanel, accessible IDs or figure caption.
2. For SS-01–03, insert a native video in the existing preview-surface pattern. Example for SS-01:

```html
<div class="wa-preview-surface">
  <video class="media"
    src="assets/superstash-browser-capture-clean.mp4"
    poster="assets/superstash-browser-capture-poster.webp"
    controls muted loop playsinline preload="metadata"
    aria-label="Saving a browser reference and finding it in Superstash"></video>
</div>
```

3. Set video width and height to the actual exported pixel dimensions. Preserve its natural aspect ratio. Do not add autoplay or a custom control implementation: `cretile-overview.js` supplies the shared central play/pause control, respects reduced motion and keeps native controls without JavaScript.
4. Replace SS-04 with a real image inside the existing figure:

```html
<div class="interface-stage"><div class="interface-viewport">
  <img class="media" src="assets/superstash-research-excerpt.webp"
    alt="Original Superstash competitor-comparison notes and the observations used to frame the problem"
    loading="lazy">
</div></div>
```

5. Add the research image's actual width and height. Update its alt text and existing figcaption to describe the specific original artefact shown. Remove the instruction caption after the slot is filled.

## Capture and privacy rules

- Use the actual current interface. Code presence is not proof that a feature is deployed, and a prototype is not a usability finding.
- Prefer a browser viewport around 1440–1900px wide, with only the application/source relevant to the task visible. Keep text readable; avoid filming the entire desktop.
- Do not clip relevant controls or distort aspect ratios. The gallery should have no decorative landscape or white image mat.
- No passwords, API keys, developer-console output, private notes, identifying contacts or confidential company material. Use fictional content or safe public references.
- Keep recordings quiet and concise. Start/end in understandable states. Use a clear poster frame from the actual recording.
- Keep the existing library screen and AI-tags screenshot until genuine replacements are available. The older right-click recording in the full story is deliberately labelled as an iteration, not as the current release.
- Do not alter fonts, heading sizes, Claude's hero treatment, homepage layout or the exploration board while replacing media.

## Product evidence inspected

These files were read, not modified or executed:

- `save-types.js`: implemented types include images, pages, articles, posts, video, snippets and app-created notes; it also records known metadata inconsistencies.
- `webapp/index.html`, `webapp/notes.test.js`: quick-note entry and note persistence/editing code.
- `extension/background.js`, `extension/content.js`: browser capture and right-click paths.
- `supabase/functions/tag-image/index.ts`: generation of descriptions and tags from the relevant saved content.
- `webapp/read-search.test.js`: existing search/refinement expectations; no claim of external AI chat or proven semantic retrieval is made.
- `webapp/landing/README.md`: documented website URL, `https://stash-extension.samueljoseph0110.workers.dev/landing/`.

The persona and usage observations come from Samuel's account in the chat, not inferred user research. API integration remains planned. No adoption, time-saved or usability metrics are claimed.

## Verification after replacement

Run `node --test` and the optional browser suites:

```powershell
node --test tests/superstash-case-study.browser.mjs tests/superstash-exploration.browser.mjs tests/cretile-controls.browser.mjs
```

The browser checks support `PLAYWRIGHT_MODULE` and `CHROME_PATH` environment variables. Verify both pages at mobile and desktop widths, image opening, all five gallery tabs, the central video control and both return links going to the overview top. The app itself must remain untouched unless Samuel separately requests app work.
