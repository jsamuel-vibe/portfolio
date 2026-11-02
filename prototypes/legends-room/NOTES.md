# Legends room hero (work in progress)

A new hero for the home page. It's a mock-up only and isn't on the live site or the preview site yet.

Open `room-mockup.html` in a browser to see it. After changing any `*-src.html` file, rebuild with `python prototypes/legends-room/build.py`.

## The idea
The hero is one room, filling the whole screen width, with an oxblood red wall:
- The nav sits on the wall: Work and About on the left, `[ Samuel Joseph ]` in the centre, LinkedIn, X and Email on the right.
- In the centre, "Product designer in Bangalore" sits above a gilded frame with Samuel's portrait in it.
- Left of the frame is the short story; on the right are "Open to product design roles" and a Resume button.
- "Samuel Joseph" runs across the wall in large script (Pinyon Script), in front of the frame.
- Below that is the AI-generated painting of design legends at a table, looking at Samuel's laptop. The painting's own cream wall has been removed (`images/legends-cutout.png`). The original is `images/legends-original.png`.

## The conversation (Samuel approved these lines)
The legends talk on their own, one after another, starting about 1.5 s after load and pausing while the painting is off screen. Each line writes itself letter by letter above the speaker's head, like Tom Riddle's diary in Harry Potter, stays briefly, then sinks away. About 2 s later, Samuel's reply writes itself above his head the same way. The speaker gets a soft spotlight and the rest of the painting dims slightly. The lines are small (14px italic, 12px on phones) and show no names.

| Legend | Line | Samuel's reply |
|---|---|---|
| Ray Eames | Damn, this guy's good. Charles, he named his layers. | Finally, someone noticed. |
| Paul Rand | Don't try to be original. Just try to be good. | Working on it, sir. |
| Le Corbusier | Too busy. Paint everything white. | Already did. Look at the background. |
| Leonardo da Vinci | Is this what art has come to? A freaking computer? | Relax Leo, you'd have loved Figma. |
| Charles Eames | Two typefaces. Good. A third and I'm leaving. | Relax, I deleted Comic Sans this morning. |
| William Morris | Needs more leaves. | Sir, this is a product page. |

Who is where in the painting, left to right: Leonardo da Vinci (back left, cap), Paul Rand (front left, bald, round glasses, bow tie), William Morris (curly hair, floral robe), Samuel (centre), Le Corbusier (standing, black glasses), Charles Eames (front right, bow tie), Ray Eames (far right, bun with bow).

Pointing at a person shows their name in a thin oval around their head. Clicking or tapping a legend plays their line next.

## Decisions Samuel made
- The old intro lines ("I work through the complexity…") go. The intro should tell his story plainly.
- Spotlight was chosen over cut-out lift and lean-in.
- No speech bubbles and no names in the lines; the names appear only in the hover ovals.
- The room fills the full screen width, not just the area between the frame lines.

## Still open
- **Portrait:** the frame holds `assets/profile.jpg` as a stand-in. Samuel may generate a painted portrait in the same style as the group.
- **Intro text needs facts from Samuel:** his Twitter/X handle, how long he's been at Cretile and whether he's still there, and whether Superstash was a side project. The current story text is a placeholder until he confirms.
- **Ideas offered, no answer yet:** legends reacting to visitor actions (for example pointing at Resume), putting real Superstash work on the laptop screen, playing all six conversations once and then stopping, and a museum-style label saying the image is AI-generated.
- **Next step:** once Samuel approves the room, build it into the real home page (`index.html`) and show it on the preview site (jsamuel-vibe.github.io/portfolio-preview) before anything goes live.
