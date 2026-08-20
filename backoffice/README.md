# Paint'n Pete — Back Office

The operating system for the business: every template, prompt, checklist, form
spec, and automation, in one version-controlled place.

Built to be **replicable**. Nothing here hardcodes a company name, an owner, a
city, or a phone number. Every document reads its facts from a single config
file, so a second operator clones this directory, edits that one file, and
inherits the entire system. See `config/README.md`.

---

## Start here

1. Read `config/business-profile.yml` — the config layer. Fill in every `todo`.
2. Read `01-foundation/business-brief.md` — paste it above every AI prompt.
3. Read `prompt-library.md` — the index of every prompt in the system.
4. Work the roadmap below in order.

---

## The one rule

**AI drafts, you verify.** Every price, product spec, scope, and legal or code
reference gets read by Noah before it reaches a client, a GC, or a crew. The
tools are fast and occasionally confidently wrong. Noah's name is on the work.

A second, mechanical version of that rule: anything in the config marked
`unverified` or `todo` does not go in front of a customer. Not in a proposal,
not on the website, not in the capabilities packet.

---

## Structure

| Directory | Contents | Guide § | Status |
|---|---|---|---|
| `config/` | Business profile — the config layer | 1.2 | **Built** |
| `01-foundation/` | Business Brief | 2.1 | **Built** |
| `02-estimating/` | Proposals, exclusions, photo-to-scope, job costing | 2 | **Built** |
| `03-leads/` | Response standards, follow-up, objections, intake form | 3 | **Built** |
| `04-visibility/` | Review engine, Google Business Profile, content | 4 | **Built** — needs your review link |
| `05-commercial/` | Capabilities packet, GC and PM outreach, bid analysis | 5 | **Built** — ⛔ blocked on credentials |
| `06-crew/` | SOPs (EN + ES), hiring, onboarding | 6 | **Built** — Spanish needs native review |
| `07-automation/` | Apps Script workflows | 7 | **Built** — needs deploying |
| `08-routines/` | Daily, weekly, monthly operating rhythm | 9 | **Built** |
| `09-website/` | Live site audit and publishing gates | 4 | **Audited** — ⛔ lead capture broken |
| `prompt-library.md` | Index of every prompt, plus the standalone ones | 10 | **Built** |

---

## Roadmap

**Phase 0 — Foundation.** Config layer and Business Brief. *Done.*

**Phase 1 — Review engine.** *Templates done.* The highest-return item in the
business: 14 Google reviews against 300+ completed projects. Blocked only on
Noah's Google review link and the client backlog — see
`04-visibility/SETUP.md`.

**Phase 2 — The money path.** *Built.* Lead capture through proposal to
follow-up: four standard responses, three-touch sequence, objection library,
intake form spec, leads tracker, proposal and exclusions templates,
photo-to-scope, and job-costing sheets with live formulas. Open items are
production rates (backfill three jobs), the service-area boundary, and a legal
review of the exclusions block.

**Phase 2b — Automation.** *Built, not deployed.* All six workflows from guide
§7 on Apps Script, plus the master workbook. About 20 minutes to install — see
`07-automation/DEPLOY.md`.

**Phase 3 — Visibility, crew, commercial, rhythm.** *Built.* Google Business
Profile content pack, the weekly content engine, service-area and case study page
specs, the three core SOPs in English and Spanish, hiring and onboarding, the
capabilities statement and outreach sequences, the bid analyser, the calendar
routines, and the prompt library.

Three gates remain on this phase, and they are deliberate:
- Commercial documents cannot be sent until `credentials` is verified.
- Spanish SOPs are AI first drafts and need a fluent speaker before they go in
  the van.
- ~~No service-area page publishes for a city until `service_area.boundary` is
  confirmed.~~ **Overtaken by events** — `service-areas.html` has been live with
  eight cities on it. See Phase 4.

**Phase 4 — Website.** *Audited 2026-08-19 — see `09-website/`.* Better than
this document previously assumed: eleven pages, all returning 200, all with meta
descriptions, H1s, and canonicals, correct sitemap and robots.txt, structured
data across the homepage and every service page, and the right phone number
throughout. The Phase 1 rebuild in `../paintnpete-redesign/` has already been
executed, so those documents are stale and should not be worked from.

**One gap, preventive rather than urgent.** The contact form posts to Netlify
Forms, which cannot reach Google Sheets or Apps Script, so workflow 1 never
fires for a website lead — no acknowledgment to the customer, no Leads row, no
follow-up sequence. Netlify does email Noah, and the inbox was checked on
2026-08-19: two submissions, both tests, nothing lost. The fix is written and
waiting in `07-automation/DEPLOY.md` step 6.

The site source is a separate repository (`~/Projects/paintnpete-website`) with
one commit and a large body of uncommitted work, and it deploys from the CLI
rather than from git — so nothing guarantees the repo matches what is live.
Commit it before touching it.

**Phase 5 — Franchise packaging.** Clonable operator kit.

---

## Stack

Resolved 2026-08-19: **Google Workspace**, so the supporting layer is Gmail on
the domain, Google Forms, Sheets, Drive, and Calendar.

**Phone: KaiCalls.** Answers 24/7, qualifies, books onto Google Calendar, and
texts the lead summary. It owns everything that happens on a call and closes the
SMS gap Apps Script couldn't. It is not the system of record — leads still land
in the `Leads` tab, because Kai's job ends at the booked appointment and the
money is made after it. See `03-leads/kai-setup.md`.

Automation runs on **Google Apps Script**, not Make.com. The guide defaults to
Make.com and correctly flags its free tier as the system's only hard limit — two
active scenarios on 1,000 credits a month, against six workflows in Section 7.
Apps Script is included with Workspace, has no scenario cap, is native to the
four products every workflow touches, and lives in this repo as code rather than
as clicks in a third-party UI. It is also the more franchisable choice: a new
operator deploys a script instead of rebuilding scenarios by hand.

---

## Notes on where things live

This directory holds **templates, prompts, specs, and code**. It does not hold
client data. Client lists, leads, and job costing live in Google Sheets, where
they belong.

`backoffice/` is excluded from Netlify deploys via `.netlifyignore` so it is
never served from the public portfolio site. Worth splitting into its own private
repository once it has grown past the foundation.
