# Cretile Case Study Narrative and Page Design

**Date:** 2026-10-28

**Status:** Ready for Samuel's review

**Supersedes:** The narrative and page order in `2026-10-23-whatsapp-case-study-redesign.md`

**Scope:** Final case-study copy, narrative order, and visual direction. No page implementation is included in this document.

## Purpose

The case study should show Samuel as a product designer who can recognize a business opportunity, understand an operational workflow, decide what deserves to be built, and turn that direction into a working first release.

The story should not depend on a dramatic mistake, a long feature list, or inflated impact. Its strength is the progression of Samuel's thinking:

1. A forced account reset created a decision point.
2. The campaign workflow depended on repeated spreadsheet work and disconnected tools.
3. The team believed an owned product could reduce that repetition, improve control, and become a foundation for future sales workflows.
4. One part of the original business case—the expected message-cost saving—proved weaker than expected.
5. Samuel refined the reason to continue, scoped the first complete workflow, and shipped it in two weeks.
6. The first differentiated value appeared through Cretile-specific audience handling, safeguards, analytics, and Claude-powered follow-up.

## Reading Experience

The page should feel editorial and visual. Each section has one job, and question-led transitions move the reader through the story.

- The opening tells the reader what the product is.
- The problem chapter proves why it was worth reconsidering the existing workflow.
- The starting hypothesis explains what the team thought ownership could change.
- The correction separates the initial assumption from what remained valuable.
- The design process shows Samuel's actual reasoning rather than a generic UX framework.
- The use cases demonstrate selected product decisions with real interface evidence.
- The close states what is live, what remains unproven, and what comes next.

The page must remain understandable when skimmed by reading only its questions, headings, captions, and highlighted statements.

---

## 1. Project Opening

### Visual

Open with one large, clean product composition before any long explanation. The image should make it immediately clear that Cretile contains contacts, campaigns, an inbox, and campaign results.

Preferred composition:

- Campaign workspace as the main screen.
- Smaller glimpses of Contacts and Inbox may sit behind or beside it.
- Preserve the real interface rather than redesigning it for the portfolio.
- Remove or obscure customer names, phone numbers, company information, and internal campaign names.
- Do not crop important controls or place a heavy shadow around the screenshot.
- Use a restrained green-tinted or neutral background so the product remains the focus.

### Kicker

`PRODUCT DESIGN · 0→1 INTERNAL PRODUCT · LIVE`

### Title

> Cretile: the first module of our internal sales platform

### One-line description

> A connected way to choose an audience, launch WhatsApp campaigns, manage replies and understand what happened.

### Long story short

> When we lost access to our Meta account, we had to start again with a new WhatsApp number. Instead of reconnecting the same tools, we used the moment to rethink a campaign workflow built around repeated Excel exports, uploads and scattered information.
>
> I worked with the founders and sales team to define the larger product, then designed and built its first module in two weeks: one place to manage contacts, run campaigns, handle replies and understand the results.

### Project details

| Label | Content |
| --- | --- |
| Role | Product designer |
| Scope | Product strategy, workflow design, UX/UI, prototyping and development |
| Team | Founders and sales |
| Timeline | Two weeks for the first release |
| Status | Live internal product |

### Purpose of this section

This is orientation, not the full story. It should tell a hiring manager what Samuel made and what he owned without forcing them to understand the business case yet.

---

## 2. Why Start This Project?

### Question transition

> Why build our own tool instead of reconnecting Interakt?

### Trigger

#### Starting again created a decision point.

> After repeated attempts to recover our previous Meta account failed, we registered a new number. Reconnecting Interakt was the obvious path, but starting again gave us a reason to examine the workflow we were about to recreate.

### Core problem

#### Every campaign began by rebuilding the audience.

> Our lead database lived in Excel and changed whenever new leads arrived. Interakt only knew about the contacts included in the last upload.
>
> Before every campaign, I had to export the latest file, upload it again, organise the contacts and rebuild the audience. With leads arriving from our website, Google Ads, Meta Ads and LinkedIn, this was not an occasional inconvenience. It had become the workflow.

