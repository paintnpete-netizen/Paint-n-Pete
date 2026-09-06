#!/usr/bin/env node
/**
 * Push Code.gs + Portal.gs to Apps Script and bump the web app deployment.
 * Uses ~/.clasprc.json (refreshes token if expired).
 */
import fs from "fs";
import path from "path";
import os from "os";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SCRIPT_ID = JSON.parse(fs.readFileSync(path.join(ROOT, ".clasp.json"), "utf8")).scriptId;
const LOCAL_RC = path.join(ROOT, ".clasprc.json");
const HOME_RC = path.join(os.homedir(), ".clasprc.json");
const RC_PATH = fs.existsSync(LOCAL_RC) ? LOCAL_RC : HOME_RC;

function loadRc() {
  return JSON.parse(fs.readFileSync(RC_PATH, "utf8"));
}

function saveRc(rc) {
  fs.writeFileSync(RC_PATH, JSON.stringify(rc, null, 2));
}

function clientCreds(rc, tok) {
  return {
    client_id: tok.client_id || rc.oauth2ClientSettings?.clientId,
    client_secret: tok.client_secret || rc.oauth2ClientSettings?.clientSecret,
  };
}

async function refreshToken(rc, tok) {
  const { client_id, client_secret } = clientCreds(rc, tok);
  if (!client_id || !client_secret) throw new Error("missing oauth client id/secret in clasprc");
  const body = new URLSearchParams({
    client_id,
    client_secret,
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
  if (!tok?.access_token) throw new Error("no clasp token — run: clasp login --creds … (noah@paintnpete.com)");
  if (Date.now() > (tok.expiry_date || 0) - 60000) {
    tok = await refreshToken(rc, tok);
    if (rc.token) rc.token = tok;
    else rc.tokens.default = tok;
    saveRc(rc);
    console.log("refreshed oauth token");
  }
  return tok.access_token;
}

async function whoami(token) {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) return "(unknown account)";
    const data = await res.json();
    return data.email || "(unknown account)";
  } catch {
    return "(unknown account)";
  }
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
  if (!res.ok) throw new Error(`${res.status} ${url}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data;
}

function readGs(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}

async function pushContent(token) {
  const files = [
    { name: "appsscript", type: "JSON", source: readGs("appsscript.json") },
    { name: "Code", type: "SERVER_JS", source: readGs("Code.gs") },
    { name: "Portal", type: "SERVER_JS", source: readGs("Portal.gs") },
  ];
  return api(token, `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/content`, {
    method: "PUT",
    body: JSON.stringify({ files }),
  });
}

async function bumpDeployments(token) {
  const version = await api(
    token,
    `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/versions`,
    {
      method: "POST",
      body: JSON.stringify({
        description: "staff booking SMS — " + new Date().toISOString().slice(0, 10),
      }),
    }
  );
  const versionNumber = version.versionNumber;
  console.log("created version", versionNumber);

  const listed = await api(
    token,
    `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/deployments`,
    { method: "GET" }
  );
  const deps = (listed.deployments || []).filter((d) => d.deploymentConfig?.versionNumber);
  if (!deps.length) {
    console.log("no versioned deployments — Apps Script → Deploy → Manage deployments → New version");
    return;
  }
  for (const dep of deps) {
    await api(
      token,
      `https://script.googleapis.com/v1/projects/${SCRIPT_ID}/deployments/${dep.deploymentId}`,
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
    console.log("updated deployment", dep.deploymentId, "→ v" + versionNumber);
  }
}

async function runSetupPortalTabs(token) {
  const key = process.env.WEBHOOK_SECRET || process.env.PORTAL_OPERATOR_KEY || "";
  const exec =
    process.env.BOOKING_SCRIPT_URL ||
    "https://script.google.com/macros/s/AKfycbxVsao0huXM_P6_LNkk1uYxE1adS8SqxgRbiTzkAoAjhVftz5EYeBSKOMccbEluTERM/exec";
  if (!key) {
    console.warn("setupPortalTabs skipped: set WEBHOOK_SECRET or run node setup-portal-tabs.mjs");
    return;
  }
  const join = exec.indexOf("?") >= 0 ? "&" : "?";
  const res = await fetch(exec + join + "key=" + encodeURIComponent(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({ action: "portal_setup_tabs", operator_key: key }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.ok) console.log("setupPortalTabs:", data.message || "ok");
  else console.warn("setupPortalTabs skipped:", data.error || res.status);
}

const token = await accessToken();
console.log("clasp account:", await whoami(token));
console.log("pushing…");
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    await pushContent(token);
    console.log("push ok");
    break;
  } catch (err) {
    const msg = String(err);
    if (attempt < 3 && msg.includes("has not enabled the Apps Script API")) {
      console.warn(`attempt ${attempt} failed (API may be propagating), retrying in 45s…`);
      await new Promise((r) => setTimeout(r, 45000));
      continue;
    }
    if (msg.includes("has not enabled the Apps Script API")) {
      console.error("\nEnable Apps Script API for the clasp account above:");
      console.error("  https://script.google.com/home/usersettings");
      console.error("Use noah@paintnpete.com — re-login with: clasp login");
    }
    throw err;
  }
}
// Bump deployment: PUT deploymentConfig only (entryPoints in body is rejected by API).
if (process.env.BUMP_DEPLOYMENT === "1") {
  try {
    await bumpDeployments(token);
  } catch (err) {
    console.warn("deployment bump skipped:", err.message);
  }
} else {
  console.log("code pushed — run: BUMP_DEPLOYMENT=1 node push-and-deploy.mjs");
}
try {
  await runSetupPortalTabs(token);
} catch (err) {
  console.warn("setupPortalTabs skipped:", err.message);
  console.warn("Run setupPortalTabs once in the Apps Script editor");
}
