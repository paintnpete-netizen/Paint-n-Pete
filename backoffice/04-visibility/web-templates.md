# Service-Area & Case Study Page Templates

These are specs for pages on paintnpete.com. They live here rather than in the
site repo because the content decisions belong to the business, not the build.

---

## The trap, stated first

The obvious move is eight city pages with the name swapped. Google reads that as
doorway content and it can suppress the whole site, not just those pages. Since
the 2024 site reputation and scaled content updates, near-duplicate local pages
are explicitly targeted.

**Rule: one service-area page ships only when you have at least two real jobs in
that area, with photos and something genuinely specific to say about the housing
stock.** Three good pages beat eight thin ones. If you only have material for
one, publish one.

---

## Service-area page template

**URL:** `/painting/[city-or-neighborhood]` — e.g. `/painting/old-northeast`

**Title tag:** `[Neighborhood] House Painting — Paint'n Pete | St. Petersburg, FL`
**Meta description:** 150–160 chars, mentions the neighbourhood and one specific
thing about the work there.

### Required sections

**1. H1 and opening (100–150 words).**
What we do here and what makes the housing stock in this specific area different.
Old Northeast has 1920s bungalows with original wood siding and lead-era coating
history. Snell Isle is mid-century masonry and waterfront exposure. Tierra Verde
is direct salt spray. St. Pete Beach is sun and wind-driven rain. *If you cannot
write this paragraph honestly, you should not publish the page.*

**2. The local problem (150–200 words).**
The failure mode specific to this area's homes and climate exposure. This is the
section that makes the page not-generic.

**3. Real work in this area.**
Minimum two projects, real photos from `../../images/work/`, one or two sentences
each. Neighbourhood-level location only, never a street address.

**4. What a job here involves.**
Pull the relevant steps from `../06-crew/sop-exterior-prep.md` or the interior
SOP, written for a homeowner rather than a crew.

**5. Reviews from this area**, if you have them. Real ones, attributed the way
Google shows them.

**6. Services offered**, linking to the main service pages rather than repeating
their content.

**7. Single call to action.** Phone number and the consultation request. One CTA,
not four.

### Schema

`LocalBusiness` with `areaServed` set to the specific place, plus `Service`.
Use the canonical phone number from `config/business-profile.yml` — the live Wix
site currently publishes the wrong one and that must not be carried over.

### AI's role

Use it to draft sections 4 and 6 and to tighten your prose. **Do not** let it
write sections 1, 2, or 3 from nothing — that is exactly how you end up with
eight identical pages describing a climate the model inferred.

---

## Case study page template

**URL:** `/work/[short-descriptive-slug]`

Aim for one per quarter, from a job you're actually proud of. These do double
duty: search visibility, and something to send a designer or a hesitant lead.

### Structure

**1. Headline.** What it was and where. `1926 Bungalow Exterior Repaint — Old
Northeast`. No adjectives.

**2. The situation (100 words).** What the house was doing when we arrived.
Peeling, chalking, failed caulk, rot at the fascia — whatever it actually was.

**3. What we found (100–150 words).** Especially anything discovered after
washing that wasn't visible in the walkthrough. This section is persuasive
precisely because most contractors hide it.

**4. The approach (200 words).** Prep sequence, products and why those products
for this substrate and exposure, and any judgement call you made.

**5. Photos.** Before, prep in progress, detail, after. The prep photo is the
one that does the work.

**6. The result.** One paragraph. Plus the client's own words if they gave a
review — quoted, not paraphrased.

**7. Details block.** Location (neighbourhood), scope, products, duration.

### Generation prompt

> [Business Brief pasted first]
>
> Write a case study page from these notes. Job details: [paste]. Photos
> attached. Follow this structure: situation, what we found, approach, result.
>
> The "what we found" section should be honest about surprises — that section is
> the reason the page persuades anyone. Do not smooth it over.
>
> Do not invent any technical detail I haven't given you. If a specification is
> missing, leave `[CONFIRM]` in place rather than guessing at a product or a
> number. Third person, no exclamation points, no superlatives, never describe
> our own work as premium or luxury.

---

## Publishing gate

Before any page from these templates goes live, check `config/business-profile.yml`:

- `service_area.boundary` — **already published.** `service-areas.html` is live
  with eight cities on it, so this gate is retrospective now: check that every
  published city is one you actually take work in, and reconcile the homepage
  `areaServed` (three cities) with the page (eight). See
  `../09-website/live-site-audit.md`.
- `credentials` — currently `todo`. No licence, insurance, or warranty claim
  appears on any page until those are verified.
- `contact.address` — `unverified`. Not in schema until confirmed publishable.
- Client permission for every photo of a private home.
