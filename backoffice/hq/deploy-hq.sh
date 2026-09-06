#!/bin/bash
# Deploy HQ + estimate drawer to paintnpete-hq.netlify.app
set -euo pipefail
cd "$(dirname "$0")"

if command -v netlify >/dev/null 2>&1; then
  netlify deploy --prod --dir=. --site=cb1b30dc-7aa5-4a43-86cc-f7dd931ae767
  echo "Live: https://paintnpete-hq.netlify.app/drawer.html"
  exit 0
fi

echo "Netlify CLI not found."
echo ""
echo "Option A — install CLI once, then re-run this script:"
echo "  npm install -g netlify-cli"
echo "  netlify login"
echo "  ./deploy-hq.sh"
echo ""
echo "Option B — drag-and-drop (no CLI):"
echo "  1. Open https://app.netlify.com/projects/paintnpete-hq/deploys"
echo "  2. Drag this folder onto the deploy zone:"
echo "     $(pwd)"
echo ""
exit 1
