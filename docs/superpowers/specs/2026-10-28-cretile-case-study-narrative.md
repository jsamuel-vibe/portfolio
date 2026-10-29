# Cretile Case Study — Narrative for Review

**Updated:** 2026-10-29

**Status:** Approved copy implemented locally as an overview and separate full case-study page. Ready for Samuel's visual review; not published.

**Scope:** Overview copy, full case-study copy and separate production notes.

This revision supersedes the earlier feature-tour narrative, expandable design story and diagram-led visual direction in this document. It incorporates Samuel's latest account of scoping, workflow exploration, importing, audience selection and colleague feedback.

## Overview page copy

### Project title

Cretile: bringing WhatsApp campaigns and customer replies into one internal product

### Description

I designed and built Cretile's first internal sales-platform module, used to run WhatsApp campaigns and respond to customers.

### Project details

- **Role:** Product designer
- **Responsibilities:** Product definition, workflow design, UX/UI and development with Claude
- **Collaborators:** Founders and sales
- **Timeline:** Two weeks for the first release
- **Status:** Live; used by me and one salesperson

### Long story short

We needed to restart WhatsApp campaigns after losing access to our old Meta account. We also wanted more control over a sales workflow spread across Excel and other tools.

I helped define the larger direction, then designed and built the first WhatsApp module. I explored workflows in existing marketing tools and with Claude, using everyday campaign tasks to decide how the parts should fit together. The live product connects contacts, campaigns, replies and reporting, with room to add company-specific automation.

### In use

**Campaigns and conversations in one product.** I run campaigns; a salesperson uses the inbox to reply. My colleague's feedback was that the app was easy to use.

**Roughly 40 follow-ups handled through Claude.** In one campaign, Claude sent the relevant follow-up when a person chose one of four support options, without me monitoring each reply as it arrived.

**About ₹15–27K a year in projected avoided provider charges.** An estimate based on three monthly campaigns to 4,000 contacts. This is not measured savings or a net return; Meta messaging charges, development and hosting costs still need to be paid.

### Product preview

Contacts, campaign creation, the inbox and campaign results.

### Link

Learn More

---

## Full case-study page copy

### Cretile: designing the first part of an internal sales platform

I was already creating WhatsApp campaigns at Cretile when we decided to build our own product. My role covered defining the first release, designing its workflows and interface, and developing it with Claude.

The larger ambition was an internal sales platform. The first version had a more immediate job: help us send campaigns and handle the conversations they generated.

### Why we started

#### We had to restart campaigns. We also had a reason to reconsider the setup.

After several unsuccessful attempts to recover our old Meta account, we registered a new account and WhatsApp number. We had disconnected Interakt and needed to resume campaigns.

There was a cost motivation too. A colleague told me WhatsApp messages were supposed to be free, so we initially believed building our own tool could remove the per-message fee as well as the subscription. After development began, I checked this with Claude and learned that Meta charged for the messages. Owning the tool would not make them free.

We continued because the plan was bigger than replacing a subscription. We wanted a product we could extend around Cretile's work, eventually connecting our Excel data and more of the sales process. I worked with the founders and sales to understand that direction and align on what to build.

#### Our contact data still needed preparation before each campaign.

Our leads lived in Excel, and the sheets changed as new people were added. Before a campaign, I would export the updated data and upload it to the campaign tool again.

Choosing a particular audience could mean more preparation. In the Interakt workflow I used, a school-only campaign meant preparing a school-only file, uploading it and assigning a tag so I could select that group.

That experience gave me a practical starting point: understand how people would bring their data into the product and use it, rather than design campaign screens in isolation.

### Defining the first release

#### Start with the work we needed to resume.

Building an entire CRM was too broad for our resources and our understanding of that wider product. WhatsApp campaigns were familiar work with an immediate need.

We already had a way to send messages, but that setup had no inbox for customers' replies. Sending alone would leave the salesperson without a way to continue the conversation there.

I scoped the first version around importing and exporting contacts, creating campaigns, checking results, retrying failed messages and replying through an inbox. Once the objective and plan were aligned, I proposed two weeks for the first release, which the team agreed to.

Excel synchronisation remained outside the first version. Imported data could be used in the app, but changes to the source spreadsheet would still require another upload.

### Design process

#### I explored different workflows against the situations our team would face.

I tried email and WhatsApp marketing products, including ConvertKit, Mailchimp and Interakt, to understand how they organised the work. With Claude, I generated multiple workflow options and considered which would be clearest for our use cases.

As I compared them, I imagined my colleagues working through the app: what they would be trying to do, what information they would have and which steps would need explaining.

