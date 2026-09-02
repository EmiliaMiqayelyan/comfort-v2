#!/usr/bin/env bash
set -euo pipefail

# Redeploy Comfort on the VPS after pushing new code.
# Usage (on the server):
#   chmod +x redeploy.sh
#   ./redeploy.sh
#
# Optional env vars:
#   SKIP_PULL=1   Skip git pull (rebuild/restart only)
#   SKIP_MIGRATE=1   Skip database migrations

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> Redeploying Comfort from $ROOT_DIR"

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  echo "==> Pulling latest code..."
  git pull --ff-only
fi

echo "==> Installing dependencies..."
npm ci
npm ci --prefix server

echo "==> Building frontend..."
npm run build

echo "==> Building API..."
npm run build --prefix server

if [[ "${SKIP_MIGRATE:-0}" != "1" ]]; then
  echo "==> Running database migrations..."
  npm run db:migrate --prefix server
fi

echo "==> Restarting PM2 processes..."
if pm2 describe comfort-web >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Redeploy complete."
pm2 status
