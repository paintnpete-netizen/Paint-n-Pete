# Commercial proposal template

A commercial bid is reviewed by a GC, property manager, or procurement office — not
the person who will walk past the wet paint. They need **scope, quantities,
schedule, insurance, and payment terms** on paper, not a residential letter with
different wording.

This template follows what real commercial painting subs put in winning
proposals: surface inventory with sq ft basis, prep and coat count per area,
product specification, phased schedule, assumptions/exclusions, and COI-ready
qualifications. Sources: industry bid guides (paintpricing.com, BidPacto), public
RFP structures (university / school district painting RFPs), and our
`capabilities-statement.md`.

**Output:** `commercial-proposal.html` → Print → Save as PDF → attach to bid
package or email.

---

## When to use this vs residential

| Residential letter | Commercial proposal |
|---|---|
| Homeowner, one decision-maker | GC, PM, procurement |
| Rooms by name | Areas / phases / floors |
| 50% deposit · 50% at completion | Progress draws, net terms, retainage |
| Two price options | Base bid + alternates table |
| HOA note | COI, additional insured, lien waiver language |

---

## Default commercial rates (Tampa Bay median, Aug 2026)

The drawer loads these automatically when **Commercial** is selected. Same
service checklist as residential; pricing reflects local GC/PM market medians
(Paint Blue, Highmark, property-manager guides).

| Item | Commercial default |
|---|---|
| Interior paint / sq ft | $2.15 |
| Exterior paint / sq ft | $2.75 |
| Pressure wash / sq ft | $0.12 |
| Priming / sq ft | $0.18 |
| Interior door (each) | $90 |
| Exterior door (each) | $115 |
| Patch — small / large | $55 / $95 |
| Clean-out (start or end) | $425 |

Residential rates stay separate ($2.00/sq ft interior paint, etc.). Switching
estimate type resets rate overrides so each book loads its defaults.

---

## Fill-out checklist (site walk or bid docs)

Copy this into your walkthrough notes. Every blank should become a line in the
proposal.

### 1. Parties (30 seconds)

- [ ] **Submitted to** — GC or property manager company + contact
- [ ] **Project name** — building, suite, or campus phase
- [ ] **Owner / tenant entity** — who holds the lease or owns the asset
- [ ] **Bid due date** — from the ITB / RFP (or "N/A" for negotiated work)
- [ ] **Site address** — where crews mobilize

### 2. Scope summary (one paragraph)

- Building type (office, retail, clinic, HOA common, etc.)
- Occupied or vacant
- Interior / exterior / both
- Total approximate sq ft (walls + ceilings — **not floor sq ft**)
- Standard: prep level + **number of coats** per surface type

### 3. Areas / phases (the heart of the bid)

For each area, list:

| Field | Example |
|---|---|
| Area name | Floor 2 — east corridor & lobby |
| Walls sq ft | 2,840 |
| Ceiling sq ft | 960 |
| Doors / frames | 12 |
| Surfaces | walls, ceilings, doors, trim |
| Prep | wash, patch ≤ 50 sq ft, caulk, spot-prime |
| Coats | 2 finish on walls; 1 flat on ceilings |
| Colors | SW Agreeable Gray walls; extra white ceilings |
| Phase | Weekend only / after 6 PM / with tenant in suite |

### 4. Products

Name **manufacturer, product line, sheen, and VOC** if the spec requires it.
Default lines in the drawer: Aura, Regal Select, Duration — change per architect
spec.

### 5. Schedule & access

- Work hours: business / after-hours / weekend / phased
- Duration: calendar days or shifts
- Access: lifts, escorts, security badges, staging location
- Protection: what stays operational (elevators, entrances, IT rooms)

### 6. Price structure

- **Base bid** — lump sum for defined scope (preferred for TI repaint)
- **Alternates** — optional lines (extra color, extra phase, upgrade product)
- **Unit rates** (optional) — $/sq ft for change orders — state in Assumptions

### 7. Commercial terms (pick one set; edit in drawer)

**Progress (typical TI):** 30% mobilize · 40% midpoint · 30% substantial
completion · retainage 10% for 30 days

**Net 30:** Invoice on substantial completion; net 30 from invoice date

**GC flow-down:** Match owner contract payment terms (state retainage % and
release trigger)

Always include:

- Change orders in writing before extra work
- COI with additional insured within 5 business days of award
- Proposal valid 30 days

### 8. Assumptions (protect your margin)

State what you **assumed** so disputes become change orders, not arguments:

- Substrate sound and dry
- Colors approved before production
- Furniture / IT moved by others unless in scope
- No prevailing wage unless stated
- No lead / asbestos abatement

### 9. Exclusions (standard block is in the template)

Add job-specific exclusions: wallpaper, fireproofing, parking lot striping, etc.

---

## Workflow

### From HQ drawer (recommended)

1. **New estimate** → tap **Commercial**
2. Fill **Commercial project** card (project name, owner, bid due, scope type,
   schedule, payment, retainage)
3. Add **Areas** with perimeter × rise (same as residential measurements)
4. Check **Services** and **Custom add-ons** for alternates
5. **Preview** → commercial layout generates automatically
6. Print → PDF → `Paint'n Pete — Proposal PNP-YYYY-MMDD — ProjectName.pdf`
7. Save job copy in `02-estimating/jobs/`

### Manual (no drawer)

1. Copy `jobs/commercial-_blank.js` → edit `commercial-job.js`
2. Fill every `[BRACKET]` from the checklist above
3. Open `commercial-proposal.html` in Chrome
4. Print → Save as PDF

### From a bid package (50+ pages)

Use `bid-analysis.md` first to extract scope, spec sections, schedule traps, and
RFI questions. **Do not trust AI for quantity takeoff** — measure drawings
yourself. Then fill the drawer from your takeoff.

---

## AI prompt (after walkthrough or bid review)

> Fill `backoffice/hq/estimating/commercial-job.js` from my notes. Match the
> commercial proposal structure: parties table, scope sections with included
> bullets, surface inventory table with sq ft totals, products, schedule block,
> qualifications, assumptions, exclusions, payment terms, and alternates if any.
> Price from rates.js × measurements when provided. Professional tone — no
> superlatives. Two-year workmanship warranty. Never "licensed contractor."
> Licensed Florida business only.
>
> NOTES: [paste walkthrough or bid-analysis output]

---

## Before you send

- [ ] Surface sq ft matches your takeoff (walls + ceilings, not floor area)
- [ ] Coat count and prep level stated per area
- [ ] Schedule matches what the GC can actually give you
- [ ] Payment + retainage match the owner contract or your standard
- [ ] Assumptions list what you did **not** price
- [ ] COI / additional insured requirement acknowledged
- [ ] Read start to finish — procurement will

---

## Related docs

- `capabilities-statement.md` — qualifications attachment
- `bid-analysis.md` — RFP triage prompt
- `../02-estimating/exclusions-assumptions.md` — residential source; adapt for
  commercial exclusions
- `../hq/DRAWER.md` — field workflow
