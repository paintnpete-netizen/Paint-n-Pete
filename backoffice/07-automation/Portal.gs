/**
 * Client portal — ActiveJobs, auth, documents, chat.
 * Called from doPost when payload.action starts with "portal_".
 * Deploy after changes: Manage deployments → New version.
 */

const PORTAL_TABS = {
  activeJobs: "ActiveJobs",
  portalUsers: "PortalUsers",
  portalAccess: "PortalAccess",
  portalMessages: "PortalMessages",
  jobExpenses: "JobExpenses"
};

/** ActiveJobs columns — must match ../10-portal/active-jobs.csv */
const ACTIVE = {
  jobNumber: 1,
  leadRow: 2,
  clientName: 3,
  phone: 4,
  email: 5,
  siteAddress: 6,
  status: 7,
  estimateTotalCents: 8,
  depositCents: 9,
  balanceCents: 10,
  estimateSentAt: 11,
  estimateAcceptedAt: 12,
  depositPaidAt: 13,
  scheduledStart: 14,
  stripeDepositId: 15,
  stripeBalanceId: 16,
  portalInviteToken: 17,
  portalUrl: 18,
  estimatePdfUrl: 19,
  contractPdfUrl: 20,
  bosPdfUrl: 21,
  notes: 22
};

const PORTAL_USER = {
  email: 1,
  passwordHash: 2,
  salt: 3,
  phone: 4,
  createdAt: 5
};

const PORTAL_ACCESS = {
  jobNumber: 1,
  email: 2,
  createdAt: 3
};

const PORTAL_MSG = {
  jobNumber: 1,
  fromRole: 2,
  body: 3,
  createdAt: 4
};

/** JobExpenses columns — per-job spend for the Job Ledger. */
const JOB_EXP = {
  id: 1,
  jobNumber: 2,
  spentAt: 3,
  category: 4,
  amountCents: 5,
  note: 6,
  createdAt: 7
};

const PORTAL_SESSION_HOURS = 72;

function handlePortalPost_(payload) {
  const action = String(payload.action || "");

  if (action === "portal_publish") {
    requireOperator_(payload);
    return jsonResponse_(portalPublish_(payload));
  }

  if (action === "portal_setup_tabs") {
    requireOperator_(payload);
    setupPortalTabs_();
    return jsonResponse_({ ok: true, message: "portal tabs ready" });
  }

  if (action === "portal_invite") {
    return jsonResponse_(portalInvite_(payload));
  }

  if (action === "portal_register") {
    return jsonResponse_(portalRegister_(payload));
  }

  if (action === "portal_login") {
    return jsonResponse_(portalLogin_(payload));
  }

  if (action === "portal_job") {
    return jsonResponse_(portalJob_(payload));
  }

  if (action === "portal_estimate") {
    return jsonResponse_(portalEstimate_(payload));
  }

  if (action === "portal_accept") {
    return jsonResponse_(portalAccept_(payload));
  }

  if (action === "portal_accept_deposit_prepare") {
    return jsonResponse_(portalAcceptDepositPrepare_(payload));
  }

  if (action === "portal_deposit_paid") {
    requireOperator_(payload);
    return jsonResponse_(portalDepositPaid_(payload));
  }

  if (action === "portal_messages") {
    return jsonResponse_(portalMessages_(payload));
  }

  if (action === "portal_message_send") {
    return jsonResponse_(portalMessageSend_(payload));
  }

  if (action === "portal_operator_message") {
    requireOperator_(payload);
    return jsonResponse_(portalOperatorMessage_(payload));
  }

  if (action === "portal_admin_login") {
    return jsonResponse_(portalAdminLogin_(payload));
  }

  if (action === "portal_admin_bootstrap") {
    requireOperator_(payload);
    return jsonResponse_(portalAdminBootstrap_(payload));
  }

  if (action === "portal_admin_session") {
    return jsonResponse_(portalAdminSession_(payload));
  }

  if (action === "portal_admin_jobs") {
    return jsonResponse_(portalAdminJobs_(payload));
  }

  if (action === "portal_admin_job") {
    return jsonResponse_(portalAdminJob_(payload));
  }

  if (action === "portal_admin_messages") {
    return jsonResponse_(portalAdminMessages_(payload));
  }

  if (action === "portal_admin_message_send") {
    return jsonResponse_(portalAdminMessageSend_(payload));
  }

  if (action === "portal_admin_estimate") {
    return jsonResponse_(portalAdminEstimate_(payload));
  }

  if (action === "portal_admin_job_delete") {
    return jsonResponse_(portalAdminJobDelete_(payload));
  }

  if (action === "portal_admin_mark_not_accepted") {
    return jsonResponse_(portalAdminMarkNotAccepted_(payload));
  }

  if (action === "portal_admin_job_ledger") {
    return jsonResponse_(portalAdminJobLedger_(payload));
  }

  if (action === "portal_admin_expense_add") {
    return jsonResponse_(portalAdminExpenseAdd_(payload));
  }

  if (action === "portal_admin_expense_delete") {
    return jsonResponse_(portalAdminExpenseDelete_(payload));
  }

  if (action === "portal_jobs") {
    return jsonResponse_(portalJobs_(payload));
  }

  if (action === "portal_switch_job") {
    return jsonResponse_(portalSwitchJob_(payload));
  }

  if (action === "portal_bos") {
    return jsonResponse_(portalBos_(payload));
  }

  if (action === "portal_admin_bos") {
    return jsonResponse_(portalAdminBos_(payload));
  }

  return jsonResponse_({ ok: false, error: "unknown portal action" });
}

function requireOperator_(payload) {
  const expected = portalOperatorSecret_();
  if (!expected) return;
  if (String(payload.operator_key || "") !== expected) {
    throw new Error("forbidden");
  }
}

function portalOperatorSecret_() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty("portalOperatorSecret")
    || props.getProperty("webhookSecret")
    || CONFIG.webhookSecret
    || "";
}

function portalSessionSecret_() {
  const props = PropertiesService.getScriptProperties();
  var s = props.getProperty("portalSessionSecret");
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty("portalSessionSecret", s);
  }
  return s;
}

function portalBaseUrl_() {
  return CONFIG.portalBaseUrl || "https://portal.paintnpete.com";
}

function portalInviteUrl_(jobNumber, token) {
  return portalBaseUrl_() + "/?job=" + encodeURIComponent(jobNumber) + "&t=" + encodeURIComponent(token);
}

