#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Production web port — nginx proxies here. Do not use 3000.
WEB_PORT=3847
API_PORT=4871

export NODE_ENV=production
export PORT="${WEB_PORT}"
export WEB_PORT="${WEB_PORT}"
export API_PORT="${API_PORT}"
export API_URL="http://127.0.0.1:${API_PORT}/api"
export NEXT_PUBLIC_API_URL="/api"

exec node node_modules/next/dist/bin/next start --port "${WEB_PORT}" --hostname 127.0.0.1
