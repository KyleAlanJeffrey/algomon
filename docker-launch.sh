#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Extension (host build, loaded manually in Chrome) ──────────────────────
echo "▶ Building extension..."
cd "$ROOT/extension"
npm install --silent
npm run build
echo "  ✓ Extension built → extension/dist/"
echo "  Load extension/dist/ in Chrome: chrome://extensions → Developer mode → Load unpacked"
echo ""

# ── Web (Docker) ────────────────────────────────────────────────────────────
echo "▶ Starting web server in Docker..."
cd "$ROOT"
docker compose up --build -d

echo ""
echo "  Web:       http://localhost:3000"
echo "  Logs:      docker compose logs -f web"
echo "  Stop:      docker compose down"
echo ""