function estimateJsonKey_(jobNumber) {
  return "portal_est_" + String(jobNumber).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function bosJsonKey_(jobNumber) {
  return "portal_bos_" + String(jobNumber).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function storeEstimateJson_(jobNumber, jobJson) {
  PropertiesService.getScriptProperties().setProperty(
    estimateJsonKey_(jobNumber),
    JSON.stringify(jobJson)
  );
}

function loadEstimateJson_(jobNumber) {
  const raw = PropertiesService.getScriptProperties().getProperty(estimateJsonKey_(jobNumber));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function storeBosJson_(jobNumber, bosJson) {
  PropertiesService.getScriptProperties().setProperty(
    bosJsonKey_(jobNumber),
    JSON.stringify(bosJson)
  );
}

function loadBosJson_(jobNumber) {
  const raw = PropertiesService.getScriptProperties().getProperty(bosJsonKey_(jobNumber));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function deleteBosJson_(jobNumber) {
  PropertiesService.getScriptProperties().deleteProperty(bosJsonKey_(jobNumber));
}

function deleteEstimateJson_(jobNumber) {
  PropertiesService.getScriptProperties().deleteProperty(estimateJsonKey_(jobNumber));
}

function portalPublish_(payload) {
  const job = payload.job || {};
  const jobNumber = String(job.number || payload.job_number || "").trim();
  if (!jobNumber) return { ok: false, error: "missing job number" };

  setupPortalTabs_();

  const email = String(job.email || payload.email || "").trim().toLowerCase();
  const phone = String(job.phone || payload.phone || "").trim();
  const clientName = String(job.client || payload.client_name || "").trim();
  const site = String(job.site || payload.site_address || "").trim();

  var totalCents = parseMoneyCents_(payload.estimate_total_cents);
  if (totalCents == null) totalCents = parseMoneyCentsFromJob_(job);
  var depositCents = parseMoneyCents_(payload.deposit_cents);
  if (depositCents == null && totalCents != null) depositCents = Math.round(totalCents / 2);
  var balanceCents = parseMoneyCents_(payload.balance_cents);
  if (balanceCents == null && totalCents != null && depositCents != null) {
    balanceCents = totalCents - depositCents;
  }

  // Reuse an existing invite token so a prior SMS link keeps working when
  // Noah re-publishes (price tweak). New token only on first publish.
  const rowNum = findActiveJobRow_(jobNumber);
  var priorToken = "";
  var priorSentAt = "";
  var priorStatus = "";
  var priorAcceptedAt = "";
  var priorDepositPaidAt = "";
  var priorStripeDeposit = "";
  var priorStripeBalance = "";
  var priorContract = "";
  var priorBos = "";
  var priorEstimatePdf = "";
  var priorNotes = "";
  if (rowNum > 0) {
    const prior = sheet_(PORTAL_TABS.activeJobs)
      .getRange(rowNum, 1, 1, ACTIVE.notes)
      .getValues()[0];
    priorToken = String(prior[ACTIVE.portalInviteToken - 1] || "").trim();
    priorSentAt = prior[ACTIVE.estimateSentAt - 1] || "";
    priorStatus = String(prior[ACTIVE.status - 1] || "").trim();
    priorAcceptedAt = prior[ACTIVE.estimateAcceptedAt - 1] || "";
    priorDepositPaidAt = prior[ACTIVE.depositPaidAt - 1] || "";
    priorStripeDeposit = prior[ACTIVE.stripeDepositId - 1] || "";
    priorStripeBalance = prior[ACTIVE.stripeBalanceId - 1] || "";
    priorContract = prior[ACTIVE.contractPdfUrl - 1] || "";
    priorBos = prior[ACTIVE.bosPdfUrl - 1] || "";
    priorEstimatePdf = prior[ACTIVE.estimatePdfUrl - 1] || "";
    priorNotes = prior[ACTIVE.notes - 1] || "";
  }
  // Keep tokens short so SMS carriers do not truncate the invite URL.
  const token = priorToken || Utilities.getUuid().replace(/-/g, "").slice(0, 24);
  const portalUrl = portalInviteUrl_(jobNumber, token);
  const now = new Date();

  storeEstimateJson_(jobNumber, job);

  // Revising an estimate should not rewind payment status.
  var nextStatus = "estimate_sent";
  if (priorStatus === "estimate_accepted" || priorStatus === "deposit_paid" ||
      priorStatus === "scheduled" || priorStatus === "in_progress" ||
      priorStatus === "paid" || priorStatus === "closed") {
    nextStatus = priorStatus;
  }

  const row = new Array(ACTIVE.notes).fill("");
  row[ACTIVE.jobNumber - 1] = jobNumber;
  row[ACTIVE.leadRow - 1] = payload.lead_row || "";
  row[ACTIVE.clientName - 1] = clientName;
  row[ACTIVE.phone - 1] = phone;
  row[ACTIVE.email - 1] = email;
  row[ACTIVE.siteAddress - 1] = site;
  row[ACTIVE.status - 1] = nextStatus;
  if (totalCents != null) row[ACTIVE.estimateTotalCents - 1] = totalCents;
  if (depositCents != null) row[ACTIVE.depositCents - 1] = depositCents;
  if (balanceCents != null) row[ACTIVE.balanceCents - 1] = balanceCents;
  row[ACTIVE.estimateSentAt - 1] = priorSentAt || now;
  row[ACTIVE.estimateAcceptedAt - 1] = priorAcceptedAt || "";
  row[ACTIVE.depositPaidAt - 1] = priorDepositPaidAt || "";
  row[ACTIVE.stripeDepositId - 1] = priorStripeDeposit || "";
  row[ACTIVE.stripeBalanceId - 1] = priorStripeBalance || "";
  row[ACTIVE.portalInviteToken - 1] = token;
  row[ACTIVE.portalUrl - 1] = portalUrl;
  row[ACTIVE.estimatePdfUrl - 1] = priorEstimatePdf || "";
  row[ACTIVE.contractPdfUrl - 1] = priorContract || "";
  row[ACTIVE.bosPdfUrl - 1] = priorBos || "";
  row[ACTIVE.notes - 1] = priorNotes || "";

  const sheet = sheet_(PORTAL_TABS.activeJobs);
  if (rowNum > 0) {
    sheet.getRange(rowNum, 1, 1, ACTIVE.notes).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  if (email) grantPortalAccess_(jobNumber, email);

  if (payload.update_lead !== false && payload.lead_row) {
    updateLeadProposalSent_(payload.lead_row, now);
  }

  // One idempotency key per publish call — HQ disables the button during
  // submit to stop double-clicks; intentional re-publish gets a fresh SMS.
  const smsAttemptId = Utilities.getUuid().replace(/-/g, "").slice(0, 16);
  const sms = sendEstimateSentSms_(phone, jobNumber, portalUrl, clientName, smsAttemptId);
  var emailResult = { sent: false, error: null };
  // KaiCalls blocks numbers with no prior SMS consent (number_opted_out).
  // Email still delivers the invite when SMS cannot.
  // Do not email on idempotency_conflict (treated as sms.sent already).
  if (!sms.sent && email) {
    emailResult = sendEstimateSentEmail_(email, portalUrl, clientName, jobNumber);
  }

  return {
    ok: true,
    job_number: jobNumber,
    portal_url: portalUrl,
    invite_token: token,
    status: nextStatus,
    revised: rowNum > 0,
    sms_sent: !!sms.sent,
    sms_error: sms.error || null,
    email_sent: !!emailResult.sent,
    email_error: emailResult.error || null
  };
}

function parseMoneyCents_(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!isFinite(n)) return null;
  return Math.round(n);
}

function parseMoneyCentsFromJob_(job) {
  const prices = job.prices || [];
  for (var i = 0; i < prices.length; i++) {
    if (prices[i].total) {
      return parseDollarStringCents_(prices[i].amount);
    }
  }
  if (prices.length === 1) return parseDollarStringCents_(prices[0].amount);
  return null;
}

function parseDollarStringCents_(s) {
  const m = String(s || "").replace(/,/g, "").match(/([\d]+(?:\.\d{1,2})?)/);
  if (!m) return null;
  return Math.round(parseFloat(m[1]) * 100);
}

function findActiveJobRow_(jobNumber) {
  const sheet = sheet_(PORTAL_TABS.activeJobs);
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const nums = sheet.getRange(2, ACTIVE.jobNumber, last, 1).getValues();
  for (var i = 0; i < nums.length; i++) {
    if (String(nums[i][0]).trim() === jobNumber) return i + 2;
  }
  return 0;
}

function readActiveJob_(jobNumber) {
  const rowNum = findActiveJobRow_(jobNumber);
  if (!rowNum) return null;
  const values = sheet_(PORTAL_TABS.activeJobs).getRange(rowNum, 1, 1, ACTIVE.notes).getValues()[0];
  return { rowNum: rowNum, values: values };
}

function activeJobPublic_(values) {
  const jobNumber = values[ACTIVE.jobNumber - 1];
  const jobJson = loadEstimateJson_(jobNumber);
  return {
    job_number: jobNumber,
    client_name: values[ACTIVE.clientName - 1],
    site_address: values[ACTIVE.siteAddress - 1],
    work: jobJson && jobJson.work ? String(jobJson.work) : "",
    status: values[ACTIVE.status - 1],
    estimate_total_cents: values[ACTIVE.estimateTotalCents - 1] || null,
    deposit_cents: values[ACTIVE.depositCents - 1] || null,
    balance_cents: values[ACTIVE.balanceCents - 1] || null,
    estimate_sent_at: values[ACTIVE.estimateSentAt - 1] || null,
    estimate_accepted_at: values[ACTIVE.estimateAcceptedAt - 1] || null,
    has_estimate: !!jobJson,
    has_contract: !!String(values[ACTIVE.contractPdfUrl - 1] || "").trim(),
    has_bos: !!loadBosJson_(jobNumber) ||
      !!String(values[ACTIVE.bosPdfUrl - 1] || "").trim(),
    estimate_pdf_url: String(values[ACTIVE.estimatePdfUrl - 1] || "").trim() || null,
    contract_pdf_url: String(values[ACTIVE.contractPdfUrl - 1] || "").trim() || null,
    bos_pdf_url: String(values[ACTIVE.bosPdfUrl - 1] || "").trim() || null
  };
}

function activeJobAdmin_(values) {
  const pub = activeJobPublic_(values);
  pub.email = String(values[ACTIVE.email - 1] || "").trim();
  pub.phone = String(values[ACTIVE.phone - 1] || "").trim();
  pub.portal_url = String(values[ACTIVE.portalUrl - 1] || "").trim() || null;
  pub.notes = String(values[ACTIVE.notes - 1] || "").trim() || null;
  pub.has_account = !!findPortalUserRow_(pub.email);
  pub.unread_client_messages = countUnreadClientMessages_(pub.job_number);
  return pub;
}

function portalInvite_(payload) {
  // Hot path for SMS invite links — do not run setupPortalTabs_ here
  // (sheet ensure on every open caused multi-second hangs / inactivity timeouts).
  const jobNumber = String(payload.job_number || "").trim();
  const token = String(payload.invite_token || payload.t || "").trim();
  if (!jobNumber || !token) return { ok: false, error: "missing invite" };

  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };
  if (String(rec.values[ACTIVE.portalInviteToken - 1]) !== token) {
    return { ok: false, error: "invalid invite" };
  }

  const email = String(rec.values[ACTIVE.email - 1] || "").trim().toLowerCase();
  return {
    ok: true,
    job_number: jobNumber,
    email: email,
    client_name: rec.values[ACTIVE.clientName - 1],
    phone_hint: phoneLastFour_(rec.values[ACTIVE.phone - 1]),
    has_account: !!findPortalUserRow_(email)
  };
}

function portalRegister_(payload) {
  setupPortalTabs_();
  const jobNumber = String(payload.job_number || "").trim();
  const token = String(payload.invite_token || payload.t || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const phoneLast4 = String(payload.phone_last4 || "").replace(/\D/g, "");

  if (!jobNumber || !token || !email || password.length < 8) {
    return { ok: false, error: "invalid registration" };
  }

  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };
  if (String(rec.values[ACTIVE.portalInviteToken - 1]) !== token) {
    return { ok: false, error: "invalid invite" };
  }
  if (email !== String(rec.values[ACTIVE.email - 1] || "").trim().toLowerCase()) {
    return { ok: false, error: "email mismatch" };
  }
  if (phoneLast4 !== phoneLastFour_(rec.values[ACTIVE.phone - 1])) {
    return { ok: false, error: "phone verify failed" };
  }
  if (findPortalUserRow_(email) > 0) {
    return { ok: false, error: "account exists — sign in" };
  }

  const salt = Utilities.getUuid();
  const hash = passwordHash_(password, salt);
  sheet_(PORTAL_TABS.portalUsers).appendRow([
    email, hash, salt, rec.values[ACTIVE.phone - 1], new Date()
  ]);
  grantPortalAccess_(jobNumber, email);

  const session = issuePortalSession_(email, jobNumber);
  return {
    ok: true,
    session: session,
    job: activeJobPublic_(rec.values),
    jobs: listPortalJobsForEmail_(email)
  };
}

function portalLogin_(payload) {
  setupPortalTabs_();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const jobNumber = String(payload.job_number || "").trim();
  const inviteToken = String(payload.invite_token || payload.t || "").trim();

  const userRow = findPortalUserRow_(email);
  if (!userRow) return { ok: false, error: "invalid credentials" };

  const user = sheet_(PORTAL_TABS.portalUsers).getRange(userRow, 1, 1, PORTAL_USER.createdAt).getValues()[0];
  if (user[PORTAL_USER.passwordHash - 1] !== passwordHash_(password, user[PORTAL_USER.salt - 1])) {
    return { ok: false, error: "invalid credentials" };
  }

  // Invite link for a new job on an existing account → grant access.
  if (jobNumber && inviteToken) {
    const inviteRec = readActiveJob_(jobNumber);
    if (inviteRec &&
        String(inviteRec.values[ACTIVE.portalInviteToken - 1]) === inviteToken &&
        email === String(inviteRec.values[ACTIVE.email - 1] || "").trim().toLowerCase()) {
      grantPortalAccess_(jobNumber, email);
    }
  }

  if (jobNumber && !hasPortalAccess_(jobNumber, email)) {
    return { ok: false, error: "no access to this job" };
  }

  var targetJob = jobNumber;
  if (!targetJob) targetJob = firstPortalJobForEmail_(email);
  if (!targetJob) return { ok: false, error: "no jobs on account" };

  const rec = readActiveJob_(targetJob);
  if (!rec) return { ok: false, error: "job not found" };

  return {
    ok: true,
    session: issuePortalSession_(email, targetJob),
    job: activeJobPublic_(rec.values),
    jobs: listPortalJobsForEmail_(email)
  };
}

function listPortalJobsForEmail_(email) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalAccess);
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const rows = sheet.getRange(2, 1, last, PORTAL_ACCESS.email).getValues();
  const want = String(email).toLowerCase();
  const seen = {};
  const jobs = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][PORTAL_ACCESS.email - 1]).toLowerCase() !== want) continue;
    const num = String(rows[i][PORTAL_ACCESS.jobNumber - 1] || "").trim();
    if (!num || seen[num]) continue;
    seen[num] = true;
    const rec = readActiveJob_(num);
    if (!rec) continue;
    jobs.push(activeJobPublic_(rec.values));
  }
  jobs.sort(function (a, b) {
    const ta = a.estimate_sent_at ? new Date(a.estimate_sent_at).getTime() : 0;
    const tb = b.estimate_sent_at ? new Date(b.estimate_sent_at).getTime() : 0;
    return tb - ta;
  });
  return jobs;
}

