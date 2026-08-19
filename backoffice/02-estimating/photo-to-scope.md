# Photo-to-Scope

Upload 3–10 job photos, get back a surface inventory and a prep checklist.

**Use Claude for this, not ChatGPT.** ChatGPT's free plan allows roughly two
image uploads per 24 hours; Claude handles about five files per conversation.
Do not plan a photo session around ChatGPT free.

---

## What this is actually for

It is not for measurements and it is not for pricing. It misjudges scale and
condition constantly — a photograph flattens a wall that is visibly bowed in
person, and it cannot tell chalking from dust.

Its real value is that **it never forgets to mention the thing you were going to
forget.** Treat every output as a checklist to verify on site, never as a
finding.

---

## The prompt

Paste `../01-foundation/business-brief.md` first, then:

> You are a senior estimator for my company. From the attached photos of a
> [INTERIOR / EXTERIOR] project in [NEIGHBOURHOOD], produce:
> 1. An inventory of every visible paintable surface
> 2. Prep work the photos suggest will be required
> 3. Conditions I should flag to the client before quoting
> 4. Five questions I should ask the homeowner that these photos raise
>
> Be explicit about what you cannot determine from a photograph.

That last line matters. Without it you get confident answers about substrate
condition that are worth nothing.

---

## Shooting for it

- Wide shot of each room or elevation, then details of anything damaged
- Include a door or outlet in frame where scale matters
- Shoot problem areas in raking light — it reveals texture that flat light hides
- Exteriors: get the fascia, soffits, and the north-facing wall, which is where
  mildew shows first in Florida

---

## Then

Item 4 — the five questions — is usually the most valuable part of the output.
Take those to the walkthrough. Feed the verified inventory into
`proposal-template.md`.
