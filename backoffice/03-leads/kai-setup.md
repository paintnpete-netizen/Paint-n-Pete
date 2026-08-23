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

## Incident — ERROR voicemail on 762, diagnosed 2026-08-20

Noah called **+1 762-316-2584 directly** and got an ERROR voicemail. Live API
read the same afternoon (business `db4a5647-08ca-4cb9-b9e6-1bd232a02d75`,
agent Kai `4cf219a6-8468-4f2f-b757-217918365ffd`):

| Check | Live result |
|---|---|
| `list_numbers` | `+17623162584` **agent unassigned** (only number on the account) |
| `list_agents` | Kai exists, voice, vapi/Elliot |
| `list_recent_calls` | 8 calls, **newest 2026-08-01**. Today's call is not there |
| `list_voicemails` | empty |
| Observability errors | none for today (the call never reached the runtime) |

**Root cause:** 762 is on the account but not routed to Kai. The 2026-08-19
writeup that called "agent unassigned" a red herring is **wrong for inbound
now**. Combined with the last-known dashboard routing (**Ring Team First**,
no team members / no fallback agent bound), a direct call has nowhere to go.
Twilio/KaiCalls plays an error voicemail instead of answering. That is why
the attempt never created a call, a lead, or a voicemail transcript.

The agent itself is not dead: the eight calls through 1 August were handled
by Kai. The inbound *path* on 762 is what is broken.

**What was changed on the live account: nothing.** Attempts to fix it:

- `attach_number` → Kai: denied (`numbers:write` missing)
- `update_agent_config` / prompt apply: denied (`agents:write` missing)
- Cursor browser MCP: tabs do not persist (`No browser tab available`)
- Chrome dashboard: **sign-in wall** at `/dashboard/phone-system`. Login is
  `paintnpete@gmail.com` (never `kanwalconsulting297@gmail.com`). Password
  was not requested. Stopped here per policy.

The API key in Cursor is read-only (`agents:read` / `calls:read` / numbers
read). MCP auth itself works; writes do not.

### What Noah has to do (about 90 seconds) so the test call works

