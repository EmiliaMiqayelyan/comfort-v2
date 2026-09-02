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
# Remove legacy + current app names to avoid port conflicts from stale npm/next processes.
for app in comfort comfort-web comfort-api; do
  pm2 delete "$app" 2>/dev/null || true
done

pm2 start ecosystem.config.cjs
pm2 save

echo "==> Redeploy complete."
pm2 status