function portalJobs_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  return {
    ok: true,
    jobs: listPortalJobsForEmail_(session.email),
    current_job: session.jobNumber
  };
}

function portalSwitchJob_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  if (!jobNumber) return { ok: false, error: "missing job_number" };
  if (!hasPortalAccess_(jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };
  return {
    ok: true,
    session: issuePortalSession_(session.email, jobNumber),
    job: activeJobPublic_(rec.values),
    jobs: listPortalJobsForEmail_(session.email)
  };
}

function portalBos_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const bos = loadBosJson_(session.jobNumber);
  if (!bos) return { ok: false, error: "bill of sale not available" };
  return { ok: true, bos: bos };
}

function portalAdminBos_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  const bos = loadBosJson_(jobNumber);
  if (!bos) return { ok: false, error: "bill of sale not available" };
  return { ok: true, bos: bos };
}

function portalJob_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const rec = readActiveJob_(session.jobNumber);
  if (!rec) return { ok: false, error: "job not found" };
  return {
    ok: true,
    job: activeJobPublic_(rec.values),
    email: session.email,
    jobs: listPortalJobsForEmail_(session.email)
  };
}

function portalEstimate_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const jobJson = loadEstimateJson_(session.jobNumber);
  if (!jobJson) return { ok: false, error: "estimate not available" };
  return { ok: true, estimate: jobJson };
}

