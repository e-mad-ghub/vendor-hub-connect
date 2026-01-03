#!/usr/bin/env bash
set -euo pipefail

CMD=${1:-help}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_LOG="/tmp/marketplace-api.log"
WEB_LOG="/tmp/marketplace-web.log"
PID_FILE="/tmp/marketplace-pids"
API_PORT="${API_PORT:-6500}"
WEB_PORT="${WEB_PORT:-6501}"

assert_port_free() {
  local PORT=$1
  if lsof -iTCP -sTCP:LISTEN -P -n | grep -q ":${PORT}"; then
    echo "Port ${PORT} is already in use. Stop the process using it or set API_PORT/WEB_PORT env vars before running."
    exit 1
  fi
}

wait_for_url() {
  local URL=$1
  local NAME=$2
  local RETRIES=20
  local SLEEP=0.5
  local STATUS
  for ((i=1; i<=RETRIES; i++)); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || true)
    if [ "$STATUS" != "000" ] && [ -n "$STATUS" ]; then
      echo "$NAME up (status $STATUS)"
      return 0
    fi
    sleep "$SLEEP"
  done
  echo "$NAME not reachable after $RETRIES attempts (last status $STATUS)"
}

start_services() {
  echo "==> Cleaning previous dev servers..."
  # Try to stop prior runs
  if [ -f "$PID_FILE" ]; then
    read -r OLD_API_PID OLD_WEB_PID < "$PID_FILE"
    kill "$OLD_API_PID" "$OLD_WEB_PID" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
  # Kill anything left on the intended ports
  lsof -ti :${API_PORT} | xargs -r kill 2>/dev/null || true
  lsof -ti :${WEB_PORT} | xargs -r kill 2>/dev/null || true
  sleep 1

  echo "==> Setting up backend (server)..."
  cd "$ROOT/server"

  if [ ! -f .env ]; then
    echo "DATABASE_URL=\"file:./dev.db\"" > .env
    cat >> .env <<'EOF'
JWT_SECRET="dev-secret-change"
API_PORT=6500
CLIENT_ORIGIN="http://localhost:6501"
STORAGE_DIR="./uploads"
INSTA_PAY_WEBHOOK_SECRET="demo-webhook"
EOF
    echo "Created server/.env with default SQLite config."
  fi

  # Sync API_PORT from env variable into server/.env if different
  if ! grep -q "API_PORT=${API_PORT}" .env; then
    sed -i "s/^API_PORT=.*/API_PORT=${API_PORT}/" .env
  fi
  if ! grep -q "CLIENT_ORIGIN=http://localhost:${WEB_PORT}" .env; then
    sed -i "s|^CLIENT_ORIGIN=.*|CLIENT_ORIGIN=\"http://localhost:${WEB_PORT}\"|" .env
  fi

  assert_port_free "${API_PORT}"

  echo "Installing server deps..."
  npm install

  echo "Running Prisma migrate..."
  npx prisma migrate dev --name init --schema ./prisma/schema.prisma

  echo "Seeding database..."
  npx ts-node prisma/seed.ts

  echo "==> Launching backend (in background)..."
  npm run dev >/tmp/marketplace-api.log 2>&1 &
  API_PID=$!
  echo "Backend running (pid $API_PID). Logs: $API_LOG"

  cd "$ROOT"

  echo "==> Setting up frontend..."
  npm install

  assert_port_free "${WEB_PORT}"

  cat > .env <<EOF
VITE_API_BASE="http://localhost:${API_PORT}/api"
EOF
  echo "Frontend .env pointing to local API (${API_PORT})."

  echo "==> Launching frontend (in background)..."
  npm run dev -- --host --port "${WEB_PORT}" --strictPort >/tmp/marketplace-web.log 2>&1 &
  WEB_PID=$!
  echo "Frontend running (pid $WEB_PID). Logs: $WEB_LOG"

  echo "$API_PID $WEB_PID" > "$PID_FILE"
  wait_for_url "http://localhost:${API_PORT}/api/products" "API"
  wait_for_url "http://localhost:${WEB_PORT}" "Web"

  echo "Done. API: http://localhost:${API_PORT} | Web: http://localhost:${WEB_PORT}"
  echo "To stop: $0 stop"
}

stop_services() {
  if [ ! -f "$PID_FILE" ]; then
    echo "No PID file found at $PID_FILE"
    exit 1
  fi
  read -r API_PID WEB_PID < "$PID_FILE"
  echo "Stopping backend pid $API_PID and frontend pid $WEB_PID"
  kill "$API_PID" "$WEB_PID" || true
  rm -f "$PID_FILE"
  echo "Stopped."
}

case "$CMD" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  help|*)
    echo "Usage: $0 [start|stop]"
    echo "  start : setup, migrate, seed, and run backend/frontend (background)"
    echo "  stop  : stop backend/frontend started by this script"
    exit 0
    ;;
esac
