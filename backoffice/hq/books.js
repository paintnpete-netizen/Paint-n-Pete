(function () {
  var SESSION_KEY = "pnp-portal-admin-session";
  var API = "https://paintnpete-portal.netlify.app/.netlify/functions/portal-api";

  var state = {
    session: "",
    jobs: [],
    jobNumber: "",
    money: null,
    expenses: []
  };

  function $(id) {
    return document.getElementById(id);
  }

  function show(id) {
    ["view-login", "view-list", "view-job", "view-loading"].forEach(function (v) {
      var el = $(v);
      if (el) el.hidden = v !== id;
    });
    $("sign-out").hidden = id === "view-login" || id === "view-loading";
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
    }).catch(function () {
      return { ok: false, error: "Network error" };
    });
  }

  function money(cents) {
    var n = Number(cents) || 0;
    var sign = n < 0 ? "−" : "";
    // Always show cents — $0.50 must not round to $1
    return sign + "$" + Math.abs(n / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function statusLabel(status) {
    var map = {
      estimate_sent: "Estimate sent",
      estimate_accepted: "Checkout started",
      estimate_declined: "Not accepted",
      deposit_paid: "Deposit paid",
      scheduled: "Scheduled",
      in_progress: "In progress",
      paid: "Paid in full",
      closed: "Closed"
    };
    return map[status] || status || "—";
  }

  function formatDate(v) {
    if (!v) return "";
    var d = new Date(v);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function renderList() {
    var box = $("jobs-list");
    var empty = $("jobs-empty");
    box.innerHTML = "";
    var jobs = state.jobs || [];
    empty.hidden = jobs.length > 0;
    jobs.forEach(function (job) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "job-money-row";
      var cash = Number(job.cash_profit_cents) || 0;
      btn.innerHTML =
        "<div><strong>" + (job.client_name || job.job_number || "Job") + "</strong>" +
        '<span class="meta">' + [job.job_number, job.site_address, statusLabel(job.status)].filter(Boolean).join(" · ") +
        "</span></div>" +
        '<div class="job-money-stats">' +
        '<span class="profit' + (cash < 0 ? " neg" : "") + '">' + money(cash) + "</span>" +
        "cash so far · paid " + money(job.collected_cents) + " / " + money(job.charged_cents) +
        "</div>";
      btn.addEventListener("click", function () {
        openJob(job.job_number);
      });
      box.appendChild(btn);
    });
    show("view-list");
  }

  function renderMoneyTiles(m) {
    var tiles = [
      { label: "Job charged", value: m.charged_cents, hint: "Contract / estimate total" },
      { label: "Client paid", value: m.collected_cents, hint: "Deposit (+ balance when paid)" },
      { label: "Still owed", value: m.owed_cents, hint: "Charged − client paid" },
      { label: "Stripe fees", value: m.stripe_fees_cents, hint: "Card processing cost to you" },
      { label: "Net from Stripe", value: m.net_received_cents, hint: "Client paid − Stripe fees" },
      { label: "Job spend", value: m.other_spent_cents, hint: "Materials, labor, etc." },
      { label: "Cash so far", value: m.cash_profit_cents, hint: "Client paid − all costs" },
      { label: "Job profit", value: m.profit_cents, hint: "Charged − all costs (if finished)" }
    ];
    $("money-grid").innerHTML = tiles.map(function (t) {
      var neg = Number(t.value) < 0 ? " neg" : "";
      return '<div class="money-tile"><span>' + t.label + "</span><strong class=\"" + neg + "\">" +
        money(t.value) + "</strong>" +
        (t.hint ? '<em class="tile-hint">' + t.hint + "</em>" : "") +
        "</div>";
    }).join("");
  }

  function renderPayments(m) {
    var list = $("payment-list");
    var empty = $("payment-empty");
    list.innerHTML = "";
    var rows = (m && m.payments) || [];
    empty.hidden = rows.length > 0;
    rows.forEach(function (p) {
      var li = document.createElement("li");
      var fee = Number(p.fee_cents) || 0;
      var meta = [
        formatDate(p.paid_at),
        fee ? ("Stripe fee " + money(fee) + " → net " + money(p.net_cents)) : null,
        p.stripe_id ? ("Stripe " + p.stripe_id) : null
      ].filter(Boolean).join(" · ");
      li.innerHTML =
        "<div><strong>" + money(p.amount_cents) + "</strong> · " + (p.label || p.kind || "Payment") +
        (meta ? '<div class="meta">' + meta + "</div>" : "") +
        "</div>";
      list.appendChild(li);
    });
  }

  function renderExpenses() {
    var list = $("expense-list");
    var empty = $("expense-empty");
    list.innerHTML = "";
    var rows = state.expenses || [];
    empty.hidden = rows.length > 0;
    rows.forEach(function (ex) {
      var li = document.createElement("li");
      li.innerHTML =
        "<div><strong>" + money(ex.amount_cents) + "</strong> · " + (ex.category || "other") +
        '<div class="meta">' + formatDate(ex.spent_at) +
        (ex.note ? " · " + ex.note : "") + "</div></div>";
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "rm";
      rm.textContent = "Remove";
      rm.addEventListener("click", function () {
        api("portal_admin_expense_delete", {
          session: state.session,
          expense_id: ex.id,
          job_number: state.jobNumber
        }).then(function (data) {
          if (!data.ok) {
            alert(data.error || "Could not delete");
            return;
          }
          state.money = data.money;
          state.expenses = data.expenses || [];
          if (state.money) {
            renderMoneyTiles(state.money);
            renderPayments(state.money);
          }
          renderExpenses();
        });
      });
      li.appendChild(rm);
      list.appendChild(li);
    });
  }

  function openJob(jobNumber) {
    show("view-loading");
    state.jobNumber = jobNumber;
    return api("portal_admin_job_ledger", {
      session: state.session,
      job_number: jobNumber
    }).then(function (data) {
      if (!data.ok) {
        alert(data.error || "Could not load job");
        return loadList();
      }
      state.money = data.money;
      state.expenses = data.expenses || [];
      $("job-status").textContent = statusLabel(data.money.status);
      $("job-title").textContent = data.money.client_name || data.money.job_number;
      $("job-sub").textContent = [data.money.job_number, data.money.site_address].filter(Boolean).join(" · ");
      renderMoneyTiles(data.money);
      renderPayments(data.money);
      renderExpenses();
      $("ex-date").value = todayISO();
      show("view-job");
    });
  }

  function loadList() {
    show("view-loading");
    return api("portal_admin_job_ledger", { session: state.session }).then(function (data) {
      if (!data.ok) {
        saveSession("");
        show("view-login");
        return false;
      }
      state.jobs = data.jobs || [];
      renderList();
      return true;
    });
  }

  function boot() {
    state.session = loadSession();
    show("view-loading");
    if (!state.session) {
      $("admin-email").value = "noah@paintnpete.com";
      show("view-login");
      return;
    }
    api("portal_admin_session", { session: state.session }).then(function (data) {
      if (!data.ok) {
        saveSession("");
        $("admin-email").value = "noah@paintnpete.com";
        show("view-login");
        return;
      }
      loadList();
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
        $("login-err").textContent = data.error || "Sign in failed";
        $("login-err").hidden = false;
        return;
      }
      saveSession(data.session);
      loadList();
    });
  });

  $("sign-out").addEventListener("click", function () {
    saveSession("");
    location.reload();
  });

  $("refresh-list").addEventListener("click", function () {
    loadList();
  });

  $("back-list").addEventListener("click", function (e) {
    e.preventDefault();
    loadList();
  });

  $("expense-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("ex-err").hidden = true;
    api("portal_admin_expense_add", {
      session: state.session,
      job_number: state.jobNumber,
      spent_at: $("ex-date").value,
      category: $("ex-category").value,
      amount: $("ex-amount").value,
      note: $("ex-note").value
    }).then(function (data) {
      if (!data.ok) {
        $("ex-err").textContent = data.error || "Could not add";
        $("ex-err").hidden = false;
        return;
      }
      state.money = data.money;
      state.expenses = data.expenses || [];
      $("ex-amount").value = "";
      $("ex-note").value = "";
      if (state.money) {
        renderMoneyTiles(state.money);
        renderPayments(state.money);
      }
      renderExpenses();
    });
  });

  boot();
})();
