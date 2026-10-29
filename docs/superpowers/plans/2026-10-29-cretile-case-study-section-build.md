# Cretile Case Study Section-by-Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Cretile case study into the approved visual, problem-led narrative while pausing after every page section for Samuel's review.

**Architecture:** Keep the existing static HTML/CSS structure and enhance it with focused, page-specific components. Each task owns one narrative chapter, its responsive styles, and its structural regression test. Existing media is reused wherever it proves a product decision; code-native HTML/CSS diagrams explain workflows that screenshots cannot.

**Tech Stack:** Semantic HTML5, CSS, existing vanilla JavaScript, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-28-cretile-case-study-narrative.md`

## Global Constraints

- Implement one task at a time and stop for Samuel's visual review before starting the next task.
- Keep each chapter introduction below roughly 80 visible words.
- Let diagrams, screenshots, and captions replace repeated explanations.
- Use the existing case-study type scale; do not introduce oversized display text throughout the page.
- Use no new framework or runtime dependency.
- Preserve current navigation, footer, home page, and Superstash case study.
- Do not state or imply that Interakt sells customer data.
- Do not claim that Cretile eliminated Meta charges or is proven faster or more effective than Interakt.
- Clearly distinguish starting expectations, current evidence, projections, and future work.
- Obscure customer names, phone numbers, company names, and unrelated message content in product media.
- Do not use multi-agent execution.

## Review Focus

- **Narrative continuity:** A reader who scans only the title, question transitions, headings, and captions can follow the full story; Tasks 1–6 add ordered-section assertions.
- **Small screens:** Diagrams reflow vertically without shrinking text below the existing body size; every task adds or updates a 640px rule where needed.
- **Sensitive information:** No newly exposed customer or company data appears in screenshots or alt text; Task 11 performs the final media audit.
- **Honest evidence:** Expectations, measured evidence, and future direction cannot be mistaken for one another; Tasks 3 and 6 assert their labels.
- **Existing product proof:** Every consequential design decision retains a nearby caption and existing local media path; Tasks 5 and 7 exercise asset and caption checks.

---

## File Structure

- `whatsapp-campaigns.html` — semantic case-study sections, exact visible copy, diagrams, product media, captions, and section IDs.
- `styles.css` — Cretile-specific editorial layout, question transitions, workflow diagrams, media treatment, and responsive rules.
- `tests/whatsapp-case-study.test.mjs` — structural, narrative-order, claim-boundary, media-path, caption, and responsive regression tests.
- `assets/wa-*.{jpg,png,mp4}` — existing evidence reused without modifying original files during the section build.

## Review Protocol

For every task:

1. Run the targeted test and the full suite.
2. Start or reuse the local preview server.
3. Inspect the section at desktop and mobile widths.
4. Give Samuel the local preview URL and a concise list of what changed.
5. Stop. Do not begin the next task until Samuel approves the current section.
6. Commit the approved section before moving forward.

---

### Task 1: Product-led Opening and Summary

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#overview` only)
- Modify: `styles.css` (Cretile opening styles and mobile rules)

**Interfaces:**
- Consumes: existing `.topnav`, `.project-intro`, `.t-display`, `.t-body`, `.meta`, and `assets/wa-hero.jpg`.
- Produces: `.wa-hero-stage`, `.wa-intro-copy`, `.wa-summary`, and `.wa-project-details` for the approved first-screen composition.

- [ ] **Step 1: Write the failing opening test**

Add a test named `opens with product proof, a concise summary, and product-designer ownership` that asserts:

- `assets/wa-hero.jpg` appears inside `#overview` before the `<h1>`;
- the title contains `first module of our internal sales platform`;
- a `Long story short` label exists;
- the summary contains `repeated Excel exports` and `designed and built its first module in two weeks`;
- Role is `Product designer`;
- Scope includes `Product strategy`, `workflow design`, `UX/UI`, `prototyping`, and `development`;
- Status is `Live internal product`;
- `#overview` appears before the first case-study chapter.

Update the existing media-caption assertion so the opening hero is validated by its descriptive alt text rather than requiring a redundant visible caption.

Production regression caught: the page returns to a text-only hero, hides Samuel's product-design ownership, or begins the detailed story before orienting the reader.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="opens with product proof" tests/whatsapp-case-study.test.mjs`

Expected: FAIL because the current hero has no opening product image, summary, scope, or status.