function portalAccept_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const rec = readActiveJob_(session.jobNumber);
  if (!rec) return { ok: false, error: "job not found" };

  const status = String(rec.values[ACTIVE.status - 1] || "");
  if (status === "estimate_accepted" || status.indexOf("deposit") >= 0 || status === "paid") {
    return { ok: true, job: activeJobPublic_(rec.values), already: true };
  }

  const now = new Date();
  sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.status).setValue("estimate_accepted");
  sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.estimateAcceptedAt).setValue(now);

  rec.values[ACTIVE.status - 1] = "estimate_accepted";
  rec.values[ACTIVE.estimateAcceptedAt - 1] = now;

  alert_(
    "Estimate accepted: " + rec.values[ACTIVE.clientName - 1],
    [
      rec.values[ACTIVE.clientName - 1] + " accepted estimate " + session.jobNumber + " in the portal.",
      "",
      "Site: " + (rec.values[ACTIVE.siteAddress - 1] || ""),
      "Phone: " + (rec.values[ACTIVE.phone - 1] || ""),
      "Email: " + (rec.values[ACTIVE.email - 1] || ""),
      "",
      "Payments are not live in the portal yet — confirm deposit by check, Zelle, or whatever you agreed."
    ].join("\n")
  );

  return { ok: true, job: activeJobPublic_(rec.values) };
}

/** Marks estimate accepted (if needed) and returns deposit metadata for Stripe Checkout. */
function portalAcceptDepositPrepare_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const rec = readActiveJob_(session.jobNumber);
  if (!rec) return { ok: false, error: "job not found" };

  const status = String(rec.values[ACTIVE.status - 1] || "");
  if (status === "deposit_paid" || status === "scheduled" || status === "in_progress" ||
      status === "balance_due" || status === "paid" || status === "closed") {
    return { ok: false, error: "deposit already paid" };
  }
  if (status === "estimate_declined" || status === "not_accepted") {
    return { ok: false, error: "this estimate was marked not accepted — ask Noah for a revised quote" };
  }

  const depositCents = Number(rec.values[ACTIVE.depositCents - 1]);
  if (!isFinite(depositCents) || depositCents < 50) {
    return { ok: false, error: "deposit amount not set on this job" };
  }

  const now = new Date();
  if (status === "estimate_sent") {
    sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.status).setValue("estimate_accepted");
    sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.estimateAcceptedAt).setValue(now);
    rec.values[ACTIVE.status - 1] = "estimate_accepted";
    rec.values[ACTIVE.estimateAcceptedAt - 1] = now;

    alert_(
      "Estimate accepted — payment started: " + rec.values[ACTIVE.clientName - 1],
      [
        rec.values[ACTIVE.clientName - 1] + " accepted estimate " + session.jobNumber +
          " and opened card checkout for the deposit.",
        "",
        "Site: " + (rec.values[ACTIVE.siteAddress - 1] || ""),
        "Deposit: $" + (depositCents / 100).toFixed(0),
        "",
        "You will get another alert when the deposit clears."
      ].join("\n")
    );
  }

  return {
    ok: true,
    job_number: session.jobNumber,
    deposit_cents: depositCents,
    client_email: String(rec.values[ACTIVE.email - 1] || session.email).trim().toLowerCase(),
    client_name: rec.values[ACTIVE.clientName - 1] || "",
    site_address: String(rec.values[ACTIVE.siteAddress - 1] || "").trim(),
    status: rec.values[ACTIVE.status - 1]
  };
}

/** Called from Stripe webhook after checkout.session.completed (deposit). */
function portalDepositPaid_(payload) {
  const jobNumber = String(payload.job_number || "").trim();
  const paymentId = String(payload.stripe_payment_id || payload.session_id || "").trim();
  if (!jobNumber) return { ok: false, error: "missing job_number" };

  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };

  const status = String(rec.values[ACTIVE.status - 1] || "");
  const depositCents = Number(rec.values[ACTIVE.depositCents - 1]) || 0;
  var amountCents = parseMoneyCents_(payload.amount_cents);
  if (amountCents == null) amountCents = depositCents;
  var feeCents = parseMoneyCents_(payload.stripe_fee_cents);
  if (feeCents == null && amountCents > 0) {
    feeCents = estimateStripeFeeCents_(amountCents);
  }

  if (status === "deposit_paid" || status === "paid" || status === "closed") {
    if (!loadBosJson_(jobNumber)) {
      generateBillOfSale_(jobNumber, paymentId, "deposit");
    }
    ensureStripeFeeExpense_(jobNumber, amountCents, feeCents, paymentId, "deposit");
    return { ok: true, already: true, job_number: jobNumber, status: status };
  }

  const now = new Date();
  sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.status).setValue("deposit_paid");
  sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.depositPaidAt).setValue(now);
  if (paymentId) {
    sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.stripeDepositId).setValue(paymentId);
  }
  if (!rec.values[ACTIVE.estimateAcceptedAt - 1]) {
    sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.estimateAcceptedAt).setValue(now);
  }

  const leadRow = rec.values[ACTIVE.leadRow - 1];
  if (leadRow) updateLeadWon_(leadRow);

  const bos = generateBillOfSale_(jobNumber, paymentId, "deposit");
  if (bos && bos.url) {
    sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.bosPdfUrl).setValue(bos.url);
  }

  ensureStripeFeeExpense_(jobNumber, amountCents, feeCents, paymentId, "deposit");

  const name = rec.values[ACTIVE.clientName - 1] || jobNumber;
  alert_(
    "Deposit paid: " + name,
    [
      name + " paid the deposit for " + jobNumber + ".",
      "",
      "Site: " + (rec.values[ACTIVE.siteAddress - 1] || ""),
      "Phone: " + (rec.values[ACTIVE.phone - 1] || ""),
      "Email: " + (rec.values[ACTIVE.email - 1] || ""),
      "Client paid: $" + (amountCents / 100).toFixed(2),
      feeCents != null ? ("Stripe fee: $" + (feeCents / 100).toFixed(2)) : "",
      paymentId ? ("Stripe: " + paymentId) : "",
      "",
      "Bill of sale is in the client portal Documents tab.",
      "ActiveJobs status is now deposit_paid — confirm scheduling with the client."
    ].filter(Boolean).join("\n")
  );

  return {
    ok: true,
    job_number: jobNumber,
    status: "deposit_paid",
    bos: !!bos,
    amount_cents: amountCents,
    stripe_fee_cents: feeCents
  };
}

/** US online card estimate: 2.9% + $0.30 (used when Stripe fee not provided). */
function estimateStripeFeeCents_(amountCents) {
  const n = Number(amountCents) || 0;
  if (n <= 0) return 0;
  return Math.round(n * 0.029) + 30;
}

