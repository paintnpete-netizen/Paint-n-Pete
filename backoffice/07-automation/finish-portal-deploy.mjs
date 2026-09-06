#!/usr/bin/env node
/**
 * Fix web app deployment (preserve entryPoints) and set portal admin password.
 * Usage: node finish-portal-deploy.mjs "your-password"
 */
import fs from "fs";
import path from "path";
import os from "os";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SCRIPT_ID = JSON.parse(fs.readFileSync(path.join(ROOT, ".clasp.json"), "utf8")).scriptId;
const DEPLOYMENT_ID = "AKfycbxVsao0huXM_P6_LNkk1uYxE1adS8SqxgRbiTzkAoAjhVftz5EYeBSKOMccbEluTERM";
const RC_PATH = path.join(os.homedir(), ".clasprc.json");

function loadRc() {
  return JSON.parse(fs.readFileSync(RC_PATH, "utf8"));
}

function saveRc(rc) {
  fs.writeFileSync(RC_PATH, JSON.stringify(rc, null, 2));
}

async function refreshToken(tok) {
  const body = new URLSearchParams({
    client_id: tok.client_id,
    client_secret: tok.client_secret,
    refresh_token: tok.refresh_token,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error("token refresh failed: " + JSON.stringify(data));
  tok.access_token = data.access_token;
  tok.expiry_date = Date.now() + (data.expires_in || 3600) * 1000;
  return tok;
}

async function accessToken() {
  const rc = loadRc();
  let tok = rc.token || (rc.tokens && rc.tokens.default);
  if (!tok?.access_token) throw new Error("no clasp token");
  if (Date.now() > (tok.expiry_date || 0) - 60000) {
    tok = await refreshToken(tok);
    if (rc.token) rc.token = tok;
    else rc.tokens.default = tok;
    saveRc(rc);
  }
  return tok.access_token;
}

async function api(token, url, options) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${url}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error("Usage: node finish-portal-deploy.mjs \"password-at-least-8-chars\"");
  process.exit(1);
}

const token = await accessToken();

const listed = await api(token, `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/versions?pageSize=1`, { method: "GET" });
const versionNumber = listed.versions?.[0]?.versionNumber;
if (!versionNumber) throw new Error("no versions found");
console.log("using version", versionNumber);

const dep = await api(
  token,
  `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/deployments/${DEPLOYMENT_ID}`,
  { method: "GET" }
);
console.log("current deployment v" + dep.deploymentConfig?.versionNumber);

await api(
  token,
  `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/deployments/${DEPLOYMENT_ID}`,
  {
    method: "PUT",
    body: JSON.stringify({
      deploymentConfig: {
        scriptId: SCRIPT_ID,
        versionNumber: String(versionNumber),
        manifestFileName: dep.deploymentConfig?.manifestFileName || "appsscript",
        description: dep.deploymentConfig?.description || "Paint'n Pete web app",
      },
    }),
  }
);
console.log("deployment updated → v" + versionNumber);

const run = await api(token, `https://script.googleapis.com/v1/scripts/${SCRIPT_ID}:run`, {
  method: "POST",
  body: JSON.stringify({
    function: "setupPortalAdmin",
    parameters: [password],
    devMode: true,
  }),
});
if (run.error) throw new Error(JSON.stringify(run.error));
console.log("setupPortalAdmin:", run.response?.result || "ok");

const test = await fetch(
  "https://script.google.com/macros/s/" + DEPLOYMENT_ID + "/exec",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({ action: "portal_invite", job_number: "TEST", invite_token: "x" }),
  }
);
const testText = await test.text();
try {
  const parsed = JSON.parse(testText);
  console.log("api test:", JSON.stringify(parsed));
} catch {
  console.log("api test failed — raw:", testText.slice(0, 120));
}
