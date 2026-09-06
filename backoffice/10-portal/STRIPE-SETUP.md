# Stripe setup — Accept & pay deposit

One button in the client portal: **Accept & pay deposit** → Stripe Checkout → deposit recorded on `ActiveJobs`.

**Your test account:** `acct_1U8o9bFgQoPneNp3`  
**Dashboard:** [Stripe test welcome](https://dashboard.stripe.com/acct_1U8o9bFgQoPneNp3/test/welcome)

**Already done (2026-08-26):** Apps Script v27 + portal deployed with Checkout + webhook handlers.

**You finish:** Stripe account wizard → copy keys → run `finish-stripe-setup.mjs`.

---

## 1. Stripe welcome wizard (use these answers)

Stay in **Test mode** until a real end-to-end test passes.

| Field | Value |
|---|---|
| Business name | **Kanwal Consulting LLC** (DBA **Paint'n Pete**) |
| Business type | LLC / sole proprietor (match your filing) |
| Industry | Home services / construction / painting |
| Website | `https://www.paintnpete.com` |
| Business address | **1105 18th St. South, St. Petersburg, FL 33712** |
| Phone | **727-902-1986** |
| Support email | **noah@paintnpete.com** |
| Product description | Residential & commercial painting — deposits for scheduled work |

Bank account and full identity verification can wait for **live mode** — test keys work before that completes.

---

## 2. Get API keys

**Developers → API keys** (test mode):

| Key | Where it goes |
|---|---|
| Secret `sk_test_…` | Netlify `STRIPE_SECRET_KEY` |
| Publishable `pk_test_…` | Not needed for hosted Checkout |

---

## 3. Create webhook

**Developers → Webhooks → Add endpoint**

| Field | Value |
|---|---|
| URL | `https://portal.paintnpete.com/.netlify/functions/stripe-webhook` |
| Events | `checkout.session.completed` |

Copy **Signing secret** → `whsec_…`

---

## 4. Wire keys (one command)

```bash
cd backoffice/10-portal
node finish-stripe-setup.mjs \
  --secret sk_test_YOUR_KEY \
  --webhook whsec_YOUR_SECRET
```

This sets Netlify env vars and redeploys.

---

## 5. Test

1. Publish a test estimate from HQ (**Submit to portal**).
2. Open invite link → **Accept & pay deposit — $X**.
3. Card: `4242 4242 4242 4242`, any future date, any CVC.
4. **ActiveJobs** → `deposit_paid`; you get email alert.

---

## 6. Go live

1. Complete Stripe activation (bank, identity).
2. Live keys + live webhook endpoint (same URL).
3. `finish-stripe-setup.mjs` with `sk_live_…` and live `whsec_…`.
4. Set `payments_status: verified` in `business-profile.yml`.

---

## Manual deploy (if needed)

```bash
cd backoffice/07-automation && BUMP_DEPLOYMENT=1 node push-and-deploy.mjs
cd backoffice/10-portal && npm install && netlify deploy --prod --dir=site --functions=netlify/functions
```