/**
 * Record Stripe processing fee as a job expense (idempotent per payment id).
 */
function ensureStripeFeeExpense_(jobNumber, amountCents, feeCents, paymentId, kind) {
  setupPortalTabs_();
  const fee = Number(feeCents);
  if (!isFinite(fee) || fee <= 0) return null;

  const existing = listJobExpenses_(jobNumber);
  const payKey = String(paymentId || "").trim();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].category !== "stripe_fees") continue;
    if (payKey && String(existing[i].note || "").indexOf(payKey) >= 0) {
      return existing[i];
    }
  }
  // One deposit fee line if no payment id yet
  if (!payKey) {
    for (var j = 0; j < existing.length; j++) {
      if (existing[j].category === "stripe_fees" &&
          String(existing[j].note || "").indexOf("deposit") >= 0) {
        return existing[j];
      }
    }
  }

  const id = "xe-stripe-" + Utilities.getUuid().replace(/-/g, "").slice(0, 10);
  const label = (kind === "balance" ? "Stripe fee (balance)" : "Stripe fee (deposit)") +
    " on $" + ((Number(amountCents) || 0) / 100).toFixed(2) +
    (payKey ? (" · " + payKey) : "");
  sheet_(PORTAL_TABS.jobExpenses).appendRow([
    id, jobNumber, new Date(), "stripe_fees", Math.round(fee), label, new Date()
  ]);
  return { id: id, amount_cents: Math.round(fee), category: "stripe_fees" };
}

/**
 * Backfill Stripe fee lines for jobs that already have a deposit but no fee expense.
 */
function backfillStripeFeesForJob_(values) {
  const jobNumber = String(values[ACTIVE.jobNumber - 1] || "").trim();
  if (!jobNumber) return;
  const status = String(values[ACTIVE.status - 1] || "");
  const depositId = String(values[ACTIVE.stripeDepositId - 1] || "").trim();
  const depositCents = Number(values[ACTIVE.depositCents - 1]) || 0;
  const collected = collectedCentsFromJob_(values);
  if (collected <= 0 && !depositId) return;

  const hasDepositFee = listJobExpenses_(jobNumber).some(function (e) {
    return e.category === "stripe_fees";
  });
  if (hasDepositFee) return;

  if (status === "deposit_paid" || status === "scheduled" || status === "in_progress" ||
      status === "balance_due" || status === "paid" || status === "closed" || depositId) {
    const amount = depositCents || collected;
    if (amount > 0) {
      ensureStripeFeeExpense_(
        jobNumber,
        amount,
        estimateStripeFeeCents_(amount),
        depositId,
        "deposit"
      );
    }
  }
}

function generateBillOfSale_(jobNumber, paymentId, paymentKind) {
  const rec = readActiveJob_(jobNumber);
  if (!rec) return null;
  const estimate = loadEstimateJson_(jobNumber) || {};
  const totalCents = Number(rec.values[ACTIVE.estimateTotalCents - 1] || 0) || 0;
  const depositCents = Number(rec.values[ACTIVE.depositCents - 1] || 0) || Math.round(totalCents / 2);
  const balanceCents = Number(rec.values[ACTIVE.balanceCents - 1] || 0) || Math.max(0, totalCents - depositCents);
  const paidCents = paymentKind === "balance" ? totalCents : depositCents;
  const bos = {
    number: jobNumber,
    title: paymentKind === "balance" ? "Bill of sale" : "Deposit receipt / bill of sale",
    kind: paymentKind || "deposit",
    issued_at: new Date().toISOString(),
    client: rec.values[ACTIVE.clientName - 1] || estimate.client || "",
    phone: rec.values[ACTIVE.phone - 1] || estimate.phone || "",
    email: rec.values[ACTIVE.email - 1] || estimate.email || "",
    site: rec.values[ACTIVE.siteAddress - 1] || estimate.site || "",
    work: estimate.work || estimate.kind || "",
    prices: estimate.prices || [],
    estimate_total_cents: totalCents,
    deposit_cents: depositCents,
    balance_cents: balanceCents,
    amount_paid_cents: paidCents,
    stripe_payment_id: paymentId || "",
    note: paymentKind === "balance"
      ? "Paid in full. Thank you for choosing Paint'n Pete."
      : "Deposit received (50%). Remaining balance is due at completion."
  };
  storeBosJson_(jobNumber, bos);
  const url = portalBaseUrl_() + "/receipt.html";
  return { bos: bos, url: url };
}

function portalAdminJobDelete_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  if (!jobNumber) return { ok: false, error: "missing job_number" };

  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };

  sheet_(PORTAL_TABS.activeJobs).deleteRow(rec.rowNum);
  deleteEstimateJson_(jobNumber);
  deleteBosJson_(jobNumber);
  deletePortalAccessForJob_(jobNumber);
  deletePortalMessagesForJob_(jobNumber);
  deleteJobExpensesForJob_(jobNumber);

  return { ok: true, deleted: jobNumber };
}

/** Operator marks cart abandoned / estimate not accepted (no deposit). */
function portalAdminMarkNotAccepted_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  if (!jobNumber) return { ok: false, error: "missing job_number" };

  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };

  const status = String(rec.values[ACTIVE.status - 1] || "");
  if (status === "deposit_paid" || status === "scheduled" || status === "in_progress" ||
      status === "balance_due" || status === "paid" || status === "closed") {
    return { ok: false, error: "cannot mark not accepted after a deposit was paid" };
  }

  const now = new Date();
  const noteLine = "Not accepted / cart abandoned — " + Utilities.formatDate(now, "America/New_York", "yyyy-MM-dd h:mm a");
  const priorNotes = String(rec.values[ACTIVE.notes - 1] || "").trim();
  const notes = priorNotes ? (priorNotes + "\n" + noteLine) : noteLine;

  sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.status).setValue("estimate_declined");
  sheet_(PORTAL_TABS.activeJobs).getRange(rec.rowNum, ACTIVE.notes).setValue(notes);

  rec.values[ACTIVE.status - 1] = "estimate_declined";
  rec.values[ACTIVE.notes - 1] = notes;

  return { ok: true, job: activeJobAdmin_(rec.values) };
}

function listJobExpenses_(jobNumber) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.jobExpenses);
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const rows = sheet.getRange(2, 1, last, JOB_EXP.createdAt).getValues();
  const want = String(jobNumber || "").trim();
  const out = [];
  for (var i = 0; i < rows.length; i++) {
    const num = String(rows[i][JOB_EXP.jobNumber - 1] || "").trim();
    if (want && num !== want) continue;
    out.push({
      id: String(rows[i][JOB_EXP.id - 1] || ""),
      job_number: num,
      spent_at: rows[i][JOB_EXP.spentAt - 1] || null,
      category: String(rows[i][JOB_EXP.category - 1] || "").trim(),
      amount_cents: Number(rows[i][JOB_EXP.amountCents - 1]) || 0,
      note: String(rows[i][JOB_EXP.note - 1] || "").trim(),
      created_at: rows[i][JOB_EXP.createdAt - 1] || null,
      _row: i + 2
    });
  }
  out.sort(function (a, b) {
    const ta = a.spent_at ? new Date(a.spent_at).getTime() : 0;
    const tb = b.spent_at ? new Date(b.spent_at).getTime() : 0;
    return tb - ta;
  });
  return out;
}

function sumExpensesCents_(jobNumber) {
  return listJobExpenses_(jobNumber).reduce(function (sum, e) {
    return sum + (Number(e.amount_cents) || 0);
  }, 0);
}

