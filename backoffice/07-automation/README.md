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

**⛔ Workflow 1 does not fire for website leads.** Audited 2026-08-19: the
contact form on paintnpete.com posts to **Netlify Forms**, which does not write
to Google Sheets and cannot trigger Apps Script. So a homeowner who fills in the
form gets no acknowledgment, appears in no Leads row, and generates no text
alert — the submission sits in a Netlify inbox instead.

The trigger here is `onFormSubmit` on a linked **Google Form**, which is a
different form that does not exist yet. Both halves are real; they are just not
connected to each other.

**The fix is written and waiting to be deployed.** `doPost` in `Code.gs` accepts
Netlify's webhook payload and produces the same Leads row, acknowledgment, and
alert as a Google Form submission would. Step 6 of `DEPLOY.md` connects it.

Do the first part of that step regardless of when you deploy: open the Netlify
Forms inbox and see what is sitting in it. Those are leads nobody answered. See
`../09-website/live-site-audit.md`.

**Kai owns the phone.** Calls are answered, qualified, and booked by KaiCalls,
which also sends the SMS lead alert that Apps Script cannot. That supersedes
workflow 3 and the missed-call path — see `../03-leads/kai-setup.md`. Web form
leads still run through workflow 1 here.

**Reminders alert Noah — they never message a client automatically.** Every
follow-up, review request, and check-in is drafted by a human before it sends.
An automated system that emails clients in your voice is how the last ten
percent stops being yours.
