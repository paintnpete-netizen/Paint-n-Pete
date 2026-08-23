# Live site audit — paintnpete.com

**Audited 2026-08-19** by fetching every page in the sitemap and parsing the
markup. Nothing here is inferred from the redesign documents; it is all read
from what the server actually returns.

---

## The headline

**The site is in far better shape than this back office assumed.** All twelve
pages from the Phase 1 build plan exist except the product reviews CMS, every
one returns 200, every one has a meta description and an H1, canonicals are
correct, `robots.txt` and `sitemap.xml` are both present and correct, and the
phone number is right everywhere.

The Phase 1 plan in `../../paintnpete-redesign/` is **stale and should not be
worked from.** It assumes Wix, and every one of its five "Day 1" emergency
fixes is already done — including the dead quote button and the schema phone
number that was publishing Noah's personal cell.

What follows are the gaps that remain. Lead capture is no longer one of them.

---

## 1. Website leads now reach the system

**Resolved 2026-08-20.** The contact form still posts to Netlify Forms. Netlify
emails `noah@paintnpete.com` **and** POSTs to the Apps Script web app. `doPost`
writes a Leads row (`source=website`), acknowledges the submitter, and alerts
`noah@paintnpete.com`. Live form test succeeded the same day; Noah marked the
test rows `outcome=test`.

Keep both channels. Do not add `onFormSubmit` until a Google Form is linked.
After any `Code.gs` change, republish the web app as a new version.

The 2026-08-19 inbox check still stands: the first two submissions were tests
and nothing was sitting unanswered. The webhook was the missing piece; it is
no longer missing. See `../07-automation/DEPLOY.md`.

### Account facts worth keeping

- Netlify login is `paintnpete@gmail.com` and the team is **Paint'n Pete**
  (slug `paintnpete`), moved 2026-08-19 off `kanwalconsulting297`. Site slug
  is still **`paintnpete`**. Same Personal team still holds three projects
  (paintnpete.com, noahkanwal.com, and one unused). Residual: Google OAuth
  on the Netlify user is still the consulting mailbox — disconnect only after
  a password or `paintnpete@gmail.com` Google login is connected.
- **Deploys are from the CLI, not from git.** There is no continuous deployment
  connected, so every publish is a manual `netlify deploy` from the folder on
  Noah's machine. The deployed site and the repo can silently diverge.
- Form name `consultation-details`, honeypot spam prevention enabled.

---

## 2. The published review count is stale

**Source updated 2026-08-20, not live until CLI deploy.** Homepage copy and
`AggregateRating` markup now read **21**, matching Google as of 2026-08-19.
The number is still hardcoded and will drift again — the monthly routine in
`../08-routines/operating-rhythm.md` already includes a re-check.

**The markup may not be doing anything.** Google's structured data policy
restricts *self-serving* review markup — a business publishing an aggregate
rating about itself on its own site is generally not eligible for star rich
results. If that applies here, the block is decorative at best. Worth
validating in Google's Rich Results Test before spending effort maintaining a
number that earns nothing. The stars in search come from the Google Business
Profile regardless, which is another argument for the review engine being the
higher-value work. Leave that engine parked until Noah starts it.

---

## 3. Business hours are not in the schema

**Source updated 2026-08-20, not live until CLI deploy.** `openingHoursSpecification`
is now `Mo–Su 08:00–20:00` on the homepage `HousePainter` block, matching
verified GBP hours.

---

## 4. Four pages have no structured data

| Page | Schema | Suggested |
|---|---|---|
| `index.html` | HousePainter, OfferCatalog, AggregateRating, FAQPage | — good |
| the five service pages | Service + City | — good |
| `service-areas.html` | Service, HousePainter, 8 × City | — good |
| `work.html` | none | `ImageGallery`, or `CreativeWork` per project |
| `products.html` | none | `FAQPage` if it answers questions |
| `about.html` | none | `AboutPage` + `Person` for Noah |
| `contact.html` | `ContactPage` (source, 2026-08-20) | live after CLI deploy |

`contact.html` is the one worth doing. It is the page most likely to be
surfaced for "paint'n pete phone number" style queries. Markup is in the
website repo; it is not live until `netlify deploy --prod`.

---

## 5. The service area is confirmed

Noah confirmed 2026-08-20. The eight live cities stay: **St. Petersburg,
Clearwater, Tampa, Gulfport, Pinellas Park, St. Pete Beach, Tierra Verde,
Treasure Island**, plus Pinellas and Hillsborough counties.

Homepage `areaServed` is aligned to that same list in source (live after CLI
deploy). `service_area.boundary` in config is `verified`.

---

## 6. One homepage image is missing alt text

**Source updated 2026-08-20, not live until CLI deploy.** The hero image
(`living-shutters-sectional.jpg`) now has alt text. `work.html` was already
clean — all 24 images carry alt text.

---

## 7. The site source is a separate repo

The live site is **not** in this repository. It lives at
`~/Projects/paintnpete-website` and deploys to Netlify site
`e5f29f47-051c-40a5-995c-08d0471a1d6c`.

This repo (`~/Projects/paint-n-pete`) is Noah's **portfolio** site — its root
`README.md` says so, its Netlify site ID is different, and `backoffice/` is
carried inside it.

**Resolved 2026-08-19.** It had one commit and a pile of uncommitted work — 27
files, 1,132 insertions, including `service-areas.html`, `sitemap.xml`,
`robots.txt`, the web manifest, and the brand icons, none of which were tracked
at all despite being live. All committed as `9389cc5` and pushed off the
machine.

Permanent home is now
[`github.com/paintnpete-netizen/paintnpete-website`](https://github.com/paintnpete-netizen/paintnpete-website)
(private). Local `origin` tracks `master` there, remote HEAD is `9389cc5`.
The temporary `website-backup` branch on the back office repo has been deleted.

**A near miss worth recording.** Attempting to switch the Cursor workspace to
that folder stashed every uncommitted change and reset the working tree to the
old commit. For a few minutes the live pages were absent from disk. Everything
was recovered from the stash, but had a `netlify deploy` run in that window, it
would have published the old site over the current one. With CLI deploys and no
git remote, the folder *was* the only copy — which is precisely the exposure
that has now been closed.

Worth deciding separately: the back office arguably belongs with neither site.
`README.md` already flags splitting it into its own private repository.

---

## 8. The redesign documents are stale in two places

`../../paintnpete-redesign/` and `~/Projects/paintnpete-website/docs/` both
describe a Wix build that no longer exists. They are useful as a record of
intent — the homepage copy and the products page structure are still the source
of truth for tone — but the build plan, platform notes, and Day 1 fix list are
all obsolete and will mislead anyone who reads them cold.

Its confirmation checklist is still live, though. Licence wording, warranty
terms, and founding year were answered 2026-08-20–21. Remaining commercial
blockers are trade references, bonding, and warranty exclusions — not this
site.

---

## Suggested order

1. **Commit and CLI-deploy the website repo** so the 2026-08-20 schema pass
   (review count 21, hours, contact markup, hero alt) is actually live. Lead
   capture is already live; do not re-wire the webhook.
2. Service area is confirmed — the eight live cities stay.
3. Decide whether the `AggregateRating` block earns its keep at all. Do not
   start the review engine until Noah asks.
