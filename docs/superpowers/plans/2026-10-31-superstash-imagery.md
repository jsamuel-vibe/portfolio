# Superstash Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every placeholder and weak image on the two Superstash pages with deterministic motion loops in Superstash's visual language plus one staged real-app screenshot.

**Architecture:** A private "studio" page renders each scene as a pure function of time (`render(t)`), so a Playwright script can seek frame by frame, screenshot at 2× and hand the frames to ffmpeg. The hero still comes from the real web app with the Supabase client replaced in the browser by an in-memory fake. The portfolio pages then swap placeholders for `<video>`/`<img>` using the existing toggle component.

**Tech Stack:** Plain HTML/CSS/JS, Playwright (`C:/Users/SamuelJoseph/samueljoseph/node_modules/playwright`), ffmpeg 9 (winget), Node 24.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-31-superstash-imagery-design.md`.
- Do not edit `Documents/GitHub/stash-extension` (read and serve only).
- No writes to the real Supabase project; the hero capture blocks every `*.supabase.co` request.
- Images: picsum.photos (Unsplash licence) photos and original typographic cards made in the studio; credits in `docs/superpowers/media/superstash-image-credits.md`.
- Output: 1920×1080 H.264 MP4, `-pix_fmt yuv420p -movflags +faststart`, muted, 6–10 s, seamless loop, target < 2 MB; WebP poster at quality 82.
- Captions call motion pieces illustrations; the hero caption says demo content.
- Do not commit: the main folder holds Codex's uncommitted Superstash work.

## File Structure

- `docs/superpowers/media/superstash-studio/index.html` — studio shell: 960×540 stage, fonts, shared styles, `?scene=` selects a scene, exposes `window.studio = { duration, render(t) }`.
- `docs/superpowers/media/superstash-studio/scenes.js` — scene definitions: `library`, `save`, `notes`, `ai`, `search`, `hoverSave`, `rightClick`; each `{ duration, build(stage), render(t) }`.
- `docs/superpowers/media/superstash-studio/library/` — downloaded photos (`p01.webp`…) and `credits.json`.
- `docs/superpowers/media/superstash-studio/render.mjs` — renders `scene` → frames → MP4 + poster into `assets/`.
- `docs/superpowers/media/superstash-studio/hero.mjs` — serves the real web app with a fake Supabase client and screenshots the library.
- `assets/superstash-*.mp4|webp` — outputs.
- Modify `superstash.html`, `superstash-case-study.html`, `superstash.css`, related tests.

### Task 1: Demo library images

- [ ] List candidates from `https://picsum.photos/v2/list?page=N&limit=100`, view a contact sheet, pick ~18 colour-matched photos (objects, architecture, plants, texture). Download `https://picsum.photos/id/{id}/800/1000` (and some landscape `1000/750`) to `library/pNN.jpg`, convert to WebP with ffmpeg, write `credits.json` `{file, author, url}`.
- [ ] Write `superstash-image-credits.md` from `credits.json` plus the anthurium from the landing page.

### Task 2: Studio shell and time-driven scenes

- [ ] `index.html` with stage, Inter + Averia Serif Libre from the landing's `assets/fonts` (copied), tokens from the landing (dark `rgb(24,24,24)` canvas, glass `rgba(255,255,255,.14)` + blur 24, blue `rgb(51,144,250)`, success `rgba(43,201,64,.8)`), and helpers `ease`, `seg(t, a, b)` (0→1 progress clamped), `lerp`.
- [ ] Scenes in `scenes.js`, each a pure `render(t)` with an end hold and a 0.6 s fade to the start state:
  - `library`: 4-column masonry of library photos and two typographic cards drifting in, staggered.
  - `save`: anthurium card on canvas; cursor glides in; glass "Save" pill appears top-left; click → "Saved"; popup with tags/notes slides in; then card scales down and flies into a small library tile row at the bottom.
  - `notes`: gallery grid with a "New quick note" card; caret blinks; text types "Love how the hero type sits on the image — try for Cretile landing"; card lifts, settles with a "Saved" tick.
  - `ai`: anthurium card; scan line passes down; tag pills (Nature, Photography, Blue, Pink, Anthurium plant, Botanical) pop in with the landing's dot colours.
  - `search`: search field; chips "plant", "blue", "photography" type in one at a time; full grid fades non-matches out step by step until the match remains and scales up.
  - `hoverSave`: close crop of a card; cursor enters; Save pill fades in; click → Saved with tick.
  - `rightClick`: card; cursor; minimal dark menu with two dimmed generic rows (Open image in new tab, Copy image) and a highlighted "Save to Superstash" with the bookmark icon; click → menu closes → Saved toast.
- [ ] Verify each scene by screenshotting t = 0, mid, end and checking them visually.

### Task 3: Renderer

- [ ] `render.mjs <scene>`: launch Chromium, viewport 960×540 DPR 2, open `index.html?scene=X`, await fonts, for each frame at 30 fps call `studio.render(i/30)` and screenshot to a temp folder, then `ffmpeg -framerate 30 -i f%04d.png -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart assets/superstash-motion-X.mp4`; poster = frame at the scene's `posterAt` → `assets/superstash-motion-X.webp`.
- [ ] Render all seven; report sizes.

### Task 4: Hero screenshot from the real app

- [ ] `hero.mjs`: start `webapp/server.mjs`, route `cdn.jsdelivr.net/npm/@supabase/**` to a fake UMD defining `window.supabase.createClient` (auth with a fixed session, chainable query builder resolving `{data, error:null}`, `channel().on().subscribe()`), abort `**/*.supabase.co/**`, serve library photos from the studio folder; rows have `type:'image'`, `storage_state:'stored'`, `owned_url`, `image_w/h`, `ai_tagged_at`, tags, title, source_url. Viewport 1600×900 DPR 2, screenshot → `assets/superstash-library-hero.webp`.

### Task 5: Pages

- [ ] Overview: hero `<img>` → library hero; tabs: library/save/notes/ai/search videos using the same markup/class as the Cretile video toggle; remove `.ss-media-placeholder` blocks and their CSS.
- [ ] Case study: hero → library hero; "A smaller first release" → notes poster; Learning-through-use pair → `hoverSave` and `rightClick` videos with honest captions; AI → ai poster.
- [ ] Update tests referencing removed files; run all tests; screenshot desktop and 390 px; refresh preview site.