- [ ] **Step 3: Implement the opening markup**

Replace only the contents of `#overview` with:

- the existing full-width product image and privacy-safe alt text;
- kicker `PRODUCT DESIGN · 0→1 INTERNAL PRODUCT · LIVE`;
- approved title and one-line description;
- two-paragraph `Long story short` summary from the spec;
- metadata for Role, Scope, Team, Timeline, and Status.

Do not edit `#scenarios` or later sections in this task.

- [ ] **Step 4: Implement the opening layout**

Add page-specific CSS that:

- expands the opening to the case-study content width;
- presents the product image without heavy shadow or cropped controls;
- places summary copy and project details in an editorial grid on desktop;
- collapses to a single readable column at 640px;
- preserves the existing global type scale and spacing rhythm.

- [ ] **Step 5: Run targeted and full tests**

Run: `node --test --test-name-pattern="opens with product proof" tests/whatsapp-case-study.test.mjs`

Expected: PASS.

Run: `node --test tests/whatsapp-case-study.test.mjs`

Expected: all tests pass, except any intentionally obsolete narrative-order assertion updated within this task to accept the new overview structure.

- [ ] **Step 6: Preview and pause for review**

Inspect `#overview` at desktop and mobile widths. Give Samuel the preview URL and stop for approval.

- [ ] **Step 7: Commit the approved opening**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "design: rebuild Cretile case study opening"
```

---

### Task 2: Why Build This? Problem Chapter

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (replace current `#scenarios` with `#why-build`)
- Modify: `styles.css` (question transition, repeating workflow, problem lenses, operator consequence)

**Interfaces:**
- Consumes: approved opening from Task 1 and current Cretile accent tokens.
- Produces: `.wa-question-transition`, `.wa-repeat-loop`, `.wa-problem-lenses`, and `.wa-operator-consequence`.

- [ ] **Step 1: Write the failing problem-chapter test**

Add a test named `explains why the workflow deserved reconsideration before showing solutions` that asserts:

- `#why-build` follows `#overview`;
- the question asks why Cretile should build instead of reconnecting Interakt;
- the copy explicitly says Interakt was not difficult to use;
- the workflow contains Excel, Export, Upload, Tag, Build audience, and Launch in that order;
- the labels Connection, Context, Continuity, and Control exist;
- the operator consequence states that the system was current only when manually kept current;
- no solution or use-case section appears before the problem chapter ends.

Production regression caught: the story jumps into features before establishing the operational and human problem.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="workflow deserved reconsideration" tests/whatsapp-case-study.test.mjs`

Expected: FAIL because `#why-build` and its workflow diagram do not exist.

- [ ] **Step 3: Implement the problem chapter markup**

Replace the existing `#scenarios` section with the approved trigger, core problem, repeating workflow, four problem lenses, and operator consequence. Use semantic lists for the workflow and problem lenses.

- [ ] **Step 4: Implement the visual explanation**

Style the repeated workflow as a code-native diagram with a visible return path from a newly added lead to the start of the process. Present the four lenses as an editorial grid without grey card containers. Use one restrained operator illustration only if it improves comprehension at both breakpoints.

- [ ] **Step 5: Run targeted and full tests**

Run the targeted test, then `node --test tests/whatsapp-case-study.test.mjs`.

Expected: all tests pass.

- [ ] **Step 6: Preview and pause for review**

Inspect the transition from summary to problem at desktop and mobile widths. Stop for Samuel's approval.

- [ ] **Step 7: Commit the approved problem chapter**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "content: establish Cretile workflow problem"
```

---

### Task 3: Expected Difference and Corrected Business Case

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (replace current `#strategy` with `#expected-change` and `#business-case`)
- Modify: `styles.css` (before/after system diagram and expectation-versus-learning comparison)

**Interfaces:**
- Consumes: problem dimensions from Task 2.
- Produces: `.wa-system-shift`, `.wa-expected-differences`, `.wa-assumption-compare`, and `.wa-product-hypothesis`.

- [ ] **Step 1: Write failing tests for the starting hypothesis and correction**

Add tests named:

- `separates the expected difference from the product evidence`;
- `corrects the cost hypothesis without turning it into a failure story`.

Assert:

