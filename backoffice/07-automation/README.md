# Automation — Guide §7

Built on **Google Apps Script**, not Make.com. Rationale in `../README.md`: the
guide's Make.com free tier caps at two active scenarios against six workflows,
while Apps Script is included with Workspace, uncapped, native to
Sheets/Forms/Gmail/Calendar, and version-controllable here as code.

Because the cap doesn't apply, all six workflows can be built. Build order still
matters — the first one is the one that costs real money when it fails.

| # | Trigger | What happens |
|---|---|---|
| 1 | Website form submitted | Instant acknowledgment email, row appended to Leads sheet, text alert to Noah's phone |
| 2 | Proposal sent (date entered) | Day 3 / 8 / 21 follow-up reminders fire automatically |
| 3 | Consultation booked | Intake form sends, responses land in Leads, calendar event created with address and answers |
| 4 | Job marked complete | Review request reminder that evening, follow-up in 2 days if no review appears, client added to past-client list |
| 5 | Every Monday 7:00am | Reminder to run the weekly content batch and work the follow-up list |
| 6 | Client painted 3+ years ago | Seasonal check-in queued for review — interior flagged at year 4, exterior at year 5 |

| File | Purpose |
|---|---|
| `sheets-setup.md` | Build the master workbook — do this first |
| `Code.gs` | All six workflows, ready to paste into Apps Script |
| `DEPLOY.md` | Install, authorise, and set triggers |
| `scorecard.csv` | The four monthly numbers |

**Workflow 1 is live for website leads as of 2026-08-20.** The contact form
still posts to Netlify Forms. Netlify emails `noah@paintnpete.com` and also
POSTs to the Apps Script web app. `doPost` writes a Leads row (`source=website`),
sends the customer an acknowledgment, and alerts `noah@paintnpete.com`.
Estimate times are exclusive: a booked 3:30–6:30 weekday slot is written to
the `Bookings` tab and Google Calendar, then hidden on the contact form.

If a Code.gs change ships, republish the web app as a **new version** or Netlify
keeps hitting the old copy. Slot hiding also needs that new version. Secret
stays in Script properties only. See `DEPLOY.md`.

**Kai owns the phone — when inbound works.** The live agent collects name and
service, does not quote prices, texts `https://www.paintnpete.com/contact`, and
promises follow-up within one business day. Calendar booking is not the live
path. Public inbound on 762 is a developer ticket as of 2026-08-20; do not
keep testing that DID while they work. See `../03-leads/kai-setup.md`. Website
form leads still run through workflow 1 here.

**Reminders alert Noah — they never message a client automatically.** Every
follow-up, review request, and check-in is drafted by a human before it sends.
An automated system that emails clients in your voice is how the last ten
percent stops being yours.
