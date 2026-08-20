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

What follows are the gaps that remain. There are eight, and one of them is
costing money right now.

---

## 1. Website leads reach Noah, but not the system

**Checked in the Netlify dashboard 2026-08-19.** The first draft of this audit
assumed the worst here and was too pessimistic. The facts:

**No leads have been lost.** The form has **two submissions ever**, both from
the same IP on the day the site was deployed, both obviously tests — one named
"Deploy Verify" at `123 Test St`, one from a family address at the exact minute
of the CLI deploy. Nothing is sitting unanswered.

**An email notification is already configured:** *Email noah@paintnpete.com on
new submission from any form.* So a real submission does reach Noah. That is
the single most important thing and it works.

**What still does not happen**, because Netlify Forms cannot write to a
spreadsheet or fire an Apps Script trigger:

- The customer gets **no acknowledgment**. They submit into apparent silence and
  wait, while comparing three contractors.
- There is **no row in the Leads tab**, so the lead does not exist to the rest
  of the system.
- Therefore **no day 3 / 8 / 21 follow-up** — those read from the sheet.
- **No text alert.** Email only, which is slower to notice than a text.

So this is not the black hole the Kai alerts were. It is a lead that lands in an
inbox and then falls out of the pipeline. The timing is fortunate: the fix can
go in before real traffic arrives rather than after.

**Also confirmed:** *No webhooks set up yet* — so the outgoing webhook below is
the missing piece, and adding it does not disturb the email notification, which
should stay as a belt-and-braces second channel.

**Pick one of three:**

| Option | Effort | Trade-off |
|---|---|---|
| Netlify notification → email → Apps Script parses it | Low | Fragile; parsing email is always brittle |
| Netlify outgoing webhook → Apps Script web app | Medium | Clean, real-time, the right answer |
| Replace the form with an embedded Google Form | Low | Works today with zero code, but worse on the page |

The webhook is the correct one, and **the code is already written**: `doPost` in
`../07-automation/Code.gs` accepts Netlify's payload and produces the same Leads
row, acknowledgment, and alert as a Google Form submission. Step 6 of
`../07-automation/DEPLOY.md` connects it. What it needs is the script published
as a web app, which requires the Google account.

### Account facts worth keeping

- Netlify login is `paintnpete@gmail.com` and the team is **Paint'n Pete**
  (slug `paintnpete`), moved 2026-08-19 off `kanwalconsulting297`. Site slug
  is still **`paintnpete`**. Same Personal team still holds three projects
  (paintnpete.com, noahkanwal.com, and one unused). Residual: Google OAuth
  on the Netlify user is still the consulting mailbox — disconnect only after
  a password or `paintnpete@gmail.com` Google login is connected.
- **Deploys are from the CLI, not from git.** There is no continuous deployment
  connected, so every publish is a manual `netlify deploy` from the folder on
  Noah's machine — which is also why the uncommitted work in item 7 is riskier
  than it looks. The deployed site and the repo can silently diverge.
- Form name `consultation-details`, honeypot spam prevention enabled.

---

## 2. The published review count is stale

Homepage `AggregateRating` markup reads:

```
ratingValue 5.0 · ratingCount 14 · reviewCount 14
```

Google shows **21**. The number was hardcoded when the site was built and has
been drifting ever since — and it will keep drifting, faster once the review
engine in `../04-visibility/` starts running. That is the whole point of the
review engine.

Two things to settle, not one:

**The number is wrong.** Update it, and add it to the monthly routine in
`../08-routines/` so it gets re-checked rather than rotting again.

**The markup may not be doing anything.** Google's structured data policy
restricts *self-serving* review markup — a business publishing an aggregate
rating about itself on its own site is generally not eligible for star rich
results. If that applies here, the block is decorative at best. Worth
validating in Google's Rich Results Test before spending effort maintaining a
number that earns nothing. The stars in search come from the Google Business
Profile regardless, which is another argument for the review engine being the
higher-value work.

---

## 3. Business hours are not in the schema

`openingHoursSpecification` is absent from the `HousePainter` block, even
though hours are now verified: 8:00 AM – 8:00 PM, seven days.

Cheap to add and genuinely useful — hours are one of the fields local search
surfaces directly, and "open now" filtering depends on it.

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
| `contact.html` | none | `ContactPage` + `LocalBusiness` |

`contact.html` is the one worth doing. It is the page most likely to be
surfaced for "paint'n pete phone number" style queries.

---

## 5. The service area contradicts itself

- Homepage `areaServed`: **St. Petersburg, Clearwater, Tampa**, plus Pinellas
  and Hillsborough counties — five entries.
- `service-areas.html`: **eight cities** — St. Petersburg, Clearwater, Tampa,
  Gulfport, Pinellas Park, St. Pete Beach, Tierra Verde, Treasure Island.

Pick one list and use it in both places.

There is a second-order point here. `service_area.boundary` is `todo` in the
config, and several documents in this back office refuse to publish a
service-area page until it is confirmed. **That gate is fictional — the page is
already live with eight cities on it.** The decision was made when the site
shipped. The config should record what is published rather than pretend the
question is open, and if any of those eight cities is one Noah does not
actually want work in, that is a live problem today, not a future one.

---

## 6. One homepage image is missing alt text

Five of six have it. `work.html` is clean — all 24 images carry alt text.

---

## 7. The site source is a separate repo, with uncommitted work

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

Its confirmation checklist is still live, though, and overlaps exactly with
what is blocking the commercial packet: licence wording, warranty terms,
founding year. Same questions, asked in July, still unanswered.

---

## Suggested order

1. **Wire the webhook** — `DEPLOY.md` step 6. Nothing has been lost yet, so this
   is preventive rather than a rescue. Do it before the site gets real traffic.
2. **Commit the website repo.** Uncommitted work is one bad afternoon from gone,
   and with CLI-only deploys there is no git copy of what is actually live.
3. Fix the review count, add opening hours, reconcile the city list — one small
   pass, all in the schema.
4. Add `ContactPage` schema and the missing alt attribute.
5. Decide whether the `AggregateRating` block earns its keep at all.
