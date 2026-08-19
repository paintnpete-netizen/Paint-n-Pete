# Kai — the phone layer

[KaiCalls](https://kaicalls.com) answers the line 24/7, runs an intake
conversation, books onto Google Calendar, texts missed callers back, and sends
Noah a transcript and lead summary within seconds.

It takes over the parts of this back office that happen **on the phone**. What
it does not do is everything that happens after a consultation is booked —
proposals, follow-up, costing, reviews. Those stay here.

---

## What Kai replaces

| Was | Now |
|---|---|
| Standard response 2 — missed-call text-back | Kai, automatically |
| The five-minute standard, for calls | Kai answers in about 2 seconds |
| Workflow 3 — consultation booking, calendar event | Kai books onto Google Calendar |
| SMS alerts, which Apps Script cannot send | Kai texts the lead summary |

That last row closes the one real gap in `../07-automation/DEPLOY.md`.

## What Kai does not replace

Proposal follow-up at day 3, 8, and 21. The review engine. Job costing. Close-rate
tracking. Objection handling in a driveway. Kai's job ends at the booked
appointment; the money is made after it.

**Kai is not the system of record.** It knows who called and what they wanted.
It does not know that a proposal went out on the 14th, that the job was won at
$18,400, or that the client is due a review request tonight. The `Leads` tab
still holds all of that — see the sync section below.

---

## Configuring Kai

Kai learns your business from a description you give it. Everything it needs is
already in `../config/business-profile.yml` and
`../01-foundation/business-brief.md` — paste from those rather than writing new
answers, so the phone says the same thing as the website and the proposals.

**Franchise note:** this is the whole configuration procedure for a new
operator. Swap the config file, re-paste, done.

### Tell Kai

- Company, owner, service area — Pinellas and Hillsborough
- The five services
- The four product lines
- Prep-first philosophy: prep is most of the job, coatings cure on their own
  schedule, products chosen for surface and exposure
- Tone: direct, craftsman, no hype, no exclamation points
- What you decline to do — **still `todo` in config.** Until it's filled in, Kai
  will happily take an intake call for work you don't want.

---

## The three rules Kai must follow

**1. Never quote a price. Not even a range.**

This is the single most important instruction. Kai will otherwise try to be
helpful, and a number given on the phone becomes the number the client
remembers, regardless of what the written proposal says later.

Give Kai the substance of standard response 3 from `standard-responses.md`:

> I can't give you a number without seeing the space — and honestly, anyone who
> does is guessing. Noah quotes after a walkthrough so the price is itemized and
> real. Can I get you on the calendar?

**2. Decline out-of-area work gracefully.** Response 4 in `standard-responses.md`.
Needs the service-area boundary, which is `todo` in config.

**3. Escalate rather than improvise.** If a caller asks something Kai wasn't
told — warranty terms, licensing, whether you'll work with their designer, a
complaint about existing work — take a message and flag it. A confident wrong
answer on the phone in your company's name is worse than a callback.

---

## The intake conversation — six questions, not twelve

`intake-form.md` has twelve questions. **Do not give Kai all twelve.** Twelve
questions is a fine web form and a terrible phone call — people abandon it, and
Kai's job is to book the appointment, not to complete the file.

Kai asks these six:

1. What kind of project — interior, exterior, cabinets, repair, commercial
2. Where is the property (address and ZIP — also the service-area check)
3. Roughly what's involved — which rooms, or the whole exterior
4. Timeline — how soon
5. Budget range, as a bracket
6. How did you find us

Then it books the consultation.

**The other six questions go in the Google Form sent after booking** — home age,
known problem areas, whether it's occupied, colour direction, who else decides,
and what a previous painter did that they didn't like. Those need thinking time
anyway, and the answers are better written than spoken.

This split is better than either tool alone: Kai gets the caller booked while
they're motivated, and you still arrive knowing everything.

---

## Getting Kai's leads into the Leads tab

Kai integrates through Zapier. Build one Zap:

**Trigger:** new lead in KaiCalls → **Action:** create row in the `Leads` tab of
*Paint'n Pete — Back Office*

Map to the existing columns: `date_received`, `name`, `phone`, `email`,
`source`, `project_type`, `address`, `zip`. Set `status` to `new`, or
`consultation booked` if Kai booked one.

Once that row exists, the whole existing chain works unchanged — you enter the
proposal date, and the day 3, 8, and 21 reminders fire from `Code.gs` exactly as
built.

**Zapier's free tier allows 100 tasks a month**, which at one task per lead is
comfortably enough. Worth knowing before it silently stops.

**If you'd rather not add Zapier**, type the leads in by hand from Kai's texts.
It's a minute a lead. The follow-up automation cares that the row exists, not
how it got there.

---

## Then turn off the overlap

Once Kai is live:

- Remove the `onFormSubmit` trigger only if the website form also routes through
  Kai. If the site form still posts to Google Forms, leave it — Kai handles the
  phone, Apps Script handles the web.
- `sendIntakeForRow` in `Code.gs` becomes redundant for phone leads, since Kai
  books and confirms. Keep it for leads that arrive by form or referral.
- `CONFIG.smsGateway` can stay empty. Kai is your text alert.

---

## Audit of the live account — 2026-08-19

Read directly from the KaiCalls account (business `db4a5647`, agent `Kai`,
created 2026-07-23). 8 calls, 6 leads.

### Alerts — FIXED 2026-08-19

No alert phone, no alert email, SMS alerts disabled, zero escalation rules.
No text was ever sent about any of the six leads.

Email is a partial exception: the dashboard falls back to "the emails of all
users associated with this business" when the field is blank, so lead emails
may have been reaching the account signup address. They were not reaching a
phone, and they were not being acted on.

**Now configured** (verified through `get_operational_settings`):

- Alert phone `+17279021986`, SMS alerts enabled
- Alert email `paintnpete@gmail.com` — set explicitly rather than relying on
  the fallback. Change to the Workspace address once it exists.
- Four escalation rules, each firing an urgent text and email:
  1. Caller wanted an estimate or callback but no appointment was booked
  2. Caller needs work urgently, or said tomorrow / this week / as soon as possible
  3. Caller has a complaint or problem with work already completed
  4. Caller pushed for a price and did not book, or seemed unhappy at getting
     no price

Rule 1 is the direct guard against the lead below. Rule 4 is the early warning
on the no-price rule — if Kai is losing people at the price question, it shows
up on the first caller rather than the tenth.

Scenario text is capped at about 100 characters, so rules have to be short.

### The urgent one

**Every lead is still status `new`. None has been worked.**

Lead `f057c7cc`, phone **+1 863 449 0446**, captured 24 July: a real caller
wanting a full exterior repaint on an occupied house in St. Petersburg, no
repairs needed, asking for a morning estimate "tomorrow" and a callback by 5pm
that day. Kai asked four separate times for a callback number and never got one
— but **caller ID captured it anyway**, so the lead was recoverable the whole
time. Nobody called. It has been sitting 26 days.

This is precisely the failure the follow-up automation exists to prevent, and it
was happening before the automation existed.

The corrected configuration addressing everything below is drafted in
`kai-agent-prompt.md`, unapplied, pending Noah's review.

### Configuration problems found in the transcripts

**1. Kai gets the company name wrong.** Across two calls it said "Peyton Pete",
"Paint and Pete", and "paints and peas". The correct pronunciation is
"Paintin' Pete" — PAYN-tin-PEET. The account is registered as "Paint N Pete",
which is itself part of the cause: text-to-speech reads that literally. The
first three seconds of every call currently misname the business.

**2. It asks for the phone number far too late.** In the 178-second call the
first request came at 130 seconds, after scope, address, and timing. Ask for the
number immediately after the name — everything else is recoverable, that isn't.

**3. It stacks two or three questions per turn.** "About how large is the house
or how many sides per square feet need painting. Also is the house currently
occupied?" The caller answered the second and dropped the first, and Kai never
recovered the house size. One question per turn.

**4. It takes messages instead of booking.** It closes with "I'll pass your
request to the team, they'll follow up soon" rather than offering slots. The
calendar booking described above is not actually configured — which is why a
caller who asked for "tomorrow morning" left without an appointment.

**5. The recording disclosure plays twice**, at 2.6s and again at 11.3s,
burning the first 15 seconds before a caller is asked anything.

**6. It offers "a free estimate"** as the opening question. Confirm that is the
intended offer — it is a commitment being made on your behalf on every call.

**7. Address readback is garbled.** One call read a confirmed address back as
"Eno Avnandar, you five 18th street south". Reading a mangled address back to a
customer undermines the professionalism the rest of the call earns.

### The phone number problem — found 2026-08-19

`list_numbers` returns exactly one number on the account:

```
+17623162584 | agent unassigned | business db4a5647
```

Three separate problems in one line.

**1. It is not your number.** 727-902-1986 is not on the KaiCalls account at
all. Unless that line is forwarding to 762-316-2584, callers to your published
number never reach Kai.

**2. The area code is wrong.** 762 is Georgia. A St. Petersburg painting
company answering on a Georgia number costs trust before the call even starts,
and it is the kind of detail a homeowner comparing three contractors notices.
Either port 727-902-1986 in (`/dashboard/phone-system/porting`) or buy a 727
number and forward to it.

**3. No agent is assigned to it.** The dashboard banner says Kai is live, and
the API says the number has no agent attached. Those disagree, and the
disagreement is worth resolving before trusting either. It is a plausible
explanation for the 18-day silence.

### Trial minutes — the account will stop answering

The dashboard reads **19 of 25 free trial minutes left**, no card on file.
Eight calls have consumed six minutes. At the observed rate of roughly 45
seconds a call, that is around twenty more calls before Kai stops.

Every fix in this document assumes Kai is answering. Decide on the paid plan
before the minutes run out, not after a missed week.

### Also worth checking

**No calls since 1 August** — 18 days silent. See the phone number problem
above for the likely cause.

**The no-price rule is untested.** No caller in these 8 calls asked for a
ballpark, so we don't yet know what Kai would say. Test it deliberately.

**Two of the 8 calls were tests** — one by Noah (lead `a0ff6cba`) and one
apparently by the KaiCalls developer (lead `4818939c`, "Connor"). Real inbound
volume is lower than the raw count suggests.

---

## Known issue — MCP connection from Cursor

**Status: open. Reported to the KaiCalls developer 2026-08-19, fix in progress.**

Kai's MCP connector works from Claude but fails from Cursor:

```
Unsupported redirect_uri: cursor://anysphere.cursor-mcp/oauth/callback
```

Their authorization server rejects Cursor's callback. Their published metadata
at `/.well-known/oauth-authorization-server` advertises a
`registration_endpoint`, so Dynamic Client Registration exists — which suggests
the server enforces a static redirect allowlist that DCR results don't feed
into, rather than Cursor being specifically missing from a list.

Cursor also opens an RFC 8252 loopback listener on `localhost:8787` during the
same flow, so accepting loopback redirects would fix every desktop MCP client
at once.

**Meanwhile:** use an API key instead of OAuth. In `~/.cursor/mcp.json`, *not*
in this repo:

```json
{ "mcpServers": { "kaicalls": {
    "url": "https://www.kaicalls.com/api/mcp",
    "headers": { "Authorization": "Bearer kc_live_..." }
} } }
```

Scopes `agents:read` and `calls:read`. Never commit the key.

### Re-testing after they ship a fix

Remove the `headers` block so it falls back to OAuth, reload Cursor, then read
what the client actually reported:

```bash
rg -i "kaicalls|redirect_uri" \
  "$HOME/Library/Application Support/Cursor/logs"/*/mcpprocess.log | tail -20
```

`Unsupported redirect_uri` means it's still open. A clean connect with no
redirect error means it's fixed, and the API key can be retired.

---

## What to check in the first week

Call your own number and listen to the whole conversation. Twice — once as a
straightforward interior enquiry, once asking for a ballpark price.

The second call is the one that matters. **If Kai gives you any kind of number,
stop and fix the configuration before it does that to a real client.**
