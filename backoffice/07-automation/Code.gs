/**
 * Paint'n Pete — back office automation
 *
 * Implements the six workflows in guide §7 on Google Apps Script.
 * Deployment and trigger setup: see DEPLOY.md
 *
 * FRANCHISE NOTE: everything operator-specific lives in CONFIG below. It
 * mirrors config/business-profile.yml, which remains the source of truth.
 * A new operator edits CONFIG and nothing else in this file.
 */

const CONFIG = {
  operator: "Noah",
  company: "Paint'n Pete",
  phone: "727-902-1986",

  // Where reminders land. Replace with the domain address once it exists.
  alertEmail: "paintnpete@gmail.com",

  // Optional carrier email-to-SMS gateway for genuine text alerts.
  // Leave empty to rely on Gmail push notifications instead. See DEPLOY.md —
  // Apps Script cannot send SMS directly and carriers are retiring these
  // gateways, so treat this as best-effort, not as a guarantee.
  smsGateway: "",

  reviewLink: "",              // from 04-visibility/SETUP.md
  intakeFormUrl: "",           // from 03-leads/intake-form.md

  // Repaint windows, in years, per guide §8
  repaintYears: { interior: 4, exterior: 5 }
};

const TABS = {
  leads: "Leads",
  jobs: "Jobs",
  scorecard: "Scorecard"
};

/**
 * Leads tab columns, 1-based, matching 03-leads/leads-tracker.csv.
 * If you reorder columns in the sheet, change these numbers and nothing else.
 */
const LEAD = {
  received: 1, name: 2, phone: 3, email: 4, source: 5, projectType: 6,
  address: 7, zip: 8, status: 9, consultDate: 10, proposalSent: 11,
  d3: 12, d8: 13, d21: 14, outcome: 15, value: 16, notes: 17
};

/** Jobs tab columns, matching 04-visibility/review-tracker.csv. */
const JOB = {
  name: 1, phone: 2, email: 3, projectType: 4, neighborhood: 5,
  completed: 6, batchDay: 7, askedVerbally: 8, requestSent: 9,
  followupSent: 10, reviewReceived: 11, notes: 12
};

/**
 * Maps your intake/inquiry form's question titles to Leads columns.
 * Form question titles must match these strings exactly — copy them from the
 * live form rather than retyping.
 */
const FORM_FIELDS = {
  "Name": LEAD.name,
  "Phone": LEAD.phone,
  "Email": LEAD.email,
  "How did you find us?": LEAD.source,
  "What kind of project is this?": LEAD.projectType,
  "Address": LEAD.address,
  "ZIP": LEAD.zip
};

// ---------------------------------------------------------------------------
// Workflow 1 — form submitted
// ---------------------------------------------------------------------------

function onFormSubmit(e) {
  const sheet = sheet_(TABS.leads);
  const row = new Array(LEAD.notes).fill("");

  row[LEAD.received - 1] = new Date();
  row[LEAD.status - 1] = "new";

  Object.keys(FORM_FIELDS).forEach(function (title) {
    const answer = e && e.namedValues && e.namedValues[title];
    if (answer && answer.length) row[FORM_FIELDS[title] - 1] = answer[0];
  });

  sheet.appendRow(row);

  const name = row[LEAD.name - 1] || "Someone";
  const email = row[LEAD.email - 1];

  if (email) sendAcknowledgment_(email, name);

  alert_(
    "New lead: " + name,
    [
      name + " just submitted the form.",
      "",
      "Phone: " + (row[LEAD.phone - 1] || "not given"),
      "Email: " + (email || "not given"),
      "Project: " + (row[LEAD.projectType - 1] || "not specified"),
      "Source: " + (row[LEAD.source - 1] || "unknown"),
      "",
      "The acknowledgment has gone out. That is not the personal reply —",
      "send response 1 from 03-leads/standard-responses.md within five minutes."
    ].join("\n")
  );
}

function sendAcknowledgment_(to, name) {
  MailApp.sendEmail({
    to: to,
    subject: "Thanks for getting in touch — " + CONFIG.company,
    body: [
      name.split(" ")[0] + ",",
      "",
      "Thanks for reaching out. I've got your message and I'll come back to you",
      "personally shortly — usually within the hour during the working day.",
      "",
      "If it's easier to talk, call me directly on " + CONFIG.phone + ".",
      "",
      CONFIG.operator,
      CONFIG.company
    ].join("\n")
  });
}

