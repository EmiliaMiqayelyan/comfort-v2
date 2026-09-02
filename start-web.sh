#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Production web port — nginx proxies here. Do not use 3000.
WEB_PORT=3847

export NODE_ENV=production
export PORT="${WEB_PORT}"

exec node node_modules/next/dist/bin/next start --port "${WEB_PORT}" --hostname 127.0.0.1
