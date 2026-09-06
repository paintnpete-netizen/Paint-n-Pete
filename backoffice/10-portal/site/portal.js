(function () {
  var SESSION_KEY = "pnp-portal-session";
  var API = "/.netlify/functions/portal-api";

  var invite = {
    job: "",
    token: ""
  };

  var state = {
    session: "",
    job: null,
    jobs: []
  };

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }

  function $(id) {
    return document.getElementById(id);
  }

  function show(id) {
    ["view-signup", "view-login", "view-jobs", "view-job", "view-loading", "view-error"].forEach(function (v) {
      var el = $(v);
      if (el) el.hidden = v !== id;
    });
    $("header").hidden = id === "view-loading" || id === "view-error";
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
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (ctrl) {
      timer = setTimeout(function () {
        try { ctrl.abort(); } catch (err) {}
      }, 12000);
    }
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ action: action }, body || {})),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (err) {
          return {
            ok: false,
            error: "portal temporarily unavailable — try again or call 727-902-1986"
          };
        }
      });
    }).catch(function (err) {
      var aborted = err && (err.name === "AbortError" || /abort/i.test(String(err)));
      return {
        ok: false,
        error: aborted
          ? "That took too long. Check your connection and try the invite link again, or call 727-902-1986."
          : "Network error. Try again or call 727-902-1986."
      };
    }).then(function (data) {
      if (timer) clearTimeout(timer);
      return data;
    });
  }

  function statusLabel(status) {
    var map = {
      estimate_sent: "Estimate ready",
      estimate_accepted: "Estimate accepted",
      estimate_declined: "Not accepted",
      not_accepted: "Not accepted",
      deposit_paid: "Deposit received",
      scheduled: "Scheduled",
      in_progress: "In progress",
      balance_due: "Balance due",
      paid: "Paid in full",
      closed: "Closed"
    };
    return map[status] || status || "Active";
  }

  function formatCents(cents) {
    if (cents == null || cents === "") return "";
    return "$" + (Number(cents) / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function formatDate(v) {
    if (!v) return "";
    var d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function depositPaidStatus(status) {
    return status === "deposit_paid" || status === "scheduled" || status === "in_progress" ||
      status === "balance_due" || status === "paid" || status === "closed";
  }

  function startDepositCheckout(btn) {
    if (btn) btn.disabled = true;
    return api("portal_accept_deposit", { session: state.session }).then(function (data) {
      if (btn) btn.disabled = false;
      if (!data.ok) {
        alert(data.error || "Could not start checkout.");
        return;
      }
      if (data.checkout_url) location.href = data.checkout_url;
    });
  }

  function openJobHome(data, opts) {
    if (data.session) saveSession(data.session);
    state.job = data.job || null;
    state.jobs = data.jobs || state.jobs || [];
    if (!state.job) {
      show("view-login");
      return;
    }
    if (!(opts && opts.stayOnJob) && state.jobs.length > 1) {
      renderJobsList();
      return;
    }
    renderJob();
    refreshMessages();
  }

  function renderJobsList() {
    var list = $("jobs-list");
    list.innerHTML = "";
    (state.jobs || []).forEach(function (job) {
      var li = document.createElement("li");
      var left = document.createElement("div");
      var total = formatCents(job.estimate_total_cents);
      left.innerHTML = "<strong>" + (job.work || job.client_name || job.job_number || "Project") + "</strong>" +
        '<div class="meta">' +
        [job.site_address, total, statusLabel(job.status)].filter(Boolean).join(" · ") +
        "</div>";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = "Open";
      btn.addEventListener("click", function () {
        api("portal_switch_job", {
          session: state.session,
          job_number: job.job_number
        }).then(function (data) {
          if (!data.ok) {
            alert(data.error || "Could not open project.");
            return;
          }
          openJobHome(data, { stayOnJob: true });
        });
      });
      li.appendChild(left);
      li.appendChild(btn);
      list.appendChild(li);
    });
    show("view-jobs");
  }

  function renderJob() {
    var job = state.job;
    if (!job) return;

    var back = $("back-to-jobs");
    if (back) back.hidden = !(state.jobs && state.jobs.length > 1);

    $("job-title").textContent = job.client_name || "Your project";
    $("job-sub").textContent = [job.job_number, job.site_address].filter(Boolean).join(" · ");

    var pill = $("job-status-pill");
    pill.textContent = statusLabel(job.status);
    pill.className = "pill" + (depositPaidStatus(job.status) ? " accepted" : "") +
      (job.status === "estimate_declined" || job.status === "not_accepted" ? " declined" : "");

    var paid = depositPaidStatus(job.status);
    var declined = job.status === "estimate_declined" || job.status === "not_accepted";
    var canCheckout = (job.status === "estimate_sent" || job.status === "estimate_accepted") && !declined;
    $("accept-banner").hidden = !canCheckout || paid;
    $("deposit-pending-banner").hidden = job.status !== "estimate_accepted" || paid || declined;
    $("deposit-paid-banner").hidden = !paid;
    if ($("declined-banner")) $("declined-banner").hidden = !declined;

    var depositLabel = job.deposit_cents ? formatCents(job.deposit_cents) : "";
    var acceptBtn = $("accept-btn");
    if (canCheckout && !paid && depositLabel) {
      acceptBtn.textContent = "Accept & pay deposit — " + depositLabel;
      $("deposit-note").textContent = "50% deposit · balance due at completion";
      $("deposit-note").hidden = false;
    } else {
      acceptBtn.textContent = "Accept & pay deposit";
      $("deposit-note").hidden = true;
    }
    if ($("retry-deposit-btn") && depositLabel) {
      $("retry-deposit-btn").textContent = "Pay deposit — " + depositLabel;
    }

    var docs = [];
    if (job.has_estimate) {
      docs.push({
        title: "Written estimate",
        meta: job.estimate_sent_at ? "Sent " + formatDate(job.estimate_sent_at) : "",
        href: "estimate.html",
        internal: true
      });
    }
    if (job.estimate_pdf_url) {
      docs.push({
        title: "Estimate PDF",
        meta: "Download",
        href: job.estimate_pdf_url,
        external: true
      });
    }
    if (job.contract_pdf_url) {
      docs.push({
        title: "Work agreement",
        meta: "Download",
        href: job.contract_pdf_url,
        external: true
      });
    }
    if (job.has_bos || job.bos_pdf_url) {
      docs.push({
        title: "Bill of sale / receipt",
        meta: paid ? "Deposit received" : "Available",
        href: (job.bos_pdf_url && job.bos_pdf_url.indexOf("http") === 0 && job.bos_pdf_url.indexOf("receipt.html") < 0)
          ? job.bos_pdf_url
          : "receipt.html",
        internal: !(job.bos_pdf_url && job.bos_pdf_url.indexOf("http") === 0 && job.bos_pdf_url.indexOf("receipt.html") < 0),
        external: (job.bos_pdf_url && job.bos_pdf_url.indexOf("http") === 0 && job.bos_pdf_url.indexOf("receipt.html") < 0)
      });
    }

    var list = $("doc-list");
    list.innerHTML = "";
    if (!docs.length) {
      $("doc-empty").hidden = false;
    } else {
      $("doc-empty").hidden = true;
      docs.forEach(function (doc) {
        var li = document.createElement("li");
        var left = document.createElement("div");
        left.innerHTML = "<strong>" + doc.title + "</strong>" +
          (doc.meta ? '<div class="meta">' + doc.meta + "</div>" : "");
        var link = document.createElement("a");
        link.className = "btn ghost";
        link.textContent = doc.external ? "Download" : "Open";
        link.href = doc.href;
        if (doc.external) {
          link.target = "_blank";
          link.rel = "noopener";
        }
        li.appendChild(left);
        li.appendChild(link);
        list.appendChild(li);
      });
    }

    show("view-job");
  }

  function renderMessages(messages) {
    var box = $("message-list");
    box.innerHTML = "";
    if (!messages || !messages.length) {
      box.innerHTML = '<p class="empty">No messages yet. Ask about colors, timing, or scope.</p>';
      return;
    }
    messages.forEach(function (m) {
      var div = document.createElement("div");
      div.className = "msg " + (m.from === "client" ? "client" : "operator");
      var t = document.createElement("time");
      t.textContent = formatDate(m.at) + (m.from === "operator" ? " · Paint'n Pete" : " · You");
      div.appendChild(document.createTextNode(m.body));
      div.appendChild(t);
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  }

  function refreshMessages() {
    return api("portal_messages", { session: state.session }).then(function (data) {
      if (data.ok) renderMessages(data.messages);
    });
  }

  function bootWithSession(opts) {
    return api("portal_job", { session: state.session }).then(function (data) {
      if (!data.ok) {
        saveSession("");
        return false;
      }
      openJobHome(data, opts);
      return true;
    });
  }

  function handleDepositReturn() {
    var deposit = qs("deposit");
    if (!deposit) return Promise.resolve(false);
    try {
      history.replaceState({}, "", location.pathname || "/");
    } catch (err) {}
    if (deposit === "cancelled") {
      alert("Checkout was cancelled. You can pay your deposit anytime from this page.");
      return bootWithSession({ stayOnJob: true }).then(function () { return true; });
    }
    if (deposit !== "success") return Promise.resolve(false);
    return bootWithSession({ stayOnJob: true }).then(function () {
      if (state.job && depositPaidStatus(state.job.status)) return true;
      var tries = 0;
      function poll() {
        tries += 1;
        return bootWithSession({ stayOnJob: true }).then(function () {
          if (state.job && depositPaidStatus(state.job.status)) return true;
          if (tries < 8) {
            return new Promise(function (resolve) {
              setTimeout(function () { resolve(poll()); }, 1500);
            });
          }
          return true;
        });
      }
      return poll();
    });
  }

  function bootInvite() {
    invite.job = qs("job");
    invite.token = qs("t");
    // Any ?job= link is an invite — never fall through to a leftover session
    // (and never sit on Loading while the API is slow or hanging).
    if (!invite.job) return Promise.resolve(false);

    saveSession("");

    if (!invite.token) {
      $("error-text").textContent =
        "This invite link is missing its security code. Open the full link from your text message, or call 727-902-1986.";
      show("view-error");
      return Promise.resolve(true);
    }

    // Doctor-office claim: show Create login immediately, then confirm invite.
    $("signup-lede").textContent =
      "Your estimate is ready. Create a password to claim your portal and view it.";
    $("su-email").value = "";
    $("signup-err").hidden = true;
    show("view-signup");
    $("signup-err").textContent = "Checking your invite…";
    $("signup-err").hidden = false;
    $("signup-err").style.color = "var(--muted)";

    return api("portal_invite", {
      job_number: invite.job,
      invite_token: invite.token
    }).then(function (data) {
      $("signup-err").style.color = "";
      if (!data || !data.ok) {
        var err = (data && data.error) || "Could not open invite.";
        $("error-text").textContent = err === "invalid invite"
          ? "This invite link is invalid or expired. Call 727-902-1986 or email noah@paintnpete.com."
          : err;
        show("view-error");
        return true;
      }
      if (data.has_account) {
        $("li-email").value = data.email || "";
        $("login-lede").textContent =
          "Hi " + (data.client_name || "there").split(" ")[0] +
          " — sign in with the password you created to open your estimate.";
        show("view-login");
      } else {
        $("su-email").value = data.email || "";
        $("signup-lede").textContent =
          "Hi " + (data.client_name || "there").split(" ")[0] +
          " — your estimate is ready. Create a password to claim your portal and view it.";
        $("signup-err").hidden = true;
        $("signup-err").textContent = "";
        show("view-signup");
      }
      return true;
    });
  }

  function clearInviteFromUrl() {
    if (!invite.job && !invite.token) return;
    try {
      history.replaceState({}, "", location.pathname || "/");
    } catch (err) {}
    invite.job = "";
    invite.token = "";
  }

  $("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("signup-err").hidden = true;
    api("portal_register", {
      job_number: invite.job,
      invite_token: invite.token,
      email: $("su-email").value,
      password: $("su-password").value,
      phone_last4: $("su-phone").value
    }).then(function (data) {
      if (!data.ok) {
        var err = data.error || "Registration failed.";
        if (/account exists/i.test(err)) {
          $("li-email").value = $("su-email").value;
          show("view-login");
          $("login-err").textContent = "You already have a login. Sign in with your password.";
          $("login-err").hidden = false;
          return;
        }
        $("signup-err").textContent = err;
        $("signup-err").hidden = false;
        return;
      }
      saveSession(data.session);
      clearInviteFromUrl();
      openJobHome(data);
    });
  });

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("login-err").hidden = true;
    api("portal_login", {
      email: $("li-email").value,
      password: $("li-password").value,
      job_number: invite.job || undefined,
      invite_token: invite.token || undefined
    }).then(function (data) {
      if (!data.ok) {
        $("login-err").textContent = data.error || "Sign in failed.";
        $("login-err").hidden = false;
        return;
      }
      saveSession(data.session);
      clearInviteFromUrl();
      openJobHome(data);
    });
  });

  $("go-login").addEventListener("click", function (e) {
    e.preventDefault();
    show("view-login");
  });

  $("sign-out").addEventListener("click", function () {
    saveSession("");
    state.job = null;
    state.jobs = [];
    location.href = "index.html";
  });

  if ($("back-jobs-link")) {
    $("back-jobs-link").addEventListener("click", function (e) {
      e.preventDefault();
      if (state.jobs && state.jobs.length) renderJobsList();
      else {
        api("portal_jobs", { session: state.session }).then(function (data) {
          if (data.ok) {
            state.jobs = data.jobs || [];
            renderJobsList();
          }
        });
      }
    });
  }
  $("accept-btn").addEventListener("click", function () {
    startDepositCheckout($("accept-btn"));
  });

  $("retry-deposit-btn").addEventListener("click", function () {
    startDepositCheckout($("retry-deposit-btn"));
  });

  $("message-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("msg-err").hidden = true;
    var body = $("msg-body").value.trim();
    if (!body) return;
    api("portal_message_send", { session: state.session, body: body }).then(function (data) {
      if (!data.ok) {
        $("msg-err").textContent = data.error || "Send failed.";
        $("msg-err").hidden = false;
        return;
      }
      $("msg-body").value = "";
      renderMessages(data.messages);
    });
  });

  function selectTab(which) {
    var docs = which === "docs";
    $("tab-docs").setAttribute("aria-selected", docs ? "true" : "false");
    $("tab-messages").setAttribute("aria-selected", docs ? "false" : "true");
    $("panel-docs").classList.toggle("hidden", !docs);
    $("panel-messages").classList.toggle("hidden", docs);
    if (!docs) refreshMessages();
  }

  $("tab-docs").addEventListener("click", function () { selectTab("docs"); });
  $("tab-messages").addEventListener("click", function () { selectTab("messages"); });

  state.session = loadSession();

  // Invite links skip the Loading screen entirely (see bootInvite).
  if (qs("job")) {
    show("view-signup");
  } else {
    show("view-loading");
  }

  // Prefer invite params over any saved session so claim/login is never skipped.
  bootInvite().then(function (handled) {
    if (handled) return;
    return handleDepositReturn().then(function (depositHandled) {
      if (depositHandled) return;
      return bootWithSession().then(function (ok) {
        if (!ok) show("view-login");
      });
    });
  }).catch(function () {
    $("error-text").textContent = "Network error. Try again or call 727-902-1986.";
    show("view-error");
  });
})();
