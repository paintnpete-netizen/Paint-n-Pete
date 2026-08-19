# Master Prompt Library — Guide §10

Every prompt in the system, in one place.

**Two rules that apply to all of them:**

1. **Paste the Business Brief first**, every time, in every new conversation.
   `01-foundation/business-brief.md`. Without it you get generic contractor copy
   that sounds like everyone else.
2. **AI drafts, you verify.** Nothing generated here goes to a client, a GC, or
   a crew without you reading it. It will invent a product specification, a
   warranty term, or a price with total confidence.

---

## Index — prompts that live in their own files

| What you need | Where |
|---|---|
| Write a client proposal | `02-estimating/proposal-template.md` |
| Read job photos into a scope and prep list | `02-estimating/photo-to-scope.md` |
| Respond to a review | `04-visibility/review-engine.md` |
| Weekly social content batch | `04-visibility/content-engine.md` |
| Service-area or case study page | `04-visibility/web-templates.md` |
| Analyse a commercial bid package | `05-commercial/bid-analysis.md` |
| Objection responses | `03-leads/objection-library.md` |
| Follow-up emails after a proposal | `03-leads/follow-up-sequence.md` |
| First-contact standard responses | `03-leads/standard-responses.md` |

The rest are below.

---

## 1. Seasonal outreach to past clients

Two a year. Not a newsletter — a specific, useful note.

> [Business Brief]
>
> Write a short email to past clients ahead of [hurricane season / the dry
> winter painting season]. It should be genuinely useful to someone who is not
> going to hire me this month.
>
> Content: [two or three specific things a homeowner should check on their
> exterior — caulk joints at windows, fascia and soffit, chalking on the
> south-facing elevation, mildew in shaded areas]. Explain what to look for and
> what it means if they find it.
>
> One sentence at the end offering to take a look. No urgency language, no
> seasonal discount, no "limited spots".
>
> Under 200 words. First person, from Noah.

**Why it works:** the client who doesn't need you keeps reading you. The one who
finds chalking on their south wall calls the same day.

---

## 2. Price increase notice

For existing clients on repeat work, and for updating published ranges.

> [Business Brief]
>
> I'm raising my rates by [X]% effective [date] because [real reason — material
> costs, insurance, wages]. Write a short note to existing repeat clients.
>
> State the change plainly and give the date. One sentence on why, honest and
> non-defensive. Do not apologise, do not over-explain, do not offer to hold the
> old rate for anyone who complains.
>
> Under 120 words. First person.

**The trap:** three paragraphs of justification signals you expect a fight and
invites one. Contractors who apologise for price get negotiated. State it.

---

## 3. Referral request

For clients who were happy and are past the review request.

> [Business Brief]
>
> Write a short text asking a happy past client whether they know anyone with
> painting coming up.
>
> Context: [job type, roughly when, anything specific I can reference].
>
> Ask once, clearly, and make it easy to say no. No incentive offer, no
> "share this with your network". Under 50 words. First person, the way I'd
> actually text.

---

## 4. Change order

The most expensive conversation in the trade, and the one most contractors avoid
until it's a dispute.

> [Business Brief]
>
> Something was discovered mid-job that isn't in the signed scope. Write the
> change order and the message that goes with it.
>
> - Found: [what — rot behind the fascia, failed substrate, previously
>   unpainted surface]
> - Where: [location]
> - Why it can't be ignored: [what happens if we coat over it]
> - Additional work required: [scope]
> - Additional cost: [PRICE — I fill this in, never you]
> - Schedule impact: [days]
>
> Two parts. First, a short message to the homeowner explaining what we found
> and why, in plain language, with the choice stated neutrally — proceed, or
> we coat it as-is and it's excluded from the warranty. Second, a formal change
> order block they can sign.
>
> Do not sound like I'm upselling. Do not apologise for finding it. Do not
> guess at any price or duration.

**The rule that saves you:** photograph it, message it, and get written approval
before any additional work happens. A verbal yes on a jobsite is not a change
order and will not survive the final invoice.

---

## 5. Subcontractor agreement — outline only

> [Business Brief]
>
> Outline the sections a subcontractor agreement should contain for a
> residential painting company in Florida hiring painting subs. For each
> section, explain in plain language what it protects against and what a small
> contractor typically gets wrong there.
>
> Cover at minimum: scope, payment terms, insurance and indemnification,
> workmanship standards and remedy, warranty, independent contractor status,
> non-solicitation of clients, and termination.
>
> Do not write contract language. I need to understand what I'm asking a lawyer
> for.

**⛔ This produces a briefing document for your attorney, not an agreement.** An
AI-generated subcontract is unenforceable in exactly the situations you'd need
it. Worker misclassification in particular carries personal liability — get it
right once, with a lawyer, and reuse it forever.

---

## 6. Portfolio case study for the site

See `04-visibility/web-templates.md` for the full spec. Short version:

> [Business Brief]
>
> Write a case study from these notes: [paste]. Photos attached. Structure:
> the situation, what we found, the approach, the result.
>
> Be honest in "what we found" — surprises after washing, hidden damage,
> anything we had to change. That section is the only reason the page persuades
> anyone.
>
> Do not invent a product, a number, or a technical detail I haven't given you.
> Leave `[CONFIRM]` where something is missing. Third person, no exclamation
> points, no superlatives, never describe our own work as premium.

---

## 7. Difficult client message

For when something has gone wrong and you need to reply well rather than fast.

> [Business Brief]
>
> A client has sent me this: [paste].
>
> Here are the facts as I understand them: [what actually happened, including
> anything that was our fault].
>
> Draft a reply that: acknowledges their specific complaint without generic
> apology language, states plainly what we did and didn't do, proposes a
> concrete next step with a date, and does not concede anything factually
> untrue to make the conversation easier.
>
> Under 150 words. Calm, not defensive, not grovelling. First person.

**Before you send it:** wait an hour. Then read it once more asking only "does
this contain any promise I don't want to keep?"

---

## 8. Estimate sanity check

Not a pricing tool — a second pair of eyes on your own logic.

> [Business Brief]
>
> Here's my scope and my estimated hours by phase for a job: [paste from the
> job-costing sheet].
>
> Do not price this and do not tell me what to charge. Instead:
>
> 1. What's in this scope that I appear not to have allocated hours for?
> 2. Which phases look light or heavy relative to the scope described?
> 3. What conditions could exist here that I haven't accounted for, given it's
>    a [age] home in coastal Florida?
> 4. What should I confirm on site before this number goes out?

---

## Prompts to never use

- Anything that asks AI to produce a price, a rate, or a range. Every number
  comes from the job-costing sheet.
- Anything that asks it to write a warranty, a licence claim, or a contract
  clause you'll actually use.
- Anything that asks it to invent a client testimonial or a project you didn't
  do. This ends businesses, and it's traceable.
- Anything that asks it to write a specification for a substrate you haven't
  seen. It will produce a confident, plausible, wrong one.
