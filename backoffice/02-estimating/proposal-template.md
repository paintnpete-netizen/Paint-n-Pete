# The Proposal

You already win work by delivering an itemized written proposal before anyone
else does. **The letter layout is fixed** (the Danielle PNP-2026-0817 design).
Client, address, scope, products, and prices change every time.

**Target: proposal out the same day as the walkthrough.**

The letter lives at `proposal.html`. Fill `job.js` with that job’s facts, open
the HTML, Print → Save as PDF. Do not send a Google Doc or a markdown dump.

---

## On site

Take rough notes on: rooms and areas, surfaces, ceiling heights, condition,
repairs needed, colors, sheens, access, and timeline. Photograph every problem
area — those feed `photo-to-scope.md`.

---

## Generating the draft

1. Copy `jobs/_blank.js` over `job.js` (or start from a similar past job in
   `jobs/`).
2. Paste `../01-foundation/business-brief.md` and the walkthrough notes into
   the chat (or the prompt below). The draft is a filled `job.js`, not a
   prose letter.
3. **The drawer prices from `rates.js` × measurements.** If you fill `job.js`
   by hand, copy the quote lines from the drawer (or leave `[PRICE]`).
4. Open `proposal.html` in Chrome. File → Print → Save as PDF, paper size
   **Letter**, **Background graphics** on.
5. Name it `Paint'n Pete — Estimate PNP-YYYY-MMDD — Firstname.pdf`.
6. Save a copy of `job.js` into `jobs/PNP-YYYY-MMDD-lastname.js` so the job
   can be reprinted.

Prompt:

> Fill `backoffice/02-estimating/job.js` from my walkthrough notes, matching
> the Danielle estimate (PNP-2026-0817): numbered scope with "what's
> included," products table, included / not included lists, sequence, terms,
> two price options only if I specified both. Price from rates.js × the
> measurements in the notes. No superlatives, no exclamation points. Use two-year workmanship
> warranty. Never "licensed contractor."
>
> WALKTHROUGH NOTES: [paste]

`exclusions-assumptions.md` is the source for the not-included list and the
terms. Distill it into the short checklist style of the letter — do not paste
the 340-word essay onto the PDF.

---

## How the letter is priced

The estimate drawer multiplies walkthrough measurements by `rates.js`:
interior/exterior paint $2.10/sq ft, pressure wash $0.75/sq ft, interior doors
$200, exterior doors $250, cabinets per door/drawer/frame/box. Edit rates on
the estimate if a job is different.

---

## Before it sends

- [ ] Quote matches the walkthrough measurements and current rates
- [ ] Printed from `proposal.html` — same letter as PNP-2026-0817
- [ ] Scope matches your notes — nothing invented or quietly dropped
- [ ] Products and sheens are ones you actually intend to use
- [ ] Timeline reflects cure times, not just working days
- [ ] Read start to finish

---

## Log it

Enter the send date in the Leads tab the moment it goes out. That date fires
the day 3 / 8 / 21 follow-ups.
