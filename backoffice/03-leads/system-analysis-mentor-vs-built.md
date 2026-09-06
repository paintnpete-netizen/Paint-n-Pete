Paint'n Pete — System analysis
George’s plan vs what you built · HQ efficiency
August 2026

This is a working brief for Noah. George = Deechie Ventures “Paint'n Pete — AI Business Implementation Guide” (pasted into the project Aug 19). Built system = backoffice/ plus live website, Apps Script, KaiCalls, HQ, and portal.


────────────────────────────────────────
1. WHAT GEORGE TOLD YOU TO BUILD
────────────────────────────────────────

Thesis in one sentence
Painting has no free Jobber/Housecall Pro. Assemble the same operating system from free tools until revenue justifies paid software. AI drafts; you verify. AI never sets the price.

George’s stack (free parts)
• Website + Google Business Profile + portfolio assets
• Claude / ChatGPT for writing
• Google Sheets + Forms for leads and tracking
• Gmail + Calendar
• Make.com for automations (free tier)
• Canva, Cursor, Perplexity as support tools

What George wanted implemented (by section)

Estimating — Business Brief; walkthrough → itemized proposal with exclusions; photo-to-scope; job-costing sheet. You set every dollar.

Leads — Answer in five minutes; four canned responses; day 3 / 8 / 21 follow-up; objections library; intake form into a sheet.

Visibility — Review engine (called the highest ROI item); GBP pack; weekly content; service-area and case study pages.

Commercial — Capabilities packet; GC / PM outreach; bid analyzer.

Crew — Core SOPs (English + Spanish); hiring and onboarding.

Automation (six workflows) — Form → ack + Leads + SMS; booked → intake + calendar; job complete → review reminders; proposal sent → follow-ups; Monday content reminder; 3–5 year past-client check-in.

Client journey — Discovery → first contact → walkthrough → same-day proposal → follow-up → work → review ask → retention / referral.

Rhythm — Daily 10 minutes / Monday 30 minutes / monthly 60 minutes on a calendar.

What George did NOT include
• An HTML “HQ” front door
• A client portal
• Stripe or deposits in-product
• KaiCalls / AI phone answering
• Apps Script as the automation engine (guide assumed Make.com)
• A franchise-style single config YAML
• ActiveJobs / estimate-sent → accept status machine


────────────────────────────────────────
2. HOW GEORGE’S SYSTEM IS SUPPOSED TO WORK
────────────────────────────────────────

Happy path (George)

1. Client finds you (GBP, site, Instagram, referral).
2. They inquire (form or call). Auto-ack goes out; you reply personally within five minutes; you book a walkthrough and send intake.
3. You walk the job, shoot photos, run photo-to-scope / job-costing, send a proposal the same day.
4. Follow-up touches on day 3, 8, and 21 if they have not signed.
5. You do the work with SOPs, ask for the review, then stay in touch for referral and retention.

Behind the scenes, Sheets hold leads and job data; Make.com (in the guide) wires forms, reminders, and SMS; Claude fills templates you check before anything goes to a client.

That is a sales-and-ops OS built from documents and light automation — not a product SaaS.


────────────────────────────────────────
3. DOES IT WORK WELL? WHY OR WHY NOT
────────────────────────────────────────

What works well

• The structure matches how a one-operator painting business actually runs: speed to reply, same-day estimate, review engine, commercial lane, crew SOPs, weekly rhythm.
• “AI drafts, you verify” is the right safety rule for pricing and scope.
• Separating templates from a single business profile makes the system teachable and copyable.
• The money path (lead → proposal → follow-up → review) is the correct spine. Everything else is support.

Where it is incomplete or weak in practice

• George’s free Make.com tier only covers about two of six automations. Without a paid Make plan or Apps Script, half the “system” stays manual.
• Documents alone do not create a daily habit. Without a front door, Noah has to remember which file to open.
• The guide stops at email proposals and a sheet. Modern clients expect a link, a place to see the estimate, and a clear next step (accept / pay / message). That gap is real.
• Phone is under-specified. Missed-call text-back is mentioned; a full AI receptionist is not. For a solo operator, the phone is still the highest-friction channel.
• Review engine is correctly prioritized but still blocked on your Google review link and backlog — 14 reviews vs 300+ jobs remains the largest demand gap.
• Commercial and some legal pieces stay gated (references, bonding, attorney language).

