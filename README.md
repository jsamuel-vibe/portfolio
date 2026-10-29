# Samuel Joseph · Portfolio

Static site: plain HTML and CSS, no build step. GitHub Pages serves it from the repository root.

- `index.html`: Home
- `whatsapp-campaigns.html`, `superstash.html`: case studies
- `styles.css`: all styles; `case-study.js`: the "View all decisions" toggle
- `game-stage.js`: the footer game stage (the oval, expanding in place, the demo/play lifecycle). New games call `GameStage.register(name, factory)` and plug into it unchanged
- `games/`: games for the stage. Each keeps its rules in a DOM-free file (`penalty-rules.js`, tested in `tests/`) and its drawing in another (`penalty.js`)
- `assets/`: images, clips and resume
- `_reference/`: the original design pages, kept for iterating (GitHub Pages skips `_` folders)

Preview locally:

```
python -m http.server 5173
```

Run the tests:

```
node --test tests/*.test.mjs
```
