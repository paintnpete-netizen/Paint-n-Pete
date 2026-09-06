#!/usr/bin/env node
/**
 * Create portal sheet tabs (ActiveJobs, PortalUsers, PortalAccess, PortalMessages).
 * Uses the live web app — scripts.run cannot access the spreadsheet (NOT_FOUND).
 *
 * Usage:
 *   WEBHOOK_SECRET=... node setup-portal-tabs.mjs
 *   node setup-portal-tabs.mjs   # reads key from BOOKING_SCRIPT_URL env if set
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
  body: JSON.stringify({
    action: "portal_setup_tabs",
    operator_key: key,
  }),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  console.error("Non-JSON response:", text.slice(0, 300));
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
if (!data.ok) process.exit(1);
