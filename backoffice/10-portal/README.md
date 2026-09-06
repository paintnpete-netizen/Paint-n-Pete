# Client Portal — Bridge Between Pipelines

Connects the **prospect pipeline** (website visit → estimate acceptance) to the
**active client pipeline** (deposit → bill of sale).

| File | Purpose |
|---|---|
| `portal.md` | Product spec — auth, screens, Stripe events, build order |
| `active-jobs.csv` | Sheet schema for the `ActiveJobs` tab |
| `estimate-sent.md` | SMS + email that carry the portal link |
| `DEPLOY-PORTAL.md` | Netlify + Apps Script deploy steps |
| `site/` | Portal UI (Netlify publish root) |
| `netlify/` | `portal-api` function → Apps Script |

**Decisions locked 2026-08-24**

1. **Payments:** Stripe (Checkout + webhooks).
2. **When the portal opens:** link goes out with the **estimate confirmation**
   text. At the walkthrough, Noah prompts the client to create a portal account
   for the estimate receipt and further communication. Booking SMS stays as-is
   (calendar link only).
3. **Legal:** Florida contractor attorney reviews contract and bill of sale
   before those docs go live. Estimate letter can ship earlier.

**Not this**

- Not the marketing site. Host as `portal.paintnpete.com` (or a sibling
  Netlify site). Do not deploy under paintnpete.com public pages without isolation.
- Not HQ. HQ stays internal (`../hq/`).
- Not a second CRM. Sheets remain system of record; portal is the client face.

**Depends on:** estimate letter in `../02-estimating/`, Leads/ActiveJobs in
`../07-automation/`, KaiCalls SMS for the estimate-sent text, Stripe account
(not yet in stack — add when created).
