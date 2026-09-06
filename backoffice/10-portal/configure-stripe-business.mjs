#!/usr/bin/env node
/**
 * Apply Paint'n Pete branding + business profile via Stripe API where allowed.
 * Usage: node configure-stripe-business.mjs --secret sk_test_...
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : "";
}

const secret = process.env.STRIPE_SECRET_KEY || arg("--secret");
if (!secret || !secret.startsWith("sk_")) {
  console.error("Usage: node configure-stripe-business.mjs --secret sk_test_...");
  process.exit(1);
}

async function stripeForm(path, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(secret + ":").toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: "Basic " + Buffer.from(secret + ":").toString("base64") },
  });
  return res.json();
}

async function uploadIcon() {
  const iconPath = path.join(ROOT, ".tmp-pnp-icon.png");
  const img = await fetch("https://www.paintnpete.com/images/brand/icon-192.png");
  if (!img.ok) throw new Error("could not download icon");
  fs.writeFileSync(iconPath, Buffer.from(await img.arrayBuffer()));

  const form = new FormData();
  form.append("purpose", "business_icon");
  form.append("file", new Blob([fs.readFileSync(iconPath)]), "icon-192.png");

  const res = await fetch("https://files.stripe.com/v1/files", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(secret + ":").toString("base64") },
    body: form,
  });
  fs.unlinkSync(iconPath);
  const data = await res.json();
  if (!res.ok) throw new Error("file upload: " + JSON.stringify(data));
  return data.id;
}

const updates = {
  "business_profile[name]": "Paint'n Pete",
  "business_profile[url]": "https://www.paintnpete.com",
  "business_profile[support_email]": "noah@paintnpete.com",
  "business_profile[support_phone]": "+17279021986",
  "business_profile[support_url]": "https://www.paintnpete.com/contact",
  "business_profile[mcc]": "1799",
  "business_profile[product_description]":
    "Residential and commercial painting. 50% deposit to schedule; balance at completion.",
  "settings[branding][primary_color]": "#1f4a3a",
  "settings[branding][secondary_color]": "#f4efe6",
  "settings[dashboard][display_name]": "Paint'n Pete",
  "settings[dashboard][timezone]": "America/New_York",
  "settings[payments][statement_descriptor]": "PAINT N PETE",
  "settings[card_payments][statement_descriptor_prefix]": "PAINTNPETE",
};

try {
  console.log("Uploading brand icon from paintnpete.com…");
  const fileId = await uploadIcon();
  updates["settings[branding][icon]"] = fileId;
  console.log("icon:", fileId);
} catch (err) {
  console.warn("icon upload skipped:", err.message);
}

console.log("Updating account settings…");
try {
  await stripeForm("/v1/account", updates);
  console.log("account update: ok");
} catch (err) {
  console.warn("account update blocked (Standard accounts → use Dashboard):", err.message);
}

const account = await stripeGet("/v1/account");
console.log(
  JSON.stringify(
    {
      display_name: account.settings?.dashboard?.display_name,
      statement_descriptor: account.settings?.payments?.statement_descriptor,
      branding_color: account.settings?.branding?.primary_color,
      business_name: account.business_profile?.name,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    },
    null,
    2
  )
);
