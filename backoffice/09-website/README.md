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

**Lead capture is live as of 2026-08-20.** The contact form still posts to
Netlify Forms. Netlify emails `noah@paintnpete.com` and POSTs to the Apps Script
web app, which writes the Leads row, acknowledges the submitter, and alerts
`noah@paintnpete.com`. Tested end-to-end.

What is still open on the site is markup, not capture: homepage review count
and hours, contact-page schema, and a CLI deploy so those edits actually go
live. Service area is confirmed — all eight cities stay.

---

## Before you publish anything here

Same two gates as the rest of the system:

- Nothing marked `todo` or `unverified` in `../config/business-profile.yml`
  goes on a public page. Licence, GL ($1M Next), WC (Biberk, not $1M), and
  two-year workmanship are verified. Never "licensed contractor." Policy
  numbers stay off the website.
- Page copy comes from `../04-visibility/web-templates.md` and the tone rules
  in `../01-foundation/business-brief.md`.

One gate has already been overtaken by events: `service_area.boundary` is
`verified` as of 2026-08-20. The eight live cities stay.