1. Sign in at [kaicalls.com/dashboard](https://www.kaicalls.com/dashboard)
   as **paintnpete@gmail.com**.
2. **Phone System → Call Routing** (or Phone Numbers).
3. **Configure** `+1 762-316-2584`.
4. Set routing to **AI-Only / Direct** (Kai answers immediately — not Ring
   Team First). Fallback agent: **Kai**. Save.
5. Call **762-316-2584** from any phone that is not 914-357-1448.

**Resolved 2026-08-20 via dashboard (paintnpete@gmail.com):** 762 is assigned
to Kai and routing is **Send Straight to Kai**. Live `list_numbers` now reads
`+17623162584 | agent 4cf219a6-…`. Dashboard card: "This number sends every
call straight to Kai."

Intended customer path: call **727-902-1986** → Noah answers if he can →
missed-call forward to 762 → Kai. Do **not** set 762 back to Ring Team First
pointing at 727 — that loops (762 rings 727, 727 forwards to 762) and is what
produced the error voicemail.

Kai rules published the same day: collect name + service, no prices, say
Paintin' Pete, text https://www.paintnpete.com/contact, promise a follow-up
call within 1 business day. Saved link exists (`kaicalls.com/l/ZRWyz1UI` →
contact page). **Text callers / Send saved links still will not stay on after
Save** — 2026-08-20 9:57 PM ET inbound: Kai promised the text, sent nothing
(zero tool calls, no SMS). A2P is already enabled via KaiCalls. Staff alerts
already go to +17279021986 and noah@paintnpete.com.

Do not port 727. Do not buy another number.

### What he should hear (after routing is Direct)

Greeting is live as: “Hi, this is Kai with Paintin' Pete. May I get your name
and what kind of painting service you need?”

**Pronunciation clinic published 2026-08-20:** four TTS overrides, all
`PAYN-tin PEET`, covering `Paintin' Pete`, `Paint'n Pete`, `Paint N Pete`,
and `Paint and Pete`. The 8:03 PM ET inbound still said “Paint and Pete” /
“paint in peat” because the apostrophe was being read aloud; the overrides
are the voice-layer fix. Call **762-316-2584 from a phone that is not 727**
to confirm.

If it works: Kai talks and says Paintin' Pete, not Paint and Pete.
If it fails: still the old name, error voicemail, or dead air — say which.

Optional second call: ask for a ballpark price. Kai must not give a number
(see the no-price rule). That rule has never been tested on a live caller.

---

## Audit of the live account — 2026-08-19

Read directly from the KaiCalls account (business `db4a5647`, agent `Kai`,
created 2026-07-23). 8 calls, 6 leads. **Re-read 2026-08-20: still 8 calls,
6 leads; nothing newer.**

### Alerts — FIXED 2026-08-19

No alert phone, no alert email, SMS alerts disabled, zero escalation rules.
No text was ever sent about any of the six leads.

Email is a partial exception: the dashboard falls back to "the emails of all
users associated with this business" when the field is blank, so lead emails
may have been reaching the account signup address. They were not reaching a
phone, and they were not being acted on.

**Now configured** (verified through `get_operational_settings`):

- Alert phone `+17279021986`, SMS alerts enabled
- Alert email `noah@paintnpete.com` — customer and vendor interaction only.
  `paintnpete@gmail.com` is admin-only and must not receive call or lead
  mail. Changed 2026-08-20 after a test-call notice landed on Gmail.
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

**3. "Agent unassigned" is live and is the inbound break (corrected 2026-08-20).**
On 2026-08-19 the dashboard showed **Ring Team First**, and that was read as
"nothing is broken — Kai is just the fallback." Noah then called 762 directly
and got an **ERROR voicemail**. Re-read the same day: the number is still
`agent unassigned`, the call never entered `list_recent_calls`, and there is
no voicemail record. Ring Team First with nobody to ring and no agent bound
is a dead route, not a safety net. Fix: attach Kai and set routing to
**AI-Only / Direct**. See the 2026-08-20 incident section above.

### What actually decides whether callers reach Kai

`+17279021986` appears in two places, and neither one answers calls:

- **Business profile phone** — a record on the account, not a routing target.
- **Admin Phone Access, "Noah", Active** — lets you call Kai's number from that
  phone and manage the agent by voice. Not an answering line.

So the only path from a customer to Kai is **call forwarding configured at your
carrier**, from 727-902-1986 to 762-316-2584. KaiCalls cannot see whether that
exists, and the dashboard offers a "How to Forward Calls" guide precisely
because it happens outside the platform.

**Resolved 2026-08-19, then broken 2026-08-20:** Noah has conditional
forwarding from 727 → 762 when he doesn't answer. That explained the silence
through 1 August. It does **not** explain today's ERROR voicemail on a
*direct* call to 762. That path is dead until Kai is attached and routing is
AI-Only / Direct. See the incident section above.

---

## Decision — port 727-902-1986 into KaiCalls

Chosen 2026-08-19. Kai becomes the front door on the published number, with
routing set so Noah still gets first crack at live calls.

### Read this before starting the port

**Porting moves the number out of your carrier account and into KaiCalls.**
After it completes, 727-902-1986 is a KaiCalls line. If that number is
currently the SIM in your pocket, your handset needs a different number for
personal and outbound use, and you keep taking business calls by having Kai's
routing ring you first.

**Resolved 2026-08-19: this is the clean case.** 914-357-1448 is Noah's
handset; 727-902-1986 is a separate business line. Porting the business line
changes nothing about the phone in his pocket, and afterwards the business
number is answered by Kai directly rather than reached through a forwarding
rule that can silently break.

### The website is already clean — checked, not assumed

Both earlier audits recorded the site as publishing 914-357-1448 in its
LocalBusiness schema. **That is no longer true.** Fetched live 2026-08-19:

| Surface | Value |
|---|---|
| JSON-LD `telephone` | `+17279021986` |
| `tel:` links | `tel:+17279021986` — the only one on the page |
| Visible copy | 727-902-1986, five occurrences |
| Any occurrence of 914 | none |

The site is also no longer Wix. It serves from Netlify as flat `.html` pages
with `HousePainter`, `FAQPage`, and `AggregateRating` structured data, so the
rebuild has already happened.

**So website callers already reach the business line**, and from there the
existing conditional forwarding hands the missed ones to Kai. No fix needed
here.

### Where 914 could still be published

Searched the open web for the personal number on 2026-08-19. Every public
listing that surfaced carries 727-902-1986 and none carries 914: Nextdoor
(which lists it four times, plus `+17279021986`), localitybiz, and the Lantern
directory. Nothing to clean up in the places a search can reach.

One caveat: the search engine's cached copy of paintnpete.com still shows Wix
page furniture, so the index is serving a stale version of the site. That
resolves on its own as the new pages are recrawled.

Still unchecked, because they need account access:

- **Google Business Profile** — the highest-volume caller source for a local
  trade, and the GBP URL is still `todo` in config. Check this first.
- Facebook and Instagram profile contact fields
- Yelp, Angi, Thumbtack, HomeAdvisor, BBB — any directory claimed but not
  indexed under this search
- Old quotes, invoices, business cards, vehicle signage
- The Google Form and any email signature

One number, everywhere: **727-902-1986**.

### Prerequisites — gather before submitting

- Current carrier account number and the port-out PIN
- Billing name and service address **exactly** as the carrier has them; a
  mismatch is the most common rejection reason
- A recent bill showing the number
- **Do not cancel the carrier line.** Cancelling before the port completes
  releases the number and it can be lost permanently.

### Sequence

1. **Paid plan — done 2026-08-19.** Solo, card on file, $0 invoice paid.
   Trial converted to a 7-day Solo trial (ends 8/26/2026) with **148 of 150
   minutes left**, then $69/month. Safe to port after caller-ID and a handoff
   destination exist; do not port tonight.
2. Keep the existing conditional forwarding running until the port completes —
   it is the safety net during the transition.
3. Submit the port at `/dashboard/phone-system/porting`. Expect days, not hours.
4. After it lands, set routing deliberately. *Ring Team First* pointed at
   Noah's handset reproduces today's behaviour with none of the forwarding
   fragility. *Kai answers first* is the change worth making only once the
   corrected prompt is live and tested.
5. Add a human handoff destination so Kai can transfer a live caller.
6. Verify caller ID, currently *Pending verification*.
7. Release the Georgia number `+17623162584` once nothing depends on it.

### Then correct the published record

Once the port is done, 727-902-1986 is the single canonical number everywhere.
The website already matches. The audit list above is what remains.

### Two more gaps found on the routing page

**Caller ID is unverified.** "0 of 1 numbers are caller-ID verified", and the
number shows *Pending verification*. Affects whether a name shows when Kai
calls out, which affects pickup rates.

**No human handoff destinations.** The transfer suggestion in
`kai-agent-prompt.md` cannot work until one is added — Kai has nowhere to send
a caller who asks for a person.

### Good news: SMS will actually send

Compliance Center reads *All systems operational*, A2P 10DLC status
**KaiCalls Pool**. The alerts configured above are not going to be silently
blocked by 10DLC registration, which was the obvious next thing to worry about.

### Trial minutes — FIXED 2026-08-19

Card on file. Plan **Solo**. Invoice `2026-08-20` for **$0**, status paid.
Usage & Billing reads: trial ends 8/26/2026, 2.0 / 150 min used, next payment
$69. The 19-of-25 free-minute cliff is gone. Kai will keep answering.

Do not start the number port until caller ID is verified and a human handoff
destination exists. The plan no longer blocks the port; those two still do.

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

**Status 2026-08-20: OAuth/API-key reads work. Writes do not.**

`mcp_auth` succeeded. `list_numbers`, `list_agents`, `list_recent_calls`,
`get_operational_settings` all return live data. Mutations fail with
`Missing required scope: numbers:write` / `agents:write`. The key was issued
read-only on purpose (2026-08-19). Dashboard login is required to attach the
number or change routing. Cursor's browser MCP cannot open a tab in this
session (`No browser tab available` / view IDs vanish immediately).

Older note (2026-08-19), still true if the API key is removed and OAuth is
retried:

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

**Do this first (2026-08-20):** sign in as paintnpete@gmail.com, set 762 to
AI-Only / Direct with Kai as fallback, then call **762-316-2584**. Do not
call 914-357-1448. Do not wait on a port.

Once Kai actually answers, call twice — once as a straightforward interior
enquiry, once asking for a ballpark price.

The second call is the one that matters. **If Kai gives you any kind of number,
stop and fix the configuration before it does that to a real client.**