Use this clarifying statement prominently:

> Interakt was not difficult to use. The problem was that our lead data and campaign audience never stayed connected.

### Primary visual: the repeating campaign loop

Show the process as a horizontal or circular diagram:

`Excel changes → Export → Upload → Tag → Build audience → Launch`

A new lead entering Excel should visually return the operator to the beginning.

Annotation:

> The campaign audience stopped being current the moment the spreadsheet changed.

### Supporting problem lenses

Under the workflow visual, break the larger problem into four short dimensions.

#### Connection

The live lead database and the uploaded campaign audience did not stay in sync.

#### Context

Lead sources lived in different lists, so acquisition context had to be deliberately preserved when contacts moved into a campaign tool.

#### Continuity

Selecting an audience, sending the campaign, handling replies and understanding results felt like separate tasks rather than one workflow.

#### Control

The team could only add company-specific workflows and automation within the boundaries of a third-party product.

### Human consequence

#### The system was only current when I manually kept it current.

> Every campaign depended on me remembering the latest file, rebuilding the audience, checking the send and being available when replies arrived.

Visual option: a simple Samuel character carrying an updated spreadsheet between disconnected contact, campaign and inbox systems. The illustration should clarify dependency, not decorate the page.

---

## 3. What We Expected to Change

### Question transition

> What did we believe building our own could change?

### Direction

> We were not trying to recreate every feature in Interakt. We believed owning the workflow could connect work that was currently spread across spreadsheets, campaign tools and individual conversations.

### Transformation visual

Show the existing arrangement first:

`Excel files → repeated uploads → campaign tool → WhatsApp replies → separate results`

Label the manual dependency:

> Connected by the person running the campaign

Then show the intended product:

`Contacts → Campaigns → Inbox → Results`

Wrap the second flow within one Cretile boundary and leave an extension point for future automation.

### Expected differences

#### Less repeated work

The latest contacts, their source and their campaign history could remain available without rebuilding the audience for every campaign.

#### More control

Cretile could own its customer data, campaign workflow and future automations instead of shaping its process around another product.

#### A product we could continue building

WhatsApp campaigns would be the first complete module, not the final product. The same foundation could later support synced lead sources, sales workflows and Claude-powered automation.

### Starting cost hypothesis

> We also expected to reduce campaign costs by removing Interakt's monthly fee and message markup.

This must be presented as an expectation at the beginning of the project, not as a measured result.

---

## 4. Correcting the Business Case

### Question transition

> Was the financial advantage as large as we expected?

### Heading

#### Most of the message cost would remain.

> We began with the belief that Interakt was responsible for most of the per-message fee. After development started, I used Claude to verify the pricing and learned that most of the charge came from Meta.
>
> The monthly platform fee and a small markup could still be avoided, but the headline cost advantage was much smaller than we expected.

### Expectation-versus-reality visual

Use a compact two-column comparison rather than a dramatic failure statement.

| Expected | Learned |
| --- | --- |
| Owning the tool would remove most campaign costs. | Meta's delivery charge applies whether the campaign runs through Interakt or Cretile. |
| Cost would be the main reason to build. | Workflow ownership and extensibility had to justify the product. |

### Decision

> That changed the test for the project. If ownership could not remove the messaging cost, it had to earn its place by reducing repeated work, connecting the sales workflow and supporting Cretile-specific automation.

### Refined product hypothesis

> If contacts, campaigns, replies and results live in one connected workflow, Cretile can reduce repeated campaign work today and build more of its sales process on the same foundation later.

This is the bridge into the design process. The story should not suggest that the product temporarily became worthless or that Samuel continued only because development had already begun.

---

## 5. Design Process

### Question transition

> How did I turn the direction into a first release?

### Introductory copy

> I did not begin with a list of screens. I began by understanding what the product needed to support, how the current work happened and which complete workflow we could realistically ship first.

The process should be shown as four connected questions, not as a generic `Research → Ideate → Design` diagram.

### 5.1 What did the product need to become?

