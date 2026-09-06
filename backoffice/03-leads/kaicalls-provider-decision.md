KaiCalls vs switching — decision brief
Paint'n Pete · August 2026

Based on the live booking → SMS → portal chain, kai-setup audits, and KaiCalls API behavior. This is a go / no-go on whether KaiCalls is the bottleneck — not a full competitor bake-off.


VERDICT (one line)

Pros of staying outweigh a full switch for voice answering. Pros of leaving outweigh staying for transactional SMS (booking confirmations and portal invites). Recommended path: keep KaiCalls on the phone; stop letting KaiCalls gate confirmation texts.


SUMMARY NUMBERS

• Friction items logged: 9
• Hard SMS quiet window: 9pm–8am ET
• Recommended path: Option B (keep Kai for voice; move transactional SMS off Kai)


WHERE KAICALLS SLOWS OR BREAKS THE CHAIN

Ordered by how hard they hit the estimate → book → confirm → portal flow.


1. Booking confirmation SMS — HIGH — Breaks the chain
KaiCalls rejects customer SMS outside 8am–9pm ET (tcpa_violation). There is no transactional or bypass flag. Late-night website bookings hold the slot, but the confirmation text never leaves.
Evidence: Gurmeet booking ~9:36pm ET; API returned 400; SMS send probes all blocked.


2. Estimate path vs staff alerts — HIGH — Noise / false urgency
Escalation rule “wanted estimate but no appointment” fired URGENT SMS even when Kai only sent a booking link and the client booked minutes later on the site.
Evidence: kai-setup.md; staff alert texts Aug 22–24.


3. Agent config write access — HIGH — Slows iteration
MCP / API often lacks agents:write. Prompt fixes (no intake on estimate path, name pronunciation) sit in markdown while live Kai keeps old behavior until manual dashboard paste.
Evidence: request_kaicalls_update → 403 Missing agents:write (repeated).


4. SMS as platform coupling — MEDIUM — Less efficient stack
Website → Apps Script → KaiCalls for transactional SMS. One compliance gate can fail the whole booking UX even when calendar, email, and sheet succeed.
Evidence: submission-created + Code.gs dual path; Netlify KaiCalls API key was missing until patched.


5. Call quality / lead capture — MEDIUM — Slows conversion
Name mispronunciation, stacked questions, late phone ask, “pass to team” instead of booking, double recording disclosure — extra talk time and lost appointments.
Evidence: Transcript audit in kai-setup.md.


6. Number ownership / porting — MEDIUM — Architecture drag
Published 727 line vs Kai agent line splits attention. Porting is irreversible coupling; not porting means dual-number ops forever.
Evidence: kai-setup.md phone number section.


7. Silent / opaque SMS failures — MEDIUM — Hard to debug
Failed sends return compliance errors; no built-in “queue as transactional overnight” for booking. We had to invent (then remove) our own quiet-hours queue.
Evidence: API docs list DNC/opt-out only; quiet hours appear as tcpa_violation.


8. Brand / TTS identity — LOW — Trust leak
Account registered as “Paint N Pete” → TTS says Peyton Pete / paints and peas on live calls.
Evidence: Transcript samples.


PROS OF STAYING (VOICE + OPS HUB)

• 24/7 AI answering on a business line
  Core product you bought — not something Twilio or SMS-only replaces.

• Leads, transcripts, recordings in one place
  Useful for reviewing calls and recovering missed contact info (caller ID).

• Staff escalation + SMS alerts already wired
  Urgent / complaint / price-pushback rules work when scoped correctly.

• A2P / number / compliance scaffolding
  Rebuilding 10DLC + consent + DNC from scratch costs time and risk.

• Booking-link textable already works daytime
  Schedule links and portal invite texts have delivered successfully in-window.


COST OF A FULL PROVIDER SWITCH

• Port / dual-run the phone number
  Carrier → new provider downtime risk; Google, site, and GBP all must update.

• Rewrite agent prompts and escalation
  Months of Kai tuning does not transfer 1:1.

• Re-do A2P / brand registration
  Can take days–weeks; SMS deliverability dips during migration.

• Rebuild Apps Script + Netlify SMS paths
  Keys, idempotency, agent IDs, alert recipients all change.

• Operator learning curve
  Muscle memory today is Kai dashboard + MCP.


DO THE PROS OF SWITCHING OUTWEIGH THE CONS?

Option A — Keep KaiCalls for everything
Fit: Only if quiet-hours SMS is acceptable or Kai enables transactional 24/7 SMS.
Effort: Low
Main risk: Booking confirmations keep failing nights and weekends.

Option B — Keep Kai for voice; move transactional SMS off Kai
Fit: Best fit for Paint'n Pete right now.
Effort: Medium
Main risk: Two vendors for SMS + voice; still need STOP / consent hygiene.

Option C — Full rip-and-replace (voice + SMS)
Fit: Only if voice quality stays unacceptable after prompt fixes.
Effort: High
Main risk: Weeks of ops risk for unclear gain on answering quality.


RECOMMENDATION

Do not rip out KaiCalls as the answering service yet.

Do switch booking-confirmation and portal-invite SMS to a transactional SMS path (Twilio Messaging or similar) that can send 24/7 with STOP handling.

Keep Kai for inbound voice, transcripts, and true emergencies.

Fix remaining Kai call-quality issues in the dashboard with a write-scoped key — that is cheaper than a full migration.


WHY NOT FULL SWITCH NOW

Most of the pain in the booking chain is SMS compliance coupling and escalation / prompt control — not “we need a different phone AI tomorrow.” A full switch resets A2P, prompts, numbers, and staff habits without guaranteeing better answering quality. Decoupling SMS removes the hard break (quiet hours) while preserving what already works on the line.


SOURCES

• Live API failures Aug 22–25 2026
• Netlify / Apps Script booking path
• backoffice/03-leads/kai-setup.md transcript audit


NEXT STEP (IF AGREED)

Pick an SMS vendor for transactional only. Wire claim / doPost and portal publish to it. Leave Kai on voice.
