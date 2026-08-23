(function () {
  var stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("pnp-proposal-job") || "null");
  } catch (err) {
    stored = null;
  }
  var job = stored || window.JOB;
  if (!job) return;

  function set(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null ? "" : String(value);
  }

  set("doc-number", job.number);
  set("meta-work", job.work || "");
  var workEl = document.getElementById("meta-work");
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

  var prices = document.getElementById("prices");
  var many = (job.prices || []).length > 1;
  prices.innerHTML = (job.prices || []).map(function (p) {
    var cls = "price" + (p.total ? " total" : many ? " line" : "");
    var amt = p.total || !many ? "amt" : "amt alt";
    return '<div class="' + cls + '"><span class="' + amt + '">' + p.amount + '</span><span class="how">' + p.label + "</span></div>";
  }).join("");

  var scope = document.getElementById("scope");
  scope.innerHTML = (job.scope || []).map(function (item, i) {
    var lis = (item.included || []).map(function (x) { return "<li>" + x + "</li>"; }).join("");
    return '<article class="item"><span class="num-circ">' + (i + 1) + "</span><div><h4>" + item.title + "</h4><p>" + item.body + '</p><p class="inc">What\'s included</p><ul>' + lis + "</ul></div></article>";
  }).join("");

  var body = document.getElementById("products");
  body.innerHTML = (job.products || []).map(function (row) {
    return "<tr><td>" + row.surface + "</td><td>" + row.product + "</td><td>" + row.sheen + "</td><td>" + row.why + "</td></tr>";
  }).join("");

  function list(id, items, cls) {
    document.getElementById(id).innerHTML = (items || []).map(function (x) {
      return "<li>" + x + "</li>";
    }).join("");
  }
  list("included", job.included);
  list("excluded", job.excluded);

  document.getElementById("sequence").innerHTML = (job.sequence || []).map(function (x, i) {
    return '<div class="step"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
  }).join("");

  document.getElementById("terms").innerHTML = (job.terms || []).map(function (x, i) {
    return '<div class="term"><span class="n">' + (i + 1) + "</span><p>" + x + "</p></div>";
  }).join("");

  document.title = "Paint'n Pete — Estimate " + job.number + " — " + job.client;

  var blob = JSON.stringify(job);
  if (/\[PRICE\]|\[CLIENT\]|\[JOB SITE|PNP-YYYY/.test(blob)) {
    document.getElementById("warn").classList.add("show");
  }
})();