Bottom line on George’s plan
As a blueprint, it is strong. As a finished product, it is intentionally incomplete: free tools + discipline. It works if you run the rhythm and finish the blocked items (reviews, intake form, commercial gates). It fails if it stays a folder of markdown you never open on the job.


────────────────────────────────────────
4. WHAT YOU ADDED BEYOND GEORGE’S PLAN — AND WHY
────────────────────────────────────────

A. Config / franchise layer (business-profile.yml)
Why: George assumed you reuse prompts by hand. You made every fact (name, phone, cities, rates posture) flow from one file so a second operator can clone the OS. That is packaging for scale, not just Paint'n Pete day one.

B. Apps Script instead of Make.com
Why: Free Make only runs two scenarios. Workspace + Apps Script can run all six automations (and more) without a monthly Make bill. Live today: website form → Leads + ack; daily / Monday triggers; booking claim; portal APIs.

C. KaiCalls (AI phone)
Why: George assumed you catch calls or use simple missed-call text-back. You added 24/7 answering, qualify, text the booking link. That matches a solo operator who cannot live on the phone. Tradeoff: quiet-hours SMS, prompt write access, and escalation noise have slowed the booking confirmation chain.

D. HQ — the internal front door (hq/index.html)
Why: George said put routines on a calendar. You built a one-page “office” so every tool, checklist, and link lives behind one bookmark. That is how the OS becomes daily, not archival.

E. Estimate drawer (hq/drawer.html)
Why: George: walkthrough → Claude proposal + manual job-costing. You built an on-site measuring UI with rates → client letter → preview → submit to portal / email. That shortens same-day estimate from “laptop later” to “on the driveway.”

F. Client portal + ActiveJobs (Phase 5)
Why: George stopped at emailing a proposal. You added a place for the client to claim a profile, see the estimate, and (later) pay and message. Estimate-sent SMS invites them in. Leads stay prospects; ActiveJobs is the post-send job record. That is closer to Jobber’s client experience without paying Jobber yet.

G. Netlify portal API + HQ Netlify host
Why: Practical hosting for an internal tool and a public portal without bolting either onto the marketing site.

H. Roadmap Phase 6 (franchise packaging)
Why: Explicit “kit for the next operator.” Not in George’s guide.

Net effect
You implemented George’s OS, then upgraded the delivery surface (phone, on-site estimate, portal) and the automation engine (Apps Script). George’s plan is still the skeleton. Your additions are the muscles that touch the client in real time.


────────────────────────────────────────
5. HOW THE SYSTEM WORKS TODAY (BUILT FLOW)
────────────────────────────────────────

1. Client calls → Kai answers → books via texted link, or client uses paintnpete.com/contact.
2. Form / claim → Apps Script holds the slot, writes Leads / Bookings, tries confirmation SMS, emails you.
3. You run the estimate in the HQ drawer → Generate letter → Preview → Submit to portal (and/or email).
4. Portal publish → ActiveJobs row + invite → estimate-sent SMS with claim link.
5. Client creates login → sees estimate → (Stripe / accept / chat still partially ahead).
6. Job moves through ActiveJobs statuses toward work, review, close.

Parallel tracks from George’s plan still matter: review engine, commercial packet, crew SOPs, weekly content, daily / Monday rhythm.


────────────────────────────────────────
6. HQ (“FRONT DOOR”) — CURRENT ITERATION
────────────────────────────────────────

What it is
An internal homepage: rooms for Today, Front desk, Estimating, Jobs, Commercial, Crew, Marketing, Vault, Rhythm, Setup. Clipboard actions (inbox, text booking link, open drawer). Deep links to Sheet, Gmail, Kai, Calendar. Separate drawer for estimating. Live at paintnpete-hq.netlify.app (internal).

What works

• One bookmark instead of hunting folders.
• Rooms map cleanly to George’s sections.
• Clipboard / Today biases you toward action, not reading docs.
• Drawer is the highest-leverage room: it is where money starts.

