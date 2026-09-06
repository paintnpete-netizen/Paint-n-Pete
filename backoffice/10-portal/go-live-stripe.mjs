#!/usr/bin/env node
/**
 * Flip portal payments to Stripe LIVE mode.
 *
 * 1. Stripe Dashboard (Live mode ON) → Developers → API keys → copy sk_live_…
 * 2. Paste below when prompted, OR:
 *      node go-live-stripe.mjs --secret sk_live_...
 *
 * This script creates the live webhook, sets Netlify env, and redeploys.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const NODE = process.env.NODE || "/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node";
const NETLIFY_CANDIDATES = [
  process.env.NETLIFY,
  path.join(ROOT, "../../.tools/node_modules/.bin/netlify"),
  "/Users/noahkanwal/Projects/paintnpete-website/node_modules/.bin/netlify",
  "/tmp/node_modules/.bin/netlify",
].filter(Boolean);

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : "";
}

function findNetlify() {
  for (const p of NETLIFY_CANDIDATES) {
    if (!p) continue;
    const r = spawnSync(p, ["--version"], { encoding: "utf8" });
    if (r.status === 0) return p;
  }
  // website run.js
  const runJs = "/Users/noahkanwal/Projects/paintnpete-website/node_modules/netlify-cli/bin/run.js";
  const r = spawnSync(NODE, [runJs, "--version"], { encoding: "utf8" });
  if (r.status === 0) return [NODE, runJs];
  return null;
}

async function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(q, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });
}

let secret = process.env.STRIPE_SECRET_KEY || arg("--secret");
if (!secret) {
  console.log("Stripe LIVE setup");
  console.log("1. Dashboard → toggle Live mode ON (top right)");
  console.log("2. Developers → API keys → Reveal live secret key");
  console.log("");
  secret = await ask("Paste sk_live_… here: ");
}

if (!secret.startsWith("sk_live_")) {
  console.error("Need a LIVE secret key starting with sk_live_ (not sk_test_).");
  process.exit(1);
}

console.log("Creating live webhook…");
const form = new URLSearchParams();
form.append("url", "https://paintnpete-portal.netlify.app/.netlify/functions/stripe-webhook");
form.append("enabled_events[]", "checkout.session.completed");
form.append("description", "Paint n Pete portal deposit (live)");

const whRes = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
  method: "POST",
  headers: {
    Authorization: "Basic " + Buffer.from(secret + ":").toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: form,
});
const wh = await whRes.json();
if (!whRes.ok) {
  console.error("Webhook create failed:", JSON.stringify(wh, null, 2));
  process.exit(1);
}
const webhookSecret = wh.secret;
if (!webhookSecret || !webhookSecret.startsWith("whsec_")) {
  console.error("No signing secret returned — create webhook in Dashboard and re-run with --webhook");
  process.exit(1);
}
console.log("Webhook:", wh.id, "→", wh.url);

const netlify = findNetlify();
if (!netlify) {
  console.error("Netlify CLI not found. Set keys manually, then redeploy.");
  console.log("STRIPE_SECRET_KEY=", secret.slice(0, 12) + "…");
  console.log("STRIPE_WEBHOOK_SECRET=", webhookSecret.slice(0, 12) + "…");
  process.exit(1);
}

function runNetlify(args) {
  const cmd = Array.isArray(netlify) ? netlify[0] : netlify;
  const prefix = Array.isArray(netlify) ? [netlify[1]] : [];
  const res = spawnSync(cmd, [...prefix, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (res.status !== 0) process.exit(res.status || 1);
}

console.log("Setting Netlify env (production + deploy-preview)…");
for (const ctx of ["production", "deploy-preview"]) {
  runNetlify(["env:set", "STRIPE_SECRET_KEY", secret, "--context", ctx, "--force"]);
  runNetlify(["env:set", "STRIPE_WEBHOOK_SECRET", webhookSecret, "--context", ctx, "--force"]);
  runNetlify([
    "env:set",
    "PORTAL_PUBLIC_URL",
    "https://paintnpete-portal.netlify.app",
    "--context",
    ctx,
    "--force",
  ]);
}

console.log("Redeploying portal…");
runNetlify(["deploy", "--prod", "--dir=site", "--functions=netlify/functions"]);

console.log("\nLIVE. Test with a real card on a small deposit first.");
console.log("Status: https://paintnpete-portal.netlify.app/.netlify/functions/stripe-status");
