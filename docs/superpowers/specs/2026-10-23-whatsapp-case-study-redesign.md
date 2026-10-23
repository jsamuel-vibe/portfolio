# WhatsApp Case Study Redesign

**Date:** 2026-10-23  
**Status:** Approved direction; awaiting spec review  
**Scope:** `whatsapp-campaigns.html`, supporting styles and behaviour, and new code-native visual assets

## Objective

Rebuild the WhatsApp case study so it positions Samuel as a 0→1 product designer rather than primarily as a solo builder. The finished page must feel candid, strategic, visually engaging, and credible. It must show how Samuel responds when an initial assumption fails, how he reframes a product opportunity, and how he turns that thinking into a working product.

The page will temporarily contain three complete, final-quality visual treatments behind a `1 · 2 · 3` comparison switcher. Samuel will use the switcher locally to choose one direction. The switcher and rejected treatments will be removed before publication.

## Core Positioning

The case study should leave a hiring manager with this impression:

> Samuel can enter an ambiguous 0→1 problem, recognize when an assumption is wrong, reframe the opportunity, make careful product decisions, ship a real system, and align a longer-term product direction with stakeholders.

The case study must not rely on inflated metrics, invented research, or generic UX-process theatre.

## Source of Truth

### Facts that can be stated

- Cretile lost access to its previous Meta account and had to create a new account and register a new number.
- Cretile had been using Interakt for WhatsApp campaigns.
- Campaign lead data traditionally lived in Excel exports.
- Samuel created and ran the campaigns.
- The team initially believed building internally would avoid an approximately ₹3,500 per-campaign charge for roughly 4,000 leads.
- After development began, Samuel verified with Claude that the per-message charge came from Meta rather than Interakt.
- The failed cost assumption weakened the original justification for the product.
- The team continued because the WhatsApp module could become the first part of a broader internal Cretile sales platform.
- Samuel formed the larger product direction by examining how Cretile worked, collaborating with the salesperson and founders, using Claude to explore the system, proposing a vision, and aligning the stakeholders around it.
- The live product can add and tag contacts, create campaigns, preview messages, protect opted-out contacts, undo a send, manage an inbox, show the 24-hour reply window, warm up the number, send and receive messages, and track campaign analytics.
- Samuel uses the product to create and run campaigns.
- One salesperson uses the product to reply to incoming messages.
- The basic campaign workflow is not currently meaningfully better than the previous Interakt workflow.
- Cretile owns the product and Samuel connected it to Claude.
- In one campaign, recipients selected from four support options. Claude monitored the responses and sent the appropriate option-specific follow-up without Samuel remaining online and opening every conversation.
- Approximately 40 people received those automated follow-ups.
- The broader lead-to-qualified-opportunity system is a future direction, not a shipped outcome.

### Claims that must not appear

- Unverified claims that Interakt or comparable providers sell customer data.
- Describing WhatsApp template pricing as a loophole.
- Claims that the product eliminated Meta messaging charges.
- `₹0/month` unless the complete operating cost is later verified.
- `4,000+ contacts reached`, `5–10 campaigns`, or `8%+ reply rate` as measured results.
- Claims that the current workflow is faster, easier, or more effective than Interakt without evidence.
- Claims of user research for the first version. Samuel was the campaign operator and designed from direct domain experience.
- Claims that the broader Cretile sales platform has already been built.
- A before-and-after claim about simplifying contact import. The previous flow cannot be reliably reconstructed.

## Narrative Principle

The story follows evolving thought rather than a clean, linear design process:

1. Samuel believed the product would save campaign costs.
2. The belief was disproved after development began.
3. The product temporarily lost its reason to exist.
4. Samuel asked what ownership could enable that a third-party tool could not.
5. He reframed WhatsApp as the first working module of a larger internal sales system.
6. He shipped a functioning campaign and inbox product.
7. The first differentiated value emerged through company-specific Claude automation.
8. The work now has a clear boundary between the live product and the future product direction.

The failed assumption is the central turning point. It is not hidden in a retrospective section.

## Voice and Writing Style

The copy should be candid but measured.

- Lead with direct statements and specific tensions.
- Preserve Samuel's tendency to think through contradictions.
- Use short sentences at turning points.
- Admit mistakes without self-sabotage; every admission should lead to a decision, action, or changed belief.
- Prefer plain language to portfolio jargon.
- Avoid generic terms such as `leveraged`, `enhanced`, `seamless`, and `user-centric`.
- Avoid presenting a textbook design process that did not occur.
- Use first person when Samuel made the decision and `we` only for genuine team decisions.
- Make the business perspective visible without reducing UX to revenue alone.
- Keep paragraphs short enough to support a visual, recruiter-friendly reading rhythm.

Representative tone:

> I started building the tool to save money. Halfway through, I learned that the reason I started was wrong.

> Meta was charging for the messages, not Interakt. Building our own tool would not remove the campaign cost. Suddenly, the product had lost its original reason to exist.

> That forced a better question: if this was not meaningfully cheaper, why should Cretile own it?

