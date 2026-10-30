$ErrorActionPreference = "Stop"

if (-not (Test-Path "frontend/dist/index.html")) {
    Write-Host "==> Building AlphaVoice Web Frontend..."
    node scripts/build-web.mjs
}

$port = if ($env:PORT) { $env:PORT } elseif ($env:OMNIVOICE_PORT) { $env:OMNIVOICE_PORT } else { "3900" }
$host_ip = if ($env:OMNIVOICE_BIND_HOST) { $env:OMNIVOICE_BIND_HOST } else { "127.0.0.1" }

Write-Host "==> Starting AlphaVoice Studio Production Server on http://${host_ip}:${port}"
$env:OMNIVOICE_SERVER_MODE = "1"
$env:PYTHONPATH = "backend;$env:PYTHONPATH"

if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv run uvicorn main:app --app-dir backend --host $host_ip --port $port
} else {
    python -m uvicorn main:app --app-dir backend --host $host_ip --port $port
}