> I spoke with the founders and salesperson about how sales currently worked, what they wanted the product to become and what would make it useful to the team. I proposed a connected internal sales platform, and we aligned on WhatsApp campaigns as its first working module.

Do not describe this as formal user research. It was stakeholder alignment, workflow understanding and product-direction work.

### 5.2 What jobs did the first module need to support?

> Because I was already the person creating campaigns, I mapped the moments surrounding the send—not only the send itself.

Show five concise jobs:

1. **Choose the right audience** — reuse a meaningful group or select people for a one-off campaign.
2. **Launch with confidence** — verify the message, audience and exclusions before sending.
3. **Manage replies** — show sales what can be answered and when a template is required.
4. **Learn and retry** — understand delivery outcomes and act on failures.
5. **Automate predictable follow-up** — respond to known choices without requiring Samuel to remain online.

### 5.3 Which existing patterns were worth keeping?

> I studied how Interakt and comparable products handled contact imports, tags, audience selection, templates, campaign results and inbox rules. I was less interested in copying their screens than understanding why each step existed, which situations it supported and where it created avoidable confusion.

Use tags as the concrete example:

> Tags were not only labels. They could preserve where a lead came from—such as the website, Google Ads, Meta Ads or LinkedIn—and turn that context into a reusable campaign audience. The design needed to keep that value while also supporting one-off selections that did not deserve a permanent tag.

### 5.4 What could form a complete first release?

> Once the objective and product direction were aligned, I proposed a two-week first release and the team agreed. The time constraint helped me prioritise a complete operating loop over a wider collection of features.

Show the selected loop:

`Contact → Audience → Campaign → Reply → Result`

Show the main deferred capability separately:

> Live Excel synchronisation was deliberately left for the next version. The first release could accept imported contacts, but an updated spreadsheet would still need to be uploaded again.

### Process outcome

> The result was a small but complete product boundary: one person could create and evaluate campaigns, while a salesperson could continue the conversations they generated.

---

## 6. Selected Product Decisions

This chapter should not describe every button. It should show a small set of consequential moments across the complete workflow. Each use case follows the same reading pattern:

`Job to be done → operational tension → design response → product evidence → principle or consequence`

### Use case 01: Choose an audience

#### Job to be done

> When I need to run a campaign, help me reach the right people without creating permanent structure for a temporary group.

#### Context

> In Interakt, a one-off group still required me to upload the contacts, add a custom tag and select that tag when creating the campaign. Tags were valuable for reusable audiences, but they became unnecessary setup when I only wanted to hand-pick a few contacts once.

#### Design response

> I kept filters and tags for reusable audiences, then added direct selection for exceptions. The operator can select specific contacts and create a campaign from that selection without inventing a tag that has no future value.

#### Visual evidence

Use the contact-selection screenshots to show:

- individual selection;
- `Select all` for a filtered result;
- a visible selected count;
- `Create campaign` as the next action.

Caption:

> Reusable audiences keep their structure. One-off audiences can remain one-off.

Principles: flexibility and efficiency of use; direct manipulation.

### Use case 02: Launch with confidence

#### Job to be done

> Before I send a campaign to thousands of contacts, help me verify the message and audience—and give me a way back if I notice a mistake.

#### Context

> Launching a campaign made me nervous because the audience was large and the action was difficult to reverse. A confirmation dialog alone would still ask me to trust that I had configured everything correctly.

#### Design response

> The launch flow makes the final message visible, explains who will and will not receive it, protects opted-out contacts and keeps the send briefly reversible.

Use three pieces of evidence without shadows or cropped controls:

1. Template selection with the final WhatsApp preview.
2. Audience review with exclusions and reasons.
3. A complete undo state showing both the countdown and the action.

Captions:

> **Check the message.** See what the recipient will receive.

> **Check the audience.** See who is excluded and why.

> **Keep a way back.** Undo makes the final action briefly reversible.

Principles: error prevention; user control and freedom.

Observed consequence, stated carefully:

> Having a way to back out made campaign launches feel less tense for the team.

### Use case 03: Manage replies

#### Job to be done

