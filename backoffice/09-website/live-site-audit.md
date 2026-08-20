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

## ⛔ 1. Website leads are not reaching the system

**The contact form is a Netlify form**, identified by its hidden `form-name`
field and `bot-field` honeypot. It collects name, email, phone, address, date,
time, and description.

Netlify forms post to Netlify. They do not write to Google Sheets, they do not
trigger Apps Script, and they do not send the acknowledgment email. So the
entire money path in `../03-leads/` and `../07-automation/` — instant
acknowledgment, row in the Leads tab, text alert to Noah — **does not fire for
anyone who fills in the form on the website.**

This is the same failure mode as the Kai alerts: a lead arrives, and nothing
tells anyone. `../07-automation/README.md` states that workflow 1 "is wired to
a Google Form submission rather than a custom endpoint, so it runs today on Wix
— or on no site at all." True, and irrelevant, because the live site is not
posting to a Google Form.

**Check first, before building anything:** log in to Netlify and look at Forms
for the site. Two things to find out — how many submissions are sitting there,
and whether an email notification was ever configured. If there are unanswered
submissions, those are real leads that were never replied to, and working
through them is more urgent than any fix below.

**Then pick one of three:**

| Option | Effort | Trade-off |
|---|---|---|
| Netlify notification → email → Apps Script parses it | Low | Fragile; parsing email is always brittle |
| Netlify outgoing webhook → Apps Script web app | Medium | Clean, real-time, the right answer |
| Replace the form with an embedded Google Form | Low | Works today with zero code, but worse on the page |

The webhook is the correct one. Netlify can POST the submission as JSON to a
URL, and Apps Script can be published as a web app that accepts a POST. That
makes workflow 1 fire exactly as designed.

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

That repo has **one commit** and a substantial pile of uncommitted
modifications across most pages. Whatever was changed since the initial commit
exists only on that disk. It should be committed before anything else is
touched there.

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

1. **Netlify Forms** — check for unanswered submissions, then wire the webhook.
   This is the only item costing money today.
2. **Commit the website repo.** Uncommitted work is one bad afternoon from gone.
3. Fix the review count, add opening hours, reconcile the city list — one small
   pass, all in the schema.
4. Add `ContactPage` schema and the missing alt attribute.
5. Decide whether the `AggregateRating` block earns its keep at all.