- `#expected-change` appears before `#business-case`;
- the disconnected flow and connected `Contacts → Campaigns → Inbox → Results` flow both exist;
- Less repeated work, More control, and A product we could continue building are labelled as expected differences;
- the cost saving is labelled as a starting expectation;
- the correction states that most of the message charge came from Meta;
- the section does not use `wrong assumption`, `product lost its reason`, or a realised-savings claim;
- the refined hypothesis connects contacts, campaigns, replies, and results.

Production regression caught: expectations are presented as outcomes or the honest correction is exaggerated into a forced redemption story.

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `node --test --test-name-pattern="expected difference|cost hypothesis" tests/whatsapp-case-study.test.mjs`

Expected: FAIL because the two chapters do not exist.

- [ ] **Step 3: Implement both strategy chapters**

Use the approved short copy. Build the disconnected-versus-connected system diagram and the compact Expected/Learned comparison with semantic HTML. Keep the product hypothesis visually prominent.

- [ ] **Step 4: Add responsive styles**

Keep both diagrams readable in a vertical mobile flow. Avoid metric cards and oversized failure statements.

- [ ] **Step 5: Run targeted and full tests**

Run targeted tests, then the full case-study suite.

Expected: all tests pass.

- [ ] **Step 6: Preview and pause for review**

Review both chapters together because the correction depends on the expectation. Stop for approval.

- [ ] **Step 7: Commit the approved strategy chapters**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "content: clarify Cretile product hypothesis"
```

---

### Task 4: Actual Design Process

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (add `#design-process` before product decisions)
- Modify: `styles.css` (connected process questions, job map, product loop, deferred capability)

**Interfaces:**
- Consumes: refined hypothesis from Task 3.
- Produces: `.wa-process-questions`, `.wa-job-map`, `.wa-first-loop`, and `.wa-deferred`.

- [ ] **Step 1: Write the failing design-process test**

Add a test named `shows the real design process without a generic framework` that asserts:

- the section covers stakeholder alignment, campaign jobs, competitor-pattern evaluation, and first-release scope;
- it does not publish `Research → Ideate → Design`, Double Diamond, or a formal-user-research claim;
- the tag example preserves website, Google Ads, Meta Ads, and LinkedIn context;
- the two-week release follows objective and direction alignment;
- the selected loop is Contact, Audience, Campaign, Reply, Result;
- Excel synchronisation is clearly deferred.

Production regression caught: the case study replaces Samuel's actual reasoning with portfolio-process theatre or implies research that did not occur.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="real design process" tests/whatsapp-case-study.test.mjs`

Expected: FAIL because `#design-process` does not exist.

- [ ] **Step 3: Implement the design-process section**

Use four question-led subsections and the approved copy budget. Reuse the existing job-map concept only after rewriting it to support this process chapter. Show the complete first-release loop and deferred Excel sync as distinct elements.

- [ ] **Step 4: Add responsive styles**

Ensure the four questions and five-step loop stack in reading order on mobile without dense cards.

- [ ] **Step 5: Run targeted and full tests**

Run the targeted test, then the full suite.

Expected: all tests pass.

- [ ] **Step 6: Preview and pause for review**

Review whether the section communicates product thinking rather than a feature inventory. Stop for approval.

- [ ] **Step 7: Commit the approved design process**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "content: show Cretile design process"
```

---

### Task 5: Use-case Framework and Choose an Audience

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#audience` only)
- Modify: `styles.css` (shared use-case rhythm, audience evidence, responsive layout)

**Interfaces:**
- Consumes: contact-selection media and first-release jobs from Task 4.
- Produces: the shared `.wa-job` pattern and the approved audience-selection use case.

- [ ] **Step 1: Write failing tests for the use-case pattern and audience decision**

Update the audience decision test to assert the section contains:

- a job-to-be-done statement;
- a short operational tension;
- a design response;
- nearby visual evidence and caption;
- only the relevant UX principle.

Add explicit assertions for reusable groups, direct contact selection, selected count, and `Create campaign` as the next action.

Production regression caught: the page becomes a feature list, explains every button, or names UX principles without showing the product consequence.

- [ ] **Step 2: Run the targeted decision tests and verify RED**

Run: `node --test --test-name-pattern="use-case|audience" tests/whatsapp-case-study.test.mjs`

Expected: FAIL because the current audience section does not contain the approved job/context/response structure.

- [ ] **Step 3: Rewrite the audience use case**

Apply the approved job, context, response, evidence, caption, and principles. Use the contact-selection screenshots without exposing private contact data.

- [ ] **Step 4: Establish the shared use-case presentation**

