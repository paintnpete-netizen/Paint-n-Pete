# Bid Package Analysis

A commercial bid package is fifty to three hundred pages, and the parts that will
cost you money are scattered through it. AI reads it in two minutes and produces
a list of things to check. It does not decide whether to bid, and it does not
produce your number.

**What this is for:** finding the traps before you price, and knowing which
questions to ask during the RFI window rather than discovering the answers on
site.

---

## The prompt

Upload the bid documents, then paste the Business Brief, then this.

> I'm a painting subcontractor evaluating whether to bid this package. Read the
> attached documents and give me the following, in this order:
>
> **1. Scope summary.** What painting work is actually included, by area and
> substrate. Quote the specification sections and page numbers so I can verify
> every line against the source.
>
> **2. Scope boundaries.** What is explicitly excluded from my scope, and — more
> importantly — anything ambiguous about whether it's mine or another trade's.
> Flag every place where painting scope could be argued to overlap with drywall,
> millwork, or general conditions.
>
> **3. Specification requirements.** Named products, film build, number of coats,
> surface prep standards, and any required mock-ups or submittals. Note where the
> spec calls for a product I'd need to source or get approved as an equal.
>
> **4. Schedule constraints.** My work windows, whether the building is occupied,
> after-hours restrictions, phasing, liquidated damages, and what trades must
> finish before I can start.
>
> **5. Contractual risk.** Retainage percentage and release terms, payment terms
> and pay-when-paid language, insurance limits and additional-insured
> requirements, bonding, indemnification, warranty duration, back-charge
> provisions, and change-order procedure including whether verbal directions are
> binding.
>
> **6. Questions I should submit during the RFI window.** Anything genuinely
> ambiguous. Give me the exact wording I'd send.
>
> **7. Red flags.** Anything in here that would make an experienced sub walk
> away.
>
> Rules: quote the source for every claim, with the section and page. If
> something isn't stated in the documents, say "not specified" rather than
> assuming an industry norm. Do not estimate quantities, hours, or price — I do
> that from the drawings and my own production rates.

---

## What AI is bad at here, and you must do yourself

- **Quantity takeoff from drawings.** Do not trust it. Measure yourself.
- **Judging whether a spec'd product is actually right** for the substrate and
  exposure. That's your fifteen years, not the model's.
- **Assessing the GC.** Ask other subs whether they pay, and how they behave on
  a change order. No document tells you this and it matters more than the spec.
- **Deciding whether you have the crew capacity.** Winning a job you can't staff
  is worse than losing it.

---

## Red flags that usually justify walking away

- Retainage above 10%, or release terms with no defined date
- Pay-when-paid combined with no right to stop work for non-payment
- Warranty longer than two years on a substrate whose condition you don't control
- Back-charge language that lets the GC deduct without notice or an opportunity
  to cure
- No named schedule, or a schedule where your window depends on trades already
  behind
- Change orders requiring written approval, combined with a project manager who
  directs verbally — a common and expensive combination
- Insurance limits above what you carry, where the increase costs more than the
  job's margin

---

## After the analysis

1. Decide bid / no-bid before you price. Analysis paralysis on a package you were
   never going to win is the most expensive free work there is.
2. Do your own takeoff.
3. Price it in the job-costing sheet (`../02-estimating/job-costing.md`) with
   commercial-appropriate production rates — they are not the residential rates.
4. Add a contingency for anything the analysis flagged as ambiguous, or exclude
   it explicitly in your bid letter. One or the other, never neither.
5. Attach the standard exclusions from `../02-estimating/exclusions-assumptions.md`,
   adapted for commercial.

---

## Before your first commercial bid

Have a construction attorney read one full subcontract from a GC you intend to
work with. It costs a few hundred dollars once and teaches you which clauses to
look for in every package after that. The prompt above is a reading aid; it is
not legal advice and it will miss things a lawyer won't.