Adding one contact, for example, should not require preparing a spreadsheet. I provided a manual-entry route alongside file upload. For larger imports, the challenge was different: preserve the useful information already in the sheet and make it available for later work.

### From spreadsheet to campaign audience

#### Importing contacts needed to preserve more than names and phone numbers.

The mapping options in the Interakt workflow I used did not give me the flexibility I wanted for our sheets. Those sheets could contain information about the organisation, customer type or source of a lead.

I designed the import flow so columns could be matched to standard fields or existing custom fields. If information did not fit those fields, the operator could create a new one. Unneeded columns could be left out, and a tag could identify the imported batch.

This let the team bring useful context into the product without being limited to a fixed set of fields.

#### Choosing recipients should not mean preparing another file.

For campaign creation, I provided an entire-audience option and a segment/tag option. An operator could choose an existing group, exclude another group or adjust individual recipients for that campaign without changing their contact records.

The contacts page also supported selecting people directly and starting a campaign from that selection. A one-off audience did not have to become a permanent tag.

These choices addressed different situations: working with everyone, reusing a group and contacting a few specific people. The aim was to let the operator work with contacts already held in the app, rather than make a separate upload the starting point for every audience.

### What shipped

#### A campaign no longer ended at the send.

The live product connects contact management, campaign creation, an inbox and reporting. I use it to create and run campaigns; one salesperson uses it to respond to customers.

Campaign setup brings the audience, template and send time together. The inbox shows the conversation's reply-window status and the available next action. Reporting separates accepted, delivered, read, replied and failed messages, helping me tell the team what happened and retry contacts we could not reach.

### What owning the workflow enabled

#### I could arrange the follow-up without monitoring every reply.

One campaign asked people to choose from four ways Cretile could help. Each choice needed a different response.

I connected the app to Claude and asked it to send the relevant follow-up when someone selected an option. Roughly 40 people received a follow-up through that workflow.

I do not have a measured time saving. The practical difference was that I did not need to stay available and open each conversation as replies arrived. It was a concrete example of adapting the product to a Cretile-specific task.

### What happened after launch

#### The product is in use, with encouraging early feedback.

My colleague described the app as easy to use. That feedback is encouraging, but it is not a usability study or evidence of faster onboarding. I have not measured whether the campaign workflow is faster than Interakt.

There is also a projected reduction in provider charges. Using the rates supplied for our estimate, three monthly campaigns to 4,000 contacts would avoid about ₹15–27K a year in subscription and message markup. Meta charges remain, and this estimate excludes development, maintenance and hosting costs. It is not a measured saving or proof that the product has paid for itself.

What I can point to today is a working product used for campaigns and replies, plus a follow-up workflow tailored to how we operate.

### What comes next

#### Connect the spreadsheet so updates do not need another upload.

The next version should connect to our Excel source so new contacts can enter the app without another export and upload. That would address a repeated task the current release still leaves with the operator.

The longer-term direction is to connect more of Cretile's sales work in the same product. That remains a direction, not a claim about what has already shipped.

### What I learned

#### The larger vision helped define where to start.

We wanted a broader internal platform, but the first release needed to do a smaller job completely. Building around campaigns and replies gave us a usable starting point while leaving the wider CRM for later.

I should have checked the pricing assumption before development began. The more useful evidence for continuing was what the product could support in practice: working with our existing data, connecting campaign tasks and enabling follow-up tailored to the team.

The next question is whether further development removes enough recurring work to justify the effort of owning and maintaining the product.

---

## Production notes — not website copy

### Reading and navigation

- Keep the overview as the short entry page: product image and brief, Long story short, in-use results, product preview, then **Learn More**.
- Learn More must open a separate full case-study page, not expand content or scroll to a lower section of the overview.
- Give the full case study a clear return link to the overview and access to all projects.
- Remove the current five alternating feature chapters from the overview. Do not turn Undo, preview, reply status and other supporting controls into five replacement chapters on the full page.
- Use the full-copy headings as a hierarchy, not as bordered question fields or search-bar graphics.

### Text and imagery

- Use the existing type scale, readable paragraphs, whitespace and restrained rules. Allow enough explanation for a section to make sense when entered midway.
- Pair the narrative with real screenshots and recordings. No vector illustrations, infographic diagrams, process-card grids or fabricated interface reconstructions.
- Use the selected sage landscape consistently where an interface frame is needed. Keep the overview preview gallery unframed, as previously requested.
- Preserve natural media ratios and the complete interface. No clipped edges, heavy shadows or white decorative mats around the screenshot.
- Keep standard controls visible in real product media without adding separate explanatory chapters.
- Use captions for context, not to repeat the whole paragraph.

### Media placement

