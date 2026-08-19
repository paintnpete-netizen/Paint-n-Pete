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
3. Work the roadmap below in order.

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
| `04-visibility/` | Review engine, Google Business Profile, content | 4 | **Review engine built** — needs your review link |
| `05-commercial/` | Capabilities packet, GC and PM outreach, bid analysis | 5 | Not started |
| `06-crew/` | SOPs (EN + ES), hiring, onboarding | 6 | Not started |
| `07-automation/` | Apps Script workflows | 7 | Not started |
| `08-routines/` | Daily, weekly, monthly operating rhythm | 9 | Not started |

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

**Phase 3 — Website.** Rebuild `paintnpete.com` in Cursor on Netlify, executing
the architecture and copy already written in `../paintnpete-redesign/`.

**Phase 4 — Commercial and crew.** Capabilities packet, outreach, the three core
SOPs in English and Spanish.

**Phase 5 — Franchise packaging.** Clonable operator kit.

---

## Stack

Resolved 2026-08-19: **Google Workspace**, so the supporting layer is Gmail on
the domain, Google Forms, Sheets, Drive, and Calendar.

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