> When sales opens a conversation, make it immediately clear whether a free-form reply is still allowed.

#### Context

> WhatsApp allows free-form replies only within the 24-hour customer-service window. An open and closed conversation cannot look identical because the available action has changed.

#### Design response

> The inbox exposes the reply-window status beside the conversation. When the window closes, the composer is replaced with an explanation and the approved-template action.

Use the real inbox screenshot, privacy-redacted, and annotate:

- the closed status;
- the explanation;
- the template action.

Caption:

> The interface changes before the salesperson attempts an unavailable action.

Principle: visibility of system status.

### Use case 04: Learn and retry

#### Job to be done

> After a campaign ends, show me what happened and what needs action next.

#### Context

> A single sent count cannot explain whether WhatsApp accepted a message, whether it reached a phone, whether it was read or whether the person replied.

#### Design response

> The report keeps accepted, delivered, read, replied and failed states separate. I can tell the team who was contacted, inspect who did not receive the message and retry the failed group without rebuilding the campaign.

Use the campaign analytics screenshot with annotations around:

- distinct delivery states;
- the explanation of accepted versus delivered;
- resend to failed contacts.

Caption:

> Campaign results lead to the next action instead of ending at a dashboard.

Principle: actionable feedback.

### Use case 05: Automate predictable follow-up

#### Job to be done

> When a lead chooses one of several known options, send the relevant next step without requiring me to monitor every reply.

#### Context

> One campaign asked people to choose from four ways Cretile could help. Each option required a different follow-up. Handling it manually meant staying available and opening every conversation as replies arrived.

#### Design response

> Because Cretile owns the workflow, I connected the product to Claude. Claude monitored the selected option and sent the matching follow-up while I was away.

Show a simple response map:

`Lead selects an option → Claude matches the response → Cretile sends the follow-up`

Evidence:

> Roughly 40 people received the relevant follow-up through this workflow.

Caption:

> This was the first moment ownership enabled behaviour tailored to how Cretile works.

Principle: cognitive offloading.

---

## 7. What Exists Today

### Question transition

> What did the first release make possible?

### Heading

#### One place to launch campaigns and continue the conversations they create.

> The live release connects contacts, campaign creation, audience safeguards, message previews, the inbox and campaign results. I use it to create and run campaigns, while one salesperson uses it to reply.

> The basic campaign workflow is not yet proven to be faster or more effective than Interakt. Its clearest advantage is that Cretile owns the system and can create workflows and automations around the way the team actually operates.

### Product visual

Use one large, uncropped live-product screen with a short caption:

> Cretile's first live sales-platform module.

### Evidence strip

Avoid a large metric wall. If numerical evidence is shown, limit it to two verified facts:

- **Two weeks** — aligned objective to working first release.
- **~40 follow-ups** — handled through the first Claude-assisted campaign workflow.

Projected cost savings should not appear as a headline outcome. If included at all, place them in a small business-case note with the assumptions and with Meta charges explicitly excluded.

---

## 8. Next Version

### Question transition

> Where does the workflow still break?

### Heading

#### The contact list still has to be uploaded again when Excel changes.

> The first release connects the work after contacts enter Cretile, but it does not yet keep the Excel source synchronised. The next version should connect the source directly so newly added contacts appear without another export and upload.

### Near-term visual

Show the current and intended state:

`Today: Excel update → export → upload → Cretile`

`Next: Excel update → synchronised with Cretile`

### Larger direction

Clearly label this as proposed, not shipped:

> Beyond synchronisation, the same product can carry lead context from the first enquiry into the sales conversation.

Visual flow:

`Website enquiry → Lead record → Brochure delivery → WhatsApp conversation → Sales owner → Qualification and follow-up`

Copy:

> I shaped this direction with the founders and salesperson so the first WhatsApp module could become part of a broader internal sales workflow rather than remain an isolated campaign tool.

---

## 9. Reflection

### Heading

#### Building quickly does not remove the need to verify why a product should exist.

> The cost assumption should have been verified before development began. Learning that Meta owned most of the message charge changed how I judged the product: it could not justify itself simply by being ours.

