# Consultation Intake Form

Twelve questions, sent after a consultation is booked. You arrive already knowing
scope, timeline, budget bracket, and who decides — so the walkthrough gets
shorter and sharper, and you spend the time looking at surfaces instead of
asking basics.

Responses land in a spreadsheet automatically, which becomes your lead database.

Build in Google Forms. Keep it friendly and brief — nothing that feels like an
interrogation. Twelve is the ceiling, not a target.

---

## The questions

**1. What kind of project is this?** *(Multiple choice)*
Interior · Exterior · Cabinets & fine finishes · Drywall & surface repair ·
Commercial · More than one of these

**2. Which rooms or surfaces are involved?** *(Checkboxes, with "Other")*
Let them tick and add. Don't make them write a paragraph.

**3. Roughly how old is the home?** *(Multiple choice)*
Before 1978 · 1978–1999 · 2000–2015 · 2015 or newer · Not sure

> Not idle curiosity. Pre-1978 means lead-safe work practices, which change
> containment, cleanup, and schedule. Knowing before the walkthrough is the
> difference between quoting it and discovering it. Ties to the pre-1978 clause
> in `../02-estimating/exclusions-assumptions.md`.

**4. When was it last painted?** *(Multiple choice)*
Within 2 years · 3–5 years · 6–10 years · More than 10 · Never / don't know

**5. Any known problem areas?** *(Checkboxes)*
Water damage · Cracking or peeling · Wood rot · Mildew or staining ·
Previous repair that didn't hold · Nothing I'm aware of

**6. Will anyone be living in the home during the work?** *(Multiple choice)*
Yes, fully occupied · Partly · No, it'll be empty

**7. Any color direction yet?** *(Short answer)*
"Colors picked, a general idea, or would you like help?" — this one also tells
you whether a designer is involved.

**8. What's your timeline?** *(Multiple choice)*
As soon as possible · Within a month · 1–3 months · Just planning for now

**9. What budget range are you working with?** *(Multiple choice — brackets)*
Brackets, never a blank field. A blank field gets skipped or gets a number
they've invented to sound reasonable. Set the brackets from your own job history
once the costing sheet has a few jobs in it.

**10. How did you find us?** *(Multiple choice)*
Google search · Google Business Profile · Instagram · Referral from a friend ·
Designer, architect, or contractor · Saw our work in the neighborhood · Other

> This is the only question that tells you where your work actually comes from.
> Everything in Section 4 of the guide is aimed at whichever answer wins, so
> don't drop this one to shorten the form.

**11. Is anyone else involved in the decision?** *(Short answer)*
Spouse, designer, HOA, property manager. Finding this out on site, after
presenting to one of two decision-makers, costs you a second visit.

**12. Anything a previous painter did that you didn't like?** *(Paragraph)*

> The most valuable question on the form. It tells you exactly what they're
> afraid of, and it's usually specific and fixable — mess, no-shows, tape lines,
> vanishing for a week. Address it directly at the walkthrough and you've won
> before you've quoted. Ask it last, when they're warmed up.

---

## Setup

1. <https://forms.google.com> → blank form → **Paint'n Pete — Consultation Intake**
2. Add the twelve questions above with the types shown
3. Responses tab → link to `leads-tracker` sheet
4. Mark nothing as required except 1 and 2 — a required field on question 9 is
   how you get an abandoned form
5. Link it from the site and send it automatically on booking (workflow 3 in
   `../07-automation/`)
