#!/usr/bin/env node
/**
 * Clear Bookings sheet + Estimate/Consultation calendar events.
 * Usage: WEBHOOK_SECRET=... node clear-estimate-bookings.mjs
 */
const EXEC_URL =
  process.env.BOOKING_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxVsao0huXM_P6_LNkk1uYxE1adS8SqxgRbiTzkAoAjhVftz5EYeBSKOMccbEluTERM/exec";

function operatorKey() {
  if (process.env.WEBHOOK_SECRET || process.env.PORTAL_OPERATOR_KEY) {
    return process.env.WEBHOOK_SECRET || process.env.PORTAL_OPERATOR_KEY;
  }
  const base = process.env.BOOKING_SCRIPT_URL || "";
  const m = base.match(/[?&]key=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

const key = operatorKey();
if (!key) {
  console.error("Set WEBHOOK_SECRET or BOOKING_SCRIPT_URL with ?key=…");
  process.exit(1);
}

const join = EXEC_URL.indexOf("?") >= 0 ? "&" : "?";
const url = EXEC_URL + join + "key=" + encodeURIComponent(key);

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  redirect: "follow",
  body: JSON.stringify({ action: "clear_estimate_bookings" }),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  console.error("Non-JSON:", text.slice(0, 400));
  process.exit(1);
}
console.log(JSON.stringify(data, null, 2));
if (!data.ok) process.exit(1);
