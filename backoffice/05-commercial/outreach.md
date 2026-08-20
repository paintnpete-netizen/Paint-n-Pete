# Commercial & Trade Outreach

Three audiences, three different reasons to care. The mistake is sending all of
them the same email about how long you've been painting.

**Cadence:** five contacts a week, tracked in the Leads sheet with source set to
`outreach`. This is a relationship pipeline that pays out in six to eighteen
months, so consistency matters far more than volume. Twenty a week for two weeks
and then nothing produces nothing.

**Before sending anything, two gates:**

1. The capabilities statement must be complete. See the gate in
   `capabilities-statement.md`.
2. **Email authentication must be finished.** Send from
   `noah@paintnpete.com`, never a Gmail address — but the domain currently has
   SPF only, with no DKIM key and no DMARC record. Cold outreach goes to people
   who have never emailed you, so their servers judge it on authentication
   alone. Without those two records this entire channel can fail silently, and
   you would read the lack of replies as "outreach doesn't work" rather than
   "outreach never arrived." Fifteen minutes of DNS, in `../04-visibility/SETUP.md`.

---

## 1. General contractors and builders

They care about one thing: whether you will make their schedule slip. Everything
else is secondary.

**Subject:** Painting sub — St. Pete / Pinellas — [YOUR NAME]

> [First name],
>
> I run Paint'n Pete, a painting company in St. Petersburg. Fifteen years in the
> trade, 300+ projects, mostly high-end residential and occupied-space work.
>
> I'm reaching out because I'd like to be on your list for painting scope in
> Pinellas and Hillsborough. What I'd bring:
>
> - Written prep standards, so the finish doesn't depend on who's on site
> - Occupied-space and after-hours capability
> - COI naming you as additional insured within one business day
> - I hit dates, and when something threatens one you hear it from me early
>   rather than late
>
> Capabilities statement attached with licence, insurance, and references.
>
> If you have a walk coming up on something in my scope, I'm happy to come out
> and price it — no obligation on your side either way.
>
> Noah Kanwal
> Paint'n Pete · 727-902-1986 · noah@paintnpete.com

**Follow-up (day 10), if no reply:**
> [First name] — following up on the note below. No pressure if painting is
> covered right now. If it helps, I'd just ask to be kept in mind for overflow
> or for anything on a tight occupied-space schedule. Either way, my details are
> here when you need them.

---

## 2. Interior designers and architects

They care about whether you will make their design look the way they drew it,
and whether you will embarrass them in front of their client. Price is not the
lead.

**Subject:** Finish work — [neighbourhood/project type] — Paint'n Pete

> [First name],
>
> I saw [specific project — a real one, named]. [One genuine, specific
> observation about it. If you can't write this sentence honestly, don't send
> the email to this person.]
>
> I'm Noah Kanwal — I run a painting company in St. Petersburg and most of my
> work is the last ten percent: cut lines, cabinet and millwork spray finishes,
> specialty finishes, and getting a colour to actually read the way it was
> specified once it's on a whole wall in Florida light.
>
> I work with Benjamin Moore, Sherwin-Williams, Florida Paints, and Farrow &
> Ball, and I'm comfortable being handed a spec and held to it.
>
> Portfolio: noah-kanwal.netlify.app
>
> If you ever have a project where the finish matters more than the schedule,
> I'd like to be considered.
>
> Noah Kanwal
> Paint'n Pete · 727-902-1986 · noah@paintnpete.com

**Notes:** the personal observation in the second line is the entire email. A
generic version of this goes straight to the bin. Send five a week that you've
actually researched, not fifty you haven't. The portfolio site is the right link
here — send the business site to GCs and the portfolio to designers.

---

## 3. Property managers

They care about tenant complaints, turn time, and never being surprised by an
invoice.

**Subject:** Painting for turns and common areas — Pinellas

> [First name],
>
> I run Paint'n Pete, a painting company in St. Petersburg. I'm looking to take
> on more property management work — unit turns, common areas, corridors, and
> exteriors.
>
> What I think matters to you:
>
> - Occupied-building work with sealed zones and daily cleanup, so tenant
>   complaints stay low
> - After-hours and weekend scheduling for common areas
> - Predictable turn times, and a call before a date slips rather than after
> - Fixed written scope with exclusions stated up front, so there are no
>   surprise change orders
> - COI naming your entity as additional insured within one business day
>
> Capabilities statement attached.
>
> If it's useful, I'm happy to walk a property and price a turn so you have a
> number to compare against what you're paying now.
>
> Noah Kanwal
> Paint'n Pete · 727-902-1986 · noah@paintnpete.com

**Notes:** the free comparison walk is the hook — it costs you an hour and gets
you inside. Property managers switch vendors more readily than GCs do, and the
switching trigger is almost always a missed turn date by the incumbent.

---

## Finding the contacts

- **GCs and builders:** Florida DBPR licence search by county, then the company
  site for a named person. Never send to `info@`.
- **Designers and architects:** Instagram and Houzz, filtered to Tampa Bay. Look
  at who is actually posting recent local work.
- **Property managers:** local NARPM chapter listings, and the management company
  names on apartment and HOA signage you drive past.

Always find a person's name. `To whom it may concern` is a deleted email.

---

## Tracking

Every send goes in the Leads sheet with `source = outreach` and status
`contacted`. The Apps Script daily check will surface anything with no follow-up
after ten days. Relationships that go nowhere for a year are normal in this
channel — the ones that convert usually do so when their incumbent fails, and
you get the call only if you're still on the list.