These lines establish tone; final copy may refine the wording without changing the meaning.

## Shared Information Architecture

All three treatments use the same factual story and section order. Differences are visual and compositional, not factual.

### 1. Outcome-led hero

Working title:

> The reason I started building disappeared before I finished.

Supporting copy introduces the initial cost idea, failed assumption, and reframing toward an internal sales platform.

Metadata:

- Company: Cretile
- Role: Product designer and builder
- Responsibilities: Product strategy, workflow design, interaction design, prototyping, and development
- Timeline: Two weeks for the first version
- Users: Campaign operator and salesperson
- Status: Live internal product

### 2. Long story short

Three scannable beats:

1. **Forced reset:** Cretile lost its Meta account and needed a new campaign setup.
2. **Wrong assumption:** The expected campaign savings came from a misunderstanding of Meta's charges.
3. **New direction:** WhatsApp became the first module of an owned, extensible sales platform.

### 3. The situation

Explain the lost account, new number, recurring Interakt relationship, infrequent campaigns, Excel-based lead handling, and Samuel's role as the campaign operator.

The section should provide context without portraying Interakt as difficult to use.

### 4. The assumption that failed

Give the turning point visual priority. Explain what Samuel believed, how he discovered the error, and why it undermined the initial business case.

### 5. Deciding whether to continue

Explain the reframing:

- Recreating a third-party tool was not valuable by itself.
- Ownership could matter if the system adapted to Cretile's particular workflows.
- WhatsApp could provide the foundation for a broader lead and sales system.

### 6. What shipped in two weeks

Show the live product as a connected system rather than a long feature list:

- Contacts and tags
- Campaign creation and message preview
- Audience protection and undo
- Safe number warm-up
- Inbox and 24-hour reply awareness
- Campaign analytics

Make clear that Samuel designed from direct experience as the campaign operator. Do not imply formal research for this version.

### 7. Selected design decisions

Focus on a small number of decisions that demonstrate judgment:

1. **Tags are required during import.** Contacts are structured before an audience is created. Do not call this a simplification of the previous flow.
2. **Opted-out contacts remain locked.** The product prevents an operator from reversing a customer's request by mistake.
3. **Sending includes an undo window.** The product allows the operator to catch the wrong audience or message before it leaves.
4. **The inbox exposes the 24-hour reply rule.** The salesperson can see whether a free-form reply is still allowed.
5. **Number warm-up is automatic.** The system reduces operational monitoring while respecting sending constraints.

The page may feature three decisions prominently and make the remaining decisions available in a secondary reveal if the layout benefits from it.

Each featured decision follows:

> Operational risk → design decision → how the interface behaves → limitation or consequence

### 8. Where ownership became useful

Present the option-based campaign as the first concrete example of differentiated value:

- Four response options were offered.
- Claude monitored the replies.
- It sent the appropriate follow-up for the selected option.
- Samuel did not have to remain online and open each conversation.
- Approximately 40 responses were handled.

Do not invent time-saved estimates or imply complex AI safety mechanisms that were not implemented.

### 9. What is true today

State the current reality plainly:

- Samuel runs campaigns.
- One salesperson replies through the inbox.
- The product is live.
- The basic workflow is not yet clearly better than Interakt.
- The most promising advantage is the ability to create Cretile-specific automations because Cretile owns the system.

### 10. The larger direction

Clearly label the following as proposed future direction:

> Website enquiry → lead record → brochure delivery → WhatsApp conversation → salesperson ownership → qualification and follow-up

Explain that Samuel shaped and aligned this direction with the salesperson and founders. Do not imply the complete flow is live.

### 11. Reflection

Close with three specific ideas:

- Verify the business model before building.
- Owning a product is not an advantage unless ownership enables meaningfully different behaviour.
- AI's first meaningful contribution was as part of the product workflow, not only as a tool used to build it.

## Visual System Shared Across Treatments

All treatments should feel like members of the existing portfolio while raising the level of art direction.

### Visual roles

- **Editorial typography:** carries the main narrative and turning-point statements.
- **Vector diagrams:** simplify sequences, systems, comparisons, and future-state flows.
- **Characters:** communicate human moments, uncertainty, and changes in thought.
- **Real product media:** proves what exists and demonstrates interaction decisions.
- **Annotations:** point to specific interface behaviour without forcing readers to infer it.

### Asset principles

- Reuse the current product screenshots and clips where they directly support the story.
- Create illustrations and diagrams as code-native SVG or HTML/CSS assets so they remain crisp, accessible, responsive, and editable.
- Use characters selectively; they should support the story rather than turn the case study into a cartoon.
- Do not use generic stock illustration packs.
- Use captions that explain why an image matters rather than only describing what it contains.

### Accessibility

- Decorative SVGs use `aria-hidden="true"`.
- Explanatory diagrams receive accessible labels or nearby text equivalents.
- All videos retain useful poster images, muted inline playback, and readable captions.
- Respect `prefers-reduced-motion`; no narrative meaning may depend on autoplay or motion.
- Maintain readable contrast and keyboard-accessible controls.

