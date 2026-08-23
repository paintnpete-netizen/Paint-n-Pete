# Job Costing

This is the difference between quoting from feel and quoting from evidence. It's
also what makes commercial bidding survivable, because a GC will happily take
your optimistic number and hold you to it.

Two importable sheets in this folder:

| File | Purpose |
|---|---|
| `job-costing-estimate.csv` | Price a job before you quote it |
| `job-costing-actuals.csv` | Record what really happened, per job |

---

## Import

1. <https://sheets.google.com> → blank sheet → name it **Job Costing — [CLIENT]**
2. **File → Import → Upload** → `job-costing-estimate.csv` → **Replace current sheet**
3. Add a second tab, import `job-costing-actuals.csv` the same way
4. Formulas arrive live. Keep one copy per job; duplicate the file each time.

Empty rows show zeros. That's intentional — it keeps the formulas free of
string-handling that breaks on import.

---

## Using the estimate sheet

The **letter** is priced in the HQ drawer from `rates.js` × measurements. Use
this sheet when you want a cost-build (hours, burden, margin) to check a
quote, and always for actuals after the job.

Fill the white columns per area: **Area, Surface, Sq ft, Prep level, Rate**.
Everything else calculates.

Under **SETTINGS**, four numbers drive the whole sheet:

**Burdened labor rate** is not the wage. It is wage plus payroll tax, workers'
comp, insurance, vehicle, and equipment, divided by billable hours. If you're
using the hourly wage here, every job you quote is underpriced and the sheet
will cheerfully confirm it.

**Overhead %** covers rent, phone, software, and your own unbilled time.

**Target gross margin** — see the trap below.

**Crew size** only affects the calendar-days figure, not cost. Cost is total
man-hours regardless of how many people work them.

---

## The margin trap — worth two minutes

The sheet computes `price = total cost ÷ (1 − margin)`. That is margin.

Most contractors instead do `cost × (1 + margin)`. That is markup, and it is not
the same number.

On a $10,000 job with a 45% target:

| Method | Price | Actual gross margin |
|---|---|---|
| Margin — `10,000 ÷ 0.55` | **$18,182** | 45% |
| Markup — `10,000 × 1.45` | $14,500 | 31% |

Same intention, $3,682 difference, and the second one leaves you wondering why a
"45% business" never has any money in it. The sheet does this correctly. Don't
replace the formula with a markup.

---

## Production rates — leave them blank at first

The **Rate** column is square feet per hour, and it is the number the whole
estimate pivots on.

**I have deliberately not filled in starter rates.** A production rate that
looks plausible and is 20% optimistic is the most expensive thing in this
system — it would be wrong in a way you wouldn't notice until the job was over,
and it would look authoritative because it came from a computer. Your rates
depend on your crew, your prep standard, and how much of the last ten percent
you refuse to skip.

**Backfill your last three completed jobs instead.** You know the square footage
and roughly the hours. Divide. That gives you real rates in an afternoon.

Then enter actuals after every job. Within about ten jobs you'll have rates
specific to your crew, by surface and prep level, and your quoting stops being
an argument with yourself.

---

## Reading the variance

The actuals sheet compares estimate to reality by phase.

**Positive hours variance** means it took longer than you quoted. One job over is
noise — a difficult client, a bad substrate. The same phase over on five jobs is
a production rate that's wrong, and you fix it in the estimate sheet.

**Watch prep specifically.** It's the phase that runs over most, because it's the
phase whose scope is genuinely unknown until you're into it. If prep is
consistently 30% over, that's not a discipline problem, it's an estimating
problem, and the fix is in the rate, not in the crew.

**Materials variance** running over usually means waste or a spec change mid-job.
Running under sometimes means you quoted a premium product and used something
else — worth catching, because that's the kind of thing a client notices in
year three.

The question to ask monthly: **where am I consistently under-estimating?** Not
"did I make money on this job," which you already know, but which phase lies to
you every time. That single answer, applied to the rate table, is worth more than
any other number in this back office.