// ---------------------------------------------------------------------------
// Workflows 2, 4, 6 — daily scan
// ---------------------------------------------------------------------------

function dailyCheck() {
  proposalFollowUps_();
  reviewReminders_();
  repaintWindow_();
}

/** Workflow 2 — day 3 / 8 / 21 proposal follow-ups. */
function proposalFollowUps_() {
  const sheet = sheet_(TABS.leads);
  const rows = sheet.getDataRange().getValues();
  const touches = [
    { day: 3, col: LEAD.d3 },
    { day: 8, col: LEAD.d8 },
    { day: 21, col: LEAD.d21 }
  ];

  for (let i = 1; i < rows.length; i++) {
    const sent = toDate_(rows[i][LEAD.proposalSent - 1]);
    if (!sent) continue;
    if (String(rows[i][LEAD.outcome - 1] || "").trim()) continue;

    const age = daysSince_(sent);

    touches.forEach(function (t) {
      if (age < t.day) return;
      if (String(rows[i][t.col - 1] || "").trim()) return;

      alert_(
        "Follow-up due (day " + t.day + "): " + rows[i][LEAD.name - 1],
        [
          "Proposal sent " + fmt_(sent) + " — that's " + age + " days ago.",
          "",
          "Client: " + rows[i][LEAD.name - 1],
          "Email: " + rows[i][LEAD.email - 1],
          "Phone: " + rows[i][LEAD.phone - 1],
          "Project: " + rows[i][LEAD.projectType - 1],
          "",
          "Use the day " + t.day + " template in",
          "03-leads/follow-up-sequence.md.",
          "",
          "No discount. Never apologise for the price."
        ].join("\n")
      );

      sheet.getRange(i + 1, t.col).setValue("reminded " + fmt_(today_()));
    });
  }
}

/** Workflow 4 — review request the evening of completion, follow-up at +2 days. */
function reviewReminders_() {
  const sheet = sheet_(TABS.jobs);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][JOB.reviewReceived - 1] || "").trim()) continue;

    const completed = toDate_(rows[i][JOB.completed - 1]);
    const requested = toDate_(rows[i][JOB.requestSent - 1]);
    const name = rows[i][JOB.name - 1];
    if (!name) continue;

    if (completed && daysSince_(completed) >= 0 && !requested &&
        !String(rows[i][JOB.requestSent - 1] || "").trim()) {
      alert_(
        "Review request: " + name,
        [
          "Job completed " + fmt_(completed) + ".",
          "",
          "Send message 1 from 04-visibility/review-engine.md tonight, while",
          "you're still fresh in their mind.",
          "",
          "Phone: " + rows[i][JOB.phone - 1],
          "Link: " + (CONFIG.reviewLink || "NOT SET — see 04-visibility/SETUP.md"),
          "",
          "Fill in the specific detail. That clause is what makes it work."
        ].join("\n")
      );
      sheet.getRange(i + 1, JOB.requestSent).setValue("reminded " + fmt_(today_()));
      continue;
    }

    if (requested && daysSince_(requested) >= 2 &&
        !String(rows[i][JOB.followupSent - 1] || "").trim()) {
      alert_(
        "Review follow-up: " + name,
        [
          "Asked " + fmt_(requested) + ", no review yet.",
          "",
          "Send message 2 from 04-visibility/review-engine.md.",
          "",
          "This is the only follow-up. Never a third."
        ].join("\n")
      );
      sheet.getRange(i + 1, JOB.followupSent).setValue("reminded " + fmt_(today_()));
    }
  }
}

/** Workflow 6 — clients reaching their repaint window. */
function repaintWindow_() {
  const sheet = sheet_(TABS.jobs);
  const rows = sheet.getDataRange().getValues();
  const due = [];

  for (let i = 1; i < rows.length; i++) {
    const completed = toDate_(rows[i][JOB.completed - 1]);
    if (!completed) continue;

    const type = String(rows[i][JOB.projectType - 1] || "").toLowerCase();
    const years = type.indexOf("exterior") > -1
      ? CONFIG.repaintYears.exterior
      : CONFIG.repaintYears.interior;

    if (daysSince_(completed) >= years * 365) {
      due.push("- " + rows[i][JOB.name - 1] + " (" + rows[i][JOB.projectType - 1] +
               ", finished " + fmt_(completed) + ") — " + rows[i][JOB.phone - 1]);
    }
  }

  if (!due.length) return;

  alert_(
    "Repaint window: " + due.length + " past client(s)",
    [
      "These are at or past their repaint window:",
      "",
      due.join("\n"),
      "",
      "Queue a seasonal check-in. Review before sending — this list is a",
      "prompt, not an outbox.",
      "",
      "The cheapest work you will ever win."
    ].join("\n")
  );
}

