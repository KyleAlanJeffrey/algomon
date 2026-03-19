#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# ── Extension (build via Docker, output → extension/dist/) ─────────────────
echo "▶ Building extension..."
docker compose --profile build run --rm extension
echo "  ✓ Extension built → extension/dist/"
echo "  Load in Chrome: chrome://extensions → Developer mode → Load unpacked → select extension/dist/"
echo ""

# ── Web ─────────────────────────────────────────────────────────────────────
echo "▶ Starting web server..."
docker compose up --build -d web

echo ""
echo "  Web:       http://localhost:3000"
echo "  Logs:      docker compose logs -f web"
echo "  Stop:      docker compose down"
echo ""
echo "  To watch extension for changes:"
echo "    docker compose --profile build run --rm extension npm run watch"
echo ""
