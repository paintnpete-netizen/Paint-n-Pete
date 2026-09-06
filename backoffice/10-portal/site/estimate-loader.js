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

  function showError(msg) {
    var loading = document.getElementById("loading");
    if (loading) loading.textContent = msg;
  }

  var isAdmin = qs("admin") === "1";
  var jobNumber = qs("job");
  var body = isAdmin
    ? {
        action: "portal_admin_estimate",
        session: session(),
        job_number: jobNumber
      }
    : { action: "portal_estimate", session: session() };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.ok || !data.estimate) {
        showError(data.error || (isAdmin
          ? "Could not load estimate. Sign in at admin."
          : "Could not load estimate. Sign in from the portal home."));
        return;
      }
      window.JOB = data.estimate;
      if (!window.renderProposal || !window.renderProposal()) {
        showError("Could not render estimate.");
        return;
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
      showError("Network error loading estimate.");
    });
})();
