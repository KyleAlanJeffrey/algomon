#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$WEB_PID" "$EXT_PID" 2>/dev/null
  wait "$WEB_PID" "$EXT_PID" 2>/dev/null
}
trap cleanup EXIT INT TERM

echo "▶ Installing web dependencies..."
cd "$ROOT/web" && npm install --silent

echo "▶ Installing extension dependencies..."
cd "$ROOT/extension" && npm install --silent

echo ""
echo "Starting Next.js dev server (http://localhost:3000)..."
cd "$ROOT/web" && npm run dev &
WEB_PID=$!

echo "Starting extension watch (dev endpoints → localhost:3000)..."
cd "$ROOT/extension" && npm run watch &
EXT_PID=$!

echo ""
echo "  Web:       http://localhost:3000"
echo "  Extension: load extension/dist/ in Chrome (developer mode)"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

wait "$WEB_PID" "$EXT_PID"
