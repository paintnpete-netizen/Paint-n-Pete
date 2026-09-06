(function () {
  var DB_NAME = "pnp-estimates";
  var STORE = "jobs";
  // Use the Netlify app URL — portal.paintnpete.com DNS is not on Netlify yet.
  var PORTAL_API = localStorage.getItem("pnp-portal-api") ||
    "https://paintnpete-portal.netlify.app/.netlify/functions/portal-api";
  var PRESETS = ["Living room", "Kitchen", "Primary bedroom", "Bedroom", "Bathroom", "Hallway", "Laundry", "Dining", "Exterior"];
  var RATE_KEYS = ["paintPerSqft", "paintExtPerSqft", "washPerSqft", "doorInterior", "doorExterior",
    "cabinetDoor", "cabinetDrawer", "cabinetFrame", "cabinetBox"];
  var LINES = {
    interior: {
      aura: {
        label: "Benjamin Moore Aura Interior",
        rows: [
          { surface: "Walls", product: "Benjamin Moore Aura Interior", sheen: "Eggshell", why: "Washable, low-odor, holds up to occupied-home traffic" },
          { surface: "Ceilings", product: "Benjamin Moore Aura Interior", sheen: "Matte", why: "Hides roller marks; the ceiling should recede" },
          { surface: "Trim & doors", product: "Benjamin Moore Aura Interior", sheen: "Satin", why: "Durable, wipeable, slight sheen that reads as millwork" },
          { surface: "Primer (as needed)", product: "Fresh Start or equivalent", sheen: "—", why: "Stain-block and adhesion on repaired or glossy spots" }
        ]
      },
      regal: {
        label: "Benjamin Moore Regal Select",
        rows: [
          { surface: "Walls", product: "Benjamin Moore Regal Select", sheen: "Eggshell", why: "Solid occupied-home interior at a lower material cost than Aura" },
          { surface: "Ceilings", product: "Benjamin Moore Regal Select", sheen: "Matte", why: "Even ceiling film without calling attention to itself" },
          { surface: "Trim & doors", product: "Benjamin Moore Advance or Regal Select", sheen: "Satin", why: "Wipeable trim and door film" },
          { surface: "Primer (as needed)", product: "Fresh Start or equivalent", sheen: "—", why: "Stain-block and adhesion on repaired or glossy spots" }
        ]
      },
      duration: {
        label: "Sherwin-Williams Duration",
        rows: [
          { surface: "Walls", product: "Sherwin-Williams Duration", sheen: "Eggshell", why: "Washable interior for Florida humidity and traffic" },
          { surface: "Ceilings", product: "Sherwin-Williams Duration or Ceiling", sheen: "Matte", why: "Flat ceiling that hides overlap" },
          { surface: "Trim & doors", product: "Sherwin-Williams Emerald Urethane or equivalent", sheen: "Satin", why: "Harder film on trim and doors" },
          { surface: "Primer (as needed)", product: "ProBlock or equivalent", sheen: "—", why: "Stain-block and adhesion on repaired or glossy spots" }
        ]
      }
    },
    exterior: {
      aura: {
        label: "Benjamin Moore Aura Exterior",
        rows: [
          { surface: "Body / siding", product: "Benjamin Moore Aura Exterior", sheen: "Low luster or soft gloss", why: "Specified for Florida UV, rain, and salt air — not the cheapest gallon" },
          { surface: "Trim", product: "Benjamin Moore Aura Exterior or Grand Entrance", sheen: "Soft gloss", why: "Harder film on fascia, rakes, and openings" },
          { surface: "Doors", product: "Aura Grand Entrance or equivalent", sheen: "Satin / gloss", why: "Entry film that takes weather and hand traffic" },
          { surface: "Primer (as needed)", product: "Fresh Start or equivalent", sheen: "—", why: "Adhesion on chalked, repaired, or bare substrate" }
        ]
      },
      regal: {
        label: "Benjamin Moore Regal Select Exterior",
        rows: [
          { surface: "Body / siding", product: "Benjamin Moore Regal Select Exterior", sheen: "Low luster", why: "Coastal-capable exterior at a lower material cost than Aura" },
          { surface: "Trim", product: "Regal Select Exterior", sheen: "Soft gloss", why: "Trim and fascia in the same system as the body" },
          { surface: "Doors", product: "Regal Select Exterior or Grand Entrance", sheen: "Satin", why: "Wipeable entry film" },
          { surface: "Primer (as needed)", product: "Fresh Start or equivalent", sheen: "—", why: "Adhesion on chalked or bare substrate" }
        ]
      },
      duration: {
        label: "Sherwin-Williams Duration Exterior",
        rows: [
          { surface: "Body / siding", product: "Sherwin-Williams Duration Exterior", sheen: "Satin or low luster", why: "Florida UV and rain; film thickness matters on the Gulf" },
          { surface: "Trim", product: "Duration Exterior or Emerald", sheen: "Satin", why: "Fascia and openings in a harder film" },
          { surface: "Doors", product: "Emerald Urethane or equivalent", sheen: "Satin / gloss", why: "Entry that can take weather" },
          { surface: "Primer (as needed)", product: "Exterior primer as specified", sheen: "—", why: "Chalk, repairs, and bare wood or masonry" }
        ]
      }
    }
  };

  var SURF = {
    interior: [
      { id: "walls", label: "Walls" },
      { id: "ceilings", label: "Ceilings" },
      { id: "trim", label: "Trim" },
      { id: "doors", label: "Doors" }
    ],
    exterior: [
      { id: "body", label: "Body / siding" },
      { id: "trim", label: "Trim" },
      { id: "fascia", label: "Fascia / soffits" },
      { id: "doors", label: "Doors" }
    ]
  };

  var dbp = null;
  var currentId = null;
  var currentJob = null;

  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbp;
  }

  function tx(mode) {
    return db().then(function (d) { return d.transaction(STORE, mode).objectStore(STORE); });
  }

  function allJobs() {
    return tx("readonly").then(function (s) {
      return new Promise(function (resolve) {
        var req = s.getAll();
        req.onsuccess = function () {
          resolve((req.result || []).sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); }));
        };
      });
    });
  }

  function getJob(id) {
    return tx("readonly").then(function (s) {
      return new Promise(function (resolve) {
        var req = s.get(id);
        req.onsuccess = function () { resolve(req.result); };
      });
    });
  }

  function saveJob(job) {
    job.updated = Date.now();
    return tx("readwrite").then(function (s) {
      return new Promise(function (resolve) {
        s.put(job).onsuccess = function () { resolve(job); };
      });
    });
  }

  function deleteJob(id) {
    return tx("readwrite").then(function (s) {
      return new Promise(function (resolve, reject) {
        var req = s.delete(id);
        req.onsuccess = function () { resolve(); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function clearEstimateStorage() {
    if (dbp) {
      dbp = dbp.then(function (d) {
        try { d.close(); } catch (err) {}
        return null;
      }).catch(function () { return null; });
    }
    dbp = null;
    currentId = null;
    currentJob = null;
    try { localStorage.removeItem("pnp-proposal-job"); } catch (err) {}
    return new Promise(function (resolve, reject) {
      var del = indexedDB.deleteDatabase(DB_NAME);
      del.onsuccess = function () { resolve(); };
      del.onerror = function () { reject(del.error || new Error("Could not clear estimates")); };
      del.onblocked = function () { resolve(); };
    });
  }

  function wipeEstimatesAndReload() {
    return clearEstimateStorage().then(function () {
      var url = location.pathname + (location.hash || "#list");
      location.replace(url);
    });
  }

  function uid() {
    return "j-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function todayISO() {
    var d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function pnpNumber(dateStr, jobId) {
    var d = (dateStr || todayISO()).replace(/-/g, "");
    var base = "PNP-" + d.slice(0, 4) + "-" + d.slice(4, 8);
    var suffix = String(jobId || "").replace(/^j-/, "").replace(/[^a-zA-Z0-9]/g, "").slice(-4);
    return suffix ? base + "-" + suffix : base;
  }

  function newJob() {
    var id = uid();
    return {
      id: id,
      number: pnpNumber(todayISO(), id),
      status: "walkthrough",
      created: Date.now(),
      updated: Date.now(),
      client: "",
      clientPhone: "",
      clientEmail: "",
      site: "",
      date: todayISO(),
      kind: "interior",
      occupancy: "occupied",
      line: "aura",
      days: "",
      colors: "",
      notes: "",
      priceSpecified: "",
      priceValue: "",
      rates: {},
      discountPercent: 0,
      services: {},
      customAddons: [],
      cabinets: { doors: "", drawers: "", frames: "", boxes: "" },
      rooms: []
    };
  }

  function roomSqft(room, job) {
    return (typeof PNP !== "undefined" && PNP.measure) ? PNP.measure(room, job) : { walls: 0, ceiling: 0, wash: 0, doors: 0 };
  }

  function jobSqft(job) {
    return (job.rooms || []).reduce(function (acc, r) {
      var s = roomSqft(r, job);
      acc.walls += s.walls;
      acc.ceiling += s.ceiling;
      return acc;
    }, { walls: 0, ceiling: 0 });
  }

  function compress(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var max = 1400;
        var w = img.width;
        var h = img.height;
        if (w > max) { h = Math.round(h * max / w); w = max; }
        var c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.72));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  function kindLabel(kind) {
    if (kind === "commercial") return "Commercial";
    if (kind === "exterior") return "Exterior";
    if (kind === "both") return "Interior & exterior";
    if (kind === "drywall") return "Drywall";
    return "Interior";
  }

  function pricingKind(job) {
    if (job && job.kind === "commercial") return job.commercialScope || "interior";
    return (job && job.kind) || "interior";
  }

  function commercialWorkLabel(job) {
    var s = (job && job.commercialScope) || "interior";
    if (s === "exterior") return "Commercial exterior";
    if (s === "both") return "Commercial interior & exterior";
    return "Commercial interior";
  }

  function scheduleHoursLabel(v) {
    var map = {
      business: "Standard business hours (7:00 AM – 5:00 PM, weekdays)",
      after_hours: "After-hours only — building occupied during the day",
      weekend: "Weekends and off-hours to minimize tenant disruption",
      phased: "Phased by area — see scope sections for sequence"
    };
    return map[v] || map.business;
  }

  function paymentTermsLabel(job) {
    var p = (job && job.paymentTerms) || "progress";
    if (p === "net30") return "Net 30 from invoice date · Invoice issued on substantial completion";
    if (p === "5050") return "50% to mobilize · 50% at substantial completion";
    if (p === "custom" && job.paymentCustom) return job.paymentCustom;
    return "30% mobilize · 40% at midpoint · 30% at substantial completion";
  }

  function pickLine(job) {
    var bucket = pricingKind(job) === "exterior" ? "exterior" : "interior";
    var set = LINES[bucket];
    return set[job.line] || set.aura;
  }

  function productRows(job) {
    if (pricingKind(job) === "both") {
      var inn = (LINES.interior[job.line] || LINES.interior.aura).rows;
      var out = (LINES.exterior[job.line] || LINES.exterior.aura).rows;
      return inn.concat(out.filter(function (r) { return r.surface !== "Primer (as needed)"; }));
    }
    return pickLine(job).rows;
  }

  function needsExtPaintRate(jobOrKind) {
    var k = typeof jobOrKind === "string" ? jobOrKind : (jobOrKind && jobOrKind.kind);
    if (k === "exterior" || k === "both") return true;
    if (k === "commercial") {
      var scope = typeof jobOrKind === "object" ? jobOrKind.commercialScope : null;
      return scope === "exterior" || scope === "both";
    }
    return false;
  }

  function applyRatesUI(job) {
    var meta = $("#rates-meta");
    var extWrap = $("#r-paint-ext-wrap");
    var intLbl = $("#r-paint-int-label");
    var isComm = job && job.kind === "commercial";
    var showExt = needsExtPaintRate(job || {});
    if (extWrap) extWrap.hidden = !showExt;
    if (intLbl) intLbl.textContent = showExt ? "Interior paint / sq ft" : "Paint / sq ft";
    if (meta) {
      meta.textContent = isComm
        ? "Tampa Bay commercial medians (Aug 2026). Same service list as residential — edit per job if scope differs."
        : "Your numbers. Change them here if a job is different; the letter uses whatever is on this estimate.";
    }
  }

  function applyKindUI(kind) {
    document.querySelectorAll("[data-kind]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-kind") === kind ? "true" : "false");
    });
    var commCard = $("#commercial-card");
    var clientLbl = $("#client-label");
    var siteLbl = $("#site-label");
    var notesLbl = $("#notes-label");
    var isComm = kind === "commercial";
    if (commCard) commCard.hidden = !isComm;
    if (clientLbl) clientLbl.textContent = isComm ? "GC / Property manager" : "Name";
    if (siteLbl) siteLbl.textContent = isComm ? "Project address" : "Job-site address";
    if (notesLbl) notesLbl.textContent = isComm ? "Site & bid notes" : "House notes";
    var btn = $("#add-room-btn");
    var h = $("#rooms-heading");
    var cabCard = $("#cabinets-card");
    if (kind === "commercial") {
      if (h) h.textContent = "Areas / phases";
      if (btn) btn.textContent = "Add an area";
    } else if (kind === "exterior") {
      if (h) h.textContent = "Elevations";
      if (btn) btn.textContent = "Add an elevation";
    } else if (kind === "both") {
      if (h) h.textContent = "Rooms & elevations";
      if (btn) btn.textContent = "Add a room or elevation";
    } else if (kind === "drywall") {
      if (h) h.textContent = "Areas";
      if (btn) btn.textContent = "Add an area";
    } else {
      if (h) h.textContent = "Rooms";
      if (btn) btn.textContent = "Add a room";
    }
    if (cabCard) cabCard.hidden = kind === "drywall";
    var sel = $("#f-line");
    if (sel && sel.options.length >= 3) {
      if (kind === "exterior") {
        sel.options[0].text = "Benjamin Moore Aura Exterior";
        sel.options[1].text = "Benjamin Moore Regal Select Exterior";
        sel.options[2].text = "Sherwin-Williams Duration Exterior";
      } else if (kind === "both") {
        sel.options[0].text = "Aura Interior + Exterior";
        sel.options[1].text = "Regal Interior + Exterior";
        sel.options[2].text = "Duration Interior + Exterior";
      } else {
        sel.options[0].text = "Benjamin Moore Aura Interior";
        sel.options[1].text = "Benjamin Moore Regal Select";
        sel.options[2].text = "Sherwin-Williams Duration";
      }
    }
    applyRatesUI({ kind: kind, commercialScope: $("#f-comm-scope") && $("#f-comm-scope").value });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[Number(p[1]) - 1] + " " + Number(p[2]) + ", " + p[0];
  }

  function buildCommercialLetter(job) {
    var line = pickLine(job);
    var rooms = job.rooms || [];
    var scopeKind = pricingKind(job);
    var names = rooms.map(function (r) {
      return r.name || "Area";
    });
    var roomList = names.length ? names.join(", ").replace(/, ([^,]*)$/, ", and $1") : "the areas walked";
    var sq = jobSqft(job);
    var q = typeof PNP !== "undefined" ? PNP.quote(job) : { prices: [], total: 0, money: "[PRICE]", paintInt: 0, paintExt: 0, washSq: 0, cabinets: {} };
    var occ = job.occupancy === "occupied"
      ? "The building remains occupied. Work zones are isolated, adjacent finishes protected, and access restored at the end of each shift."
      : "Work areas will be vacant during production.";
    var days = job.days ? " Estimated duration: " + job.days + "." : "";
    var colors = job.colors ? " Color direction: " + job.colors + "." : "";
    var notes = job.notes ? " Notes: " + job.notes : "";
    var project = (job.projectName || "").trim() || job.site || "[Project name]";
    var owner = (job.ownerEntity || "").trim() || "As directed by owner";
    var retainPct = String(job.retainagePct || "10").replace(/[^0-9.]/g, "") || "10";

    var scope = rooms.map(function (r) {
      var s = roomSqft(r, job);
      var extArea = typeof PNP !== "undefined" && PNP.areaKind(r, job) === "exterior";
      var surfaces = (r.surfaces || []).join(", ") || (extArea ? "body, trim, and fascia" : "walls, ceilings, and trim");
      var body = (r.name || "Area") + " — " + surfaces + ".";
      if (s.walls) {
        body += " About " + s.walls + " sq ft of wall surface (perimeter × rise, openings deducted)" +
          (!extArea && s.ceiling ? "; " + s.ceiling + " sq ft of ceiling." : ".");
      }
      if (r.doors) body += " " + r.doors + " door(s) / frame(s) in count.";
      if (r.condition) body += " Substrate condition: " + r.condition + ".";
      if (r.notes) body += " " + r.notes;
      return {
        title: (r.name || "Area") + " — " + surfaces,
        body: body,
        included: [
          "Wash, scuff-sand, caulk, and spot-prime as needed for adhesion",
          "Two finish coats on specified surfaces unless noted otherwise",
          "Floor, fixture, and adjacent-finish protection in this area",
          "Daily cleanup; area left broom-clean at end of shift"
        ]
      };
    });

    if (!scope.length) {
      scope = [{
        title: commercialWorkLabel(job) + " — as bid",
        body: "Scope matches the walkthrough and any attached bid documents. Add areas with measurements before sending.",
        included: ["Prep and finish coats per specification below"]
      }];
    }

    scope.push({
      title: "Protection, access & turnover",
      body: scheduleHoursLabel(job.workSchedule || "business") + (job.scheduleNotes ? (" " + job.scheduleNotes) : "") +
        " Final walkthrough with owner's representative before substantial completion.",
      included: [
        "Work-zone isolation and signage as required",
        "Protection of floors, fixtures, and remaining operations",
        "Debris removed; tools and hazards cleared daily",
        "Punch-list touch-ups included in base scope"
      ]
    });

    var checkedServices = (typeof PNP !== "undefined" ? PNP.servicesForKind(job.kind, job) : [])
      .filter(function (svc) { return job.services && job.services[svc.id] && job.services[svc.id].on; })
      .map(function (svc) { return svc.label; });
    if (checkedServices.length) {
      scope.push({
        title: "Additional scope items",
        body: checkedServices.join("; ") + ".",
        included: checkedServices
      });
    }

    var customAddons = (job.customAddons || []).map(function (row) {
      var label = (row.label || "").trim();
      var raw = typeof PNP !== "undefined" && PNP.parseAmount ? PNP.parseAmount(row.amount) : 0;
      if (!label || !raw) return null;
      return { label: label, amount: PNP.money(raw), raw: raw };
    }).filter(Boolean);

    var prices = q.prices && q.prices.length
      ? q.prices.map(function (p, i, arr) {
          return i === arr.length - 1 && arr.length === 1
            ? { amount: p.amount, label: "Base contract — specified scope", total: true }
            : p;
        })
      : [{ amount: "[PRICE]", label: "Add area measurements to price this proposal", total: true }];
    job.priceSpecified = q.total ? q.money : "";

    var surfaces = [];
    var totalW = 0;
    var totalC = 0;
    var totalD = 0;
    rooms.forEach(function (r) {
      var s = roomSqft(r, job);
      totalW += s.walls || 0;
      totalC += s.ceiling || 0;
      totalD += Number(r.doors) || 0;
      surfaces.push({
        area: r.name || "Area",
        walls: s.walls ? s.walls.toLocaleString("en-US") : "—",
        ceiling: s.ceiling ? s.ceiling.toLocaleString("en-US") : "—",
        doors: r.doors ? String(r.doors) : "—",
        notes: [r.condition, r.notes].filter(Boolean).join(" · ")
      });
    });

    var surfaceTotals = rooms.length ? {
      walls: totalW.toLocaleString("en-US"),
      ceiling: totalC.toLocaleString("en-US"),
      doors: String(totalD)
    } : null;

    var excluded = [
      "Wallpaper or covering removal",
      "Lead, asbestos, or mold testing / abatement",
      "Structural repairs or substrate replacement beyond incidental patching",
      "Moving tenant furniture, IT, or specialty equipment",
      "Fireproofing or specialty industrial coatings",
      "Owner-furnished paint (can apply; no finish warranty on client-supplied product)",
      "Permits and fees unless explicitly listed",
      "Mock-ups beyond one standard color sample per area"
    ];
    if (scopeKind === "interior") excluded.splice(4, 0, "Exterior surfaces of any kind");
    if (scopeKind === "exterior") excluded.splice(4, 0, "Interior surfaces of any kind");

    var included = [
      "Labor, materials, and standard consumables for specified surfaces",
      "Surface prep per scope — wash, sand, caulk, spot-prime as listed",
      "Protection and daily cleanup in active work areas",
      "Final walkthrough with owner's representative",
      "Certificate of insurance upon award (additional insured as required)",
      "Two-year workmanship warranty on specified coatings"
    ];

    var assumptions = [
      "Surfaces are sound, dry, and free of active moisture intrusion unless noted in the walkthrough.",
      "Access, power, water, and staging area provided by owner or GC.",
      "Colors and sheens confirmed in writing before production coats begin.",
      "Unforeseen substrate damage discovered after start is a written change order before continuing.",
      "Prevailing wage / certified payroll not included unless stated in writing."
    ];
    if (q.rates) {
      var coRate = q.rates.paintPerSqft;
      if (job.commercialScope === "exterior" && q.rates.paintExtPerSqft != null) {
        coRate = q.rates.paintExtPerSqft;
      }
      assumptions.push("Change-order unit rate for additional paint scope: $" +
        Number(coRate).toFixed(2) + "/sq ft unless otherwise agreed.");
    }

    var qualifications = [
      "Kanwal Consulting LLC DBA Paint'n Pete — licensed Florida business",
      "General liability and workers' compensation certificates available (COI on request)",
      "Occupied-space and after-hours repainting experience",
      "Written prep and protection standards for every crew",
      "Two-year workmanship warranty on specified coatings"
    ];

    var summaryParts = [];
    if (q.paintInt) summaryParts.push(q.paintInt.toLocaleString("en-US") + " sq ft interior paint surface");
    if (q.paintExt) summaryParts.push(q.paintExt.toLocaleString("en-US") + " sq ft exterior paint surface");
    if (names.length) summaryParts.push(names.length + " area(s): " + roomList);
    var summary = (summaryParts.length ? summaryParts.join("; ") + ". " : "") +
      commercialWorkLabel(job) + " proposal. " + line.label + " specified below. " +
      "Two finish coats on specified surfaces unless noted otherwise.";

    return {
      template: "commercial",
      number: job.number || pnpNumber(job.date),
      date: fmtDate(job.date) || "[DATE]",
      work: commercialWorkLabel(job),
      client: job.client || "[GC / Property manager]",
      phone: job.clientPhone || "",
      email: job.clientEmail || "",
      site: job.site || "[Project address]",
      headline: "Painting proposal — " + project,
      lede: occ + days + colors + notes +
        " This proposal is based on field measurements and the scope described below.",
      summary: summary,
      parties: [
        { label: "Submitted to", value: job.client || "[GC / Property manager]" },
        { label: "Project", value: project },
        { label: "Owner / tenant", value: owner },
        { label: "Proposal date", value: fmtDate(job.date) || "[DATE]" },
        { label: "Bid due", value: job.bidDue ? fmtDate(job.bidDue) : "N/A" },
        { label: "Job site", value: job.site || "[Project address]" },
        { label: "Contact", value: [job.clientPhone, job.clientEmail].filter(Boolean).join(" · ") || "—" }
      ],
      prices: prices,
      customAddons: customAddons,
      deposit: paymentTermsLabel(job),
      validity: "Valid 30 days from proposal date",
      retainage: "Retainage: " + retainPct + "% held until punch-list completion unless owner contract states otherwise.",
      scope: scope,
      surfaces: surfaces,
      surfaceTotals: surfaceTotals,
      products: productRows(job),
      schedule: {
        hours: scheduleHoursLabel(job.workSchedule || "business"),
        phasing: (job.workSchedule === "phased" ? "Phased by area — see scope sections." : "Single mobilization unless alternates are accepted."),
        duration: job.days || "Confirm after award and final color approval.",
        access: job.scheduleNotes || "Confirm lifts, escorts, badges, and staging with GC before mobilization."
      },
      qualifications: qualifications,
      included: included,
      excluded: excluded,
      assumptions: assumptions,
      sequence: [
        "Pre-construction meeting — contacts, phasing, submittals, and protection plan",
        "Mobilize — signage, work-zone isolation, and surface prep per specification",
        "Prime and finish coats — sequenced to minimize disruption to operations",
        "Substantial completion walkthrough — punch list issued",
        "Final touch-ups and turnover documentation"
      ],
      terms: [
        paymentTermsLabel(job) + ".",
        "Change orders in writing before extra work; unit rates in Assumptions unless otherwise agreed.",
        "Proposal valid 30 days. Insurance certificates furnished within 5 business days of award.",
        "Retainage: " + retainPct + "% unless owner contract states otherwise.",
        "Substantial completion: specified surfaces coated per scope, punch list issued."
      ],
      accept: "Sign below and return with purchase order or signed contract, or reply by email to authorize mobilization. We will confirm start date and issue COI naming required additional insureds.",
      fine: "This proposal is an offer to perform work as described. Owner/GC contract documents govern if they conflict. Weather, cure time, and upstream trade delays may adjust the schedule. Valid 30 days.",
      _sqft: sq,
      _quote: q
    };
  }

  function buildLetter(job) {
    if (job.kind === "commercial") return buildCommercialLetter(job);
    var line = pickLine(job);
    var rooms = job.rooms || [];
    var names = rooms.map(function (r) { return r.name || (job.kind === "exterior" ? "Elevation" : job.kind === "drywall" ? "Area" : "Room"); });
    var roomList = names.length ? names.join(", ").replace(/, ([^,]*)$/, ", and $1") : "the areas walked";
    var occ = job.occupancy === "occupied"
      ? (job.kind === "exterior"
        ? "The house stays occupied. We protect plantings and openings, and we work the weather window rather than our convenience."
        : job.kind === "both"
        ? "You'll be in the house while we work. Interior is sequenced room by room so you always have usable space; exterior works the weather window, not our convenience."
        : "You'll be in the house while we work. We sequence room by room so you always have usable space.")
      : "The house will be vacant while we work.";
    var days = job.days ? " We're off site in " + job.days + "." : "";
    var colors = job.colors ? " Color direction: " + job.colors + "." : "";
    var notes = job.notes ? " Notes from the walkthrough: " + job.notes : "";
    var kind = job.kind === "exterior" ? "exterior" : job.kind === "both" ? "interior and exterior" : job.kind === "drywall" ? "drywall" : "interior";
    var sq = jobSqft(job);
    var q = typeof PNP !== "undefined" ? PNP.quote(job) : { prices: [], total: 0, money: "[PRICE]", paintInt: 0, paintExt: 0, washSq: 0, cabinets: {} };

    var scope = rooms.map(function (r) {
      var s = roomSqft(r, job);
      var extArea = typeof PNP !== "undefined" && PNP.areaKind(r, job) === "exterior";
      var surfaces = (r.surfaces || []).join(", ") || (extArea ? "body, trim, and fascia" : "walls, ceilings, and trim");
      var body = (r.name || "Area") + " — " + surfaces + ".";
      if (s.walls) {
        body += " About " + s.walls + " sq ft of wall (perimeter × average rise, openings deducted)" +
          (!extArea && s.ceiling ? " and " + s.ceiling + " sq ft of ceiling." : ".");
      } else if (s.perimeter || s.rise) {
        body += " Measurements on file; confirm openings before start.";
      }
      if (r.doors) body += " " + r.doors + " door(s) counted.";
      if (r.windows) body += " " + r.windows + " window(s) deducted from wall area.";
      if (extArea && r.wash !== false && s.wash) body += " Pressure wash about " + s.wash + " sq ft of face.";
      if (r.condition) body += " Condition: " + r.condition + ".";
      if (r.notes) body += " " + r.notes;
      return {
        title: (r.name || "Area") + " — " + surfaces,
        body: body,
        included: job.kind === "exterior"
          ? [
            "Wash, scrape, sand, and spot-prime as needed",
            "Two finish coats on specified surfaces",
            "Caulk open joints at trim and openings",
            "Color confirmation on the elevation, in that light"
          ]
          : [
            "Wash, scuff-sand, and spot-prime as needed",
            "Two finish coats on specified surfaces",
            r.doors ? (r.doors + " door(s) / frame(s) in the count") : "Openings masked or included as noted",
            "Color confirmation in the room before we start"
          ]
      };
    });

    if (!scope.length) {
      scope = [{
        title: kindLabel(job.kind) + " — surfaces as walked",
        body: "Scope will match the walkthrough notes. Add rooms or elevations and measurements before sending.",
        included: ["Prep and two finish coats on specified surfaces"]
      }];
    }

    var cab = (q && q.cabinets) || {};
    if (cab.doors || cab.drawers || cab.frames || cab.boxes) {
      var bits = [];
      if (cab.doors) bits.push(cab.doors + " door" + (cab.doors === 1 ? "" : "s"));
      if (cab.drawers) bits.push(cab.drawers + " drawer" + (cab.drawers === 1 ? "" : "s"));
      if (cab.frames) bits.push(cab.frames + " frame" + (cab.frames === 1 ? "" : "s"));
      if (cab.boxes) bits.push(cab.boxes + " box" + (cab.boxes === 1 ? "" : "es"));
      scope.push({
        title: "Cabinet painting",
        body: bits.join(", ") + ". Priced per piece — doors, drawers, frames, and boxes counted on site.",
        included: [
          "Remove hardware; doors and drawer fronts finished off the boxes",
          "Frames and boxes finished in place",
          "Reinstall doors, drawers, and hardware"
        ]
      });
    }

    if (job.kind === "exterior") {
      scope.push({
        title: "Prep, protection, and weather window",
        body: "Wash, scrape, sand, caulk, and prime to a sound substrate. We will not topcoat in conditions that compromise the film. Plantings, openings, and remaining contents protected.",
        included: [
          "Pressure-appropriate wash and dry time",
          "Scrape, sand, caulk, spot-prime",
          "Final walkthrough before we leave"
        ]
      });
    } else if (job.kind === "drywall") {
      scope.push({
        title: "Drywall scope and finish level",
        body: "Hang, tape, mud, and finish to the level specified in the services checked below. Furniture protection and daily cleanup included.",
        included: [
          "Floor and furniture protection",
          "Hang and finish per checked services",
          "Final walkthrough before we leave"
        ]
      });
    } else if (job.kind === "both") {
      scope.push({
        title: "Prep, protection, and daily cleanup",
        body: "Interior: occupied-home protection, work zones sealed, house put back at the end of every shift. Exterior: wash, scrape, sand, caulk, and prime; finish coats only in a weather window that will hold.",
        included: [
          "Floor, fixture, and furniture protection inside",
          "Planting and opening protection outside",
          "Daily tidy; final walkthrough before we leave"
        ]
      });
    } else {
      scope.push({
        title: "Prep, protection, and daily cleanup",
        body: job.occupancy === "occupied"
          ? "Occupied-home protocol: floors and furnishings protected, HVAC returns covered, work zones sealed, and the house put back at the end of every shift — not at the end of the job."
          : "Floors and remaining contents protected. Work zones kept clean; final walkthrough before we leave.",
        included: [
          "Floor, fixture, and furniture protection",
          "Daily tidy so rooms can be used overnight",
          "Final walkthrough before we leave"
        ]
      });
    }

    var prices = q.prices && q.prices.length ? q.prices : [{ amount: "[PRICE]", label: "Add measurements (perimeter × rise) or cabinet counts to price this job" }];
    job.priceSpecified = q.total ? q.money : "";

    var excluded = [
      "Popcorn or textured ceiling repair",
      "Moving heavy furniture or packing contents",
      "HOA or building-association approvals",
      "Repairs to wood rot or damaged substrate found after scraping",
      "Client-supplied paint (we can apply it; we cannot warrant the finish)"
    ];
    if (!(cab.doors || cab.drawers || cab.frames || cab.boxes)) {
      excluded.splice(1, 0, "Cabinet refinishing (quote separately)");
    }
    if (job.kind === "interior") excluded.splice(2, 0, "Exterior of any kind");
    if (job.kind === "exterior") excluded.splice(2, 0, "Interior of any kind");
    if (job.kind === "drywall") {
      excluded = excluded.filter(function (x) {
        return x !== "Popcorn or textured ceiling repair";
      });
    }

    var checkedServices = (typeof PNP !== "undefined" ? PNP.servicesForKind(job.kind) : [])
      .filter(function (svc) { return job.services && job.services[svc.id] && job.services[svc.id].on; })
      .map(function (svc) { return svc.label; });
    if (checkedServices.length) {
      scope.push({
        title: "Selected services",
        body: checkedServices.join("; ") + ".",
        included: checkedServices
      });
    }

    var customAddons = (job.customAddons || []).map(function (row) {
      var label = (row.label || "").trim();
      var raw = typeof PNP !== "undefined" && PNP.parseAmount ? PNP.parseAmount(row.amount) : 0;
      if (!label || !raw) return null;
      return { label: label, amount: PNP.money(raw), raw: raw };
    }).filter(Boolean);

    var included = job.kind === "exterior"
      ? [
        "Color guidance on the elevation, in that light",
        "Wash, scrape, sand, caulk, and prime as specified",
        "Two finish coats on every specified surface",
        "Planting and opening protection",
        "Final walkthrough before we leave",
        "Two-year workmanship warranty"
      ]
      : job.kind === "both"
      ? [
        "Color guidance in the rooms and on the elevations",
        "Occupied-home sequencing inside; weather window outside",
        "Floor, fixture, furniture, planting, and opening protection",
        "Two finish coats on every specified surface",
        "Final walkthrough before we leave",
        "Two-year workmanship warranty"
      ]
      : job.kind === "drywall"
      ? [
        "Floor, fixture, and furniture protection",
        "Drywall hang and finish per checked services",
        "Daily cleanup; final walkthrough before we leave",
        "Two-year workmanship warranty"
      ]
      : [
        "Color guidance in your light before we open a can",
        "Occupied-home sequencing — you always have usable space",
        "Floor, fixture, and furniture protection",
        "Daily cleanup; house restored at the end of every shift",
        "Two finish coats on every specified surface",
        "Final walkthrough before we leave",
        "Two-year workmanship warranty"
      ];
    if (q.washSq) included.splice(-2, 0, "Pressure washing of specified elevations");
    if (q.doorInt || q.doorExt) included.splice(-2, 0, "Door painting as counted on the walkthrough");
    if (cab.doors || cab.drawers || cab.frames || cab.boxes) included.splice(-2, 0, "Cabinet painting as counted — doors, drawers, frames, boxes");

    var sequence = job.kind === "exterior"
      ? [
        "Confirm colors on the elevation, in the light it actually gets",
        "Wash, scrape, sand, caulk, spot-prime; let the substrate dry",
        "Finish coats — weather window, not our convenience",
        "Final walkthrough; 50% balance due"
      ]
      : job.kind === "both"
      ? [
        "Confirm interior colors in the rooms, and exterior colors on the elevations",
        "Interior: protect, wash, sand, caulk, spot-prime, then finish coats room by room",
        "Exterior: wash, scrape, sand, caulk, spot-prime; finish in the weather window",
        "Final walkthrough; 50% balance due"
      ]
      : job.kind === "drywall"
      ? [
        "Confirm areas, finish level, and texture selection",
        "Protect floors and contents; hang and tape per scope",
        "Skim, texture, and sand to specified level",
        "Final walkthrough; 50% balance due"
      ]
      : [
        "Confirm colors in the rooms, in your light",
        "Protect, wash, sand, caulk, spot-prime",
        "Finish coats — sequenced room by room",
        "Final walkthrough; 50% balance due"
      ];

    var pricedNote = q.total
      ? " Investment below is calculated from field measurements × your current rates (" +
        (q.rates ? ("paint $" + Number(q.rates.paintPerSqft).toFixed(2) + "/sq ft") : "current rates") + ")."
      : "";

    return {
      number: job.number || pnpNumber(job.date),
      date: fmtDate(job.date) || "[DATE]",
      work: kindLabel(job.kind),
      client: job.client || "[CLIENT]",
      phone: job.clientPhone || "",
      email: job.clientEmail || "",
      site: job.site || "[JOB SITE ADDRESS]",
      headline: "A written proposal for your " + kind + ".",
      lede: (names.length ? (names.length + " area" + (names.length > 1 ? "s" : "") + " walked: " + roomList + ". ") : "") +
        occ + days + colors + notes +
        " Two-year workmanship warranty. " + line.label + " specified below." + pricedNote,
      prices: prices,
      customAddons: customAddons,
      deposit: "50% to schedule · 50% at completion",
      validity: "Valid 30 days",
      scope: scope,
      products: productRows(job),
      included: included,
      excluded: excluded,
      sequence: sequence,
      terms: [
        "50% to schedule the work, 50% on the day of the final walkthrough.",
        "This proposal is valid 30 days from the date above.",
        "Wood rot, failed previous coatings, or hidden water damage found after we start is a written change order — we stop, show you, and price it before continuing.",
        "Homes built before 1978 require lead-safe work practices; we'll confirm the approach if that applies."
      ],
      accept: "Reply to this email, or sign below and send it back. Either one books the work. I'll confirm dates once the deposit is in.",
      fine: "Extras we find after we start — rot, failed coatings, hidden water damage — are a written change order. HOA or building approvals are yours to obtain. Homes built before 1978 need lead-safe work practices; we'll confirm the approach. Weather and cure time can move an exterior or a close-the-door date. This proposal is valid 30 days.",
      _sqft: sq,
      _quote: q
    };
  }

  function $(sel) { return document.querySelector(sel); }
  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function show(id) {
    document.querySelectorAll("[data-view]").forEach(function (n) {
      n.hidden = n.getAttribute("data-view") !== id;
    });
    document.body.classList.toggle("view-preview", id === "preview");
    document.querySelectorAll("#job-path [data-step]").forEach(function (n) {
      n.classList.toggle("here", n.getAttribute("data-step") === id);
    });
  }

  function openPreview(job) {
    // Always rebuild from the latest form + rates — never show a stale letter.
    var letter = buildLetter(job);
    job.status = job.priceSpecified ? "drafted" : "needs-price";
    job.letter = letter;
    return saveJob(job).then(function () {
      try { localStorage.setItem("pnp-proposal-job", JSON.stringify(letter)); } catch (err) {}
      show("preview");
      var frame = document.getElementById("preview-frame");
      var hint = document.querySelector(".preview-hint");
      if (!frame) return job;
      if (hint) {
        hint.textContent = job.priceSpecified
          ? "Loading preview…"
          : "Loading preview… Tip: add perimeter × rise (or cabinet counts) so Investment can calculate.";
      }

      return fetch("estimating/" + (job.kind === "commercial" ? "commercial-proposal.html" : "proposal.html") + "?v=" + Date.now())
        .then(function (res) {
          if (!res.ok) throw new Error("Could not load estimate template (" + res.status + ")");
          return res.text();
        })
        .then(function (html) {
          var safe = JSON.stringify(letter).replace(/</g, "\\u003c");
          var renderJs = job.kind === "commercial" ? "commercial-proposal-render.js" : "proposal-render.js";
          html = html
            .replace(/href="proposal\.css"/g, 'href="estimating/proposal.css"')
            .replace(/href="commercial-proposal\.css"/g, 'href="estimating/commercial-proposal.css"')
            .replace(/<script src="(?:commercial-)?job\.js"><\/script>\s*/g, "")
            .replace(
              /<script src="(?:commercial-)?proposal-render\.js"><\/script>/g,
              "<script>window.PNP_SKIP_AUTO_RENDER=false;window.JOB=" + safe + ";</script><script src=\"estimating/" + renderJs + "\"></script>"
            );
          frame.removeAttribute("src");
          frame.srcdoc = html;
          if (hint) {
            hint.textContent = job.priceSpecified
              ? ("This is what the client will see. Investment: " + job.priceSpecified + ".")
              : "This is what the client will see. Add measurements so prices calculate from your rates.";
          }
          return job;
        })
        .catch(function (err) {
          if (hint) {
            hint.textContent = "Preview failed: " + (err && err.message ? err.message : String(err));
          }
          try {
            frame.srcdoc =
              "<!DOCTYPE html><html><body style=\"font:16px/1.4 system-ui;padding:1.5rem\">" +
              "<p>Could not load the letter template. Your data is saved.</p>" +
              "<pre style=\"white-space:pre-wrap\">" +
              (letter.client || "") + "\n" + (letter.site || "") + "\n" +
              ((letter.prices || []).map(function (p) { return p.amount + " — " + p.label; }).join("\n")) +
              "</pre></body></html>";
          } catch (e2) {}
          return job;
        });
    });
  }

  function cloneJob(job) {
    var id = uid();
    var copy = JSON.parse(JSON.stringify(job));
    copy.id = id;
    copy.number = pnpNumber(copy.date || todayISO(), id);
    copy.status = "walkthrough";
    copy.portalUrl = "";
    copy.created = Date.now();
    copy.updated = Date.now();
    return copy;
  }

  function portalResultMessage(job, data) {
    var msg = "Submitted to portal.\n\n" + (data.portal_url || "");
    if (data.sms_sent) {
      msg += "\n\nInvite text sent to " + (job.clientPhone || "client") + ".";
    } else if (data.sms_error) {
      msg += "\n\nInvite text was not sent: " + data.sms_error;
      if (data.email_sent) {
        msg += "\n\nInvite email was sent to " + (job.clientEmail || "the client") + " instead.";
      } else {
        msg += "\nCopy the link above and text or email the client manually.";
      }
    } else if (data.email_sent) {
      msg += "\n\nInvite email sent to " + (job.clientEmail || "the client") + ".";
    }
    return msg;
  }

  function publishToPortal(job, btn, opts) {
    opts = opts || {};
    if (opts.fromForm !== false && document.querySelector('[data-view="job"]') && currentJob && currentJob.id === job.id) {
      readForm(job);
    }
    var letter = buildLetter(job);
    if (!job.priceSpecified) {
      return Promise.reject(new Error("Add measurements or cabinet counts so the estimate can calculate a price before submitting to the portal."));
    }
    var originalLabel = btn ? btn.textContent : "Submit to portal";
    if (btn) { btn.disabled = true; btn.textContent = "Submitting…"; }
    return fetch(PORTAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "portal_publish", job: letter })
    }).then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      }).catch(function () {
        return { ok: false, data: { error: "bad response from portal API (" + res.status + ")" } };
      });
    }).then(function (result) {
      if (btn) { btn.disabled = false; btn.textContent = "Update portal"; }
      if (!result.ok || !result.data.ok) {
        if (btn) btn.textContent = originalLabel;
        throw new Error(result.data.error || "Portal submit failed.");
      }
      job.status = "portal-published";
      job.portalUrl = result.data.portal_url;
      job.letter = letter;
      return saveJob(job).then(function () {
        return { job: job, data: result.data };
      });
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
      throw err;
    });
  }

  function emailClientInvite(job, portalUrl) {
    readForm(job);
    var letter = buildLetter(job);
    var first = (job.client || "there").split(/\s+/)[0] || "there";
    var to = encodeURIComponent(job.clientEmail || "");
    var sub = encodeURIComponent("Your Paint'n Pete estimate is ready — " + (letter.number || ""));
    var body = encodeURIComponent(
      "Hi " + first + ",\n\n" +
      "Your written estimate is ready. Claim your client portal profile to view it and message us:\n\n" +
      portalUrl + "\n\n" +
      "Create your password on that page — your personalized estimate will be waiting.\n\n" +
      "Questions? Call 727-902-1986 or reply to this email.\n\n" +
      "Noah Kanwal\nPaint'n Pete\n"
    );
    job.status = "portal-published";
    return saveJob(job).then(function () {
      location.href = "mailto:" + to + "?subject=" + sub + "&body=" + body;
    });
  }

  function renderList() {
    show("list");
    currentId = null;
    currentJob = null;
    allJobs().then(function (jobs) {
      var box = $("#job-list");
      if (!jobs.length) {
        box.innerHTML = '<p class="empty">No estimates in the drawer yet. New estimate starts a folder for this walkthrough.</p>';
        return;
      }
      box.innerHTML = "";
      jobs.forEach(function (j) {
        var published = j.status === "portal-published" || !!j.portalUrl;
        var row = el(
          '<div class="card list-card">' +
            '<a class="list-card-main" href="#job/' + j.id + '">' +
              '<div class="row"><div><h2></h2><p class="meta"></p></div><span class="pill"></span></div>' +
            "</a>" +
            '<div class="list-card-actions">' +
              '<button type="button" class="btn small" data-act="portal-one" data-id="' + j.id + '"></button>' +
              '<button type="button" class="btn ghost small" data-act="duplicate-one" data-id="' + j.id + '">Duplicate</button>' +
              '<button type="button" class="btn ghost small list-delete" data-act="delete-one" data-id="' + j.id + '">Delete</button>' +
            "</div>" +
          "</div>"
        );
        row.querySelector("h2").textContent = j.client || "Unnamed walkthrough";
        row.querySelector(".meta").textContent =
          [j.number, j.site, j.priceSpecified].filter(Boolean).join(" · ");
        row.querySelector(".pill").textContent = kindLabel(j.kind) + " · " + (j.status || "walkthrough");
        row.querySelector('[data-act="portal-one"]').textContent = published ? "Update portal" : "Submit to portal";
        box.appendChild(row);
      });
    });
  }

  function bindJobForm(job) {
    currentId = job.id;
    currentJob = job;
    show("job");
    $("#f-client").value = job.client || "";
    $("#f-phone").value = job.clientPhone || "";
    $("#f-email").value = job.clientEmail || "";
    $("#f-site").value = job.site || "";
    $("#f-date").value = job.date || todayISO();
    $("#f-kind").value = job.kind || "interior";
    applyKindUI($("#f-kind").value);
    $("#f-occupancy").value = job.occupancy || "occupied";
    $("#f-line").value = job.line || "aura";
    $("#f-days").value = job.days || "";
    $("#f-colors").value = job.colors || "";
    $("#f-notes").value = job.notes || "";
    var proj = $("#f-project");
    if (proj) proj.value = job.projectName || "";
    var owner = $("#f-owner");
    if (owner) owner.value = job.ownerEntity || "";
    var bidDue = $("#f-bid-due");
    if (bidDue) bidDue.value = job.bidDue || "";
    var commScope = $("#f-comm-scope");
    if (commScope) commScope.value = job.commercialScope || "interior";
    var workSched = $("#f-work-schedule");
    if (workSched) workSched.value = job.workSchedule || "business";
    var payment = $("#f-payment");
    if (payment) payment.value = job.paymentTerms || "progress";
    var payCustom = $("#f-payment-custom");
    if (payCustom) payCustom.value = job.paymentCustom || "";
    var retain = $("#f-retainage");
    if (retain) retain.value = job.retainagePct != null ? job.retainagePct : "10";
    var schedNotes = $("#f-schedule-notes");
    if (schedNotes) schedNotes.value = job.scheduleNotes || "";
    $("#job-num").textContent = job.number;
    var disc = $("#f-discount");
    if (disc) disc.value = String([5, 10, 15, 20].indexOf(Number(job.discountPercent)) >= 0 ? Number(job.discountPercent) : 0);
    var rates = (typeof PNP !== "undefined" ? PNP.mergeRates(job.rates, job) : {});
    RATE_KEYS.forEach(function (k) {
      var n = document.getElementById("r-" + k);
      if (n) n.value = rates[k];
    });
    var cab = job.cabinets || {};
    $("#c-doors").value = cab.doors || "";
    $("#c-drawers").value = cab.drawers || "";
    $("#c-frames").value = cab.frames || "";
    $("#c-boxes").value = cab.boxes || "";
    renderServices(job);
    renderCustomAddons(job);
    renderRooms(job);
    applyRatesUI(job);
    updateQuote(job);
  }

  function syncCustomAddonsFromDom(job) {
    job.customAddons = job.customAddons || [];
    var rows = document.querySelectorAll("#custom-addons-list .custom-addon-row");
    if (!rows.length) return job;
    job.customAddons = [];
    rows.forEach(function (row) {
      var labelEl = row.querySelector("[data-addon-label]");
      var amtEl = row.querySelector("[data-addon-amount]");
      job.customAddons.push({
        label: labelEl ? labelEl.value.trim() : "",
        amount: amtEl ? amtEl.value.trim() : ""
      });
    });
    return job;
  }

  function renderCustomAddons(job) {
    var box = $("#custom-addons-list");
    if (!box) return;
    job.customAddons = job.customAddons || [];
    if (!job.customAddons.length) job.customAddons.push({ label: "", amount: "" });
    box.innerHTML = "";
    job.customAddons.forEach(function (row, idx) {
      var el = document.createElement("div");
      el.className = "custom-addon-row";
      el.innerHTML =
        '<div><label>Description</label><input data-addon-label placeholder="e.g. Custom trim repair, gate touch-up…" value="' +
        (row.label || "").replace(/"/g, "&quot;") + '"></div>' +
        '<div><label>Price</label><input data-addon-amount inputmode="decimal" placeholder="0" value="' +
        (row.amount || "").replace(/"/g, "&quot;") + '"></div>' +
        '<button type="button" class="rm-addon" aria-label="Remove line">×</button>';
      el.querySelector(".rm-addon").onclick = function () {
        job.customAddons.splice(idx, 1);
        if (!job.customAddons.length) job.customAddons.push({ label: "", amount: "" });
        persist().then(function (j) { renderCustomAddons(j); updateQuote(j); });
      };
      el.querySelectorAll("input").forEach(function (inp) {
        function sync() {
          syncCustomAddonsFromDom(job);
          updateQuote(job);
          persist();
        }
        inp.addEventListener("change", sync);
        inp.addEventListener("blur", sync);
      });
      box.appendChild(el);
    });
  }

  function syncServicesFromDom(job) {
    job.services = job.services || {};
    document.querySelectorAll("#services-list [data-svc]").forEach(function (row) {
      var id = row.getAttribute("data-svc");
      var chk = row.querySelector("[data-svc-on]");
      var qty = row.querySelector("[data-svc-qty]");
      if (!id || !chk) return;
      job.services[id] = {
        on: chk.checked,
        qty: qty ? qty.value.trim() : ""
      };
    });
    return job;
  }

  function renderServices(job) {
    var box = $("#services-list");
    if (!box || typeof PNP === "undefined" || !PNP.servicesForKind) return;
    var list = PNP.servicesForKind(job.kind || "interior", job);
    var R = PNP.mergeRates(job.rates, job);
    var services = job.services || {};
    box.innerHTML = list.map(function (svc) {
      var sel = services[svc.id] || {};
      var rate = R[svc.rateKey];
      var rateTxt = svc.type === "fixed"
        ? ("$" + Number(rate).toLocaleString("en-US"))
        : svc.type === "per_unit"
        ? ("$" + rate + " / " + (svc.unit || "ea"))
        : ("$" + Number(rate).toFixed(2) + " / sq ft");
      var needsQty = svc.type === "per_sqft" || svc.type === "per_unit" || svc.type === "skim" || svc.id === "hangSheetrock";
      var qtyLabel = svc.type === "per_unit" ? (svc.unit || "qty") : "sq ft";
      var qtyHtml = needsQty
        ? '<div><span class="svc-qty-label">' + qtyLabel + '</span><input class="svc-qty" data-svc-qty inputmode="decimal" placeholder="auto" value="' + (sel.qty || "") + '"></div>'
        : '<div></div>';
      var note = svc.note ? '<span class="svc-note">' + svc.note + " · " + rateTxt + "</span>" : '<span class="svc-note">' + rateTxt + "</span>";
      return '<div class="service-row" data-svc="' + svc.id + '"' + (svc.group ? ' data-svc-group="' + svc.group + '"' : "") + '>' +
        '<label><input type="checkbox" data-svc-on' + (svc.type === "skim" ? ' data-svc-skim' : "") + (sel.on ? " checked" : "") + '> ' +
        svc.label + note + "</label>" + qtyHtml + "</div>";
    }).join("");

    box.querySelectorAll(".service-row").forEach(function (row) {
      var chk = row.querySelector("[data-svc-on]");
      var qty = row.querySelector("[data-svc-qty]");
      function sync() {
        if (chk.hasAttribute("data-svc-skim") && chk.checked) {
          var group = row.getAttribute("data-svc-group");
          box.querySelectorAll('[data-svc-group="' + group + '"] [data-svc-on]').forEach(function (other) {
            if (other !== chk) other.checked = false;
          });
        }
        syncServicesFromDom(job);
        updateQuote(job);
        persist();
      }
      chk.addEventListener("change", sync);
      if (qty) {
        qty.addEventListener("change", sync);
        qty.addEventListener("blur", sync);
      }
    });
  }

  function syncRoomsFromDom(job) {
    var cards = document.querySelectorAll("#rooms .room-card");
    if (!cards.length) return job;
    job.rooms = job.rooms || [];
    while (job.rooms.length < cards.length) {
      job.rooms.push({
        name: "",
        perimeter: "",
        rise: "",
        ceiling: "",
        doors: "",
        windows: "",
        condition: "",
        notes: "",
        surfaces: defaultsForJob(job),
        wash: job.kind === "exterior",
        place: job.kind === "exterior" ? "exterior" : "interior",
        photos: []
      });
    }
    cards.forEach(function (card, idx) {
      var room = job.rooms[idx] || {};
      card.querySelectorAll("[data-k]").forEach(function (inp) {
        room[inp.getAttribute("data-k")] = inp.value;
      });
      surfacesOf(room, card);
      var washEl = card.querySelector("[data-wash]");
      if (washEl) room.wash = washEl.checked;
      if (!room.surfaces || !room.surfaces.length) {
        room.surfaces = defaultSurfaces(
          (typeof PNP !== "undefined" && PNP.areaKind(room, job) === "exterior") || job.kind === "exterior"
            ? "exterior"
            : "interior"
        );
      }
      room.photos = room.photos || [];
      job.rooms[idx] = room;
    });
    if (job.rooms.length > cards.length) job.rooms.length = cards.length;
    return job;
  }

  function readForm(job) {
    job.client = $("#f-client").value.trim();
    job.clientPhone = $("#f-phone").value.trim();
    job.clientEmail = $("#f-email").value.trim();
    job.site = $("#f-site").value.trim();
    job.date = $("#f-date").value;
    job.kind = $("#f-kind").value;
    job.occupancy = $("#f-occupancy").value;
    job.line = $("#f-line").value;
    job.days = $("#f-days").value.trim();
    job.colors = $("#f-colors").value.trim();
    job.notes = $("#f-notes").value.trim();
    var proj = $("#f-project");
    job.projectName = proj ? proj.value.trim() : "";
    var owner = $("#f-owner");
    job.ownerEntity = owner ? owner.value.trim() : "";
    var bidDue = $("#f-bid-due");
    job.bidDue = bidDue ? bidDue.value : "";
    var commScope = $("#f-comm-scope");
    job.commercialScope = commScope ? commScope.value : "interior";
    var workSched = $("#f-work-schedule");
    job.workSchedule = workSched ? workSched.value : "business";
    var payment = $("#f-payment");
    job.paymentTerms = payment ? payment.value : "progress";
    var payCustom = $("#f-payment-custom");
    job.paymentCustom = payCustom ? payCustom.value.trim() : "";
    var retain = $("#f-retainage");
    job.retainagePct = retain ? retain.value.trim() : "10";
    var schedNotes = $("#f-schedule-notes");
    job.scheduleNotes = schedNotes ? schedNotes.value.trim() : "";
    var discEl = $("#f-discount");
    job.discountPercent = discEl ? Number(discEl.value) || 0 : 0;
    job.rates = {};
    RATE_KEYS.forEach(function (k) {
      var n = document.getElementById("r-" + k);
      if (n && n.value !== "") job.rates[k] = n.value;
    });
    job.cabinets = {
      doors: $("#c-doors").value.trim(),
      drawers: $("#c-drawers").value.trim(),
      frames: $("#c-frames").value.trim(),
      boxes: $("#c-boxes").value.trim()
    };
    syncServicesFromDom(job);
    syncCustomAddonsFromDom(job);
    syncRoomsFromDom(job);
    job.number = pnpNumber(job.date, job.id);
    var q = typeof PNP !== "undefined" ? PNP.quote(job) : { total: 0, money: "" };
    job.priceSpecified = q.total ? q.money : "";
    return job;
  }

  function updateQuote(job) {
    var q = typeof PNP !== "undefined" ? PNP.quote(job) : { total: 0, money: "$0", items: [], paintInt: 0, paintExt: 0 };
    var bits = [];
    if (q.paintInt) bits.push(q.paintInt.toLocaleString("en-US") + " sq ft interior");
    if (q.paintExt) bits.push(q.paintExt.toLocaleString("en-US") + " sq ft exterior");
    if (q.washSq) bits.push(q.washSq.toLocaleString("en-US") + " sq ft wash");
    if (q.doorInt) bits.push(q.doorInt + " interior door" + (q.doorInt === 1 ? "" : "s"));
    if (q.doorExt) bits.push(q.doorExt + " exterior door" + (q.doorExt === 1 ? "" : "s"));
    if (q.drywallSq) bits.push(q.drywallSq.toLocaleString("en-US") + " sq ft drywall area");
    if (q.discountPercent) bits.push(q.discountPercent + "% discount");
    var el = $("#quote-out");
    if (el) {
      el.innerHTML = q.total
        ? ("<strong>" + q.money + "</strong> — " + (bits.length ? bits.join(" · ") + ". " : "") + "From measurements, checked services, and your rates.")
        : (job.kind === "drywall"
          ? "Add areas and check drywall services. Per-square-foot lines use qty or measured area."
          : job.kind === "commercial"
          ? "Add areas / phases with measurements. The total feeds the commercial proposal."
          : "Measure rooms or elevations, count doors, check services, and count cabinets. The total is those numbers × the rates below.");
    }
    var box = $("#quote-lines");
    if (box) {
      box.innerHTML = (q.items || []).map(function (line) {
        return "<li><span>" + line.label + "</span><strong>" + line.amount + "</strong></li>";
      }).join("");
    }
  }

  function surfacesOf(room, node) {
    room.surfaces = [];
    node.querySelectorAll("[data-surf]").forEach(function (c) {
      if (c.checked) room.surfaces.push(c.getAttribute("data-surf"));
    });
  }

  function surfList(kind) {
    if (kind === "commercial") kind = "interior";
    if (kind === "exterior") return SURF.exterior;
    if (kind === "drywall") return [{ id: "walls", label: "Walls" }, { id: "ceilings", label: "Ceilings" }];
    if (kind === "both") {
      return SURF.interior.concat([
        { id: "body", label: "Body / siding" },
        { id: "fascia", label: "Fascia / soffits" }
      ]);
    }
    return SURF.interior;
  }

  function measureCaption(s, isExt) {
    if (!s.walls && !s.ceiling) return "";
    var t = s.walls ? (s.walls + " sq ft walls (perimeter × rise, openings deducted)") : "";
    if (!isExt && s.ceiling) t += (t ? " · " : "") + s.ceiling + " sq ft ceiling";
    if (isExt && s.wash) t += (t ? " · " : "") + s.wash + " sq ft wash";
    return t;
  }

  function defaultsForJob(job) {
    var pk = pricingKind(job);
    if (pk === "exterior") return defaultSurfaces("exterior");
    if (pk === "drywall") return defaultSurfaces("drywall");
    if (job.kind === "commercial") return defaultSurfaces("commercial");
    return defaultSurfaces("interior");
  }

  function defaultSurfaces(kind) {
    if (kind === "commercial") return ["walls", "ceilings", "trim", "doors"];
    if (kind === "exterior") return ["body", "trim", "fascia"];
    if (kind === "drywall") return ["walls", "ceilings"];
    return ["walls", "ceilings", "trim"];
  }

  function renderRooms(job) {
    var box = $("#rooms");
    box.innerHTML = "";
    (job.rooms || []).forEach(function (room, idx) {
      var card = el('<article class="card room-card"></article>');
      var isExt = typeof PNP !== "undefined" && PNP.areaKind(room, job) === "exterior";
      var checks = surfList(isExt ? "exterior" : "interior").map(function (s) {
        return '<label><input type="checkbox" data-surf="' + s.id + '"> ' + s.label + "</label>";
      }).join("");
      var nameLbl = isExt ? "Elevation" : job.kind === "commercial" ? "Area / phase name"
        : job.kind === "both" ? "Room or elevation name" : job.kind === "drywall" ? "Area name" : "Room name";
      var placeSel = (job.kind === "both" || (job.kind === "commercial" && job.commercialScope === "both"))
        ? '<label>This area</label><select data-k="place"><option value="interior">Interior</option><option value="exterior">Exterior</option></select>'
        : "";
      var dims =
        '<div class="grid2"><div><label>Perimeter (lf)</label><input data-k="perimeter" inputmode="decimal"></div>' +
        '<div><label>Average rise (ft)</label><input data-k="rise" inputmode="decimal"></div></div>' +
        (isExt
          ? '<p class="meta">Face walls = perimeter of the house × average rise. Doors and windows deducted after.</p>'
          : job.kind === "drywall"
          ? '<p class="meta">Drywall area = wall perimeter × rise plus ceiling sq ft.</p>' +
            '<label>Ceiling (sq ft)</label><input data-k="ceiling" inputmode="decimal" placeholder="include if part of the job" />'
          : '<p class="meta">Walls = room perimeter × average rise. Doors and windows deducted after.</p>' +
            '<label>Ceiling (sq ft)</label><input data-k="ceiling" inputmode="decimal" placeholder="only if ceilings are in the job" />');
      card.innerHTML =
        '<div class="row"><h2></h2><button type="button" class="link rm" style="color:var(--muted);background:none;border:0;font:inherit;cursor:pointer">Remove</button></div>' +
        "<label>" + nameLbl + "</label><input data-k=\"name\" list=\"room-presets\" />" +
        placeSel +
        dims +
        '<div class="grid2"><div><label>Doors (count)</label><input data-k="doors" inputmode="numeric"></div>' +
        '<div><label>Windows</label><input data-k="windows" inputmode="numeric"></div></div>' +
        '<label>Surfaces</label><div class="checks">' + checks + "</div>" +
        (isExt ? '<label class="check-line"><input type="checkbox" data-wash> Pressure wash</label>' : "") +
        '<label>Condition</label><input data-k="condition" placeholder="chalking, mildew, peeling, new drywall…" />' +
        '<label>Notes</label><textarea data-k="notes" placeholder="Colors, repairs, access, pets, HOA…"></textarea>' +
        '<p class="sqft" data-sqft></p>' +
        '<label class="cam">Take / upload photos<input type="file" accept="image/*" capture="environment" multiple></label>' +
        '<div class="photos"></div>';
      card.querySelector("h2").textContent = room.name || (
        job.kind === "commercial" ? ("Area " + (idx + 1)) :
        (isExt ? "Elevation " : "Room ") + (idx + 1)
      );
      ["name","length","width","height","perimeter","rise","ceiling","doors","windows","condition","notes"].forEach(function (k) {
        var n = card.querySelector('[data-k="' + k + '"]');
        if (n) n.value = room[k] || "";
      });
      var periEl = card.querySelector('[data-k="perimeter"]');
      if (periEl && !room.perimeter) {
        if (room.length && room.width) periEl.value = String(2 * (Number(room.length) + Number(room.width)));
        else if (room.length) periEl.value = room.length;
      }
      var riseEl = card.querySelector('[data-k="rise"]');
      if (riseEl && !room.rise && room.height) riseEl.value = room.height;
      var placeEl = card.querySelector('[data-k="place"]');
      if (placeEl) placeEl.value = room.place || "interior";
      var washEl = card.querySelector("[data-wash]");
      if (washEl) washEl.checked = room.wash !== false && isExt;
      (room.surfaces || defaultSurfaces(isExt ? "exterior" : "interior")).forEach(function (s) {
        var c = card.querySelector('[data-surf="' + s + '"]');
        if (c) c.checked = true;
      });
      var sq = roomSqft(room, job);
      card.querySelector("[data-sqft]").textContent = measureCaption(sq, isExt);
      var photoBox = card.querySelector(".photos");
      (room.photos || []).forEach(function (p, pi) {
        var fig = el('<figure><img alt=""><button type="button" aria-label="Remove photo">×</button></figure>');
        fig.querySelector("img").src = p;
        fig.querySelector("button").onclick = function () {
          room.photos.splice(pi, 1);
          persist().then(function (j) { renderRooms(j); });
        };
        photoBox.appendChild(fig);
      });
      card.querySelector(".rm").onclick = function () {
        job.rooms.splice(idx, 1);
        persist().then(function (j) { renderRooms(j); updateQuote(j); });
      };
      card.querySelectorAll("input, textarea, select").forEach(function (inp) {
        function syncField() {
          if (inp.hasAttribute("data-k")) room[inp.getAttribute("data-k")] = inp.value;
          if (inp.hasAttribute("data-wash")) room.wash = inp.checked;
          if (inp.getAttribute("data-k") === "place") {
            if (inp.value === "exterior") {
              room.wash = true;
              room.place = "exterior";
            }
            persist().then(function (j) { renderRooms(j); updateQuote(j); });
            return;
          }
          surfacesOf(room, card);
          card.querySelector("[data-sqft]").textContent = measureCaption(roomSqft(room, job), typeof PNP !== "undefined" && PNP.areaKind(room, job) === "exterior");
          persist().then(updateQuote);
        }
        inp.addEventListener("change", syncField);
        if (inp.matches('input[data-k], textarea[data-k]')) {
          inp.addEventListener("blur", syncField);
        }
      });
      card.querySelector('input[type="file"]').addEventListener("change", function (ev) {
        var files = Array.prototype.slice.call(ev.target.files || []);
        var chain = Promise.resolve();
        files.forEach(function (f) {
          chain = chain.then(function () { return compress(f); }).then(function (data) {
            room.photos = room.photos || [];
            room.photos.push(data);
          });
        });
        chain.then(function () { return persist(); }).then(function (j) { renderRooms(j); });
      });
      box.appendChild(card);
    });
  }

  function persist() {
    if (!currentJob) return Promise.resolve(null);
    readForm(currentJob);
    return saveJob(currentJob);
  }

  function route() {
    var hash = (location.hash || "#list").replace(/^#/, "");
    var parts = hash.split("/");
    if (parts[0] === "job" && parts[1]) {
      getJob(parts[1]).then(function (job) {
        if (!job) { location.hash = "list"; return; }
        bindJobForm(job);
      });
      return;
    }
    renderList();
  }

  document.addEventListener("click", function (e) {
    var kbtn = e.target.closest("[data-kind]");
    if (kbtn && kbtn.getAttribute("data-kind")) {
      e.preventDefault();
      var kind = kbtn.getAttribute("data-kind");
      var prevKind = currentJob && currentJob.kind;
      if (currentJob && (prevKind === "commercial") !== (kind === "commercial")) {
        currentJob.rates = {};
      }
      $("#f-kind").value = kind;
      applyKindUI(kind);
      persist().then(function (job) {
        if (job) { renderServices(job); renderRooms(job); updateQuote(job); }
      });
      return;
    }
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "new") {
      var job = newJob();
      saveJob(job).then(function () { location.hash = "job/" + job.id; });
    }
    if (act === "clear-all") {
      if (!confirm("Clear all estimate folders on this device? This cannot be undone.")) return;
      wipeEstimatesAndReload().catch(function (err) {
        alert(err && err.message ? err.message : String(err));
      });
      return;
    }
    if (act === "portal-one") {
      e.preventDefault();
      e.stopPropagation();
      var pubId = t.getAttribute("data-id");
      if (!pubId) return;
      getJob(pubId).then(function (job) {
        if (!job) return;
        return publishToPortal(job, t, { fromForm: false }).then(function (result) {
          try { navigator.clipboard.writeText(result.data.portal_url); } catch (err) {}
          alert(portalResultMessage(job, result.data));
          renderList();
        });
      }).catch(function (err) {
        var text = err && err.message ? err.message : String(err);
        if (/fetch|Network|Failed|CORS/i.test(text) || text === "Failed to fetch") {
          alert("Could not reach the portal API at " + PORTAL_API + ".\n\n" + text);
        } else {
          alert(text);
        }
      });
      return;
    }
    if (act === "duplicate-one") {
      e.preventDefault();
      e.stopPropagation();
      var dupId = t.getAttribute("data-id");
      if (!dupId) return;
      getJob(dupId).then(function (job) {
        if (!job) return;
        var copy = cloneJob(job);
        return saveJob(copy).then(function () {
          location.hash = "job/" + copy.id;
        });
      }).catch(function (err) {
        alert(err && err.message ? err.message : String(err));
      });
      return;
    }
    if (act === "delete-one") {
      e.preventDefault();
      e.stopPropagation();
      var delId = t.getAttribute("data-id");
      if (!delId) return;
      if (!confirm("Delete this estimate from your folder? This only removes it from this device — not from the client portal.")) return;
      deleteJob(delId).then(function () {
        if (currentId === delId) {
          currentId = null;
          currentJob = null;
          location.hash = "list";
        } else {
          renderList();
        }
      }).catch(function (err) {
        alert(err && err.message ? err.message : String(err));
      });
      return;
    }
    if (act === "add-room") {
      persist().then(function (job) {
        job.rooms = job.rooms || [];
        job.rooms.push({
          id: uid(),
          name: "",
          length: "",
          width: "",
          height: "",
          perimeter: "",
          rise: "",
          ceiling: "",
          doors: "",
          windows: "",
          surfaces: defaultsForJob(job),
          place: job.kind === "exterior" ? "exterior" : "interior",
          wash: job.kind === "exterior",
          condition: "",
          notes: "",
          photos: []
        });
        return saveJob(job);
      }).then(function (job) { renderRooms(job); updateQuote(job); });
    }
    if (act === "add-custom-addon") {
      persist().then(function (job) {
        job.customAddons = job.customAddons || [];
        job.customAddons.push({ label: "", amount: "" });
        return saveJob(job);
      }).then(function (job) { renderCustomAddons(job); updateQuote(job); });
    }
    if (act === "preview" || act === "generate") {
      persist().then(function (job) {
        if (!job.priceSpecified) {
          if (!confirm("No price is set yet. Preview anyway?")) return;
        }
        return openPreview(job);
      });
    }
    if (act === "edit") {
      if (currentJob) bindJobForm(currentJob);
      else if (currentId) location.hash = "job/" + currentId;
      else show("list");
    }
    if (act === "portal") {
      persist().then(function (job) {
        var btn = document.querySelector('[data-view="preview"] [data-act="portal"]') ||
          document.querySelector('[data-act="portal"]');
        return publishToPortal(job, btn).then(function (result) {
          try { navigator.clipboard.writeText(result.data.portal_url); } catch (err) {}
          alert(portalResultMessage(job, result.data));
          location.hash = "list";
        }).catch(function (err) {
          var text = err && err.message ? err.message : String(err);
          if (/fetch|Network|Failed|CORS/i.test(text) || text === "Failed to fetch") {
            alert("Could not reach the portal API at " + PORTAL_API + ".\n\n" + text);
          } else {
            alert(text);
          }
        });
      });
    }
    if (act === "email" || act === "send") {
      persist().then(function (job) {
        if (!job.clientEmail) {
          alert("Add the client's email on the estimate before emailing.");
          return;
        }
        var emailBtn = document.querySelector('[data-view="preview"] [data-act="email"]') ||
          document.querySelector('[data-act="email"]');
        function sendWithUrl(url) {
          return emailClientInvite(job, url);
        }
        if (job.portalUrl) return sendWithUrl(job.portalUrl);
        if (!job.priceSpecified) {
          alert("Set the price, then Submit to portal (or Email will publish first).");
        }
        if (emailBtn) { emailBtn.disabled = true; emailBtn.textContent = "Publishing…"; }
        return publishToPortal(job, null).then(function (result) {
          if (emailBtn) { emailBtn.disabled = false; emailBtn.textContent = "Email client"; }
          try { navigator.clipboard.writeText(result.data.portal_url); } catch (err) {}
          return sendWithUrl(result.data.portal_url);
        }).catch(function (err) {
          if (emailBtn) { emailBtn.disabled = false; emailBtn.textContent = "Email client"; }
          alert(err && err.message ? err.message : String(err));
        });
      });
    }
    if (act === "save") persist().then(function () { t.textContent = "Saved"; setTimeout(function () { t.textContent = "Save"; }, 1200); });
  });

  document.addEventListener("change", function (e) {
    if (!currentJob) return;
    if (e.target.closest(".room-card")) return;
    if (!e.target.closest('[data-view="job"]')) return;
    if (e.target.id === "f-comm-scope") {
      persist().then(function (job) {
        if (!job) return;
        applyRatesUI(job);
        renderServices(job);
        updateQuote(job);
      });
      return;
    }
    persist().then(updateQuote);
  });

  window.addEventListener("hashchange", route);

  (function boot() {
    var params = new URLSearchParams(location.search || "");
    if (params.get("clearEstimates") === "1") {
      clearEstimateStorage().then(function () {
        location.replace(location.pathname + "#list");
      }).catch(function (err) {
        alert(err && err.message ? err.message : String(err));
        route();
      });
      return;
    }
    route();
  })();
})();
