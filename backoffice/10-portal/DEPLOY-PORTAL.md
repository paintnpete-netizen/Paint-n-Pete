# Deploy the client portal

v1 includes signup, estimate download, accept + deposit (Stripe Checkout), and chat.

**Stripe:** Code is ready. You need a Stripe account + Netlify env vars before clients can pay. See **`STRIPE-SETUP.md`**.

Host at `portal.paintnpete.com` as its own Netlify site — not on the marketing deploy.

**Live (2026-08-24):** Netlify site `paintnpete-portal` — https://paintnpete-portal.netlify.app  
Custom domain configured on Netlify: `portal.paintnpete.com` (needs DNS CNAME below).  
Admin: https://app.netlify.com/projects/paintnpete-portal

---

## 1. Apps Script

**Automated push (recommended):**

```bash
cd backoffice/07-automation
node clasp-login-noah.mjs    # choose noah@paintnpete.com in the browser
node push-and-deploy.mjs                    # push Code.gs + Portal.gs only
BUMP_DEPLOYMENT=1 node push-and-deploy.mjs  # push + bump web app to latest version
node setup-portal-tabs.mjs                  # create portal sheet tabs (via web app)
```

Prerequisites (one-time, per Google account):

1. [Enable the Apps Script API](https://script.google.com/home/usersettings) for **noah@paintnpete.com** (the script owner).
2. Clasp must be logged in as **noah@paintnpete.com**, not `paintnpete@gmail.com` — the latter cannot edit this project unless you share it.

**Manual (if push fails):**

1. Open **Paint'n Pete Automation** in Apps Script as **noah@paintnpete.com**.
2. Add `Portal.gs` (paste from `backoffice/07-automation/Portal.gs`) alongside `Code.gs`.
3. Update `Code.gs` if your copy is behind — it must route `portal_*` actions in `doPost` and set `portalBaseUrl` in `CONFIG`.
4. Run **`setupPortalTabs`** once — automated:

```bash
node setup-portal-tabs.mjs   # needs WEBHOOK_SECRET or BOOKING_SCRIPT_URL with ?key=
```

Or from Apps Script editor: **Portal.gs** → **`setupPortalTabs`**. Creates:
   - `ActiveJobs`, `PortalUsers`, `PortalAccess`, `PortalMessages`
5. **Deploy → Manage deployments → New version** (same web app URL as booking).

Optional Script properties:

| Key | Purpose |
|---|---|
| `portalSessionSecret` | Auto-created on first login if missing |
| `portalOperatorSecret` | Defaults to `webhookSecret` — used for publish from HQ |

---

## 2. Netlify site

From `backoffice/10-portal/`:

```bash
cd backoffice/10-portal
netlify sites:create --name paintnpete-portal   # once
netlify link                                     # pick the portal site
netlify env:set PORTAL_SCRIPT_URL "https://script.google.com/macros/s/…/exec"
netlify env:set PORTAL_OPERATOR_KEY "<same as webhookSecret>"
netlify deploy --prod
```

**Environment variables** (Site settings → Environment variables):

| Variable | Value |
|---|---|
| `PORTAL_SCRIPT_URL` | Apps Script web app `/exec` URL |
| `PORTAL_OPERATOR_KEY` | Shared secret (`webhookSecret`) |
| `STRIPE_SECRET_KEY` | Stripe secret key — see `STRIPE-SETUP.md` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PORTAL_PUBLIC_URL` | Public portal URL for Checkout return links |

You can reuse `BOOKING_SCRIPT_URL` / `WEBHOOK_SECRET` names instead — the function checks both.

---

## 3. DNS

In Wix DNS (where `paintnpete.com` lives):

| Type | Host | Points to |
|---|---|---|
| **CNAME** | `portal` | `paintnpete-portal.netlify.app` |

Netlify already has `portal.paintnpete.com` on the site — SSL provisions after DNS propagates (usually under an hour).

Until DNS works, use https://paintnpete-portal.netlify.app for testing.

---

## 4. Local dev

```bash
cd backoffice/10-portal
netlify dev
```

Open `http://localhost:8888`. Set HQ drawer API if needed:

```javascript
localStorage.setItem("pnp-portal-api", "http://localhost:8888/.netlify/functions/portal-api");
```

---

## 5. Publish an estimate (HQ)

1. Generate the letter in the estimate drawer (price filled in).
2. Tap **Submit to portal** — creates an `ActiveJobs` row, copies the invite URL, and sends the estimate-sent SMS via KaiCalls.
3. Set **Leads** `proposal_sent` if not auto-updated.

Invite URL shape:

`https://portal.paintnpete.com/?job=PNP-2026-0824-smith&t=<token>`

---

## 6. What clients see

| Tab | v1 behavior |
|---|---|
| **Documents** | Written estimate (same letter as HQ) — print/save PDF |
| **Messages** | Text to Noah; you get an email alert |
| **Accept & pay deposit** | One button → Stripe Checkout (50% deposit) |

After deposit clears, status becomes `deposit_paid`, Leads marks `won`, and you get an email alert.

---

## 7. Portal admin (operator)

**URL:** https://portal.paintnpete.com/admin.html (or `/admin.html` on the Netlify URL)

One-time password setup in Apps Script (run as **noah@paintnpete.com**):

1. Open **Paint'n Pete Automation** → **Portal.gs**
2. Function dropdown → **`setupPortalAdmin`**
3. Click **Run** — when prompted, pass your password:
   - In the editor: add a temporary line `setupPortalAdmin("your-secure-password")` and run it, then remove the line; or run from **Executions** with a parameter if your editor supports it.
   - Minimum 8 characters. Stored as a salted hash in Script properties — not in the sheet or repo.

Default admin email is **`noah@paintnpete.com`** (`CONFIG.alertEmail`). Override with Script property `portalAdminEmail`.

**Admin can:**

- See all published portal jobs (status, estimate total, unread client messages)
- Open a job — contact info, portal invite link, estimate dates
- Read and reply to client messages (no email alert on your own replies)
- View the written estimate as the client sees it

Clients still use `/` (index.html). Admin uses `/admin.html` — separate login and session.

To change your admin password, run `setupPortalAdmin("new-password")` again.

---

## 8. Not in v1

- Balance payment at completion (second Checkout session)
- Contract and bill of sale PDFs (attorney review first)
- Parallel estimate-sent email (SMS auto-sends on submit)
- Photo attachments in chat

See `portal.md` for the full roadmap.
