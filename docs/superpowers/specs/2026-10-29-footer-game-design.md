# Footer game: design

Date: 2026-10-29
Branch: `feature/footer-game` (worktree `../portfolio-footer-game`, off `be93a09`)

## Goal

Add a small, playable game to the homepage footer. It sits in an oval, inspired by the illustrated oval on Keen's "Love & Relationships" page. Before anyone touches it, a demo plays inside the oval to give the footer some life. Clicking the oval expands it in place and starts a real round.

The first game is a **penalty shootout**. The oval and its behavior (the *stage*) are reusable: later games plug into the same stage without changing it.

## Architecture

Static site, no build step, no dependencies. Plain JavaScript loaded with `<script>` tags, like `site.js`.

| File | Responsibility |
|---|---|
| `game-stage.js` | Reusable stage: oval, idle/expanded states, expand and collapse animation, close button, Esc, focus handling, pausing off-screen, reduced motion. Knows nothing about any game. |
| `games/penalty-rules.js` | Pure penalty logic: keeper's choice, shot resolution, score text. No DOM, no canvas. |
| `games/penalty.js` | Penalty scene: canvas drawing, animation, input. Uses `PenaltyRules`. Registers with the stage. |
| `styles.css` | A `.game-stage` block: oval shape, expanded size, transitions, reduced-motion rule. |
| `index.html` | One `<div class="game-stage" data-game="penalty">` inside the footer, above `.rule`, plus the three script tags. |

### Stage–game contract

The stage gives each game a container element, not a canvas. That way a future game can use canvas, SVG, the DOM or a library.

```js
GameStage.register('penalty', function (container) {
  return {
    idle()   {},          // start the self-playing demo loop
    play()   {},          // the user expanded the stage: start a real round
    resize(w, h) {},      // the stage changed size (CSS pixels)
    pause()  {},          // the stage went off-screen
    resume() {},          // the stage is back on screen
    stop()   {}           // the stage collapsed; idle() is called next
  };
});
```

The stage owns everything outside `container`: shape, size, state, focus and lifecycle. The game owns everything inside it. Neither reaches into the other.

### Lifecycle

1. The page loads. The stage finds `[data-game]`, creates the container, calls the registered factory, then `resize()` and `idle()`.
2. Click, Enter or Space on the collapsed oval: the stage expands, then calls `resize()` and `play()`.
3. × or Esc: the stage calls `stop()`, collapses, then calls `resize()` and `idle()`.
4. An `IntersectionObserver` calls `pause()` when the stage is fully off-screen and `resume()` when it comes back.
5. A `ResizeObserver` calls `resize()` whenever the stage's size changes, including during the expand transition.

If the game named in `data-game` isn't registered, the stage leaves the element empty and adds nothing interactive.

## Stage behavior

### Collapsed (idle)

- Full content width, `border-radius: 50%`, aspect ratio about 2.4:1 (roughly 1000×420 on desktop).
- The game's idle demo plays inside it, clipped by the oval.
- A pill button centred near the bottom reads **"⚽ Take a penalty"**. The label comes from a `data-label` attribute, so other games can set their own.
- The whole oval has `role="button"`, `tabindex="0"` and an `aria-label` ("Play a penalty shootout"). On hover, the cursor becomes a pointer and the oval scales to 1.01.

### Expanding

- About 450 ms, ease-out. The border radius animates from the oval to 24px, and the aspect ratio changes to 16:9, with the height capped at 80vh.
- The page scrolls smoothly so the stage is centred.
- The idle demo cuts straight into `play()`, with no loading screen.

### Expanded

- A × close button sits top-right. Esc also closes.
- On expand, focus moves into the stage. On collapse, it returns to the oval.
- The stage drops `role="button"` while expanded, so clicks go to the game.
- The page is not blocked: there's no overlay and no scroll lock.

### Phones (below 640px)

- Collapsed: aspect ratio about 1.6:1.
- Expanded: aspect ratio 4:5, full content width.

### Reduced motion (`prefers-reduced-motion: reduce`)

- Idle: the game draws one still frame (keeper set, ball on the spot) and doesn't loop.
- Expanding and collapsing are instant.
- The game itself still animates once the user chooses to play.

## Penalty game

### Scene

The camera is behind the penalty taker, facing the goal. Flat illustration, drawn in canvas code:

- Green grass with alternating mowing stripes and white penalty-box lines.
- A white goal frame with a light net mesh.
- A soft band of crowd or hedge shapes behind the goal (simple shapes, no faces).
- Keeper and striker drawn as flat-colored figures (rounded body, head, arms), animated by moving their parts. The keeper wears one bright accent color.
- Every size is derived from the goal width, so the scene scales to any stage size. The canvas backing store uses `devicePixelRatio`, so it stays sharp on high-DPI screens.

