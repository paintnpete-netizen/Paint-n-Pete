# The Master Workbook

One Google Sheet, three tabs. Everything in `Code.gs` reads and writes these,
and the column positions are referenced by number — so **add columns at the end,
never in the middle**, or update the `LEAD` and `JOB` maps in the script.

| Tab | Source CSV | What it holds |
|---|---|---|
| `Leads` | `../03-leads/leads-tracker.csv` | Every inquiry, from first contact to won or lost |
| `Jobs` | `../04-visibility/review-tracker.csv` | Completed work, review status, repaint windows |
| `Scorecard` | `scorecard.csv` | The four monthly numbers |

Job costing stays separate — one file per job, not a tab here.

---

## Build it

1. <https://sheets.google.com> → blank sheet → name it
   **Paint'n Pete — Back Office**
2. Rename the first tab to `Leads`, then **File → Import → Upload** →
   `leads-tracker.csv` → **Replace current sheet**
3. Add a tab named `Jobs`, import `review-tracker.csv` the same way
4. Add a tab named `Scorecard`, import `scorecard.csv`

Tab names are case-sensitive and must match exactly. The script throws a clear
error naming the missing tab if they don't.

---

## Leads

Statuses, in order: `new` → `contacted` → `consultation booked` →
`proposal sent` → `won` / `lost`.

Two columns do real work beyond record-keeping:

**`proposal_sent`** drives the entire follow-up sequence. Enter a real date the
moment a proposal goes out. If this is blank, no reminders fire and the quote
goes quiet — which is precisely the failure this system exists to prevent.

**`outcome`** stops the reminders. Fill it in as soon as you know, win or lose.
Leaving it blank means chasing a job you already lost.

The `followup_d3` / `d8` / `d21` columns are written by the script as
`reminded [date]` when it alerts you. Overwrite with the real date you sent, or
leave it — either way it won't remind you twice.

---

## Jobs

`completed_date` triggers the review request reminder. `project_type` decides
the repaint window: anything containing "exterior" gets 5 years, everything
else 4.

`batch_day` is only used for the one-time backlog push described in
`../04-visibility/review-engine.md`. Leave it blank going forward.

---

## Scorecard

One row per month. Four numbers, thirty seconds:

**Inquiries received · proposals sent · jobs won · reviews earned.**

Close rate calculates itself. That figure is what separates a lead problem from
a pricing problem — a quiet month with a high close rate means not enough
people are finding you, while a busy month with a low one means the proposals
or the pricing need attention. Completely different fixes, and without this
column you cannot tell them apart.

---

## One habit

Update `Leads` at the end of each day. Two minutes then is the difference
between real numbers and a guess at the end of the quarter.
