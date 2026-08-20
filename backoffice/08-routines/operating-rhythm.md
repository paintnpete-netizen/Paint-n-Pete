# Operating Rhythm — Calendar Setup

Put these in Google Calendar as recurring events with the checklist pasted into
the description. A routine that lives in your head is a routine you skip in your
third busy week.

Automation handles the reminding (see `../07-automation/DEPLOY.md`); these events
are the time you've committed to acting on what it surfaces.

---

## Daily — 10 minutes

Three short blocks rather than one. Create all three as recurring weekday events.

### Event: "Inbox sweep" — 7:00am, Mon–Fri, 10 min

```
1. Kai lead summaries from overnight — any new lead into the Leads tab
2. Email, website form, Google Business Profile messages, Instagram DMs
3. Reply to every one before starting work. Standard responses:
   backoffice/03-leads/standard-responses.md
4. Anything urgent that Kai escalated — call back first, before the drive
```

**The rule:** every inbound message gets a reply the same morning, even if the
reply is "I'm on a job today, can I call you at five?" The lead that went cold
for 26 days did so because nobody read the summary.

### Event: "Post" — 12:00pm, Mon–Fri, 2 min

```
Post the day's pre-written caption from the Monday batch.
Tag the neighborhood. Don't write anything new — that's Monday's job.
```

### Event: "Close the day" — 5:30pm, Mon–Fri, 5 min

```
1. Leads tab: update status on anything that moved today
2. Jobs tab: log actual hours against the estimate
3. Photos off the phone into Drive, foldered by job
4. Finished a job today? Send the review text this evening —
   backoffice/04-visibility/review-engine.md
```

---

## Monday — 30 minutes

### Event: "Monday routine" — 7:00am, weekly, 30 min

```
1. CONTENT BATCH (10 min)
   Run the weekly prompt in backoffice/04-visibility/content-engine.md
   against last week's photos. Schedule five captions.

2. FOLLOW-UPS (10 min)
   The Apps Script Monday email lists every proposal at day 3, 8, or 21.
   Work the list. Templates: backoffice/03-leads/follow-up-sequence.md
   Nothing gets skipped because it "feels" dead. Day 21 is often the one
   that converts.

3. OUTREACH (5 min)
   Five commercial or designer contacts.
   backoffice/05-commercial/outreach.md

4. AUDIT (5 min)
   - Did the automations run? Any lead in the sheet with no owner?
   - Google Business Profile: respond to new reviews, publish one post,
     add a photo, reject any suggested edits
```

---

## First Monday of the month — 60 minutes

### Event: "Monthly review" — first Monday, 60 min

```
1. JOB COSTING (20 min)
   Enter actuals for every job closed last month.
   Read the variance by phase. backoffice/02-estimating/job-costing.md
   One question: where did we lose hours, and was it estimating or execution?

2. SCORECARD (5 min)
   Four numbers into the Scorecard tab: inquiries, proposals sent,
   jobs won, reviews earned. The close rate calculates itself.

3. REVIEWS (5 min)
   Current count vs last month. Work the next batch from the backlog
   tracker, respecting the pacing rules.
   Then update the count on the website — it is hardcoded in the homepage
   AggregateRating markup and does not update itself. It sat at 14 while
   Google said 21. backoffice/09-website/live-site-audit.md

4. COMMERCIAL PIPELINE (10 min)
   Every outreach contact — advance, follow up, or close it out.
   Nothing sits at "contacted" for two months.

5. PAST CLIENTS (10 min)
   Anyone hitting a repaint window this month gets the seasonal touch.
   backoffice/../prompt-library.md

6. RESEARCH (10 min)
   Perplexity: product changes, local market, competitor pricing moves.
   backoffice/01-foundation/business-brief.md — does anything need updating?
```

---

## Quarterly — 30 minutes

### Event: "System review" — first Monday of Jan/Apr/Jul/Oct, 30 min

```
1. Re-read config/business-profile.yml. Anything still 'todo'?
   Anything 'verified' that's since changed? Update last_reviewed.
2. Callbacks last quarter — each one is usually a missing SOP step.
   Add or amend one SOP. backoffice/06-crew/
3. Insurance certificate expiry check.
4. Rates: has your burdened labour rate moved? Material costs?
   If yes, the job-costing sheet needs updating before the next proposal.
5. Kai: pull recent transcripts, listen to two, fix what's drifting.
```

---

## The only four numbers that matter early

Inquiries received · proposals sent · jobs won · reviews earned.

Close rate is the diagnostic. If inquiries are up and jobs won is flat, the
problem is the proposal or the follow-up, not the marketing. If inquiries are
flat, the problem is visibility, and reviews are the cheapest fix.

Followers and impressions are decoration until these four are moving.

---

## What to do when you fall off

You will. A busy fortnight in season will eat the Monday routine first.

The order of recovery is: **daily inbox sweep, then follow-ups, then everything
else.** An unanswered lead costs you a job this month. A skipped content batch
costs you nothing you can measure. Do not restart with the content.