> The more useful question became whether ownership allowed Cretile to work differently. The first release began answering that through connected campaign states, company-specific audience handling and Claude-assisted follow-up.

> A custom product earns its place when it captures how the organisation works and creates room for the organisation to work differently—not when it recreates an existing tool feature for feature.

---

## Visual Language

### Copy budget

The document is intentionally detailed so implementation decisions remain unambiguous; the page itself must stay concise.

- Keep each chapter introduction below roughly 80 visible words.
- Keep each problem lens or principle to one short sentence.
- Let diagrams and captions replace repeated explanations.
- Do not place the internal notes, rationale, or acceptance language from this document on the page.
- If a paragraph repeats information already visible in a product screen or diagram, remove the paragraph.

### Question-led chapters

Use large bordered question fields as transitions between major chapters. They should feel like the reader's next natural question, not decorative search bars.

Recommended questions:

1. Why build our own tool instead of reconnecting Interakt?
2. What did we believe building our own could change?
3. Was the financial advantage as large as we expected?
4. How did I turn the direction into a first release?
5. What did the first release make possible?
6. Where does the workflow still break?

### Real product proof

Every major product claim should be followed by a real screenshot, short clip or clearly labelled reconstruction. Screens should be shown large enough to read and should not be hidden by shadows, excessive framing, or aggressive cropping.

### Diagrams

Use code-native diagrams for:

- the repeating Excel-to-campaign loop;
- disconnected versus connected workflow;
- expectation versus learned reality;
- first-release product loop;
- Claude response matching;
- current upload versus future synchronisation;
- proposed lead-to-qualification direction.

Each diagram should make one relationship easier to understand. Avoid decorative arrows and generic process graphics.

### Character illustration

Use at most one or two character moments. The strongest opportunity is the operator manually carrying updated lead data between disconnected systems. It should make the human dependency visible without turning the case study into a comic.

### Layout

- Retain the portfolio's current restrained typography and spacing.
- Use the existing case-study type scale rather than oversized display copy throughout.
- Alternate text-led sections with diagrams and full-width product proof.
- Do not place every section inside a grey container.
- Use subtle rules, whitespace and captions to create grouping.
- Keep screenshots fully visible unless a crop is intentionally annotating one decision.

### Privacy

Before publication, obscure or replace:

- customer names;
- phone numbers;
- company names;
- campaign names that reveal internal information;
- message content unrelated to the design decision.

Do not state or imply that Interakt sells customer data. Frame ownership as greater control and extensibility, not as an accusation about another company.

---

## Claims and Boundaries

### Safe claims

- Samuel designed and built the first release.
- The objective and larger direction were aligned with founders and sales.
- The first release was scoped to two weeks after that alignment.
- The product is live and used by Samuel and one salesperson.
- The product supports contacts, campaigns, an inbox, analytics and safeguards.
- The audience flow supports reusable groups and direct selection.
- Campaign reports separate message states and allow retrying failed contacts.
- The inbox shows the 24-hour reply status.
- Claude handled option-specific follow-up for roughly 40 people in one campaign.
- Live Excel synchronisation and the broader sales workflow are future directions.

### Claims to avoid

- The product eliminated Meta messaging charges.
- Interakt was difficult to use.
- Interakt sells customer data.
- The current workflow is objectively faster or better than Interakt without evidence.
- Formal user research was conducted for this first version.
- Projected savings are realised savings.
- The future sales-platform flow has already shipped.

## Acceptance Criteria for the Final Page

The narrative is ready to implement when:

- the opening identifies Samuel as the product designer within the first screen;
- the reader sees the product before reading the business history;
- the summary and problem chapter do not repeat each other;
- the reason to start is explained through the actual workflow, not only the lost account;
- the original cost hypothesis and the corrected business case are clearly separated;
- the design process reflects Samuel's real work and does not imitate a textbook framework;
- selected use cases show judgment rather than enumerate features;
- every important interface claim is supported by a visual;
- current product, measured evidence, projected value and future direction are visibly distinct;
- all customer and company-sensitive information is removed from screenshots.