1. **Opening and first-release scope:** use the actual campaign workspace. Caption: “The first release brings campaign work and customer replies into one internal product.”
2. **Spreadsheet preparation:** explain in prose. Do not construct a fictional before-screen or a workflow diagram.
3. **Import mapping:** a privacy-redacted excerpt from the 17:53 recording can show standard, existing and new custom-field mapping together. Caption: “Keep useful spreadsheet columns by mapping them to existing fields or creating a new one.”
4. **Audience selection:** a redacted excerpt from the 17:59 recording can show entire-audience and segment/tag options, followed by the selected recipient state. Caption: “Choose an existing audience, then adjust recipients for this campaign.”
5. **Direct selection:** the existing anonymised contacts screenshot can accompany the same narrative as secondary evidence, without another feature chapter.
6. **What shipped:** pair a real inbox screenshot with the actual campaign report. A short campaign-creation clip can show the supporting preview and send controls in context.
7. **Claude follow-up:** explain the real example in text. No genuine automation screenshot or chat has been supplied, so do not make a reconstruction or suggest one exists.
8. **Next version:** prose is sufficient. Do not show an Excel-sync interface that has not been built.

These are editorial placement instructions, not approved public exports. Existing media also needs a privacy check before reuse.

### Private evidence

The recordings supplied on 2026-10-29 were reviewed locally as private references:

- **17:53:30:** import setup, optional tagging, column mapping and review before import.
- **17:59:18:** campaign creation, audience inclusion/exclusion, per-campaign recipient adjustments, template selection and final setup.
- The accompanying campaign screenshot includes a phone number. Remove it before any public use.
- Do not copy raw recordings or extracted reference frames into public assets or commit them. Any published excerpt needs deliberate redaction and review.
- File-system dialogs, source filenames, customer names, phone numbers, emails, organisation names, internal group labels and private message content may need removal.
- The recordings demonstrate custom-field mapping and tag-based campaign audiences separately. They do **not** establish automatic audience generation from every imported custom-field value. Do not claim that a School field automatically becomes a School segment.

### Evidence boundaries

- Workflow exploration used existing products and Claude-generated alternatives; do not claim a formal comparative usability study.
- Imagining colleagues' tasks is part of Samuel's design reasoning, not an observed usability-test result.
- The feedback was that the app was easy to use. Do not invent a direct quotation, satisfaction score, successful onboarding trial or feedback-driven redesign.
- Competitor limitations describe Samuel's experience with the setup he used, not a verified claim about every current Interakt plan or capability.
- The send-only setup without an inbox was the interim setup after disconnecting Interakt. Do not imply Interakt lacked an inbox.
- No measured time saving, conversion improvement, revenue increase or superiority over Interakt has been established.
- Two weeks refers to the first release. Do not imply every subsequent capability, including the Claude workflow, shipped within that period.
- Excel synchronisation is planned, not shipped. Do not claim the current product eliminates reuploads when the source sheet changes.
- Avoid treating a desire for ownership as proof of improved privacy, lower total cost or business return.

### Projection basis — internal calculation

The range uses Samuel's supplied pricing assumptions, not a current vendor quote:

- 3 campaigns per month × 4,000 contacts = 12,000 messages per month.
- Assumed provider rate: ₹0.882–₹0.970 per message.
- Assumed direct Meta rate: ₹0.8631 per message.
- Assumed provider subscription: ₹1,000 per month.
- Annual avoided subscription and markup: 12 × [₹1,000 + 12,000 × (provider rate − ₹0.8631)].
- Result: ₹14,721.60–₹27,393.60 per year, rounded to about ₹15–27K.
- This is a same-volume scenario, not evidence that three campaigns ran every month. It excludes development, maintenance and hosting and assumes the supplied rates apply to the same message category and destination, on a comparable tax basis.
- Verify applicable rates and subscription terms before publication. Until then, keep the estimate explicitly conditional; do not describe it as money already saved.

### Review checkpoint

Samuel approved this narrative and the two-page split. The overview is implemented in `whatsapp-campaigns.html`, with Learn More opening `cretile-case-study.html`. Both use plain text and real product media. New import, audience, inbox, workspace and report exports have privacy redactions; only the external dark capture border was trimmed. The original private recordings remain outside public assets.

Visual review is the current checkpoint. Deployment and the next case-study rewrite are separate steps. At Samuel's request, the hero caption and the two additional pricing footnotes have been removed from the pages. The cost projection remains explicitly labelled as a projection in the main copy; detailed calculation assumptions stay in these internal notes.

The portfolio inbox export has a contrast-adjusted teal template action with a visible label; this does not modify the underlying application. Videos use a subtle central play/pause button with keyboard support and native controls when JavaScript is unavailable. Both return links go to the top of the overview.
