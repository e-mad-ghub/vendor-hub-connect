#!/usr/bin/env bash
set -euo pipefail

CMD=${1:-help}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_LOG="/tmp/marketplace-web.log"
PID_FILE="/tmp/marketplace-pids"
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
    read -r OLD_WEB_PID < "$PID_FILE"
    kill "$OLD_WEB_PID" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
  # Kill anything left on the intended ports
  lsof -ti :${WEB_PORT} | xargs -r kill 2>/dev/null || true
  sleep 1

  cd "$ROOT"

  echo "==> Setting up frontend..."
  npm install

  assert_port_free "${WEB_PORT}"

  echo "==> Launching frontend (in background)..."
  npm run dev -- --host --port "${WEB_PORT}" --strictPort >/tmp/marketplace-web.log 2>&1 &
  WEB_PID=$!
  echo "Frontend running (pid $WEB_PID). Logs: $WEB_LOG"

  echo "$WEB_PID" > "$PID_FILE"
  wait_for_url "http://localhost:${WEB_PORT}" "Web"

  echo "Done. Web: http://localhost:${WEB_PORT}"
  echo "To stop: $0 stop"
}

stop_services() {
  if [ ! -f "$PID_FILE" ]; then
    echo "No PID file found at $PID_FILE"
    exit 1
  fi
  read -r WEB_PID < "$PID_FILE"
  echo "Stopping frontend pid $WEB_PID"
  kill "$WEB_PID" || true
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
