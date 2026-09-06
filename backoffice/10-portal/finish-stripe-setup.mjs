#!/usr/bin/env node
/**
 * After Stripe account + webhook are created, wire keys into Netlify and redeploy.
 *
 * Usage:
 *   cd backoffice/10-portal
 *   node finish-stripe-setup.mjs \
 *     --secret sk_test_... \
 *     --webhook whsec_...
 *
 * Or env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const NODE = process.env.NODE || "/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node";
const NETLIFY = process.env.NETLIFY || "/tmp/node_modules/.bin/netlify";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : "";
}

const secret = process.env.STRIPE_SECRET_KEY || arg("--secret");
const webhook = process.env.STRIPE_WEBHOOK_SECRET || arg("--webhook");
const portalUrl = process.env.PORTAL_PUBLIC_URL || "https://paintnpete-portal.netlify.app";

if (!secret || !secret.startsWith("sk_")) {
  console.error("Missing Stripe secret key (sk_test_… or sk_live_…)");
  console.error("Usage: node finish-stripe-setup.mjs --secret sk_test_... --webhook whsec_...");
  process.exit(1);
}
if (!webhook || !webhook.startsWith("whsec_")) {
  console.error("Missing webhook signing secret (whsec_…) from Stripe → Developers → Webhooks");
  process.exit(1);
}

function run(args, opts) {
  const res = spawnSync(NETLIFY, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
    env: { ...process.env, NODE_OPTIONS: "" },
    ...opts,
  });
  if (res.status !== 0) process.exit(res.status || 1);
}

console.log("Setting Netlify env vars on paintnpete-portal…");
for (const ctx of ["production", "deploy-preview"]) {
  run(["env:set", "STRIPE_SECRET_KEY", secret, "--context", ctx, "--force"]);
  run(["env:set", "STRIPE_WEBHOOK_SECRET", webhook, "--context", ctx, "--force"]);
  run(["env:set", "PORTAL_PUBLIC_URL", portalUrl, "--context", ctx, "--force"]);
}

console.log("Redeploying portal (functions need new env)…");
run(["deploy", "--prod", "--dir=site", "--functions=netlify/functions"]);

console.log("\nDone. Test flow:");
console.log("  1. Publish estimate from HQ → Submit to portal");
console.log("  2. Open invite link → Accept & pay deposit");
console.log("  3. Card 4242 4242 4242 4242 → ActiveJobs should show deposit_paid");
console.log("\nWebhook URL (must exist in Stripe):");
console.log("  " + portalUrl.replace(/\/$/, "") + "/.netlify/functions/stripe-webhook");
