# Website — Guide §4 (web surface)

The website is not built in this repository. It lives at
`~/Projects/paintnpete-website` and deploys to its own Netlify site. This folder
holds the back office's view of it: what is live, what is broken, and what has
to be true before a page publishes.

---

## What it contains

- `live-site-audit.md` — full audit of paintnpete.com, read from the live
  markup on 2026-08-19

---

## The state of it

**Better than expected.** Eleven pages, all returning 200, all with meta
descriptions, H1s, and canonicals. Sitemap and robots.txt correct. Structured
data on the homepage, all five service pages, and the service-areas page. The
phone number is right everywhere. The Phase 1 rebuild described in
`../../paintnpete-redesign/` has already happened — those documents are stale
and describe a Wix site that no longer exists.

**One gap, and it is preventive rather than urgent.** The contact form posts to
Netlify Forms, which cannot talk to Google Sheets or Apps Script. Netlify does
email `noah@paintnpete.com` on every submission, so a lead does reach Noah — but
the customer gets no acknowledgment, no row appears in the Leads tab, and no
follow-up sequence starts.

Checked the Netlify inbox on 2026-08-19: **two submissions, both tests, nothing
lost.** The fix is written (`doPost` in `../07-automation/Code.gs`) and needs
deploying — `../07-automation/DEPLOY.md` step 6 — ideally before the site sees
real traffic.

---

## Before you publish anything here

Same two gates as the rest of the system:

- Nothing marked `todo` or `unverified` in `../config/business-profile.yml`
  goes on a public page — that means no licence, insurance, or warranty claim
  until `credentials` is filled in.
- Page copy comes from `../04-visibility/web-templates.md` and the tone rules
  in `../01-foundation/business-brief.md`.

One gate has already been overtaken by events: `service_area.boundary` is still
`todo`, but `service-areas.html` is live with eight cities on it. Reconcile the
config to what is published rather than treating the question as open.
