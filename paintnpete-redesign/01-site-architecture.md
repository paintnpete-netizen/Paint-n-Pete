# Paint'n Pete — Site Architecture (Phase 1)

Goal: simple, elegant customer experience for a premium residential painter in St. Petersburg, FL.
Design principle from the benchmark research: **proof → one clear next step → low-anxiety consultation.**

---

## 1. Navigation

Keep it to six items. Premium sites win by being easy to scan, not by having more links.

```
Paint'n Pete    Services ▾    Work    Products    About    Contact
                                                  [ Request a Consultation ]
```

- **Services** is a dropdown, not a page dump.
- One primary CTA in the header: *Request a Consultation*. Not "Book Now," not three competing buttons.
- Mobile: sticky bottom bar with **Call** and **Request a Consultation**.

### Services dropdown
| Label | Slug |
|---|---|
| Interior Painting | `/interior-painting` |
| Exterior Painting | `/exterior-painting` |
| Cabinets & Fine Finishes | `/cabinets-and-finishes` |
| Drywall & Surface Repair | `/drywall-repair` |
| Commercial | `/commercial` |

---

## 2. Full page map

| Page | Slug | Purpose | Phase |
|---|---|---|---|
| Home | `/` | Positioning, proof, one next step | 1 |
| Interior Painting | `/interior-painting` | Scope, process, products, FAQ | 1 |
| Exterior Painting | `/exterior-painting` | Florida-specific prep and coatings | 1 |
| Cabinets & Fine Finishes | `/cabinets-and-finishes` | Highest-margin, most visual service | 1 |
| Drywall & Surface Repair | `/drywall-repair` | Repair + texture matching | 1 |
| Commercial | `/commercial` | Short page, separate audience | 1 |
| Work | `/work` | Gallery + filters + case studies | 1 |
| Case study (template) | `/work/{project}` | 3–5 scoped project stories | 1 |
| Products | `/products` | Brand education hub | 1 |
| Product review (CMS) | `/products/{slug}` | Monthly review, you author | 1 |
| About | `/about` | Noah, craft, credentials | 1 |
| Contact | `/contact` | Consultation request + Calendly | 1 |
| Color Studio | `/color-studio` | AI photo color consultation | **2** |

**Fix immediately (from live inventory, July 25 2026):**
- Menu Gallery already points to `/projects-7` (works). Orphan URL `/gallery` 404s — add a 301 to `/work` or delete.
- Dead homepage button “GET A FREE QUOTE” has no `href` — remove or wire it.
- Schema.org phone is `9143571448` but site displays `727-902-1986` — fix LocalBusiness JSON-LD.
- Orphan page `/inquiry-services-page` has generic Wix boilerplate — delete or rebuild as Contact.
- Classic Wix Editor mobile is broken (horizontal overflow ~980px) — rebuild mobile layout, don’t just shrink desktop.
- Prefer renaming `/projects-7` → `/work` with a redirect.

---

## 3. Homepage section order

Ordered so a stranger can decide in one scroll whether you're the right painter.

1. **Hero** — positioning line, one CTA, one strong finished-work image
2. **Trust strip** — rating, years, projects completed, licensed/insured
3. **What we do** — five services, each with one real sentence (not just an icon)
4. **Proof** — 3 featured projects with captions, link to full Work page
5. **How it works** — 4-step process, removes anxiety about mess/timeline
6. **Why it lasts in Florida** — prep + coatings; your genuine differentiator
7. **Products & color guidance** — teaser into `/products`, and later `/color-studio`
8. **Testimonials** — with star ratings and source
9. **Service area** — St. Pete + surrounding, plain list
10. **FAQ** — 6 questions that block buyers
11. **Closing CTA** — consultation, phone, email
12. **Footer**

Rationale: the current site jumps from tagline to icons to a Calendly embed with no proof or process in between. That's the main conversion gap.

---

## 4. What changes vs. today

| Today | Phase 1 |
|---|---|
| 2 pages (Home, broken Gallery) | 13 pages, real IA |
| 6 service icons that link nowhere | 5 service pages with scope + process |
| No process explained | 4-step process on home + each service page |
| No credentials visible | Trust strip in first scroll |
| Gallery images uncaptioned | Captions + filters + case studies |
| No product education | `/products` hub + monthly review |
| Calendly embed as the whole conversion path | Short form + consult options; Calendly on `/contact` |
| Truncated body copy | Rewritten, complete copy |

---

## 5. Conversion rules

- **One** primary CTA per page. Secondary actions are text links, not buttons.
- Phone number visible in header on desktop, tap-to-call on mobile.
- Consultation form: short. Name, phone/email, project type, ZIP, optional photos, notes. Nothing else.
- Offer consultation *modality* choice (on-site or video) — benchmark showed this reduces friction.
- Every service page ends with the same single CTA.

---

## 6. Things to confirm before publishing

Do not publish trust claims we haven't verified. Fill these in:

- [ ] License number / "licensed & insured" — exact wording you're entitled to use
- [ ] Insurance carrier coverage amount (if you want it stated)
- [ ] Warranty terms — how many years, what it covers
- [ ] Year Paint'n Pete was founded (distinct from your 15 years painting)
- [ ] Google review count and current rating
- [ ] Service area boundary — which cities you actually take work in
- [ ] Whether you want price ranges published (benchmark: transparent ranges build trust)