function collectedCentsFromJob_(values) {
  const status = String(values[ACTIVE.status - 1] || "");
  const deposit = Number(values[ACTIVE.depositCents - 1]) || 0;
  const total = Number(values[ACTIVE.estimateTotalCents - 1]) || 0;
  const balance = Number(values[ACTIVE.balanceCents - 1]);
  const bal = isFinite(balance) ? balance : Math.max(0, total - deposit);
  if (status === "paid" || status === "closed") return total;
  if (status === "deposit_paid" || status === "scheduled" || status === "in_progress" ||
      status === "balance_due") {
    return deposit;
  }
  // Stripe IDs present even if status lag
  if (String(values[ACTIVE.stripeBalanceId - 1] || "").trim()) return total;
  if (String(values[ACTIVE.stripeDepositId - 1] || "").trim()) return deposit;
  return 0;
}

function jobPaymentsFromJob_(values, expenses) {
  const payments = [];
  const deposit = Number(values[ACTIVE.depositCents - 1]) || 0;
  const charged = Number(values[ACTIVE.estimateTotalCents - 1]) || 0;
  const balanceRaw = Number(values[ACTIVE.balanceCents - 1]);
  const balance = isFinite(balanceRaw) ? balanceRaw : Math.max(0, charged - deposit);
  const status = String(values[ACTIVE.status - 1] || "");
  const depositId = String(values[ACTIVE.stripeDepositId - 1] || "").trim();
  const balanceId = String(values[ACTIVE.stripeBalanceId - 1] || "").trim();
  const depositPaidAt = values[ACTIVE.depositPaidAt - 1] || null;
  const collected = collectedCentsFromJob_(values);

  function feeForNote_(needle) {
    var sum = 0;
    (expenses || []).forEach(function (e) {
      if (e.category !== "stripe_fees") return;
      const note = String(e.note || "");
      if (needle && note.indexOf(needle) >= 0) sum += Number(e.amount_cents) || 0;
    });
    return sum;
  }

  const depositRecorded =
    status === "deposit_paid" || status === "scheduled" || status === "in_progress" ||
    status === "balance_due" || status === "paid" || status === "closed" || !!depositId;

  if (depositRecorded && (deposit > 0 || collected > 0)) {
    const depAmt = deposit > 0 ? deposit : Math.min(collected, charged);
    var depFee = feeForNote_(depositId) || feeForNote_("deposit");
    if (!depFee && (expenses || []).length) {
      // sole stripe fee line counts as deposit fee when no balance yet
      const onlyFees = (expenses || []).filter(function (e) { return e.category === "stripe_fees"; });
      if (onlyFees.length === 1 && !balanceId) depFee = Number(onlyFees[0].amount_cents) || 0;
    }
    payments.push({
      kind: "deposit",
      label: "Deposit",
      amount_cents: depAmt,
      fee_cents: depFee,
      net_cents: Math.max(0, depAmt - depFee),
      paid_at: depositPaidAt,
      stripe_id: depositId || null
    });
  }

  if ((status === "paid" || status === "closed" || balanceId) && balance > 0) {
    var balFee = feeForNote_(balanceId) || feeForNote_("balance");
    payments.push({
      kind: "balance",
      label: "Balance",
      amount_cents: balance,
      fee_cents: balFee,
      net_cents: Math.max(0, balance - balFee),
      paid_at: null,
      stripe_id: balanceId || null
    });
  }

  return payments;
}

function jobMoneySummary_(values) {
  const jobNumber = String(values[ACTIVE.jobNumber - 1] || "").trim();
  backfillStripeFeesForJob_(values);

  const charged = Number(values[ACTIVE.estimateTotalCents - 1]) || 0;
  const deposit = Number(values[ACTIVE.depositCents - 1]) || 0;
  const balanceRaw = Number(values[ACTIVE.balanceCents - 1]);
  const balance = isFinite(balanceRaw) ? balanceRaw : Math.max(0, charged - deposit);
  const collected = collectedCentsFromJob_(values);
  const expenses = listJobExpenses_(jobNumber);
  var stripeFees = 0;
  var otherSpent = 0;
  expenses.forEach(function (e) {
    const amt = Number(e.amount_cents) || 0;
    if (e.category === "stripe_fees") stripeFees += amt;
    else otherSpent += amt;
  });
  const spent = stripeFees + otherSpent;
  const netReceived = Math.max(0, collected - stripeFees);
  // Job profit if fully performed at contract price (includes all costs so far)
  const profit = charged - spent;
  // Cash in pocket so far: money received minus fees and job spend
  const cashProfit = collected - spent;
  const owed = Math.max(0, charged - collected);
  return {
    job_number: jobNumber,
    client_name: values[ACTIVE.clientName - 1] || "",
    site_address: values[ACTIVE.siteAddress - 1] || "",
    status: values[ACTIVE.status - 1] || "",
    charged_cents: charged,
    deposit_cents: deposit,
    balance_cents: balance,
    collected_cents: collected,
    stripe_fees_cents: stripeFees,
    net_received_cents: netReceived,
    other_spent_cents: otherSpent,
    spent_cents: spent,
    profit_cents: profit,
    cash_profit_cents: cashProfit,
    owed_cents: owed,
    margin_pct: charged > 0 ? Math.round((profit / charged) * 1000) / 10 : null,
    payments: jobPaymentsFromJob_(values, expenses)
  };
}

function portalAdminJobLedger_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  setupPortalTabs_();

  const jobNumber = String(payload.job_number || "").trim();
  if (jobNumber) {
    const rec = readActiveJob_(jobNumber);
    if (!rec) return { ok: false, error: "job not found" };
    return {
      ok: true,
      money: jobMoneySummary_(rec.values),
      expenses: listJobExpenses_(jobNumber).map(function (e) {
        return {
          id: e.id,
          job_number: e.job_number,
          spent_at: e.spent_at,
          category: e.category,
          amount_cents: e.amount_cents,
          note: e.note,
          created_at: e.created_at
        };
      })
    };
  }

  const sheet = sheet_(PORTAL_TABS.activeJobs);
  const last = sheet.getLastRow();
  if (last < 2) return { ok: true, jobs: [] };
  const rows = sheet.getRange(2, 1, last, ACTIVE.notes).getValues();
  const jobs = rows
    .filter(function (r) { return String(r[ACTIVE.jobNumber - 1] || "").trim(); })
    .map(function (r) { return jobMoneySummary_(r); })
    .sort(function (a, b) {
      return String(b.job_number).localeCompare(String(a.job_number));
    });
  return { ok: true, jobs: jobs };
}

function portalAdminExpenseAdd_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  if (!jobNumber) return { ok: false, error: "missing job_number" };
  if (!readActiveJob_(jobNumber)) return { ok: false, error: "job not found" };

  var amountCents = Number(payload.amount_cents);
  if (!isFinite(amountCents) || amountCents <= 0) {
    const dollars = String(payload.amount || "").replace(/[^0-9.]/g, "");
    amountCents = Math.round(parseFloat(dollars || "0") * 100);
  }
  if (!isFinite(amountCents) || amountCents <= 0) {
    return { ok: false, error: "enter a spend amount" };
  }

  const category = String(payload.category || "materials").trim() || "materials";
  const note = String(payload.note || "").trim();
  const spentAt = payload.spent_at ? new Date(payload.spent_at) : new Date();
  const id = "xe-" + Utilities.getUuid().replace(/-/g, "").slice(0, 12);

  setupPortalTabs_();
  sheet_(PORTAL_TABS.jobExpenses).appendRow([
    id, jobNumber, spentAt, category, amountCents, note, new Date()
  ]);

  const rec = readActiveJob_(jobNumber);
  return {
    ok: true,
    money: jobMoneySummary_(rec.values),
    expenses: listJobExpenses_(jobNumber).map(function (e) {
      return {
        id: e.id,
        job_number: e.job_number,
        spent_at: e.spent_at,
        category: e.category,
        amount_cents: e.amount_cents,
        note: e.note,
        created_at: e.created_at
      };
    })
  };
}

