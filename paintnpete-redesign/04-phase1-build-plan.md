# Phase 1 Build Plan — Paint'n Pete on Wix

**Decisions locked (July 25, 2026):**
- Stay on Wix; redesign layout/content first
- AI Color Studio in Phase 2
- Benjamin Moore official color API when Color Studio ships; other brands as closest-match
- Noah writes monthly product reviews; we build the CMS

**Platform:** Classic Wix Editor (not Studio). No Velo currently (`isWixCodeOnSite=false`). Mobile is currently broken (980px horizontal overflow) — treat mobile rebuild as mandatory, not polish.

---

## Immediate fixes (Day 1)

Do these before any redesign so the live site stops leaking trust:

1. **Wire or remove** the dead homepage button “GET A FREE QUOTE” (no href today).
2. **Fix LocalBusiness schema phone** — currently `9143571448`, site shows `727-902-1986`.
3. **301 `/gallery` → `/projects-7`** (or later `/work`) so the orphan 404 dies.
4. **Delete or rebuild** orphan `/inquiry-services-page` (generic Wix boilerplate: “Custom Project Development,” etc.).
5. **Add descriptive alt text** to gallery images (currently filenames).

---

## Phase 1 page build order

Build in this order so each publish has a clear conversion path:

| # | Page | Source docs | Notes |
|---|---|---|---|
| 1 | Home (restructure) | `02-homepage-copy.md` | New section order; fix mobile |
| 2 | Contact | — | Form + Calendly; replace orphan inquiry page |
| 3 | Work | — | Rename `/projects-7`; captions + filters |
| 4 | About | — | Noah, credentials, service area |
| 5 | Interior Painting | — | First service template |
| 6 | Exterior Painting | — | Florida-specific prep |
| 7 | Cabinets & Fine Finishes | — | |
| 8 | Drywall & Surface Repair | — | |
| 9 | Commercial | — | Short |
| 10 | Products hub | `03-products-page.md` | Four brand sections |
| 11 | Product Reviews CMS | — | Collection + “This month” block |
| 12 | Nav + header CTA | `01-site-architecture.md` | Services dropdown, sticky mobile CTA |

---

## Homepage rebuild checklist (Wix)

Section order (do not reorder without reason):

- [ ] Hero — headline, subhead, one CTA, one photo
- [ ] Trust strip — 4 stats (wait for CONFIRM items)
- [ ] What we do — 5 service cards with one sentence each, linking to service pages
- [ ] Recent work — 3 captioned projects
- [ ] How it works — 4 steps
- [ ] Why it lasts in Florida
- [ ] Products & color teaser → `/products`
- [ ] Testimonials (keep existing three; add stars + neighborhoods)
- [ ] Service area
- [ ] FAQ accordion
- [ ] Closing CTA
- [ ] Footer

Mobile: rebuild as stacked sections. Do not keep the current desktop-width canvas.

---

## Design direction (simple + elegant)

- Plenty of white space; one full-bleed image at a time
- One primary button style sitewide
- Typography: clear sans for UI, restrained display for H1 only
- Color: keep brand accents from the logo, but stop flooding the page with them
- Photography: finished work and process shots only — no stock rooms
- Avoid: CTA carpet, franchise zip-wall, self-describing “premium/luxury” adjectives

---

## Confirmation checklist (you fill in)

Do not publish unverified claims. Reply with answers:

- [ ] Exact “licensed & insured” wording + license number if shown
- [ ] Warranty terms (years + what it covers)
- [ ] Year Paint'n Pete was founded
- [ ] Google review rating + count + profile URL
- [ ] Cities you actually take work in
- [ ] Whether to publish price ranges (and what they are)
- [ ] Business hours for footer
- [ ] Instagram / Google / Facebook links (if any)
- [ ] Confirm street address in schema (`1105 18th Street South, 33712`) is correct to publish
- [ ] Preferred Wix access method (editor invite to an email, or screen-share / you click while I guide)

---

## What I need from you to start building

1. Answers to the confirmation checklist (or “skip for now” on any item)
2. Wix editor access — invite an email I can use, or sit with me while you click
3. Your three best project photos for the homepage “Recent work” cards, with one-line captions

---

## Phase 2 (later — not started)

Color Studio at `/color-studio`:
- Upload room photo → AI recommends 3–5 colors → wall-preserving recolors → email list to paintnpete@gmail.com
- Embedded widget + external serverless backend (Wix 14s timeout)
- Benjamin Moore Digital Studio API for named colors; other brands as closest-match
- Consent, retention, rate limits, sample disclaimer

Estimated: 2–4 weeks MVP after Phase 1 is live.

---

## Document index

| File | Contents |
|---|---|
| `01-site-architecture.md` | Nav, page map, conversion rules |
| `02-homepage-copy.md` | Paste-ready homepage copy |
| `03-products-page.md` | Brand education + monthly review CMS |
| `04-phase1-build-plan.md` | This file |
| Benchmark canvas | Competitor pattern matrix (beside chat) |