## Treatment 1: Editorial and Diagram-led

Purpose: communicate maturity, strategy, and clarity.

- Strong typographic hierarchy and generous whitespace.
- Large editorial statements mark the failed assumption and reframing.
- Timelines and system diagrams explain sequence and scope.
- Characters appear only as small cameos, if at all.
- Real product media occupies large, high-confidence frames.
- Best suited to conservative product teams and fast recruiter scanning.

Risk: it may feel too restrained and fail to express Samuel's playful curiosity.

## Treatment 2: Character-led Story

Purpose: communicate humanity, evolving thought, and memorability.

- A simple custom Samuel character appears at the major story beats.
- Speech and thought bubbles carry short internal questions, not long exposition.
- The failed assumption is presented as a compact sequence of illustrated panels.
- Claude may appear as a simple system character where it reveals or performs something, but must not become a mascot that takes ownership away from Samuel.
- Product screens interrupt the illustrated narrative to prove the work is real.
- Avoid childish proportions, exaggerated emojis, and continuous comic styling.

Risk: excessive character use could reduce perceived maturity or compete with the product.

## Treatment 3: Hybrid Story System

Purpose: balance strategy, personality, explanation, and proof. This is the recommended default.

- Editorial typography forms the base.
- Characters appear at three or four turning points.
- Vectors explain the account reset, reframing, system architecture, and future sales journey.
- Real product screenshots and clips anchor every major product claim.
- Short metric-style cards may show verified facts such as two current roles or approximately 40 automated follow-ups; they must not imitate unverified business metrics.
- Visual rhythm alternates between story, explanation, and proof.

Risk: without disciplined spacing and repetition, the mixture could feel inconsistent. Shared colors, type, stroke weights, radius, and caption treatment must unify it.

## Temporary Comparison Mode

### Behaviour

- Add a fixed or sticky `1 · 2 · 3` switcher near the top of the WhatsApp case-study page.
- Label the control accessibly as `Case study presentation`.
- Buttons expose `aria-pressed` or tab semantics and work by keyboard.
- Version 3, the hybrid treatment, is the default.
- Selecting a version updates the visible treatment without a full navigation away from the case study.
- Reflect the selected treatment in the URL query string, such as `?view=1`, so a specific treatment can be refreshed and shared locally.
- The switcher is explicitly marked `Temporary comparison` so it cannot be mistaken for part of the final portfolio concept.
- Existing navigation and footer remain available in every treatment.

### Removal

Once Samuel selects a direction:

- Remove the comparison switcher.
- Remove or archive the rejected DOM and styles outside the production page.
- Keep only the selected treatment in the published case study.
- Update metadata to match the final headline and description.

## Responsive Behaviour

- Desktop can use split editorial compositions, side-by-side diagrams, and wide product media.
- Tablet collapses complex multi-column compositions while retaining sequence.
- Mobile uses a single narrative column.
- Comic sequences become horizontal scroll-snap panels or stacked panels, depending on readability.
- Vector diagrams reflow vertically rather than shrinking text below a readable size.
- The temporary switcher remains reachable without obscuring the case-study navigation.

## Files Expected to Change

- `whatsapp-campaigns.html`: new case-study structure and temporary comparison treatments.
- `styles.css`: shared case-study art direction, three treatment layers, responsive behaviour, and accessibility states.
- `site.js`: temporary switcher behaviour and query-string synchronization.
- `assets/`: only if a code-native SVG is clearer as a standalone file; inline SVG is preferred for treatment-specific illustrations.
- `.gitignore`: add `.superpowers/` so visual-companion working files are not committed.

The homepage and Superstash case study are outside this implementation scope.

## Verification

Before presenting the implementation as complete:

1. Confirm each `1 · 2 · 3` control shows a complete, polished treatment.
2. Confirm `?view=1`, `?view=2`, and `?view=3` load the intended treatment.
3. Confirm the default is treatment 3.
4. Confirm every factual and numerical claim matches the approved source-of-truth section.
5. Confirm no prohibited claim appears in visible copy, metadata, captions, or alt text.
6. Confirm product media loads and video controls behave as intended.
7. Test keyboard access and visible focus for the switcher and interactive media.
8. Test desktop, tablet, and mobile layouts.
9. Test reduced-motion behaviour.
10. Confirm links back to all projects, the next project, email, LinkedIn, and résumé remain correct.
11. Confirm the home page and Superstash page are unchanged.

## Completion Criteria

The work is ready for Samuel's comparison when:

- Each treatment looks intentional enough to publish on its own.
- The story clearly positions Samuel as a 0→1 product designer.
- The failed assumption creates narrative tension without making Samuel appear careless.
- Strategy, design decisions, shipped product, current limitations, and future vision are clearly separated.
- Characters and diagrams improve comprehension rather than decorate the page.
- No part of the story depends on invented evidence.
- Samuel can compare all three treatments through the temporary switcher and choose one for publication.