### A round (play mode)

1. A heads-up display above the goal shows 5 shot dots: empty, ✓ for a goal, ✗ for a save or miss.
2. Ready: the keeper bounces on their line. Over the goal area, the cursor is a crosshair.
3. Click or tap (pointer events): the target is locked, `pickDive` chooses the keeper's dive, the striker runs up (about 400 ms), and the ball flies along a slight curve (about 500 ms) while the keeper dives.
4. `resolveShot` decides the result: `goal`, `save` or `miss`.
5. The result shows for about 1 s: **GOAL!** with the net bulging, **Saved** with the keeper holding the ball, or **Miss** with the ball going past the post or over the bar. Then the scene resets.
6. After shot 5, a result card shows `scoreLine(results)` (for example, "4 / 5: Nice finish") and a **Play again** button.

Input is ignored while a shot is in progress.

### Keeper logic (`pickDive`)

- The keeper commits when the user clicks, before seeing where the ball goes. It chooses `left`, `centre` or `right`.
- Base weights: left 0.4, centre 0.2, right 0.4.
- Bias: for every earlier shot this round aimed at a side, that side's weight goes up by 0.1. Weights are then normalised. "Side" means the left or right third of the goal. Shots into the middle third add no bias.
- Takes an injected `rand()` so tests can make it deterministic.

### Shot resolution (`resolveShot`)

Coordinates are normalised to the goal mouth: `x` runs from 0 (left post) to 1 (right post), and `y` from 0 (ground) to 1 (crossbar).

- `x < 0`, `x > 1` or `y > 1` → `miss`. Clicks are accepted in a margin around the goal, up to 15% of the goal width or height, so wide and high shots are possible. Clicks outside that margin are ignored. A `y` below 0 (a click on the grass) is clamped to 0, so it becomes a shot along the ground.
- Otherwise, the keeper's reach is an ellipse centred on the dive position: `left` at x 0.15, `centre` at x 0.5, `right` at x 0.85, all at y 0.4. Its radii are 0.2 horizontally and 0.5 vertically. If the target is inside the ellipse → `save`. Otherwise → `goal`.
- Result: a keeper who guesses right still can't reach a top corner, a keeper who stays in the middle saves low central shots, and shots tight to the posts score but risk missing.

### Aim wobble (`scatter`)

In play mode the ball lands near the click, not exactly on it: each axis is offset by a random amount of up to ±0.06, and `y` is clamped at 0. The keeper's bias uses the aimed spot, and the result uses where the ball lands. With the first reach numbers (reach stopping at y 0.75), any shot near the crossbar always scored. The reach above, together with the wobble, means a correct guess saves high shots a little inside the frame (x 0.1, y 0.85). Only shots tight to a corner beat a correct guess, and aiming there misses about 30% of the time.

### Score text (`scoreLine`)

`"N / 5: <line>"`, where 5 → "Perfect", 4 → "Nice finish", 3 → "Not bad", 2 → "Unlucky", 1 → "The keeper's having a day", and 0 → "Try another corner".

### Idle demo

Same scene. An AI striker picks random targets (about 85% inside the goal, 15% in the margin), and `pickDive` runs with no history. There's a 1.5 s pause between shots, no heads-up display and no result card, and the loop never ends.

### Sound

None.

## Testing

Use `node:test`, following `tests/whatsapp-case-study.test.mjs`.

`tests/penalty-rules.test.mjs` loads `games/penalty-rules.js` with `vm` and reads `PenaltyRules` off the sandbox:

- A top-corner shot (x 0.95, y 0.9) beats a keeper who dived right.
- A low centre shot (x 0.5, y 0.2) is saved by a keeper who stayed in the centre.
- `x < 0`, `x > 1` and `y > 1` are misses, whatever the dive.
- With a seeded `rand`, the dive bias favours the side the shooter used most.
- `scoreLine` returns the right text for 0–5.

`tests/game-stage.test.mjs` checks the markup and CSS:

- `index.html` has `.game-stage[data-game="penalty"]` inside the footer, before `.rule`.
- `index.html` loads `game-stage.js`, `games/penalty-rules.js` and `games/penalty.js`.
- `styles.css` has a `.game-stage` rule and a `prefers-reduced-motion` rule for it.

Manual check with `python -m http.server 5173`:

- The idle demo plays in the oval.
- Click and Enter both expand it.
- A full round of 5 works with mouse and touch.
- × and Esc collapse it and return focus to the oval.
- It pauses when scrolled off-screen.
- The layout holds at 375px wide.
- Reduced motion shows a still frame.

## Out of scope

Sound, saved high scores, games other than penalties, and a menu for choosing between games. The stage contract allows all of these to be added later without rework.
