# Samuel Joseph · Portfolio

Static site: plain HTML and CSS, no build step. GitHub Pages serves it from the repository root.

- `index.html`: Home
- `whatsapp-campaigns.html`: Cretile overview, product preview and full case study on one page
- `superstash.html`: Superstash overview, product preview and full case study on one page
- `cretile-case-study.html`, `superstash-case-study.html`: forwarders that keep old links (and their #section links) working
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
The preview is served from this folder; closing the server stops localhost.

New import, audience and inbox stills are privacy-redacted exports. Raw private
recordings and extracted source frames stay outside public assets and version control.

Cretile videos use a central keyboard-accessible play/pause control. Native
controls remain available without JavaScript.

Checks: `node --test`. Optional real-browser playback/navigation checks:
`node --test tests/cretile-controls.browser.mjs` (requires Playwright and Chromium;
`PLAYWRIGHT_MODULE` and `CHROME_PATH` can point to an existing bundled runtime).

Superstash follows the same layout: the overview opens the page and the full
story, including the reviewed exploration board, continues below the preview.

Missing Superstash media are visible labelled slots, not broken image paths.
Capture instructions and replacement markup are in
`docs/superpowers/media/2026-10-30-superstash-media-brief.md`.
The application repository was inspected read-only; no secrets or app code were copied.

Additional browser checks:
`node --test tests/superstash-case-study.browser.mjs tests/superstash-exploration.browser.mjs`.
