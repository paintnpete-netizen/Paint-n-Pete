# Paint'n Pete — Back Office

The operating system for the business: every template, prompt, checklist, form
spec, and automation, in one version-controlled place.

Built to be **replicable**. Nothing here hardcodes a company name, an owner, a
city, or a phone number. Every document reads its facts from a single config
file, so a second operator clones this directory, edits that one file, and
inherits the entire system. See `config/README.md`.

---

## Start here

1. Open `hq/index.html` — the office. Bookmark it. That is the daily front door.
2. Read `config/business-profile.yml` — the config layer. Fill in every `todo`.
3. Read `01-foundation/business-brief.md` — paste it above every AI prompt.
4. Read `prompt-library.md` — the index of every prompt in the system.

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
| `05-commercial/` | Capabilities packet, GC and PM outreach, bid analysis | 5 | **Built** — ⛔ blocked on trade references / bonding |
| `06-crew/` | SOPs (EN + ES), hiring, onboarding | 6 | **Built** — Spanish needs native review |
| `07-automation/` | Apps Script workflows | 7 | **Live** — form → sheet, daily + Monday triggers |
| `08-routines/` | Daily, weekly, monthly operating rhythm | 9 | **Built** |
| `hq/` | Internal Workspace HQ — one page, all tools | — | **Built** — bookmark `hq/index.html`; estimate drawer is `hq/drawer.html` |
| `09-website/` | Live site audit and publishing gates | 4 | **Audited** — form capture live; schema pass in source |
| `10-portal/` | Client portal — docs, chat, payments (prospect → active) | `DEPLOY-PORTAL.md` | **v1 live** — no Stripe yet |
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
photo-to-scope, and job-costing sheets with live formulas. Service-area
boundary confirmed 2026-08-20 (eight cities). Production rates and a legal
review of the exclusions block are parked until Noah asks.

**Phase 2b — Automation.** *Live as of 2026-08-20.* Website form submissions
land in the Leads tab, the submitter gets an acknowledgment, and
`dailyCheck` / `mondayReminder` are installed. See `07-automation/DEPLOY.md`.
Workflows that depend on a Google Form (`onFormSubmit`) or on Kai writing
into the sheet are still waiting on those pieces, not on Apps Script.

**Phase 3 — Visibility, crew, commercial, rhythm.** *Built.* Google Business
Profile content pack, the weekly content engine, service-area and case study page
specs, the three core SOPs in English and Spanish, hiring and onboarding, the
capabilities statement and outreach sequences, the bid analyser, the calendar
routines, and the prompt library.

Three gates remain on this phase, and they are deliberate:
- Commercial documents cannot be sent until trade references are filled and
  bonding is either stated or deleted. Licence wording, W-9, current Next GL
  and biBERK WC from the COIs, legal name, founded year, and warranty are
  now verified.
- Spanish SOPs are AI first drafts and need a fluent speaker before they go in
  the van.
- Service area is confirmed: the eight live cities stay.

**Phase 4 — Website.** *Audited 2026-08-19 — see `09-website/`.* Better than
this document previously assumed: eleven pages, all returning 200, all with meta
descriptions, H1s, and canonicals, correct sitemap and robots.txt, structured
data across the homepage and every service page, and the right phone number
throughout. The Phase 1 rebuild in `../paintnpete-redesign/` has already been
executed, so those documents are stale and should not be worked from.

**Lead capture is live.** The contact form still posts to Netlify Forms; an
outgoing webhook now fires `doPost` so a Leads row, customer acknowledgment,
and alert all happen. Netlify also still emails Noah. End-to-end tested
2026-08-20. Remaining website work is the schema pass in `09-website/`
(review count, hours, contact markup) and a CLI deploy — not the form.

The site source is a separate repository (`~/Projects/paintnpete-website`),
private GitHub `paintnpete-netizen/paintnpete-website`, last committed as
`9389cc5`. Deploys are from the CLI, not from git, so a schema change is not
live until `netlify deploy --prod` runs from that folder.

**Phase 5 — Client portal.** *v1 in `10-portal/` — deploy with `DEPLOY-PORTAL.md`.*
Bridges estimate acceptance to active work: documents, chat, accept timestamp.
Portal link rides the estimate-sent text (not the booking SMS). Stripe and
contract/BOS templates are next. Spec: `10-portal/portal.md`.

**Phase 6 — Franchise packaging.** Clonable operator kit.

---

## Stack

Resolved 2026-08-19: **Google Workspace**, so the supporting layer is Gmail on
the domain, Google Forms, Sheets, Drive, and Calendar.

**Phone: KaiCalls.** Intended to answer 24/7, qualify, and text a booking
link. Public inbound on the 762 DID is currently with a KaiCalls developer —
do not keep testing that line while they work. Live booking path is
`https://www.paintnpete.com/contact`, not calendar slots. Kai is not the
system of record — website leads already land in the `Leads` tab. See
`03-leads/kai-setup.md`.

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
