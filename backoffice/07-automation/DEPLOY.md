# Deploying the automation

About 20 minutes. Build the workbook first — see `sheets-setup.md`.

---

## 1. Install the script

1. Open the **Paint'n Pete — Back Office** sheet
2. **Extensions → Apps Script**
3. Delete the placeholder `myFunction` stub
4. Paste the entire contents of `Code.gs`
5. Save, and name the project *Paint'n Pete Automation*

## 2. Fill in CONFIG

At the top of the file. These come from `../config/business-profile.yml`:

- `alertEmail` — where reminders land. `paintnpete@gmail.com` is correct: these
  are internal notes to yourself and no client ever sees them.
- `clientEmail` — `noah@paintnpete.com`. Set as Reply-To on the two messages
  this script sends to clients, so replies land on the business address rather
  than a Gmail one.
- `reviewLink` — from `../04-visibility/SETUP.md`. Leave empty for now; the
  review reminders will still fire and will tell you it isn't set.
- `intakeFormUrl` — from `../03-leads/intake-form.md`.
- `webhookSecret` — invent a long random string. Needed for step 6.

## 3. Authorise

Run `mondayReminder` once from the editor. Google will ask for permission to
send mail, read the sheet, and manage your calendar.

**You'll see a scary "Google hasn't verified this app" screen.** That's expected
for a script you wrote yourself — click *Advanced*, then *Go to Paint'n Pete
Automation*. It is your own code in your own account, not a third party.

Check that the email arrives. If it does, everything else works.

## 4. Set the triggers

In the Apps Script editor, the clock icon in the left sidebar, then **Add
trigger**:

| Function | Event source | Setting |
|---|---|---|
| `dailyCheck` | Time-driven | Day timer, 7am–8am |
| `mondayReminder` | Time-driven | Week timer, Monday, 7am–8am |
| `onFormSubmit` | From spreadsheet | On form submit |

The third only works once a Google Form is linked to this sheet. Add it when
the form exists. **It has nothing to do with the website form** — that arrives
through step 6 instead.

## 5. Match the form fields

`FORM_FIELDS` maps your form's question titles to spreadsheet columns, and the
strings must match **exactly** — copy them from the live form rather than
retyping. A mismatch fails silently, dropping that answer while the rest of the
row saves normally, which is the most annoying possible failure. Submit one test
response and confirm every column populates.

## 6. Connect the website form — the important one

Without this, **nobody who fills in the form on paintnpete.com enters the
system.** The site posts to Netlify Forms, which cannot write to a spreadsheet
or fire a trigger. `doPost` in `Code.gs` bridges the two.

**First, check what's already sitting there.** Netlify → the paintnpete.com site
→ **Forms**. Any submissions in that inbox are real leads that were never
acknowledged. Work through them before wiring anything up — an apology today
still recovers some of them.

**a. Publish the script as a web app.**
Apps Script editor → **Deploy → New deployment** → gear icon → **Web app**.

- Execute as: **Me**
- Who has access: **Anyone**

"Anyone" sounds alarming and isn't optional — Netlify is an anonymous caller.
That is exactly what `webhookSecret` is protecting. Copy the deployment URL.

**b. Point Netlify at it.**
Netlify → site → **Forms → Form notifications → Add notification → Outgoing
webhook**.

- Event: **New form submission**
- URL: your deployment URL with the secret appended —
  `https://script.google.com/macros/s/AKfy…/exec?key=YOUR_SECRET`
- Form: the consultation form, or all forms

Netlify also offers a JWS signature secret. Skip it: Apps Script's `doPost`
cannot read request headers, so the signature is unverifiable. The query-string
secret is doing that job.

**c. Test it end to end.** Submit the real form on the live site with your own
details. Within a minute you should get the acknowledgment email, a row in
Leads with source `website`, and the alert. If nothing happens, Apps Script
editor → **Executions** shows whether the request arrived at all:

- **No execution logged** — Netlify never called it. Check the URL in the
  notification, and check Netlify's own delivery log.
- **Execution returned `forbidden`** — the `key` parameter doesn't match
  `CONFIG.webhookSecret`.
- **Execution returned `error`** — you'll also have an email with the raw
  payload attached. Send it to me and I'll fix the mapping.

**d. Redeploy after any code change.** This is the one that catches everyone:
editing `Code.gs` does *not* update a published web app. Deploy → Manage
deployments → edit → **New version**. Otherwise Netlify keeps hitting the old
copy and you debug code that isn't running.

---

## About text alerts

The guide calls for a text to your phone on a new lead, and **Apps Script cannot
send SMS.**

**Kai closes this.** Every call it answers produces a text with the lead summary
within seconds, which is the alert the guide is asking for and better than
anything this script could send. Leave `CONFIG.smsGateway` empty. See
`../03-leads/kai-setup.md`.

For web form leads, which don't pass through Kai, use a **Gmail push
notification**: every alert here has a subject beginning `[Paint'n Pete]`, so
set your phone to notify on that and you get a lock-screen alert in seconds.
Free and reliable.

The carrier email-to-SMS gateways remain available via `CONFIG.smsGateway` —
`5551234567@vtext.com` on Verizon, `@txt.att.net` on AT&T, `@tmomail.net` on
T-Mobile — but carriers are retiring them and delivery is best-effort. Now that
Kai handles the calls, there's little reason to bother.

---

## Limits

Workspace allows 1,500 emails a day from Apps Script and 90 minutes of runtime.
These workflows use a tiny fraction of both — the daily scan is a few seconds
against a few hundred rows.

Compare against Make.com's free tier: 1,000 operations a month across two active
scenarios. All six workflows run here comfortably, which is why this is the
better choice on Workspace.

---

## If something breaks

Apps Script editor → **Executions** in the left sidebar. Every run is logged
with its status and error.

The two most common failures:

**`Missing tab "Leads"`** — the tab name doesn't match exactly. Case-sensitive.

**Reminders that don't fire** — almost always an empty `proposal_sent` or
`completed_date`, or text where a date should be. Check the cell is a real date,
not a string that looks like one. Google right-aligns real dates by default,
which is the quickest way to tell at a glance.