What is inefficient today

1. Too many rooms for a solo morning
   Ten sections compete. Most days you need: Today → Leads/Kai → Drawer → Portal/Jobs. Commercial, Crew, Vault, and Marketing are weekly / as-needed, but they sit at the same visual weight as Today.

2. Context switching to other products
   HQ still ships you to Sheet, Gmail, Kai dashboard, Calendar, Netlify. The front door is a directory more than a cockpit. Every hop costs minutes and breaks focus.

3. Estimating path is multi-step across surfaces
   Drawer → preview → portal submit → hope SMS sent → check portal admin if something fails. Failures (quiet hours, API key, bad phone) are not visible as a single status strip on HQ.

4. Duplicate sources of truth risk
   Leads sheet, Bookings, ActiveJobs, Kai leads, Netlify forms. HQ links to several of them without a single “what needs me in the next hour” queue.

5. Setup and gated items clutter the daily surface
   Trade references, bonding, Kai SMS status, warranty language matter — but they dilute the daily path when shown as peer rooms.

6. Mobile / on-site use is drawer-first; HQ home is desktop-shaped
   On the job you want drawer + text booking link, not a hallway of eight rooms.

7. Rhythm is calendared but not enforced
   Add-to-calendar buttons help; they do not show “did I do Monday’s 30 minutes?” as a checklist state.


────────────────────────────────────────
7. HOW TO MAKE HQ MORE EFFICIENT
────────────────────────────────────────

Priority order (highest leverage first)

1. Collapse to a three-mode front door
   Mode A — Today (default): one queue — new leads, today’s estimates, portal jobs waiting on client, failed SMS / alerts. Three buttons: Open drawer, Text booking link, Open Leads.
   Mode B — Weekly: reviews, content, commercial, crew, rhythm checklists.
   Mode C — Vault / Setup: config, prompts, gated commercial items.
   Same bookmark; less hallway.

2. Build a single “Needs you” strip
   Pull (even manually at first) count of: new Leads rows, bookings today, ActiveJobs in estimate_sent with no claim, SMS failures. One strip beats eight room cards.

3. Make the drawer the primary on-site app
   Home screen bookmark = drawer on phone; HQ home = office desktop. Or detect mobile and open drawer / Today only.

4. Surface pipeline status in HQ
   After Submit to portal: show invite URL, SMS sent/failed, claim status. Close the loop without opening portal admin + Kai + Sheet.

5. Kill duplicate entry points
   One Leads link (sheet or Kai — pick primary). One calendar. One “message client” path once portal chat exists.

6. Auto-open the next action after estimate
   Drawer “Submit to portal” success screen = copy link + SMS status + “Text client another way” fallback. That is the money moment; do not dump back to the hallway.

7. Park George’s docs behind search, not equal nav
   README / SOPs / prompt library stay one click away, not competing with Today.


────────────────────────────────────────
8. OVERALL JUDGMENT
────────────────────────────────────────

George’s system: Correct operating model for a lean painting company. Strong on process and judgment rules. Weak on phone, client delivery surface, and free-tier automation limits.

Your additions: Necessary upgrades for a solo operator in 2026 — especially Kai (with caveats), Apps Script, drawer estimating, and portal. They make George’s plan real for clients, not only for files.

Where you are now: Skeleton of George’s OS is built; the money path is live through estimate-sent; review engine and commercial gates still block growth; Kai SMS quiet hours and write-scope limits are the main technical drag on the chain you care about this week.

Best next efficiency move for HQ: Shrink the front door to Today + Drawer + Needs-you queue. Keep everything else one click behind Weekly / Vault. That honors George’s rhythm without making you walk a ten-room hallway every morning.


────────────────────────────────────────
9. SOURCES
────────────────────────────────────────

• Deechie Ventures AI Business Implementation Guide (George, Aug 19 paste)
• backoffice/README.md
• backoffice/hq/README.md
• backoffice/10-portal/portal.md
• backoffice/03-leads/kai-setup.md
• Live booking / portal / HQ work Aug 2026
