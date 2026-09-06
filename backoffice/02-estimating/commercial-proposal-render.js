(function (root) {
  function renderCommercialProposal(job, doc) {
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
    set("headline", job.headline);
    set("lede", job.lede);
    set("summary", job.summary || "");
    set("deposit", job.deposit);
    set("validity", job.validity);
    set("accept", job.accept);
    set("fine", job.fine);

    var retainage = $("retainage");
    if (retainage) {
      if (job.retainage) {
        retainage.hidden = false;
        retainage.textContent = job.retainage;
      } else {
        retainage.hidden = true;
        retainage.textContent = "";
      }
    }

    var parties = $("parties");
    if (parties) {
      var rows = job.parties || [];
      parties.querySelector("tbody").innerHTML = rows.map(function (row) {
        return "<tr><td>" + row.label + "</td><td>" + row.value + "</td></tr>";
      }).join("");
    }

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
        return '<article class="item"><span class="num-circ">' + (i + 1) + "</span><div><h4>" + item.title + "</h4><p>" + item.body + '</p><p class="inc">Included</p><ul>' + lis + "</ul></div></article>";
      }).join("");
    }

    var surfaces = $("surfaces");
    var surfacesTotal = $("surfaces-total");
    if (surfaces) {
      var surfRows = job.surfaces || [];
      surfaces.innerHTML = surfRows.map(function (row) {
        return "<tr><td>" + row.area + "</td><td>" + (row.walls || "—") + "</td><td>" +
          (row.ceiling || "—") + "</td><td>" + (row.doors || "—") + "</td><td>" +
          (row.notes || "") + "</td></tr>";
      }).join("");
      if (surfacesTotal && job.surfaceTotals) {
        var t = job.surfaceTotals;
        surfacesTotal.innerHTML = "<tr><td>Total</td><td>" + t.walls + "</td><td>" +
          t.ceiling + "</td><td>" + t.doors + "</td><td></td></tr>";
      } else if (surfacesTotal) {
        surfacesTotal.innerHTML = "";
      }
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
        return "<tr><td>" + row.surface + "</td><td>" + row.product + "</td><td>" +
          row.sheen + "</td><td>" + (row.why || row.note || "") + "</td></tr>";
      }).join("");
    }

    var scheduleBlock = $("schedule-block");
    if (scheduleBlock && job.schedule) {
      var s = job.schedule;
      scheduleBlock.innerHTML =
        (s.hours ? '<span class="lbl">Work hours</span><p>' + s.hours + "</p>" : "") +
        (s.phasing ? '<span class="lbl">Phasing</span><p>' + s.phasing + "</p>" : "") +
        (s.duration ? '<span class="lbl">Duration</span><p>' + s.duration + "</p>" : "") +
        (s.access ? '<span class="lbl">Access &amp; protection</span><p>' + s.access + "</p>" : "");
    }

    function list(id, items) {
      var el = $(id);
      if (!el) return;
      el.innerHTML = (items || []).map(function (x) {
        return "<li>" + x + "</li>";
      }).join("");
    }
    list("qualifications", job.qualifications);
    list("included", job.included);
    list("excluded", job.excluded);

    var sequence = $("sequence");
    if (sequence) {
      sequence.innerHTML = (job.sequence || []).map(function (x, i) {
        return '<div class="step"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
      }).join("");
    }

    var assumptions = $("assumptions");
    if (assumptions) {
      assumptions.innerHTML = (job.assumptions || []).map(function (x, i) {
        return '<div class="term"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
      }).join("");
    }

    var terms = $("terms");
    if (terms) {
      terms.innerHTML = (job.terms || []).map(function (x, i) {
        return '<div class="term"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
      }).join("");
    }

    if (doc === document) {
      document.title = "Paint'n Pete — Commercial Proposal " + job.number + " — " + job.client;
    }

    var warn = $("warn");
    if (warn) {
      var blob = JSON.stringify(job);
      if (/\[PRICE\]|\[CLIENT\]|\[JOB SITE|PNP-YYYY/.test(blob)) warn.classList.add("show");
      else warn.classList.remove("show");
    }
  }

  root.PNP_renderCommercialProposal = renderCommercialProposal;

  var stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("pnp-proposal-job") || "null");
  } catch (err) {
    stored = null;
  }
  var job = root.JOB != null ? root.JOB : stored;
  if (job && !root.PNP_SKIP_AUTO_RENDER) renderCommercialProposal(job, document);
})(typeof window !== "undefined" ? window : this);
