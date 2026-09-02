#!/usr/bin/env bash
set -euo pipefail

# Redeploy Comfort on the VPS after pushing new code.
# Usage (on the server):
#   chmod +x redeploy.sh start-web.sh
#   ./redeploy.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

WEB_PORT=3847
API_PORT=4871

echo "==> Redeploying Comfort from $ROOT_DIR (web port ${WEB_PORT})"

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  echo "==> Pulling latest code..."
  git pull --ff-only
fi

chmod +x redeploy.sh start-web.sh

echo "==> Installing dependencies..."
install_deps() {
  local dir="${1:-.}"
  local prefix_args=()
  if [[ "$dir" != "." ]]; then
    prefix_args=(--prefix "$dir")
  fi

  if ! npm ci "${prefix_args[@]}"; then
    echo "==> npm ci failed in ${dir}, falling back to npm install..."
    npm install "${prefix_args[@]}"
  fi
}

install_deps .
install_deps server

echo "==> Building frontend..."
npm run build

echo "==> Building API..."
npm run build --prefix server

if [[ "${SKIP_MIGRATE:-0}" != "1" ]]; then
  echo "==> Running database migrations..."
  npm run db:migrate --prefix server
fi

echo "==> Restarting PM2 processes..."
for app in comfort comfort-web comfort-api; do
  pm2 delete "$app" 2>/dev/null || true
done

fuser -k 3000/tcp 2>/dev/null || true
fuser -k "${WEB_PORT}/tcp" 2>/dev/null || true
fuser -k "${API_PORT}/tcp" 2>/dev/null || true

pm2 start ecosystem.config.cjs
pm2 save

echo "==> Redeploy complete."
pm2 status
pm2 logs comfort-web --lines 5 --nostream
