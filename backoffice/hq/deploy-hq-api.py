#!/usr/bin/env python3
"""Deploy HQ folder to paintnpete-hq via Netlify API (uses ~/.netlify/config.json)."""
import json
import os
import sys
import urllib.request
import zipfile
import tempfile
import shutil

SITE_ID = "cb1b30dc-7aa5-4a43-86cc-f7dd931ae767"
HQ_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.expanduser("~/.netlify/config.json")


def load_token():
    with open(CONFIG, encoding="utf-8") as f:
        data = json.load(f)
    users = data.get("users") or {}
    for user in users.values():
        token = user.get("auth", {}).get("token")
        if token:
            return token
    raise SystemExit("No Netlify token in ~/.netlify/config.json — run: netlify login")


def make_zip():
    tmp = tempfile.NamedTemporaryFile(suffix=".zip", delete=False)
    tmp.close()
    skip = {".DS_Store"}
    with zipfile.ZipFile(tmp.name, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _dirs, files in os.walk(HQ_DIR):
            for name in files:
                if name in skip:
                    continue
                path = os.path.join(root, name)
                arc = os.path.relpath(path, HQ_DIR)
                zf.write(path, arc)
    return tmp.name


def deploy(token, zip_path):
    url = f"https://api.netlify.com/api/v1/sites/{SITE_ID}/deploys"
    with open(zip_path, "rb") as f:
        body = f.read()
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/zip",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        return json.loads(res.read().decode())


def main():
    token = load_token()
    zip_path = make_zip()
    try:
        result = deploy(token, zip_path)
        deploy_id = result.get("id", "?")
        state = result.get("state", "?")
        url = result.get("ssl_url") or result.get("url") or "https://paintnpete-hq.netlify.app"
        print(f"Deploy {deploy_id} — {state}")
        print(f"Live: {url}/drawer.html")
        if state not in ("ready", "published", "uploading", "processing", "preparing"):
            print(json.dumps({k: result.get(k) for k in ("state", "error_message")}, indent=2))
            sys.exit(1)
    finally:
        os.unlink(zip_path)


if __name__ == "__main__":
    main()
