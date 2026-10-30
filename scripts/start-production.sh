#!/usr/bin/env bash
set -euo pipefail

# Ensure frontend build exists
if [ ! -f "frontend/dist/index.html" ]; then
    echo "==> Building AlphaVoice Web Frontend..."
    node scripts/build-web.mjs
fi

PORT="${PORT:-${OMNIVOICE_PORT:-3900}}"
HOST="${OMNIVOICE_BIND_HOST:-0.0.0.0}"

echo "==> Starting AlphaVoice Studio Production Server on http://${HOST}:${PORT}"
export OMNIVOICE_SERVER_MODE=1
export PYTHONPATH="./backend:${PYTHONPATH:-}"

if command -v uv >/dev/null 2>&1; then
    exec uv run uvicorn main:app --app-dir backend --host "$HOST" --port "$PORT"
else
    exec python3 -m uvicorn main:app --app-dir backend --host "$HOST" --port "$PORT"
fi