Create the shared typography and spacing pattern that later use cases consume. Remove unnecessary grey wrappers and heavy shadows from the audience evidence.

- [ ] **Step 5: Run targeted and full tests**

Run the targeted audience tests, then the complete suite.

Expected: all tests pass and every local asset resolves.

- [ ] **Step 6: Preview and pause for review**

Present only the audience use case. Apply requested corrections before starting the launch section.

- [ ] **Step 7: Commit the approved use-case chapter**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "design: explain Cretile audience selection"
```

---

### Task 6: Launch with Confidence

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#launch` only)
- Modify: `styles.css` (launch evidence layout and complete Undo presentation)

**Interfaces:**
- Consumes: shared `.wa-job` pattern from Task 5 and existing preview, audience, and Undo media.
- Produces: the approved launch-safety use case.

- [ ] **Step 1: Write a failing launch-use-case test**

Assert the section contains the job, campaign-launch tension, message preview, audience exclusions, opt-out protection, complete Undo state, error prevention, user control, and the carefully worded team consequence.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="launch with confidence" tests/whatsapp-case-study.test.mjs`

Expected: FAIL against the current shorter feature-led section.

- [ ] **Step 3: Rewrite the launch use case**

Apply the approved copy and three-part evidence sequence. Show the complete Undo state without cropped controls.

- [ ] **Step 4: Refine the media treatment**

Remove heavy shadows and grey containers where they reduce legibility. Preserve captions and readable media at both breakpoints.

- [ ] **Step 5: Run targeted and full tests**

Run the launch test, then the complete suite.

- [ ] **Step 6: Preview and pause for review**

Present only the launch use case and stop for approval.

- [ ] **Step 7: Commit the approved launch section**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "design: explain safe campaign launch"
```

---

### Task 7: Manage Replies

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#reply-state` only)
- Modify: `styles.css` (open/closed reply evidence and annotation)

**Interfaces:**
- Consumes: shared `.wa-job` pattern and existing inbox evidence.
- Produces: the approved 24-hour reply-state use case.

- [ ] **Step 1: Write a failing reply-state test**

Assert the section contains the job, 24-hour constraint, open/closed distinction, template action, nearby evidence and caption, and visibility-of-system-status principle.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="manage replies" tests/whatsapp-case-study.test.mjs`

Expected: FAIL against the current feature-led section.

- [ ] **Step 3: Rewrite the reply-state use case**

Use the privacy-safe real inbox screenshot when possible; otherwise retain and clearly label the reconstruction. Annotate only the state, explanation, and next action.

- [ ] **Step 4: Run targeted and full tests**

Run the reply-state test, then the complete suite.

- [ ] **Step 5: Preview and pause for review**

Present only the reply-state use case and stop for approval.

- [ ] **Step 6: Commit the approved reply section**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "design: clarify Cretile reply states"
```

---

### Task 8: Learn and Retry

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#analytics` only)
- Modify: `styles.css` (analytics evidence and annotations)

**Interfaces:**
- Consumes: shared `.wa-job` pattern and `assets/wa-analytics.png`.
- Produces: the approved actionable-results use case.

- [ ] **Step 1: Write a failing campaign-results test**

Assert the section contains the job, distinction between accepted/delivered/read/replied/failed, team communication, retry action, evidence caption, and actionable-feedback principle.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="learn and retry" tests/whatsapp-case-study.test.mjs`

Expected: FAIL against the current shorter section.

- [ ] **Step 3: Rewrite the analytics use case**

Apply the approved copy and annotate only the distinct states, accepted-versus-delivered explanation, and retry action.

- [ ] **Step 4: Run targeted and full tests**

Run the analytics test, then the complete suite.

- [ ] **Step 5: Preview and pause for review**

Present only the analytics use case and stop for approval.

- [ ] **Step 6: Commit the approved analytics section**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "design: make campaign results actionable"
```

---

### Task 9: Automate Predictable Follow-up

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#follow-up` only)
- Modify: `styles.css` (Claude response map and evidence treatment)

**Interfaces:**
- Consumes: shared `.wa-job` pattern and existing response-map component.
- Produces: the approved Claude-assisted follow-up use case.

- [ ] **Step 1: Write a failing automation-use-case test**

