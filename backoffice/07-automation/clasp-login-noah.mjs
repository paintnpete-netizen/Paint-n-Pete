#!/usr/bin/env node
/**
 * Re-auth clasp as noah@paintnpete.com (script owner).
 * Opens OAuth in browser; paste the redirect URL when prompted.
 */
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { execSync } from "child_process";

const RC_PATH = path.join(os.homedir(), ".clasprc.json");
const rc = JSON.parse(fs.readFileSync(RC_PATH, "utf8"));
const tok = rc.token || rc.tokens?.default;
if (!tok?.client_id) throw new Error("missing clasp client_id in ~/.clasprc.json");

const PORT = 8889;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = [
  "https://www.googleapis.com/auth/script.projects",
  "https://www.googleapis.com/auth/script.scriptapp",
  "https://www.googleapis.com/auth/script.deployments",
  "https://www.googleapis.com/auth/script.webapp.deploy",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/logging.read",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cloud-platform",
].join(" ");

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: tok.client_id,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent select_account",
    login_hint: "noah@paintnpete.com",
  });

function saveToken(next) {
  if (rc.token) rc.token = next;
  else rc.tokens.default = next;
  fs.writeFileSync(RC_PATH, JSON.stringify(rc, null, 2));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  if (err) {
    res.end("Auth error: " + err);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.end("Missing code");
    return;
  }
  const body = new URLSearchParams({
    client_id: tok.client_id,
    client_secret: tok.client_secret,
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT,
  });
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await tokenRes.json();
  if (!tokenRes.ok) {
    res.end("Token exchange failed: " + JSON.stringify(data));
    server.close();
    process.exit(1);
  }
  const next = {
    ...tok,
    access_token: data.access_token,
    refresh_token: data.refresh_token || tok.refresh_token,
    expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
    type: "authorized_user",
  };
  saveToken(next);
  const who = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + data.access_token },
  }).then((r) => r.json());
  res.end(`Logged in as ${who.email}. You can close this tab.`);
  console.log("logged in as", who.email);
  server.close();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log("Open this URL and choose noah@paintnpete.com:\n");
  console.log(authUrl);
  try {
    execSync(`open "${authUrl}"`);
  } catch {
    /* headless */
  }
  console.log(`\nWaiting for redirect on ${REDIRECT} …`);
});
