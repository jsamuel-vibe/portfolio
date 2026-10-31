# Samuel Joseph · Portfolio

Static site: plain HTML and CSS, no build step. GitHub Pages serves it from the repository root.

- `index.html`: Home
- `whatsapp-campaigns.html`: short Cretile overview and product preview
- `cretile-case-study.html`: full Cretile case study, reached through Learn More
- `superstash.html`: short Superstash overview and product preview
- `superstash-case-study.html`: full Superstash narrative, reached through Learn More
- `styles.css`, `site.js`: shared styles, navigation, carousels and image viewer
- `cretile-overview.css`, `cretile-overview.js`: shared case-study layouts, media tabs, minimal play/pause controls and legacy deep-link forwarding (existing filenames retained)
- `superstash.css`: Superstash exploration board, reviewed screenshot treatment and media placeholders
- `game-stage.js`: the footer game stage (the oval, expanding in place, the demo/play lifecycle). New games call `GameStage.register(name, factory)` and plug into it unchanged
- `games/`: games for the stage. Each keeps its rules in a DOM-free file (`penalty-rules.js`, tested in `tests/`) and its drawing in another (`penalty.js`)
- `assets/`: images, clips and resume
- `_reference/`: the original design pages, kept for iterating (GitHub Pages skips `_` folders)

Preview locally:

```
python -m http.server 4173 --bind 127.0.0.1
```

Keep that terminal running, then open http://127.0.0.1:4173/whatsapp-campaigns.html.
Learn More opens http://127.0.0.1:4173/cretile-case-study.html.
The preview is served from this folder; closing the server stops localhost.

New import, audience and inbox stills are privacy-redacted exports. Raw private
recordings and extracted source frames stay outside public assets and version control.

Cretile videos use a central keyboard-accessible play/pause control. Native
controls remain available without JavaScript. Both return links on the full
case study lead to the top of the overview.

Checks: `node --test`. Optional real-browser playback/navigation checks:
`node --test tests/cretile-controls.browser.mjs` (requires Playwright and Chromium;
`PLAYWRIGHT_MODULE` and `CHROME_PATH` can point to an existing bundled runtime).

Superstash follows the same short-overview / full-story navigation. The reviewed
exploration board lives on `superstash-case-study.html`; old exploration links
on the overview forward to it. Both story return links lead to `superstash.html#top`.

Missing Superstash media are visible labelled slots, not broken image paths.
Capture instructions and replacement markup are in
`docs/superpowers/media/2026-10-30-superstash-media-brief.md`.
The application repository was inspected read-only; no secrets or app code were copied.

Additional browser checks:
`node --test tests/superstash-case-study.browser.mjs tests/superstash-exploration.browser.mjs`.
