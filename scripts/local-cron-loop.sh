#!/usr/bin/env bash

set -euo pipefail

JOB="${1:-all}"
INTERVAL_SECONDS="${CRON_INTERVAL_SECONDS:-60}"

echo "Starting local cron loop"
echo "- job: ${JOB}"
echo "- interval: ${INTERVAL_SECONDS}s"
echo "Press Ctrl+C to stop."

while true; do
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] running job: ${JOB}"
  ./scripts/local-cron.sh "${JOB}"
  sleep "${INTERVAL_SECONDS}"
done