function portalAdminExpenseDelete_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const expenseId = String(payload.expense_id || payload.id || "").trim();
  const jobNumber = String(payload.job_number || "").trim();
  if (!expenseId) return { ok: false, error: "missing expense_id" };

  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.jobExpenses);
  const last = sheet.getLastRow();
  if (last < 2) return { ok: false, error: "expense not found" };
  const rows = sheet.getRange(2, 1, last, JOB_EXP.createdAt).getValues();
  var deletedJob = jobNumber;
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][JOB_EXP.id - 1]) === expenseId) {
      deletedJob = String(rows[i][JOB_EXP.jobNumber - 1] || jobNumber).trim();
      sheet.deleteRow(i + 2);
      break;
    }
  }
  if (!deletedJob) return { ok: false, error: "expense not found" };

  const rec = readActiveJob_(deletedJob);
  return {
    ok: true,
    money: rec ? jobMoneySummary_(rec.values) : null,
    expenses: listJobExpenses_(deletedJob).map(function (e) {
      return {
        id: e.id,
        job_number: e.job_number,
        spent_at: e.spent_at,
        category: e.category,
        amount_cents: e.amount_cents,
        note: e.note,
        created_at: e.created_at
      };
    })
  };
}

function deletePortalAccessForJob_(jobNumber) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalAccess);
  const last = sheet.getLastRow();
  if (last < 2) return;
  const rows = sheet.getRange(2, 1, last, PORTAL_ACCESS.email).getValues();
  const want = String(jobNumber);
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][PORTAL_ACCESS.jobNumber - 1]) === want) {
      sheet.deleteRow(i + 2);
    }
  }
}

function deletePortalMessagesForJob_(jobNumber) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalMessages);
  const last = sheet.getLastRow();
  if (last < 2) return;
  const rows = sheet.getRange(2, 1, last, PORTAL_MSG.createdAt).getValues();
  const want = String(jobNumber);
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][PORTAL_MSG.jobNumber - 1]) === want) {
      sheet.deleteRow(i + 2);
    }
  }
}

function deleteJobExpensesForJob_(jobNumber) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.jobExpenses);
  const last = sheet.getLastRow();
  if (last < 2) return;
  const rows = sheet.getRange(2, 1, last, JOB_EXP.createdAt).getValues();
  const want = String(jobNumber);
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][JOB_EXP.jobNumber - 1]) === want) {
      sheet.deleteRow(i + 2);
    }
  }
}

function portalMessages_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  return { ok: true, messages: listPortalMessages_(session.jobNumber) };
}

function portalMessageSend_(payload) {
  const session = parsePortalSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  if (!hasPortalAccess_(session.jobNumber, session.email)) {
    return { ok: false, error: "forbidden" };
  }
  const body = String(payload.body || "").trim();
  if (!body) return { ok: false, error: "empty message" };

  appendPortalMessage_(session.jobNumber, "client", body);

  const rec = readActiveJob_(session.jobNumber);
  const name = rec ? rec.values[ACTIVE.clientName - 1] : session.jobNumber;
  alert_(
    "Portal message: " + name,
    [
      name + " sent a message on " + session.jobNumber + ":",
      "",
      body,
      "",
      "Reply in the sheet PortalMessages tab, by phone, or by email."
    ].join("\n")
  );

  return { ok: true, messages: listPortalMessages_(session.jobNumber) };
}

function portalOperatorMessage_(payload) {
  setupPortalTabs_();
  const jobNumber = String(payload.job_number || "").trim();
  const body = String(payload.body || "").trim();
  if (!jobNumber || !body) return { ok: false, error: "missing fields" };
  appendPortalMessage_(jobNumber, "operator", body);
  return { ok: true, messages: listPortalMessages_(jobNumber) };
}

function portalAdminEmail_() {
  const props = PropertiesService.getScriptProperties();
  return String(props.getProperty("portalAdminEmail") || CONFIG.alertEmail || "").trim().toLowerCase();
}

function portalAdminPasswordConfigured_() {
  const props = PropertiesService.getScriptProperties();
  return !!(props.getProperty("portalAdminPasswordHash") && props.getProperty("portalAdminSalt"));
}

/** Run once from the editor: setupPortalAdmin("your-password") */
function setupPortalAdmin(password) {
  const pass = String(password || "").trim();
  if (pass.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const props = PropertiesService.getScriptProperties();
  const email = portalAdminEmail_();
  if (!email) throw new Error("Set CONFIG.alertEmail or portalAdminEmail script property.");
  const salt = Utilities.getUuid();
  props.setProperties({
    portalAdminEmail: email,
    portalAdminSalt: salt,
    portalAdminPasswordHash: passwordHash_(pass, salt)
  });
  Logger.log("Portal admin ready for " + email);
}

/**
 * One-time admin password setup from the editor.
 * 1. Replace REPLACE_ME below with your password (8+ chars)
 * 2. Run this function once
 * 3. Revert REPLACE_ME before committing
 */
function setupPortalAdminOnce() {
  setupPortalAdmin("REPLACE_ME");
}

function portalAdminLogin_(payload) {
  if (!portalAdminPasswordConfigured_()) {
    return { ok: false, error: "admin not configured — run setupPortalAdmin in Apps Script" };
  }
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (email !== portalAdminEmail_() || !password) {
    return { ok: false, error: "invalid credentials" };
  }
  const props = PropertiesService.getScriptProperties();
  const salt = props.getProperty("portalAdminSalt");
  const hash = props.getProperty("portalAdminPasswordHash");
  if (hash !== passwordHash_(password, salt)) {
    return { ok: false, error: "invalid credentials" };
  }
  return {
    ok: true,
    session: issueAdminSession_(email),
    email: email
  };
}

/** One-time setup via operator key — portal_admin_bootstrap */
function portalAdminBootstrap_(payload) {
  const pass = String(payload.password || "").trim();
  if (pass.length < 8) return { ok: false, error: "password too short" };
  setupPortalAdmin(pass);
  return { ok: true, email: portalAdminEmail_() };
}

function portalAdminSession_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  return { ok: true, email: session.email };
}

function portalAdminJobs_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.activeJobs);
  const last = sheet.getLastRow();
  if (last < 2) return { ok: true, jobs: [] };
  const rows = sheet.getRange(2, 1, last, ACTIVE.notes).getValues();
  const jobs = rows
    .filter(function (r) { return String(r[ACTIVE.jobNumber - 1] || "").trim(); })
    .map(function (r) { return activeJobAdmin_(r); })
    .sort(function (a, b) {
      const ta = a.estimate_sent_at ? new Date(a.estimate_sent_at).getTime() : 0;
      const tb = b.estimate_sent_at ? new Date(b.estimate_sent_at).getTime() : 0;
      return tb - ta;
    });
  return { ok: true, jobs: jobs };
}

function portalAdminJob_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  const rec = readActiveJob_(jobNumber);
  if (!rec) return { ok: false, error: "job not found" };
  return { ok: true, job: activeJobAdmin_(rec.values) };
}

