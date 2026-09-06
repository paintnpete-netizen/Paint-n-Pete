(function () {
  var SESSION_KEY = "pnp-portal-admin-session";
  var API = "/.netlify/functions/portal-api";

  var state = {
    session: "",
    jobs: [],
    job: null
  };

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }

  function $(id) {
    return document.getElementById(id);
  }

  function show(id) {
    ["view-login", "view-dashboard", "view-job", "view-loading"].forEach(function (v) {
      $(v).hidden = v !== id;
    });
    $("header").hidden = id === "view-loading" || id === "view-login";
  }

  function loadSession() {
    try {
      return localStorage.getItem(SESSION_KEY) || "";
    } catch (err) {
      return "";
    }
  }

  function saveSession(token) {
    try {
      if (token) localStorage.setItem(SESSION_KEY, token);
      else localStorage.removeItem(SESSION_KEY);
    } catch (err) {}
    state.session = token || "";
  }

  function api(action, body) {
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ action: action }, body || {}))
    }).then(function (res) {
      return res.json();
    });
  }

  function statusLabel(status) {
    var map = {
      estimate_sent: "Estimate sent",
      estimate_accepted: "Accepted (checkout started)",
      estimate_declined: "Not accepted",
      not_accepted: "Not accepted",
      deposit_paid: "Deposit paid",
      scheduled: "Scheduled",
      in_progress: "In progress",
      balance_due: "Balance due",
      paid: "Paid",
      closed: "Closed"
    };
    return map[status] || status || "Active";
  }

  function canMarkNotAccepted(status) {
    return status === "estimate_sent" || status === "estimate_accepted";
  }

  function formatCents(cents) {
    if (cents == null || cents === "") return "—";
    return "$" + (Number(cents) / 100).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function formatDate(v) {
    if (!v) return "—";
    var d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDateTime(v) {
    if (!v) return "";
    var d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function deleteJob(jobNumber, fromRow) {
    if (!jobNumber) return;
    if (!confirm("Delete " + jobNumber + " from the client portal?\n\nThis removes the ActiveJobs row, estimate, messages, and access for that job. It cannot be undone.")) {
      return;
    }
    return api("portal_admin_job_delete", {
      session: state.session,
      job_number: jobNumber
    }).then(function (data) {
      if (!data.ok) {
        alert(data.error || "Delete failed.");
        return;
      }
      if (fromRow || (state.job && state.job.job_number === jobNumber)) {
        state.job = null;
        location.href = "admin.html";
        return;
      }
      return loadJobs();
    });
  }

  function markNotAccepted(jobNumber, stayOnDetail) {
    if (!jobNumber) return;
    if (!confirm("Mark " + jobNumber + " as not accepted?\n\nUse this when the client abandoned checkout or declined. They will not be able to pay this estimate until you submit a revised one.")) {
      return;
    }
    return api("portal_admin_mark_not_accepted", {
      session: state.session,
      job_number: jobNumber
    }).then(function (data) {
      if (!data.ok) {
        alert(data.error || "Could not update status.");
        return;
      }
      if (stayOnDetail && data.job) {
        state.job = data.job;
        renderJobDetail();
        return;
      }
      return loadJobs();
    });
  }

  function renderJobs() {
    var jobs = state.jobs || [];
    $("jobs-empty").hidden = jobs.length > 0;
    $("jobs-table").hidden = jobs.length === 0;
    var body = $("jobs-body");
    body.innerHTML = "";

    jobs.forEach(function (job) {
      var tr = document.createElement("tr");
      tr.className = "admin-row";
      tr.dataset.job = job.job_number;

      var client = document.createElement("td");
      client.innerHTML = "<strong>" + escapeHtml(job.client_name || "Client") + "</strong>" +
        '<div class="meta">' + escapeHtml(job.job_number || "") +
        (job.site_address ? " · " + escapeHtml(job.site_address) : "") + "</div>";

      var status = document.createElement("td");
      status.innerHTML = '<span class="pill' +
        (job.status === "estimate_accepted" ? " accepted" : "") + '">' +
        escapeHtml(statusLabel(job.status)) + "</span>";

      var total = document.createElement("td");
      total.textContent = formatCents(job.estimate_total_cents);

      var msgs = document.createElement("td");
      if (job.unread_client_messages > 0) {
        msgs.innerHTML = '<span class="badge">' + job.unread_client_messages + " new</span>";
      } else {
        msgs.textContent = "—";
      }

      var actions = document.createElement("td");
      actions.style.whiteSpace = "nowrap";
      if (canMarkNotAccepted(job.status)) {
        var decline = document.createElement("button");
        decline.type = "button";
        decline.className = "btn ghost small";
        decline.textContent = "Not accepted";
        decline.title = "Cart abandoned or estimate declined";
        decline.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          markNotAccepted(job.job_number, false);
        });
        actions.appendChild(decline);
      }
      var del = document.createElement("button");
      del.type = "button";
      del.className = "btn ghost small";
      del.textContent = "Delete";
      del.style.color = "#a33";
      del.style.marginLeft = "0.35rem";
      del.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        deleteJob(job.job_number, false);
      });
      actions.appendChild(del);

      tr.appendChild(client);
      tr.appendChild(status);
      tr.appendChild(total);
      tr.appendChild(msgs);
      tr.appendChild(actions);
      tr.addEventListener("click", function () {
        location.href = "admin.html?job=" + encodeURIComponent(job.job_number);
      });
      body.appendChild(tr);
    });
  }

  function renderJobDetail() {
    var job = state.job;
    if (!job) return;

    $("job-title").textContent = job.client_name || "Client";
    $("job-sub").textContent = [job.job_number, job.site_address].filter(Boolean).join(" · ");

    var pill = $("job-status-pill");
    pill.textContent = statusLabel(job.status);
    pill.className = "pill" +
      (job.status === "estimate_accepted" ? " accepted" : "") +
      (job.status === "estimate_declined" || job.status === "not_accepted" ? " declined" : "");

    $("job-email").textContent = job.email || "—";
    $("job-phone").textContent = job.phone || "—";
    $("job-account").textContent = job.has_account ? "Registered" : "Invite not used yet";
    $("job-total").textContent = formatCents(job.estimate_total_cents);
    $("job-sent").textContent = formatDate(job.estimate_sent_at);
    $("job-accepted").textContent = formatDate(job.estimate_accepted_at);

    var link = $("job-portal-link");
    if (job.portal_url) {
      link.href = job.portal_url;
      link.textContent = "Open invite";
      link.hidden = false;
      $("copy-portal-link").hidden = false;
    } else {
      link.hidden = true;
      $("copy-portal-link").hidden = true;
    }

    var est = $("view-estimate");
    if (job.has_estimate) {
      est.hidden = false;
      est.href = "estimate.html?admin=1&job=" + encodeURIComponent(job.job_number);
    } else {
      est.hidden = true;
    }

    var markBtn = $("mark-not-accepted");
    if (markBtn) markBtn.hidden = !canMarkNotAccepted(job.status);

    var delBtn = $("delete-job");
    if (delBtn) delBtn.hidden = false;

    show("view-job");
  }

  function renderMessages(messages) {
    var box = $("message-list");
    box.innerHTML = "";
    if (!messages || !messages.length) {
      box.innerHTML = '<p class="empty">No messages yet.</p>';
      return;
    }
    messages.forEach(function (m) {
      var div = document.createElement("div");
      div.className = "msg " + (m.from === "client" ? "client" : "operator");
      var t = document.createElement("time");
      t.textContent = formatDateTime(m.at) +
        (m.from === "operator" ? " · You" : " · Client");
      div.appendChild(document.createTextNode(m.body));
      div.appendChild(t);
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadJobs() {
    return api("portal_admin_jobs", { session: state.session }).then(function (data) {
      if (!data.ok) throw new Error(data.error || "Could not load jobs");
      state.jobs = data.jobs || [];
      renderJobs();
      show("view-dashboard");
    });
  }

  function loadJobDetail(jobNumber) {
    return api("portal_admin_job", {
      session: state.session,
      job_number: jobNumber
    }).then(function (data) {
      if (!data.ok) throw new Error(data.error || "Job not found");
      state.job = data.job;
      renderJobDetail();
      return api("portal_admin_messages", {
        session: state.session,
        job_number: jobNumber
      });
    }).then(function (data) {
      if (data && data.ok) renderMessages(data.messages);
    });
  }

  function bootSession() {
    if (!state.session) return Promise.resolve(false);
    return api("portal_admin_session", { session: state.session }).then(function (data) {
      if (!data.ok) {
        saveSession("");
        return false;
      }
      var jobNumber = qs("job");
      if (jobNumber) return loadJobDetail(jobNumber).then(function () { return true; });
      return loadJobs().then(function () { return true; });
    });
  }

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("login-err").hidden = true;
    api("portal_admin_login", {
      email: $("admin-email").value,
      password: $("admin-password").value
    }).then(function (data) {
      if (!data.ok) {
        $("login-err").textContent = data.error || "Sign in failed.";
        $("login-err").hidden = false;
        return;
      }
      saveSession(data.session);
      var jobNumber = qs("job");
      if (jobNumber) loadJobDetail(jobNumber);
      else loadJobs();
    });
  });

  $("sign-out").addEventListener("click", function () {
    saveSession("");
    state.jobs = [];
    state.job = null;
    location.href = "admin.html";
  });

  $("refresh-jobs").addEventListener("click", function () {
    loadJobs();
  });

  $("back-dashboard").addEventListener("click", function (e) {
    e.preventDefault();
    location.href = "admin.html";
  });

  $("copy-portal-link").addEventListener("click", function () {
    if (!state.job || !state.job.portal_url) return;
    navigator.clipboard.writeText(state.job.portal_url).then(function () {
      $("copy-portal-link").textContent = "Copied";
      setTimeout(function () {
        $("copy-portal-link").textContent = "Copy";
      }, 1500);
    });
  });

  if ($("delete-job")) {
    $("delete-job").addEventListener("click", function () {
      if (!state.job) return;
      deleteJob(state.job.job_number, true);
    });
  }

  if ($("mark-not-accepted")) {
    $("mark-not-accepted").addEventListener("click", function () {
      if (!state.job) return;
      markNotAccepted(state.job.job_number, true);
    });
  }

  $("message-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("msg-err").hidden = true;
    var body = $("msg-body").value.trim();
    if (!body || !state.job) return;
    api("portal_admin_message_send", {
      session: state.session,
      job_number: state.job.job_number,
      body: body
    }).then(function (data) {
      if (!data.ok) {
        $("msg-err").textContent = data.error || "Send failed.";
        $("msg-err").hidden = false;
        return;
      }
      $("msg-body").value = "";
      renderMessages(data.messages);
    });
  });

  state.session = loadSession();
  show("view-loading");

  bootSession().then(function (ok) {
    if (!ok) {
      $("admin-email").value = "noah@paintnpete.com";
      show("view-login");
    }
  }).catch(function (err) {
    saveSession("");
    $("login-err").textContent = err.message || "Network error.";
    $("login-err").hidden = false;
    $("admin-email").value = "noah@paintnpete.com";
    show("view-login");
  });
})();
