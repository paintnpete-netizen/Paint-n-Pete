/**
 * Paint'n Pete unit rates — source of truth for the estimate drawer.
 *
 * Painting and wash/door numbers are Noah's (Aug 2026).
 * Cabinet piece rates are a published 2026 contractor model until Noah
 * replaces them: Carolina Renew averages (door $120, drawer $65, box $45)
 * plus $45 per face frame (their guide quotes frames per linear foot;
 * the drawer prices frames as a count, same as doors).
 */
(function (root) {
  var RATES = {
    paintPerSqft: 2.1,
    washPerSqft: 0.75,
    doorInterior: 200,
    doorExterior: 250,
    cabinetDoor: 120,
    cabinetDrawer: 65,
    cabinetFrame: 45,
    cabinetBox: 45
  };

  function num(v) {
    var n = Number(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function money(n) {
    n = Math.round(Number(n) || 0);
    return "$" + n.toLocaleString("en-US");
  }

  function mergeRates(extra) {
    var out = {};
    Object.keys(RATES).forEach(function (k) { out[k] = RATES[k]; });
    if (extra) {
      Object.keys(RATES).forEach(function (k) {
        if (extra[k] !== "" && extra[k] != null && isFinite(Number(extra[k]))) {
          out[k] = Number(extra[k]);
        }
      });
    }
    return out;
  }

  function areaKind(room, job) {
    if (job && job.kind === "exterior") return "exterior";
    if (job && job.kind === "interior") return "interior";
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

  function quote(job) {
    job = job || {};
    var R = mergeRates(job.rates);
    var paintInt = 0;
    var paintExt = 0;
    var washSq = 0;
    var doorInt = 0;
    var doorExt = 0;
    var wallInt = 0;
    var wallExt = 0;
    var ceilInt = 0;

    (job.rooms || []).forEach(function (room) {
      var g = measure(room, job);
      var ext = areaKind(room, job) === "exterior";
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

    var items = [];
    if (paintInt) {
      items.push(line(paintInt * R.paintPerSqft,
        "Interior painting — " + paintInt.toLocaleString("en-US") + " sq ft × $" + R.paintPerSqft.toFixed(2)));
    }
    if (paintExt) {
      items.push(line(paintExt * R.paintPerSqft,
        "Exterior painting — " + paintExt.toLocaleString("en-US") + " sq ft × $" + R.paintPerSqft.toFixed(2)));
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

    var total = items.reduce(function (sum, x) { return sum + x.raw; }, 0);
    var prices = items.slice();
    if (total) prices.push({ amount: money(total), raw: total, label: "Total", total: true });

    return {
      rates: R,
      paintInt: paintInt,
      paintExt: paintExt,
      washSq: washSq,
      doorInt: doorInt,
      doorExt: doorExt,
      wallInt: wallInt,
      wallExt: wallExt,
      ceilInt: ceilInt,
      cabinets: { doors: cabDoors, drawers: cabDrawers, frames: cabFrames, boxes: cabBoxes },
      items: items,
      prices: prices,
      total: total,
      money: money(total)
    };
  }

  root.PNP_RATES = RATES;
  root.PNP = { rates: RATES, mergeRates: mergeRates, measure: measure, quote: quote, money: money, areaKind: areaKind };
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