Assert the section contains the job, four known choices, manual-monitoring tension, Claude matching, Cretile sending, roughly 40 follow-ups, simplified-reconstruction label, and cognitive-offloading principle.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="predictable follow-up" tests/whatsapp-case-study.test.mjs`

Expected: FAIL against the current shorter section.

- [ ] **Step 3: Rewrite the follow-up use case**

Apply the approved copy and refine the response map so Samuel remains the product decision-maker and Claude appears as one system step.

- [ ] **Step 4: Run targeted and full tests**

Run the automation test, then the complete suite.

- [ ] **Step 5: Preview and pause for review**

Present only the automation use case and stop for approval.

- [ ] **Step 6: Commit the approved automation section**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "design: show Cretile follow-up automation"
```

---

### Task 10: Product Today, Next Version, and Reflection

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (`#product`, `#direction`, `#takeaway`)
- Modify: `styles.css` (evidence strip, current/future comparison, larger-direction flow)

**Interfaces:**
- Consumes: approved use cases from Tasks 5–9.
- Produces: current-state evidence, explicitly future Excel sync, proposed larger sales flow, and reflection.

- [ ] **Step 1: Write failing tests for evidence boundaries**

Assert:

- the live product names Samuel as campaign operator and one salesperson as inbox user;
- the page says the basic workflow is not yet proven faster or more effective than Interakt;
- Two weeks and roughly 40 follow-ups are the only headline evidence values;
- Excel synchronisation is labelled `Next` or `not yet built`;
- the larger website-enquiry-to-qualification flow is labelled proposed;
- the reflection says the cost assumption should have been verified earlier and ownership must enable different behaviour.

Production regression caught: future work or projected value is mistaken for shipped impact.

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `node --test --test-name-pattern="product today|next version|evidence boundaries|reflection" tests/whatsapp-case-study.test.mjs`

Expected: FAIL because current, next, and reflection copy do not match the approved narrative.

- [ ] **Step 3: Implement the closing chapters**

Use the approved current-state copy, two-item evidence strip, current-versus-next Excel diagram, proposed larger workflow, and three-paragraph reflection. Avoid a large metrics wall.

- [ ] **Step 4: Add responsive styles**

Keep evidence compact and make both future-state flows stack vertically on mobile.

- [ ] **Step 5: Run targeted and full tests**

Run the targeted tests, then the full suite.

Expected: all tests pass.

- [ ] **Step 6: Preview and pause for review**

Review the boundary between shipped product and future vision. Stop for approval.

- [ ] **Step 7: Commit the approved closing chapters**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs
git commit -m "content: close Cretile case study honestly"
```

---

### Task 11: Full-page Polish, Privacy, and Regression Verification

**Files:**
- Modify: `tests/whatsapp-case-study.test.mjs`
- Modify: `whatsapp-campaigns.html` (only cross-section fixes)
- Modify: `styles.css` (only cross-section rhythm and responsive fixes)
- Modify: `assets/wa-*` only if privacy-safe replacements are required and Samuel has supplied or approved them.

**Interfaces:**
- Consumes: all approved sections.
- Produces: publication-ready Cretile case study without changing other portfolio pages.

- [ ] **Step 1: Add final regression assertions**

Assert the complete section order, local asset existence, captions, responsive breakpoints, reduced motion, absence of unsupported claims, and a reasonable visible-copy budget. Replace obsolete assertions rather than preserving tests for the discarded narrative.

- [ ] **Step 2: Run the full suite before polish**

Run: `node --test tests/whatsapp-case-study.test.mjs`

Expected: PASS before purely visual refinements.

- [ ] **Step 3: Audit desktop and mobile presentation**

Check narrative rhythm, question transitions, line length, image legibility, diagram reflow, focus visibility, and reduced-motion behaviour. Make only cross-section consistency fixes.

- [ ] **Step 4: Audit privacy and claims**

Inspect every media asset and alt text. Confirm no customer name, phone number, company name, internal campaign name, unsupported Interakt claim, realised-savings claim, or shipped-future claim remains.

- [ ] **Step 5: Run all repository tests**

Run: `node --test`

Expected: all tests pass with no errors or warnings.

- [ ] **Step 6: Perform final visual review**

Review the complete page at desktop and mobile widths, then present it to Samuel for final approval.

- [ ] **Step 7: Commit the publication-ready case study**

```bash
git add whatsapp-campaigns.html styles.css tests/whatsapp-case-study.test.mjs assets
git commit -m "design: finish Cretile case study narrative"
```
