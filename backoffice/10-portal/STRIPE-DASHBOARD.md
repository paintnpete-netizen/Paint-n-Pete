# Stripe Dashboard setup — Paint'n Pete

Complete these in the Stripe Dashboard (API cannot update your own Standard account).
Use **Test mode** first; repeat in **Live mode** before real deposits.

Account: `acct_1U8o9bFgQoPneNp3` · [Settings](https://dashboard.stripe.com/acct_1U8o9bFgQoPneNp3/test/settings)

---

## 1. Activate account (required for live payouts)

**Settings → Business → Account details** (or follow the home-page checklist)

| Field | Value |
|---|---|
| Legal business name | **Kanwal Consulting LLC** |
| DBA / doing business as | **Paint'n Pete** |
| Business type | **Company** (LLC) |
| Industry / MCC | **Special trade contractors** or **Home improvement / painting** (MCC **1799** if asked) |
| Website | `https://www.paintnpete.com` |
| Product description | Residential & commercial painting — interior, exterior, drywall. 50% deposit to schedule; balance at completion. |
| Business address | **1105 18th St S, St. Petersburg, FL 33712** |
| Support phone | **727-902-1986** |
| Support email | **noah@paintnpete.com** |

**Settings → Payouts → Add bank account** — business checking for Kanwal Consulting LLC (required before live money).

**Settings → Personal details** — Noah Kanwal, owner/representative (SSN + ID for verification).

---

## 2. Branding (client-facing Checkout)

**Settings → Business → Branding**

| Field | Value |
|---|---|
| Business name (display) | **Paint'n Pete** |
| Brand color | `#1f4a3a` (matches portal green) |
| Accent / background | `#f4efe6` (cream — optional) |
| Icon / logo | Upload square logo from marketing site if available |

Clients see this on the Stripe Checkout page when paying deposits.

---

## 3. Statement descriptor (bank/card statement)

**Settings → Business → Public details → Statement descriptor**

| Field | Value |
|---|---|
| Statement descriptor | **PAINT N PETE** (max 22 chars; no apostrophe) |

Per-job suffix on deposits is set automatically from the job number (e.g. `PAINT N PETE* PNP-2026-0825`).

---

## 4. Payments settings

**Settings → Payments**

- **Payment methods:** Cards only for v1 (Apple Pay / Google Pay enable automatically with Checkout).
- **Receipts:** Turn **on** email receipts to customers (Stripe sends after successful payment).
- **Timezone:** **America/New_York** (Florida).

---

## 5. Webhook (already created)

**Developers → Webhooks** — confirm endpoint exists:

- URL: `https://paintnpete-portal.netlify.app/.netlify/functions/stripe-webhook`
- Event: `checkout.session.completed`

When `portal.paintnpete.com` DNS is live, add the same path on that domain or switch the endpoint URL.

---

## 6. Portal return URL (Netlify)

Checkout success/cancel links must hit a working URL. Until DNS is fixed, use:

`PORTAL_PUBLIC_URL=https://paintnpete-portal.netlify.app`

```bash
cd backoffice/10-portal
NODE="/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node"
NETLIFY="/tmp/node_modules/.bin/netlify"
$NODE $NETLIFY env:set PORTAL_PUBLIC_URL "https://paintnpete-portal.netlify.app" --context production --force
$NODE $NETLIFY deploy --prod --dir=site --functions=netlify/functions
```

---

## 7. Go live checklist

1. Finish activation + bank account in **Live mode**.
2. Create **live** webhook (same URL, live signing secret).
3. Run `finish-stripe-setup.mjs` with `sk_live_…` and live `whsec_…`.
4. One real small deposit on a friendly job.
5. Set `payments_status: verified` in `business-profile.yml`.

---

## Already optimized in code

- One-step **Accept & pay deposit** in client portal
- Checkout line item: deposit amount + job number + site
- Custom submit text: 50% deposit / balance at completion
- Phone + billing address collected on Checkout
- Webhook → ActiveJobs `deposit_paid` + Leads `won` + email alert
