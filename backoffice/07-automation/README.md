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

**Depends on:** the Leads sheet and past-client sheet (schemas to be defined
here), and workflow 1 additionally depends on the website rebuild, since the
current Wix site can't post to an endpoint we control.

**Foundation to build first:** the Sheets schemas. Four of the six workflows read
or write them, and getting the columns right once avoids migrating later.
