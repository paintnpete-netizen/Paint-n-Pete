# Estimate drawer

Field tool for the walkthrough. Lives at `drawer.html`. Bookmark it on the
phone (Add to Home Screen in Safari) so it is there when you are in the house.

**Photos and notes stay on this device** (IndexedDB). They do not go in git
and they are not on paintnpete.com.

## The path this is testing

1. Client calls Kai or uses the website booking form.
2. Lead lands in the sheet; ack email sends; confirmation text when KaiCalls
   SMS is fixed.
3. A rep calls to confirm the visit.
4. **You are on site** — open this drawer, New estimate, paste name/address
   from the booking.
5. Tap **Interior**, **Exterior**, or **Both**. Walls (inside or out):
   perimeter × average rise. Interior ceilings: enter ceiling sq ft if
   they're in the job. Then photos, doors/windows, condition, notes.
6. The quote is measurements × your rates (paint $2.10/sq ft, wash $0.75/sq ft, doors $200/$250, cabinets per piece). Generate the letter.
7. **Generate letter** — same layout as every other estimate.
8. Print / Save PDF, **Email client**, then log `proposal_sent` in Leads.

## What Generate prices from

Square footage, door counts, wash, and cabinet piece counts × the rates in
`../02-estimating/rates.js` (editable on the estimate). It does not invent a
price. If a number looks wrong, the measurement or the rate is wrong.

## Phone

Open `hq/drawer.html` on the laptop once, AirDrop the `hq` folder plus
`../02-estimating/proposal.html` and `proposal.css` if you want Generate to
open the letter on the phone. Simplest: run the walkthrough in the drawer on
the phone, Generate when you are back on the laptop with this repo — the
letter is also stored in the browser until you clear site data.

Same Safari/Chrome profile: Generate writes the letter, then opens
`proposal.html`.
