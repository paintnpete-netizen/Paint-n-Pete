# Client Portal Spec

Status: **v1 built** (2026-08-24) — signup, documents, accept, chat. **Stripe deferred.**
Locked decisions: Stripe when payments ship; portal link with estimate-sent SMS;
Florida contractor attorney for contract + bill of sale.

Facts (company name, phone, domain) come from `../config/business-profile.yml`.
Do not hardcode a second operator's identity here.

---

## Why it exists

Two pipelines, one handoff:

```
PROSPECT                         PORTAL                         ACTIVE CLIENT
visit → book → walkthrough       account + estimate PDF         deposit paid
→ estimate drafted          →    accept + pay deposit      →    → schedule → work
                                 chat + docs                    → balance → bill of sale
```

Today the prospect side mostly exists. The active side is deposit language on
the estimate with no collection, no hosted docs, and no client chat. The Jobs
tab is review/repaint tracking — wrong place for active work. This portal is
the bridge, not a third CRM.

---

## Three purposes only

| # | Purpose | Client does | System does |
|---|---|---|---|
| 1 | **Documents** | Download estimate, contract, change orders, bill of sale | Publish versions; mark accepted; everything downloadable as PDF |
| 2 | **Chat** | One simple thread — colors, change orders, scheduling notes | Alert Noah on new message; no bot in this box |
| 3 | **Payments** | Card deposit and balance via Stripe Checkout | Webhook → sheet status; auto bill of sale after final payment |

No marketing chrome. No dashboard clutter. One job room per job; later, one
account can hold multiple jobs.

---

## Hosting and auth

**URL:** `https://portal.paintnpete.com` (preferred) or a sibling Netlify site.
Not on the public marketing deploy path without isolation.

**Auth (v1):** client creates an account when they open the estimate link.

1. Noah sends estimate-sent SMS with portal URL (see `estimate-sent.md`).
2. Link opens signup: email pre-filled from Leads, set password (or magic link).
3. Verify phone with a one-time code to the number on the lead.
4. Land on that job's room: estimate PDF → Accept → Pay deposit.

**Access rule:** magic link / signed token binds the invite to a job id
(`PNP-YYYY-MMDD-lastname`). After account creation, session cookie. No public
browsing of other jobs.

**Operator rule:** Noah uses **portal admin** (`/admin.html`) to supervise jobs and
reply to clients. HQ + Sheets remain the source of truth for publishing and
pipeline status.

---

## Screens (v1)

### A. Signup / sign-in

- Email (pre-filled from invite), password, phone verify
- Sign-in for returning clients
- Single CTA: "Open your estimate"

### B. Job home (three tabs)

1. **Documents** — list with date, version, Download
2. **Messages** — chatbox (text + optional photo attach)
3. **Pay** — amount due + Stripe button; hidden when nothing owed

### C. Estimate accept

- Preview / download estimate PDF (same letter as `../02-estimating/proposal.html`)
- **Accept estimate** (timestamp recorded)
- Then **Pay deposit** (50% of accepted total, or amount set on the job row)

### D. Empty / error

- Expired link, wrong phone verify, paid-in-full thank-you

No separate "settings" for v1 beyond change password.

---

## Document set

| Document | When it appears | Source | Legal gate |
|---|---|---|---|
| Estimate | When Noah publishes / sends | HQ letter → PDF (`../02-estimating/`) | None beyond current exclusions review |
| Contract / work agreement | After accept (or with deposit) | New template | **Florida contractor attorney** |
| Change order | When Noah posts one | Short PDF from agreed chat | Attorney template once |
| Bill of sale / receipt | After final payment clears | Auto from Stripe + job facts | **Florida contractor attorney** |
| Paint / color confirm | Optional mid-job | Checklist or chat confirmation | Soft |

All listed documents are **downloadable**. Estimate reuses the existing letter —
do not redesign it for the portal.

---

## Status machine

Stored on the `ActiveJobs` tab (see `active-jobs.csv`). Portal UI mirrors this.

```
estimate_sent
  → estimate_accepted
  → deposit_paid
  → scheduled
  → in_progress
  → balance_due
  → paid
  → closed
```

Also allow: `lost` / `cancelled` (manual).

**Leads tab** still owns the prospect path through `proposal sent` → `won` /
`lost`. When estimate is sent and the portal invite goes out:

- Leads: `status = proposal sent`, `proposal_sent = date`
- ActiveJobs: new row `status = estimate_sent`, `portal_url` set

When deposit clears: Leads `outcome = won` if not already; ActiveJobs
`status = deposit_paid`.

Do **not** overload the review `Jobs` tab with deposit/BOS columns.

---

## Stripe

**Product:** Stripe Checkout (hosted). No card data on Paint'n Pete servers.

| Event | When | Effect |
|---|---|---|
| Create Checkout Session | Client clicks Pay deposit / Pay balance | Session amount from ActiveJobs |
| `checkout.session.completed` (deposit) | Deposit paid | `status = deposit_paid`, store `stripe_payment_id`, alert Noah, unlock schedule |
| `checkout.session.completed` (balance) | Final paid | `status = paid`, generate bill of sale PDF, attach to Documents |
| `charge.refunded` | Manual refund in Stripe | Flag row; alert Noah; do not auto-delete docs |

**Split:** default 50% deposit / 50% at completion (copy already on the estimate
letter). Override per job via ActiveJobs `deposit_cents` / `balance_cents`.

**Secrets:** Stripe secret key and webhook secret in Netlify env only — never
git. Publishable key may live in portal frontend config.

**Stack note:** add Stripe under `stack` in business-profile when the account
exists (`status: todo` until then).

---

## Chat

- One thread per job
- Client and Noah only (no Kai bot in this box)
- Text + optional image attach (color chips, damage)
- New client message → email + SMS alert to Noah (`alertEmail` / staff phone)
- Change-order agreement in chat can spawn a downloadable change-order PDF
  after Noah confirms

KaiCalls stays on the phone line and booking/estimate SMS. It is not the
document host and not the payment rail.

---

## Estimate-send handoff (from the walkthrough)

**At the estimate (in person or on a call):**

> I'll text you a link. Create your portal account there — that's where you'll
> get the estimate as a PDF, we can confirm colors, and you can put the deposit
> down when you're ready.

**After Noah publishes the estimate from HQ / drawer:**

1. PDF archived (Drive or portal storage)
2. ActiveJobs row created / updated
3. Estimate-sent SMS + email fire with portal link (`estimate-sent.md`)
4. Leads `proposal_sent` set; follow-up sequence still applies until won/lost

Booking confirmation SMS is **unchanged** (thanks + calendar link). Portal
link is **not** on the booking text.

---

## Technical shape (fit current tools)

| Layer | Role |
|---|---|
| Portal UI | Small Netlify site (`portal.paintnpete.com`) |
| Netlify Functions | Auth helpers, Stripe Checkout session, webhooks, doc download URLs |
| Google Sheets | SoR — Leads + **ActiveJobs** (new tab) |
| Apps Script | Optional: alerts, follow-ups; not the public face of the portal |
| HQ estimate letter | Source PDF for estimate documents |
| KaiCalls | Estimate-sent SMS only |
| Stripe | Checkout + webhooks |

**Reuse:** `JOB` JSON + `proposal.html` for estimate rendering. Prefer hosting
the printed PDF over rewriting the letter.

**Website boundary:** portal code lives in its own Netlify project (or a clear
`/portal` isolate), not mixed into marketing deploys by accident.

---

## Build order

1. This spec + ActiveJobs tab in the workbook (`active-jobs.csv`)
2. Stripe account (test mode) + Checkout + webhook stub
3. Portal v0 — invite link, signup, estimate PDF download
4. Wire HQ "Send estimate" → SMS + publish PDF + sheet rows
5. Accept + deposit Checkout
6. Chat + Noah alerts
7. Attorney-reviewed contract + bill of sale templates → portal
8. Balance payment → auto bill of sale

Do not start the review engine or franchise packaging as a dependency of this
work.

---

## Out of scope for v1

- Full account SSO / Google login (password + phone verify is enough)
- In-app e-sign product (accept timestamp + PDF download; wet ink still OK)
- Crew / subcontractor access
- Multi-currency or financing
- Replacing KaiCalls for voice

---

## Open items (Noah)

- [ ] Create Stripe account under business entity (Kanwal Consulting LLC DBA Paint'n Pete)
- [ ] Retain Florida contractor attorney for contract + BOS
- [ ] Decide portal domain DNS (`portal.paintnpete.com`)
- [ ] Where PDFs live at rest (Drive folder vs portal object storage)