function portalAdminMessages_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  if (!readActiveJob_(jobNumber)) return { ok: false, error: "job not found" };
  return { ok: true, messages: listPortalMessages_(jobNumber) };
}

function portalAdminMessageSend_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  const body = String(payload.body || "").trim();
  if (!jobNumber || !body) return { ok: false, error: "missing fields" };
  if (!readActiveJob_(jobNumber)) return { ok: false, error: "job not found" };
  appendPortalMessage_(jobNumber, "operator", body);
  return { ok: true, messages: listPortalMessages_(jobNumber) };
}

function portalAdminEstimate_(payload) {
  const session = parseAdminSession_(payload.session);
  if (!session) return { ok: false, error: "session expired" };
  const jobNumber = String(payload.job_number || "").trim();
  if (!readActiveJob_(jobNumber)) return { ok: false, error: "job not found" };
  const jobJson = loadEstimateJson_(jobNumber);
  if (!jobJson) return { ok: false, error: "estimate not available" };
  return { ok: true, estimate: jobJson };
}

function countUnreadClientMessages_(jobNumber) {
  const messages = listPortalMessages_(jobNumber);
  for (var i = messages.length - 1; i >= 0; i--) {
    if (messages[i].from === "operator") return 0;
    if (messages[i].from === "client") {
      var count = 0;
      for (var j = i; j >= 0; j--) {
        if (messages[j].from === "client") count++;
        else break;
      }
      return count;
    }
  }
  return 0;
}

function issueAdminSession_(email) {
  const exp = Date.now() + PORTAL_SESSION_HOURS * 3600 * 1000;
  const payload = "admin|" + email + "|" + exp;
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payload, portalSessionSecret_())
  );
  return Utilities.base64EncodeWebSafe(payload + "|" + sig);
}

function parseAdminSession_(token) {
  if (!token) return null;
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts = decoded.split("|");
    if (parts.length !== 4 || parts[0] !== "admin") return null;
    const email = parts[1];
    const exp = Number(parts[2]);
    const sig = parts[3];
    const payload = "admin|" + email + "|" + exp;
    const expected = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(payload, portalSessionSecret_())
    );
    if (sig !== expected) return null;
    if (Date.now() > exp) return null;
    if (email !== portalAdminEmail_()) return null;
    return { email: email };
  } catch (err) {
    return null;
  }
}

function listPortalMessages_(jobNumber) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalMessages);
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const rows = sheet.getRange(2, 1, last, PORTAL_MSG.createdAt).getValues();
  return rows
    .filter(function (r) { return String(r[PORTAL_MSG.jobNumber - 1]) === jobNumber; })
    .map(function (r) {
      return {
        from: r[PORTAL_MSG.fromRole - 1],
        body: r[PORTAL_MSG.body - 1],
        at: r[PORTAL_MSG.createdAt - 1]
      };
    });
}

function appendPortalMessage_(jobNumber, fromRole, body) {
  setupPortalTabs_();
  sheet_(PORTAL_TABS.portalMessages).appendRow([jobNumber, fromRole, body, new Date()]);
}

function grantPortalAccess_(jobNumber, email) {
  if (hasPortalAccess_(jobNumber, email)) return;
  sheet_(PORTAL_TABS.portalAccess).appendRow([jobNumber, email, new Date()]);
}

function hasPortalAccess_(jobNumber, email) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalAccess);
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const rows = sheet.getRange(2, 1, last, PORTAL_ACCESS.email).getValues();
  const wantJob = String(jobNumber);
  const wantEmail = String(email).toLowerCase();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][PORTAL_ACCESS.jobNumber - 1]) === wantJob &&
        String(rows[i][PORTAL_ACCESS.email - 1]).toLowerCase() === wantEmail) {
      return true;
    }
  }
  return false;
}

function firstPortalJobForEmail_(email) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalAccess);
  const last = sheet.getLastRow();
  if (last < 2) return "";
  const rows = sheet.getRange(2, 1, last, PORTAL_ACCESS.email).getValues();
  const want = String(email).toLowerCase();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][PORTAL_ACCESS.email - 1]).toLowerCase() === want) {
      return String(rows[i][PORTAL_ACCESS.jobNumber - 1]);
    }
  }
  return "";
}

function findPortalUserRow_(email) {
  setupPortalTabs_();
  const sheet = sheet_(PORTAL_TABS.portalUsers);
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const rows = sheet.getRange(2, PORTAL_USER.email, last, 1).getValues();
  const want = String(email).toLowerCase();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === want) return i + 2;
  }
  return 0;
}

function passwordHash_(password, salt) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + password,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest);
}

function phoneLastFour_(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.slice(-4);
}

function issuePortalSession_(email, jobNumber) {
  const exp = Date.now() + PORTAL_SESSION_HOURS * 3600 * 1000;
  const payload = email + "|" + jobNumber + "|" + exp;
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payload, portalSessionSecret_())
  );
  return Utilities.base64EncodeWebSafe(payload + "|" + sig);
}

function parsePortalSession_(token) {
  if (!token) return null;
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts = decoded.split("|");
    if (parts.length !== 4) return null;
    const email = parts[0];
    const jobNumber = parts[1];
    const exp = Number(parts[2]);
    const sig = parts[3];
    const payload = email + "|" + jobNumber + "|" + exp;
    const expected = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(payload, portalSessionSecret_())
    );
    if (sig !== expected) return null;
    if (Date.now() > exp) return null;
    return { email: email, jobNumber: jobNumber };
  } catch (err) {
    return null;
  }
}

function updateLeadProposalSent_(leadRow, when) {
  const row = Number(leadRow);
  if (!row || row < 2) return;
  const leads = sheet_(TABS.leads);
  leads.getRange(row, LEAD.proposalSent).setValue(when);
  leads.getRange(row, LEAD.status).setValue("proposal sent");
}

function updateLeadWon_(leadRow) {
  const row = Number(leadRow);
  if (!row || row < 2) return;
  const leads = sheet_(TABS.leads);
  const outcome = String(leads.getRange(row, LEAD.outcome).getValue() || "").trim().toLowerCase();
  if (outcome === "won") return;
  leads.getRange(row, LEAD.outcome).setValue("won");
  leads.getRange(row, LEAD.status).setValue("won");
}

/** Run once from the editor to create portal sheet tabs. */
function setupPortalTabs() {
  setupPortalTabs_();
}

/**
 * One-time: add portal tabs. Safe to re-run from the editor.
 * Also called automatically on first portal API use.
 */
function setupPortalTabs_() {
  const ss = spreadsheet_();
  ensureTab_(ss, PORTAL_TABS.activeJobs, [
    "job_number", "lead_row", "client_name", "phone", "email", "site_address",
    "status", "estimate_total_cents", "deposit_cents", "balance_cents",
    "estimate_sent_at", "estimate_accepted_at", "deposit_paid_at", "scheduled_start",
    "stripe_deposit_id", "stripe_balance_id", "portal_invite_token", "portal_url",
    "estimate_pdf_url", "contract_pdf_url", "bos_pdf_url", "notes"
  ]);
  ensureTab_(ss, PORTAL_TABS.portalUsers, [
    "email", "password_hash", "salt", "phone", "created_at"
  ]);
  ensureTab_(ss, PORTAL_TABS.portalAccess, [
    "job_number", "email", "created_at"
  ]);
  ensureTab_(ss, PORTAL_TABS.portalMessages, [
    "job_number", "from_role", "body", "created_at"
  ]);
  ensureTab_(ss, PORTAL_TABS.jobExpenses, [
    "id", "job_number", "spent_at", "category", "amount_cents", "note", "created_at"
  ]);
}
