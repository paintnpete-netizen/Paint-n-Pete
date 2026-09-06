(function (root) {
  function renderProposal(job, doc) {
    doc = doc || document;
    if (!job) return;

    function $(id) {
      return doc.getElementById(id);
    }

    function set(id, value) {
      var el = $(id);
      if (el) el.textContent = value == null ? "" : String(value);
    }

    set("doc-number", job.number);
    set("meta-work", job.work || "");
    var workEl = $("meta-work");
    if (workEl) workEl.hidden = !job.work;
    set("meta-date", job.date);
    set("meta-client", job.client);
    set("meta-phone", job.phone);
    set("meta-email", job.email);
    set("meta-site", job.site);
    set("headline", job.headline);
    set("lede", job.lede);
    set("deposit", job.deposit);
    set("validity", job.validity);
    set("accept", job.accept);
    set("fine", job.fine);

    var prices = $("prices");
    if (prices) {
      var many = (job.prices || []).length > 1;
      prices.innerHTML = (job.prices || []).map(function (p) {
        var cls = "price" + (p.total ? " total" : many ? " line" : "");
        var amt = p.total || !many ? "amt" : "amt alt";
        return '<div class="' + cls + '"><span class="' + amt + '">' + p.amount + '</span><span class="how">' + p.label + "</span></div>";
      }).join("");
    }

    var scope = $("scope");
    if (scope) {
      scope.innerHTML = (job.scope || []).map(function (item, i) {
        var lis = (item.included || []).map(function (x) { return "<li>" + x + "</li>"; }).join("");
        return '<article class="item"><span class="num-circ">' + (i + 1) + "</span><div><h4>" + item.title + "</h4><p>" + item.body + '</p><p class="inc">What\'s included</p><ul>' + lis + "</ul></div></article>";
      }).join("");
    }

    var addonsWrap = $("custom-addons-wrap");
    var addonsBody = $("custom-addons");
    var addons = job.customAddons || [];
    if (addonsWrap && addonsBody) {
      if (addons.length) {
        addonsWrap.hidden = false;
        addonsBody.innerHTML = addons.map(function (row) {
          return "<tr><td>" + row.label + "</td><td class=\"amt-col\">" + row.amount + "</td></tr>";
        }).join("");
      } else {
        addonsWrap.hidden = true;
        addonsBody.innerHTML = "";
      }
    }

    var body = $("products");
    if (body) {
      body.innerHTML = (job.products || []).map(function (row) {
        return "<tr><td>" + row.surface + "</td><td>" + row.product + "</td><td>" + row.sheen + "</td><td>" + row.why + "</td></tr>";
      }).join("");
    }

    function list(id, items) {
      var el = $(id);
      if (!el) return;
      el.innerHTML = (items || []).map(function (x) {
        return "<li>" + x + "</li>";
      }).join("");
    }
    list("included", job.included);
    list("excluded", job.excluded);

    var sequence = $("sequence");
    if (sequence) {
      sequence.innerHTML = (job.sequence || []).map(function (x, i) {
        return '<div class="step"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
      }).join("");
    }

    var terms = $("terms");
    if (terms) {
      terms.innerHTML = (job.terms || []).map(function (x, i) {
        return '<div class="term"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
      }).join("");
    }

    if (doc === document) {
      document.title = "Paint'n Pete — Estimate " + job.number + " — " + job.client;
    }

    var warn = $("warn");
    if (warn) {
      var blob = JSON.stringify(job);
      if (/\[PRICE\]|\[CLIENT\]|\[JOB SITE|PNP-YYYY/.test(blob)) warn.classList.add("show");
      else warn.classList.remove("show");
    }
  }

  root.PNP_renderProposal = renderProposal;

  var stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("pnp-proposal-job") || "null");
  } catch (err) {
    stored = null;
  }
  // Prefer injected letter from the drawer. Only fall back to localStorage when
  // opening proposal.html alone (no window.JOB).
  var job = root.JOB != null ? root.JOB : stored;
  if (job && !root.PNP_SKIP_AUTO_RENDER) renderProposal(job, document);
})(typeof window !== "undefined" ? window : this);
