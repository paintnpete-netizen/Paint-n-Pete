(function () {
  var CLIENT_SESSION_KEY = "pnp-portal-session";
  var ADMIN_SESSION_KEY = "pnp-portal-admin-session";
  var API = "/.netlify/functions/portal-api";

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }

  function session() {
    try {
      if (qs("admin") === "1") {
        return localStorage.getItem(ADMIN_SESSION_KEY) || "";
      }
      return localStorage.getItem(CLIENT_SESSION_KEY) || "";
    } catch (err) {
      return "";
    }
  }

  function money(cents) {
    return "$" + (Number(cents || 0) / 100).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function showError(msg) {
    var loading = document.getElementById("loading");
    if (loading) loading.textContent = msg;
  }

  var isAdmin = qs("admin") === "1";
  var jobNumber = qs("job");
  var body = isAdmin
    ? {
        action: "portal_admin_bos",
        session: session(),
        job_number: jobNumber
      }
    : { action: "portal_bos", session: session() };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.ok || !data.bos) {
        showError(data.error || "Could not load bill of sale. Sign in from the portal home.");
        return;
      }
      var bos = data.bos;
      document.getElementById("doc-kicker").textContent = bos.title || "Bill of sale";
      document.getElementById("doc-number").textContent = bos.number || "";
      document.getElementById("meta-date").textContent = bos.issued_at
        ? new Date(bos.issued_at).toLocaleString()
        : "";
      document.getElementById("meta-client").textContent = bos.client || "";
      document.getElementById("meta-phone").textContent = bos.phone || "";
      document.getElementById("meta-email").textContent = bos.email || "";
      document.getElementById("meta-site").textContent = bos.site || "";
      document.getElementById("lede").textContent = bos.note || "";
      document.getElementById("paid-kind").textContent =
        bos.kind === "balance" ? "Paid in full" : "Deposit received";
      document.getElementById("paid-amount").textContent = money(bos.amount_paid_cents);
      document.getElementById("totals").innerHTML =
        "Estimate total " + money(bos.estimate_total_cents) +
        "<br />Deposit " + money(bos.deposit_cents) +
        "<br />Balance due " + money(bos.balance_cents);

      if (bos.stripe_payment_id) {
        var ref = document.getElementById("stripe-ref");
        ref.hidden = false;
        ref.textContent = "Payment ref: " + bos.stripe_payment_id;
      }

      var prices = document.getElementById("prices");
      var lines = bos.prices || [];
      if (!lines.length) {
        prices.innerHTML = "<p class=\"meta\">See your written estimate for line-item detail.</p>";
      } else {
        prices.innerHTML = lines.map(function (p) {
          return "<p><strong>" + (p.amount || "") + "</strong> — " + (p.label || "") + "</p>";
        }).join("");
      }

      document.getElementById("loading").hidden = true;
      document.getElementById("sheet").hidden = false;

      if (isAdmin) {
        var link = document.querySelector(".toolbar a");
        if (link) {
          link.href = jobNumber
            ? "admin.html?job=" + encodeURIComponent(jobNumber)
            : "admin.html";
          link.textContent = "← Admin";
        }
      }
    })
    .catch(function () {
      showError("Network error. Try again from the portal home.");
    });
})();
