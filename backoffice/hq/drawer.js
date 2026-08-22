(function () {
  var DB_NAME = "pnp-estimates";
  var STORE = "jobs";
  var PRESETS = ["Living room", "Kitchen", "Primary bedroom", "Bedroom", "Bathroom", "Hallway", "Laundry", "Dining", "Exterior"];
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

  function uid() {
    return "j-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function todayISO() {
    var d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function pnpNumber(dateStr) {
    var d = (dateStr || todayISO()).replace(/-/g, "");
    return "PNP-" + d.slice(0, 4) + "-" + d.slice(4, 8);
  }

  function newJob() {
    return {
      id: uid(),
      number: pnpNumber(todayISO()),
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
    if (kind === "exterior") return "Exterior";
    if (kind === "both") return "Interior & exterior";
    return "Interior";
  }

  function pickLine(job) {
    var bucket = job.kind === "exterior" ? "exterior" : "interior";
    var set = LINES[bucket];
    return set[job.line] || set.aura;
  }

  function productRows(job) {
    if (job.kind === "both") {
      var inn = (LINES.interior[job.line] || LINES.interior.aura).rows;
      var out = (LINES.exterior[job.line] || LINES.exterior.aura).rows;
      return inn.concat(out.filter(function (r) { return r.surface !== "Primer (as needed)"; }));
    }
    return pickLine(job).rows;
  }

  function applyKindUI(kind) {
    document.querySelectorAll("[data-kind]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-kind") === kind ? "true" : "false");
    });
    var btn = $("#add-room-btn");
    var h = $("#rooms-heading");
    if (kind === "exterior") {
      if (h) h.textContent = "Elevations";
      if (btn) btn.textContent = "Add an elevation";
    } else if (kind === "both") {
      if (h) h.textContent = "Rooms & elevations";
      if (btn) btn.textContent = "Add a room or elevation";
    } else {
      if (h) h.textContent = "Rooms";
      if (btn) btn.textContent = "Add a room";
    }
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
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[Number(p[1]) - 1] + " " + Number(p[2]) + ", " + p[0];
  }

  function buildLetter(job) {
    var line = pickLine(job);
    var rooms = job.rooms || [];
    var names = rooms.map(function (r) { return r.name || (job.kind === "exterior" ? "Elevation" : "Room"); });
    var roomList = names.length ? names.join(", ").replace(/, ([^,]*)$/, ", and $1") : "the areas walked";
    var occ = job.occupancy === "occupied"
      ? (job.kind === "exterior"
        ? "The house stays occupied. We protect plantings and openings, and we work the weather window rather than our convenience."
        : job.kind === "both"
        ? "You'll be in the house while we work. Interior is sequenced room by room so you always have usable space; exterior works the weather window, not our convenience."
        : "You'll be in the house while we work. We sequence room by room so you always have usable space.")
      : "The house will be vacant while we work.";
    var days = job.days ? " We're off site in " + job.days + "." : "";
    var kind = job.kind === "exterior" ? "exterior" : job.kind === "both" ? "interior and exterior" : "interior";
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
      }
      if (r.condition) body += " Condition: " + r.condition + ".";
      if (r.notes) body += " " + r.notes;
      if (job.colors) body += " Color direction: " + job.colors + ".";
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

    var prices = q.prices && q.prices.length ? q.prices : [{ amount: "[PRICE]", label: "Add measurements to price this job" }];
    job.priceSpecified = q.total ? q.money : "";

    var excluded = [
      "Wallpaper removal",
      "Popcorn or textured ceiling repair",
      "Moving heavy furniture or packing contents",
      "HOA or building-association approvals",
      "Repairs to wood rot or damaged substrate found after scraping",
      "Client-supplied paint (we can apply it; we cannot warrant the finish)"
    ];
    if (!(cab.doors || cab.drawers || cab.frames || cab.boxes)) {
      excluded.splice(2, 0, "Cabinet refinishing (quote separately)");
    }
    if (job.kind === "interior") excluded.splice(3, 0, "Exterior of any kind");
    if (job.kind === "exterior") excluded.splice(3, 0, "Interior of any kind");

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
      : [
        "Confirm colors in the rooms, in your light",
        "Protect, wash, sand, caulk, spot-prime",
        "Finish coats — sequenced room by room",
        "Final walkthrough; 50% balance due"
      ];

    return {
      number: job.number || pnpNumber(job.date),
      date: fmtDate(job.date) || "[DATE]",
      work: kindLabel(job.kind),
      client: job.client || "[CLIENT]",
      phone: "727-902-1986",
      email: "noah@paintnpete.com",
      site: job.site || "[JOB SITE ADDRESS]",
      headline: "A written proposal for your " + kind + ".",
      lede: (names.length ? (names.length + " area" + (names.length > 1 ? "s" : "") + " walked: " + roomList + ". ") : "") + occ + days + " Two-year workmanship warranty. " + line.label + " specified below." + (q.paintInt || q.paintExt ? " Priced from field measurements at your current rates." : ""),
      prices: prices,
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
      _sqft: sq
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
        var a = el('<a class="card" href="#job/' + j.id + '"><div class="row"><div><h2></h2><p class="meta"></p></div><span class="pill"></span></div></a>');
        a.querySelector("h2").textContent = j.client || "Unnamed walkthrough";
        a.querySelector(".meta").textContent = (j.number || "") + (j.site ? " · " + j.site : "");
        a.querySelector(".pill").textContent = kindLabel(j.kind) + " · " + (j.status || "walkthrough");
        box.appendChild(a);
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
    $("#job-num").textContent = job.number;
    var rates = (typeof PNP !== "undefined" ? PNP.mergeRates(job.rates) : {});
    ["paintPerSqft","washPerSqft","doorInterior","doorExterior","cabinetDoor","cabinetDrawer","cabinetFrame","cabinetBox"].forEach(function (k) {
      var n = document.getElementById("r-" + k);
      if (n) n.value = rates[k];
    });
    var cab = job.cabinets || {};
    $("#c-doors").value = cab.doors || "";
    $("#c-drawers").value = cab.drawers || "";
    $("#c-frames").value = cab.frames || "";
    $("#c-boxes").value = cab.boxes || "";
    renderRooms(job);
    updateQuote(job);
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
    job.rates = {};
    ["paintPerSqft","washPerSqft","doorInterior","doorExterior","cabinetDoor","cabinetDrawer","cabinetFrame","cabinetBox"].forEach(function (k) {
      var n = document.getElementById("r-" + k);
      if (n && n.value !== "") job.rates[k] = n.value;
    });
    job.cabinets = {
      doors: $("#c-doors").value.trim(),
      drawers: $("#c-drawers").value.trim(),
      frames: $("#c-frames").value.trim(),
      boxes: $("#c-boxes").value.trim()
    };
    job.number = pnpNumber(job.date);
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
    var el = $("#quote-out");
    if (el) {
      el.innerHTML = q.total
        ? ("<strong>" + q.money + "</strong> — " + bits.join(" · ") + ". From measurements × your rates.")
        : "Measure rooms or elevations, count doors, and count cabinets. The total is those numbers × the rates below.";
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
    if (kind === "exterior") return SURF.exterior;
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

  function defaultSurfaces(kind) {
    return kind === "exterior" ? ["body", "trim", "fascia"] : ["walls", "ceilings", "trim"];
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
      var nameLbl = isExt ? "Elevation" : job.kind === "both" ? "Room or elevation name" : "Room name";
      var placeSel = job.kind === "both"
        ? '<label>This area</label><select data-k="place"><option value="interior">Interior</option><option value="exterior">Exterior</option></select>'
        : "";
      var dims =
        '<div class="grid2"><div><label>Perimeter (lf)</label><input data-k="perimeter" inputmode="decimal"></div>' +
        '<div><label>Average rise (ft)</label><input data-k="rise" inputmode="decimal"></div></div>' +
        (isExt
          ? '<p class="meta">Face walls = perimeter of the house × average rise. Doors and windows deducted after.</p>'
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
        (isExt ? '<label class="check-line"><input type="checkbox" data-wash> Pressure wash ($0.75 / sq ft of the face)</label>' : "") +
        '<label>Condition</label><input data-k="condition" placeholder="chalking, mildew, peeling, new drywall…" />' +
        '<label>Notes</label><textarea data-k="notes" placeholder="Colors, repairs, access, pets, HOA…"></textarea>' +
        '<p class="sqft" data-sqft></p>' +
        '<label class="cam">Take / upload photos<input type="file" accept="image/*" capture="environment" multiple></label>' +
        '<div class="photos"></div>';
      card.querySelector("h2").textContent = room.name || ((isExt ? "Elevation " : "Room ") + (idx + 1));
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
        inp.addEventListener("change", function () {
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
        });
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
      $("#f-kind").value = kind;
      applyKindUI(kind);
      persist().then(function (job) {
        if (job) { renderRooms(job); updateQuote(job); }
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
          surfaces: defaultSurfaces(job.kind),
          place: job.kind === "exterior" ? "exterior" : "interior",
          wash: job.kind === "exterior",
          condition: "",
          notes: "",
          photos: []
        });
        return saveJob(job);
      }).then(function (job) { renderRooms(job); updateQuote(job); });
    }
    if (act === "generate") {
      persist().then(function (job) {
        var letter = buildLetter(job);
        job.status = job.priceSpecified ? "drafted" : "needs-price";
        job.letter = letter;
        return saveJob(job).then(function () {
          try { localStorage.setItem("pnp-proposal-job", JSON.stringify(letter)); } catch (err) {}
          location.href = "../02-estimating/proposal.html";
        });
      });
    }
    if (act === "send") {
      persist().then(function (job) {
        var letter = job.letter || buildLetter(job);
        var to = encodeURIComponent(job.clientEmail || "");
        var sub = encodeURIComponent("Paint'n Pete estimate " + letter.number + " — " + (job.site || ""));
        var body = encodeURIComponent(
          "Hi " + (job.client || "there") + ",\n\nWritten estimate " + letter.number + " is attached / follows — itemized scope, products, and terms.\n\nReply to this email or sign and send it back to book the work. 50% to schedule, 50% at the final walkthrough.\n\nNoah Kanwal\nPaint'n Pete\n727-902-1986\n"
        );
        job.status = "ready-to-send";
        saveJob(job).then(function () {
          location.href = "mailto:" + to + "?subject=" + sub + "&body=" + body;
        });
      });
    }
    if (act === "save") persist().then(function () { t.textContent = "Saved"; setTimeout(function () { t.textContent = "Save notes"; }, 1200); });
  });

  document.addEventListener("change", function (e) {
    if (!currentJob) return;
    if (e.target.closest(".room-card")) return;
    if (!e.target.closest('[data-view="job"]')) return;
    persist().then(updateQuote);
  });

  window.addEventListener("hashchange", route);
  route();
})();
