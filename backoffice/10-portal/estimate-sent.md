# Estimate-sent messages (portal invite)

Sent when Noah publishes an estimate — **not** at booking. Booking SMS stays
the calendar confirmation only.

Company name and phone resolve from `../config/business-profile.yml`. Replace
bracketed tokens at send time.

---

## SMS (KaiCalls)

Keep under ~320 characters when possible; the portal URL is required.

> [First name], your Paint'n Pete estimate is ready. Claim your client portal to view it and message us: [portal_url]
>
> Questions? Call [phone].

**Tokens**

| Token | Source |
|---|---|
| `[First name]` | Lead / ActiveJobs `client_name` |
| `[portal_url]` | ActiveJobs `portal_url` (invite link with token) |
| `[phone]` | Config `phone` |

**Do not** put payment card details or Stripe secrets in SMS.

---

## Email (optional same-day)

**From / Reply-To:** `clientEmail` (noah@paintnpete.com)  
**Subject:** Your estimate is ready — Paint'n Pete

```
[First name],

Thanks for walking the job with me. Your estimate is ready in your client portal:

[portal_url]

There you can:
- Download the estimate PDF
- Create your account for messages and color confirmation
- Pay the deposit by card when you're ready to schedule

If anything looks off, reply to this email or call me on [phone].

[Operator]
Paint'n Pete
```

---

## Walkthrough prompt (spoken)

Use at the end of the estimate visit, before or as the text goes out:

> I'll text you a link in a few minutes. Create your portal account there —
> that's where you'll get the estimate PDF, we can confirm paint colors, and
> you can put the deposit down when you're ready to lock the schedule.

---

## Wiring

1. HQ estimate drawer **Submit to portal** publishes the estimate and writes ActiveJobs.
2. Apps Script sends this SMS via KaiCalls (`sms:write`) on publish — same `kaiCallsApiKey` as booking.
3. Parallel email optional; SMS is the primary invite.
4. Idempotency key: `estimate-sent-[job_number]-[attemptId]` — one key per
   publish call so accidental retries of the same submit do not double-text,
   while intentional re-publish can send a fresh invite SMS.
