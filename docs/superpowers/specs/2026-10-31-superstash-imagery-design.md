# Superstash imagery overhaul — design

Date: 2026-10-31. Approved in conversation with Samuel.

## Problem

The Superstash overview and case study rely on one real screenshot repeated four times, three grey "screen recording to add" placeholders, an AI-tags image floating in a mostly empty dark box, a blurry hover-save mock-up, and a right-click recording crowded with other extensions' menu items.

## Direction

Rebuild the imagery as short, silent, looping motion pieces in Superstash's own visual language, plus one staged real screenshot as proof the product exists. Reference for "modern": one focused action at a time on a calm canvas, the saved item settling into the library (Samuel's reference recording of a save interaction).

## Source material

- `Documents/GitHub/stash-extension/webapp/landing/` — the Superstash landing page. Its `motion.js` already contains three scenes: `playSaveStory` (`.save-scene`), `playAiAnalysis` (`.ai-illustration`) and `playSearchStory` (`.search-area`), plus the static `notes-frame.webp`. Reuse the markup, styles, fonts and assets; do not edit the landing page itself.
- `Documents/GitHub/stash-extension/webapp/` — the real app, used once for the hero screenshot with demo data stubbed in the browser (no writes to the real Supabase project, no real login).
- Demo library: about 24 free-licence images (Unsplash licence or public domain), colour-matched, plus the landing page's anthurium photo. Record source and licence for each in `docs/superpowers/media/superstash-image-credits.md`.

## Motion studio

A private HTML page (not published with the portfolio) that loads the landing page's scene code and assets, recomposes each scene to the portfolio's media frame, and is recorded by Playwright at 2× scale. Each scene renders one loop: start state, the action, a held end state, then a fade back to the start so the loop is seamless.

Output per scene: H.264 MP4 (muted, 6–10 s, target under 2 MB) and a WebP poster taken from the end state. Video playback reuses the portfolio's existing single centred play/pause toggle (as on the WhatsApp pages); reduced-motion users see the poster.

## Scenes and placement

| Asset | Scene | Used on |
|---|---|---|
| `superstash-library-hero.webp` | Real app, staged with the demo library (still) | Overview hero; case study hero |
| `superstash-motion-library` | Library grid settles in card by card | Overview tab "Library" |
| `superstash-motion-save` | Landing save scene, extended: after "Saved" the image shrinks and lands in a library tile | Overview tab "Capture" |
| `superstash-motion-notes` | New scene in the same style: "New quick note" card in the gallery, a thought types in, the card settles among saves | Overview tab "Notes"; still frame for case study "A smaller first release" |
| `superstash-motion-ai` | Landing AI scan scene | Overview tab "AI context"; still frame in case study AI section |
| `superstash-motion-search` | Landing search scene, extended so a full grid filters down to the match | Overview tab "Finding" |
| `superstash-motion-hover-save` | Opening beat of the save scene: cursor hovers, Save button appears, becomes Saved | Case study "Learning through use", first image |
| `superstash-motion-right-click` | Designed scene: minimal context menu, two dimmed generic items above a highlighted "Save to Superstash", then Saved | Case study "Learning through use", second image |

Research (5 FigJam images) and the exploration board (12 drafts) keep their content and get a consistent frame and spacing.

## Honesty in captions

- Motion pieces are captioned as illustrations of the flow, not recordings. The right-click caption states it illustrates the right-click save.
- The hero caption identifies it as the working product shown with demo content.
- Existing statements about what is planned versus built stay as they are.

## Out of scope

Copy changes beyond captions and alt text; the landing page; Cretile/WhatsApp pages; the exploration board content.

## Done when

- No placeholders remain on either Superstash page; no image repeats except the hero.
- Every new asset loads on desktop and at 390 px wide with no horizontal scroll.
- Existing tests pass, updated only where they name the old placeholder or image files.
- Preview site refreshed for Samuel's review.

## Revision 2 (same day, after Samuel's review)

The first pass recreated the interface with a photo-only demo library. Samuel wanted the real interface to lead, with his real mix of saves (images, X and LinkedIn posts, web pages, videos), and kept only the AI motion piece.

- Library, quick notes and search are now recorded from the working app, signed in as Samuel, with every write to Supabase blocked during recording (inserts answered locally). Files: `assets/superstash-real-{library,notes,search}.mp4/.webp`; the still `superstash-real-library.webp` is the hero on both pages and on the home and next-project cards.
- Capture is a new motion piece modelled on Samuel's reference: tap an image, "Save to Superstash" appears by the cursor, the image flies into Superstash (`superstash-motion-tap-save`). It also replaces the right-click image in the case study.
- Kept from the first pass: `superstash-motion-ai`, `superstash-motion-hover-save`.
- A note under the overview tabs says which views are recordings and which are illustrations.