// ---------------------------------------------------------------------------
// Workflow 3 — consultation booked
// ---------------------------------------------------------------------------

/**
 * Run after entering a consultation date on a lead row. Sends the intake form
 * and creates the calendar event. Pass the row number as shown in the sheet.
 */
function sendIntakeForRow(rowNumber) {
  const sheet = sheet_(TABS.leads);
  const row = sheet.getRange(rowNumber, 1, 1, LEAD.notes).getValues()[0];
  const when = toDate_(row[LEAD.consultDate - 1]);
  const email = row[LEAD.email - 1];
  const name = String(row[LEAD.name - 1] || "there").split(" ")[0];

  if (!when) throw new Error("Row " + rowNumber + " has no consultation date.");
  if (!CONFIG.intakeFormUrl) throw new Error("CONFIG.intakeFormUrl is not set.");

  if (email) {
    MailApp.sendEmail({
      to: email,
      subject: "Before I come out — a few quick questions",
      body: [
        name + ",",
        "",
        "Looking forward to seeing the space on " + fmt_(when) + ".",
        "",
        "If you have five minutes beforehand, this short form means I arrive",
        "already knowing the basics and we can spend the time on the actual",
        "surfaces instead:",
        "",
        CONFIG.intakeFormUrl,
        "",
        "Not essential — if you'd rather just talk it through on the day,",
        "that's completely fine.",
        "",
        CONFIG.operator
      ].join("\n")
    });
  }

  const end = new Date(when.getTime() + 60 * 60 * 1000);
  CalendarApp.getDefaultCalendar().createEvent(
    "Consultation — " + row[LEAD.name - 1],
    when,
    end,
    {
      location: row[LEAD.address - 1] || "",
      description: [
        "Phone: " + row[LEAD.phone - 1],
        "Project: " + row[LEAD.projectType - 1],
        "Source: " + row[LEAD.source - 1],
        "Notes: " + row[LEAD.notes - 1]
      ].join("\n")
    }
  );

  sheet.getRange(rowNumber, LEAD.status).setValue("consultation booked");
}

// ---------------------------------------------------------------------------
// Workflow 5 — Monday routine
// ---------------------------------------------------------------------------

function mondayReminder() {
  const leads = sheet_(TABS.leads).getDataRange().getValues();
  let open = 0;
  for (let i = 1; i < leads.length; i++) {
    if (toDate_(leads[i][LEAD.proposalSent - 1]) &&
        !String(leads[i][LEAD.outcome - 1] || "").trim()) open++;
  }

  alert_(
    "Monday, 30 minutes",
    [
      "10 min — weekly content batch. Seven captions.",
      "10 min — follow-up list. " + open + " proposal(s) still open.",
      " 5 min — Canva: last week's photos into the before/after frame.",
      " 5 min — confirm nothing fell through.",
      "",
      "Four numbers that matter: inquiries, proposals sent, jobs won,",
      "reviews earned. Everything else is decoration."
    ].join("\n")
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sheet_(name) {
  const s = SpreadsheetApp.getActive().getSheetByName(name);
  if (!s) throw new Error('Missing tab "' + name + '". See sheets-setup.md.');
  return s;
}

function alert_(subject, body) {
  MailApp.sendEmail({
    to: CONFIG.alertEmail,
    subject: "[" + CONFIG.company + "] " + subject,
    body: body
  });

  // Gateways cap around 160 characters and silently truncate past it.
  if (CONFIG.smsGateway) {
    MailApp.sendEmail({
      to: CONFIG.smsGateway,
      subject: "",
      body: subject.substring(0, 150)
    });
  }
}

function toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  if (!s || s.indexOf("reminded") === 0) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function today_() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysSince_(date) {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  return Math.floor((today_().getTime() - a.getTime()) / 86400000);
}

function fmt_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "d MMM yyyy");
}
