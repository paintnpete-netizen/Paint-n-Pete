/**
 * Paint'n Pete unit rates — source of truth for the estimate drawer.
 *
 * Residential: Noah (Aug 2026).
 * Commercial: Tampa Bay median market rates (Aug 2026) — synthesized from
 *   Paint Blue (Seminole/Tampa), Highmark Painters (Tampa), Tampa property-
 *   manager guides, and PaintPricing commercial benchmarks. Median of published
 *   per-sq-ft wall-surface ranges; 2 finish coats + standard prep unless noted.
 *
 * Cabinet piece rates (residential): published 2026 contractor model until replaced.
 */
(function (root) {
  /** Residential default rates */
  var RATES = {
    paintPerSqft: 2,
    paintExtPerSqft: 2,
    washPerSqft: 0.15,
    primePerSqft: 0.25,
    wallWashPerSqft: 0.25,
    texturePerSqft: 2.25,
    loxonPerSqft: 0.25,
    scrapePerSqft: 3,
    wallpaperPerSqft: 3,
    sheetrockPerSqft: 4,
    skim3PerSqft: 1,
    skim4PerSqft: 2,
    skim5PerSqft: 6,
    popcornPerSqft: 1.5,
    orangePeelPerSqft: 2,
    knockdownPerSqft: 3,
    skipTrowelPerSqft: 4,
    archwayPerSqft: 8,
    doorInterior: 200,
    doorExterior: 250,
    closetBifold: 150,
    patchSmall: 85,
    patchLarge: 150,
    cleanout: 300,
    sealantBasic: 475,
    sealantAdvanced: 875,
    cabinetDoor: 120,
    cabinetDrawer: 65,
    cabinetFrame: 45,
    cabinetBox: 45
  };

  /**
   * Tampa Bay commercial medians (wall-surface basis, Aug 2026).
   * Interior paint $2.15 — midpoint of local $1.75–$2.50 office/TI range (2 coats).
   * Exterior paint $2.75 — midpoint of local $2.00–$3.50 repaint range (wash + 2 coats).
   * Doors $90/$115 — public bid medians ($65–$100/door interior, full unit).
   */
  var COMMERCIAL_RATES = {
    paintPerSqft: 2.15,
    paintExtPerSqft: 2.75,
    washPerSqft: 0.12,
    primePerSqft: 0.18,
    wallWashPerSqft: 0.2,
    texturePerSqft: 1.95,
    loxonPerSqft: 0.22,
    scrapePerSqft: 2.35,
    wallpaperPerSqft: 2.65,
    sheetrockPerSqft: 3.5,
    skim3PerSqft: 0.85,
    skim4PerSqft: 1.75,
    skim5PerSqft: 5.25,
    popcornPerSqft: 1.3,
    orangePeelPerSqft: 1.75,
    knockdownPerSqft: 2.65,
    skipTrowelPerSqft: 3.5,
    archwayPerSqft: 7,
    doorInterior: 90,
    doorExterior: 115,
    closetBifold: 75,
    patchSmall: 55,
    patchLarge: 95,
    cleanout: 425,
    sealantBasic: 525,
    sealantAdvanced: 925,
    cabinetDoor: 85,
    cabinetDrawer: 48,
    cabinetFrame: 38,
    cabinetBox: 38
  };

  /** Shared service list — commercial uses the same catalog; scope filters match residential. */
  var SERVICE_KINDS = ["interior", "exterior", "both", "drywall", "commercial"];

  /** Checkbox line items shown per estimate kind (also used in proposals). */
  var SERVICE_CATALOG = [
    { id: "cleanoutStart", label: "Furniture / item clean-out (commencement)", type: "fixed", rateKey: "cleanout", kinds: ["interior", "exterior", "both", "drywall", "commercial"] },
    { id: "cleanoutEnd", label: "Furniture / item clean-out (put-back)", type: "fixed", rateKey: "cleanout", kinds: ["interior", "exterior", "both", "drywall", "commercial"] },
    { id: "basicSealantExt", label: "Basic exterior sealant package", type: "fixed", rateKey: "sealantBasic", note: "Resealing windows, repairing holes", kinds: ["exterior", "both", "commercial"] },
    { id: "advancedSealantExt", label: "Advanced exterior sealant package", type: "fixed", rateKey: "sealantAdvanced", note: "Major damage repair or replacement plus basic sealants", kinds: ["exterior", "both", "commercial"] },
    { id: "loxonSealant", label: "Loxon block sealant (clear coat)", type: "per_sqft", rateKey: "loxonPerSqft", kinds: ["exterior", "both", "commercial"] },
    { id: "primingExt", label: "Priming", type: "per_sqft", rateKey: "primePerSqft", kinds: ["exterior", "both", "commercial"] },
    { id: "textureExt", label: "Texture application or reapplication", type: "per_sqft", rateKey: "texturePerSqft", kinds: ["exterior", "both", "commercial"] },
    { id: "scrapeRemoval", label: "Advanced scraping or paint removal", type: "per_sqft", rateKey: "scrapePerSqft", kinds: ["exterior", "both", "commercial"] },
    { id: "basicSealantInt", label: "Basic interior sealant package", type: "fixed", rateKey: "sealantBasic", note: "Resealing windows, repairing holes", kinds: ["interior", "both", "commercial"] },
    { id: "advancedSealantInt", label: "Advanced interior sealant package", type: "fixed", rateKey: "sealantAdvanced", note: "Major damage repair or replacement plus basic sealants", kinds: ["interior", "both", "commercial"] },
    { id: "wallpaperRemoval", label: "Wallpaper removal", type: "per_sqft", rateKey: "wallpaperPerSqft", kinds: ["interior", "both", "commercial"] },
    { id: "wallWashing", label: "Wall washing", type: "per_sqft", rateKey: "wallWashPerSqft", kinds: ["interior", "both", "commercial"] },
    { id: "primingInt", label: "Priming", type: "per_sqft", rateKey: "primePerSqft", kinds: ["interior", "both", "commercial"] },
    { id: "patchSmall", label: "Single hole patch (less than 1×1 ft)", type: "per_unit", rateKey: "patchSmall", unit: "patch", kinds: ["interior", "both", "commercial"] },
    { id: "patchLarge", label: "Large hole patch", type: "per_unit", rateKey: "patchLarge", unit: "patch", kinds: ["interior", "both", "commercial"] },
    { id: "closetBifold", label: "Closet bifold doors", type: "per_unit", rateKey: "closetBifold", unit: "door", kinds: ["interior", "both", "commercial"] },
    { id: "hangSheetrock", label: "Hang sheetrock", type: "per_sqft", rateKey: "sheetrockPerSqft", kinds: ["drywall", "commercial"] },
    { id: "skim3", label: "Skim level 3 (add-on)", type: "skim", rateKey: "skim3PerSqft", group: "skim", kinds: ["drywall", "commercial"] },
    { id: "skim4", label: "Skim level 4 (add-on)", type: "skim", rateKey: "skim4PerSqft", group: "skim", kinds: ["drywall", "commercial"] },
    { id: "skim5", label: "Skim level 5 (add-on)", type: "skim", rateKey: "skim5PerSqft", group: "skim", kinds: ["drywall", "commercial"] },
    { id: "popcornTexture", label: "Popcorn texture", type: "per_sqft", rateKey: "popcornPerSqft", kinds: ["drywall", "commercial"] },
    { id: "orangePeelTexture", label: "Orange peel texture", type: "per_sqft", rateKey: "orangePeelPerSqft", kinds: ["drywall", "commercial"] },
    { id: "knockdownTexture", label: "Knockdown texture", type: "per_sqft", rateKey: "knockdownPerSqft", kinds: ["drywall", "commercial"] },
    { id: "skipTrowel", label: "Skip trowel", type: "per_sqft", rateKey: "skipTrowelPerSqft", kinds: ["drywall", "commercial"] },
    { id: "archways", label: "Advanced add-ons (archways, etc.)", type: "per_sqft", rateKey: "archwayPerSqft", kinds: ["drywall", "commercial"] }
  ];

  function num(v) {
    var n = Number(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function parseAmount(v) {
    var n = Number(String(v == null ? "" : v).replace(/[^0-9.-]/g, ""));
    return isFinite(n) && n > 0 ? Math.round(n) : 0;
  }

  function money(n) {
    n = Math.round(Number(n) || 0);
    return "$" + n.toLocaleString("en-US");
  }

  function isCommercial(job) {
    return job && job.kind === "commercial";
  }

  function mergeRates(extra, job) {
    var base = isCommercial(job) ? COMMERCIAL_RATES : RATES;
    var out = {};
    Object.keys(RATES).forEach(function (k) { out[k] = base[k]; });
    if (extra) {
      Object.keys(RATES).forEach(function (k) {
        if (extra[k] !== "" && extra[k] != null && isFinite(Number(extra[k]))) {
          out[k] = Number(extra[k]);
        }
      });
    }
    return out;
  }

  function effectiveKind(job) {
    if (!job) return "interior";
    if (job.kind === "commercial") return job.commercialScope || "interior";
    return job.kind || "interior";
  }

  function areaKind(room, job) {
    var k = effectiveKind(job);
    if (k === "exterior") return "exterior";
    if (k === "interior") return "interior";
    if (k === "drywall") return "drywall";
    if (room && room.place === "exterior") return "exterior";
    if (room && room.place === "interior") return "interior";
    return "interior";
  }

  function measure(room, job) {
    var doors = num(room.doors);
    var windows = num(room.windows);
    var open = doors * 21 + windows * 15;
    var L = num(room.length);
    var W = num(room.width);
    var peri = num(room.perimeter) || (L && W ? 2 * (L + W) : L);
    var rise = num(room.rise) || num(room.height);
    var face = peri * rise;
    var ext = areaKind(room, job) === "exterior";
    var ceiling = ext ? 0 : (num(room.ceiling) || (L && W ? Math.round(L * W) : 0));
    return {
      walls: Math.max(0, Math.round(face - open)),
      ceiling: ceiling,
      wash: ext ? Math.round(face) : 0,
      doors: doors,
      perimeter: peri,
      rise: rise
    };
  }

  function paintsWalls(room) {
    var s = room.surfaces || [];
    if (!s.length) return true;
    return ["walls", "body", "fascia", "trim"].some(function (id) {
      return s.indexOf(id) >= 0;
    });
  }

  function paintsCeilings(room) {
    return (room.surfaces || []).indexOf("ceilings") >= 0;
  }

  function paintsDoors(room) {
    return (room.surfaces || []).indexOf("doors") >= 0;
  }

  function wantsWash(room, job) {
    if (areaKind(room, job) !== "exterior") return false;
    if (room.wash === false || room.wash === "false") return false;
    return true;
  }

  function line(amount, label) {
    return { amount: money(amount), raw: Math.round(amount), label: label };
  }

  /** Commercial shows the same services as residential for the equivalent scope. */
  function servicesForKind(kind, job) {
    var scopeKind = kind === "commercial" ? effectiveKind(job) : kind;
    return SERVICE_CATALOG.filter(function (s) {
      return s.kinds.indexOf(scopeKind || "interior") >= 0;
    });
  }

  function drywallSqft(job) {
    return (job.rooms || []).reduce(function (sum, room) {
      var g = measure(room, job);
      return sum + g.walls + g.ceiling;
    }, 0);
  }

  function serviceQty(svc, sel, ctx) {
    if (sel && sel.qty !== "" && sel.qty != null) return num(sel.qty);
    if (svc.type === "skim") return num(ctx.drywallBaseSq);
    if (svc.kinds.indexOf("drywall") >= 0) return ctx.drywallSq;
    if (svc.id === "loxonSealant" || svc.id === "primingExt" || svc.id === "textureExt" || svc.id === "scrapeRemoval") {
      return ctx.paintExt || ctx.washSq;
    }
    if (svc.id === "wallpaperRemoval" || svc.id === "wallWashing" || svc.id === "primingInt") {
      return ctx.paintInt;
    }
    return 0;
  }

  function serviceLines(job, R, ctx) {
    var items = [];
    var services = job.services || {};
    var drywallBaseSq = 0;
    if (services.hangSheetrock && services.hangSheetrock.on) {
      drywallBaseSq = serviceQty({ id: "hangSheetrock", kinds: ["drywall"] }, services.hangSheetrock, ctx);
    }
    ctx.drywallBaseSq = drywallBaseSq;

    servicesForKind(job.kind, job).forEach(function (svc) {
      var sel = services[svc.id];
      if (!sel || !sel.on) return;

      var rate = R[svc.rateKey];
      if (svc.type === "fixed") {
        items.push(line(rate, svc.label + (svc.note ? " — " + svc.note : "")));
        return;
      }
      if (svc.type === "per_unit") {
        var count = num(sel.qty);
        if (!count) return;
        items.push(line(count * rate, svc.label + " — " + count + " " + (svc.unit || "ea") + " × $" + rate));
        return;
      }
      if (svc.type === "skim") {
        var skimSq = serviceQty(svc, sel, ctx);
        if (!skimSq || !drywallBaseSq) return;
        items.push(line(skimSq * rate, svc.label + " — " + skimSq.toLocaleString("en-US") + " sq ft × $" + rate.toFixed(2)));
        return;
      }
      if (svc.type === "per_sqft") {
        var sq = serviceQty(svc, sel, ctx);
        if (!sq) return;
        items.push(line(sq * rate, svc.label + " — " + sq.toLocaleString("en-US") + " sq ft × $" + rate.toFixed(2)));
      }
    });
    return items;
  }

  function customAddonLines(job) {
    var items = [];
    (job.customAddons || []).forEach(function (row) {
      var label = (row.label || "").trim();
      var raw = parseAmount(row.amount);
      if (!label || !raw) return;
      items.push(line(raw, label));
    });
    return items;
  }

  function quote(job) {
    job = job || {};
    var R = mergeRates(job.rates, job);
    var paintInt = 0;
    var paintExt = 0;
    var washSq = 0;
    var doorInt = 0;
    var doorExt = 0;
    var wallInt = 0;
    var wallExt = 0;
    var ceilInt = 0;
    var isDrywall = effectiveKind(job) === "drywall";

    (job.rooms || []).forEach(function (room) {
      var g = measure(room, job);
      var ext = areaKind(room, job) === "exterior";
      if (isDrywall) return;
      var paintSq = 0;
      if (paintsWalls(room)) paintSq += g.walls;
      if (!ext && paintsCeilings(room)) paintSq += g.ceiling;
      if (ext) {
        paintExt += paintSq;
        wallExt += g.walls;
        if (wantsWash(room, job)) washSq += g.wash;
      } else {
        paintInt += paintSq;
        wallInt += g.walls;
        ceilInt += paintsCeilings(room) ? g.ceiling : 0;
      }
      if (paintsDoors(room)) {
        if (ext) doorExt += g.doors;
        else doorInt += g.doors;
      }
    });

    var cab = job.cabinets || {};
    var cabDoors = num(cab.doors);
    var cabDrawers = num(cab.drawers);
    var cabFrames = num(cab.frames);
    var cabBoxes = num(cab.boxes);
    var extPaintRate = R.paintExtPerSqft != null ? R.paintExtPerSqft : R.paintPerSqft;

    var items = [];
    if (paintInt) {
      items.push(line(paintInt * R.paintPerSqft,
        "Interior painting — " + paintInt.toLocaleString("en-US") + " sq ft × $" + R.paintPerSqft.toFixed(2)));
    }
    if (paintExt) {
      items.push(line(paintExt * extPaintRate,
        "Exterior painting — " + paintExt.toLocaleString("en-US") + " sq ft × $" + extPaintRate.toFixed(2)));
    }
    if (washSq) {
      items.push(line(washSq * R.washPerSqft,
        "Pressure washing — " + washSq.toLocaleString("en-US") + " sq ft × $" + R.washPerSqft.toFixed(2)));
    }
    if (doorInt) {
      items.push(line(doorInt * R.doorInterior,
        "Interior doors — " + doorInt + " × $" + R.doorInterior));
    }
    if (doorExt) {
      items.push(line(doorExt * R.doorExterior,
        "Exterior doors — " + doorExt + " × $" + R.doorExterior));
    }
    if (cabDoors) {
      items.push(line(cabDoors * R.cabinetDoor,
        "Cabinet doors — " + cabDoors + " × $" + R.cabinetDoor));
    }
    if (cabDrawers) {
      items.push(line(cabDrawers * R.cabinetDrawer,
        "Cabinet drawers — " + cabDrawers + " × $" + R.cabinetDrawer));
    }
    if (cabFrames) {
      items.push(line(cabFrames * R.cabinetFrame,
        "Cabinet frames — " + cabFrames + " × $" + R.cabinetFrame));
    }
    if (cabBoxes) {
      items.push(line(cabBoxes * R.cabinetBox,
        "Cabinet boxes — " + cabBoxes + " × $" + R.cabinetBox));
    }

    var ctx = {
      paintInt: paintInt,
      paintExt: paintExt,
      washSq: washSq,
      drywallSq: drywallSqft(job)
    };
    items = items.concat(serviceLines(job, R, ctx));
    items = items.concat(customAddonLines(job));

    var subtotal = items.reduce(function (sum, x) { return sum + x.raw; }, 0);
    var discountPct = [5, 10, 15, 20].indexOf(Number(job.discountPercent)) >= 0
      ? Number(job.discountPercent)
      : 0;
    var discountRaw = discountPct && subtotal
      ? Math.round(subtotal * discountPct / 100)
      : 0;
    var prices = items.slice();
    if (discountRaw) {
      prices.push({
        amount: "−$" + discountRaw.toLocaleString("en-US"),
        raw: -discountRaw,
        label: "Discount (" + discountPct + "%)"
      });
      items = prices.slice();
    }
    var total = Math.max(0, subtotal - discountRaw);
    if (total || subtotal) prices.push({ amount: money(total), raw: total, label: "Total", total: true });

    return {
      rates: R,
      rateBook: isCommercial(job) ? "commercial" : "residential",
      paintInt: paintInt,
      paintExt: paintExt,
      washSq: washSq,
      doorInt: doorInt,
      doorExt: doorExt,
      wallInt: wallInt,
      wallExt: wallExt,
      ceilInt: ceilInt,
      drywallSq: ctx.drywallSq,
      cabinets: { doors: cabDoors, drawers: cabDrawers, frames: cabFrames, boxes: cabBoxes },
      items: items,
      prices: prices,
      subtotal: subtotal,
      discountPercent: discountPct,
      discount: discountRaw,
      total: total,
      money: money(total)
    };
  }

  root.PNP_RATES = RATES;
  root.PNP_COMMERCIAL_RATES = COMMERCIAL_RATES;
  root.PNP_SERVICE_CATALOG = SERVICE_CATALOG;
  root.PNP = {
    rates: RATES,
    commercialRates: COMMERCIAL_RATES,
    serviceCatalog: SERVICE_CATALOG,
    servicesForKind: servicesForKind,
    mergeRates: mergeRates,
    measure: measure,
    quote: quote,
    money: money,
    parseAmount: parseAmount,
    areaKind: areaKind,
    effectiveKind: effectiveKind,
    isCommercial: isCommercial,
    drywallSqft: drywallSqft
  };
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
