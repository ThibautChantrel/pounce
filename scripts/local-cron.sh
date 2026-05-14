#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 {race-start|race-close|backyard-dnf|all}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load env values automatically from project files.
# .env is loaded first, then .env.local overrides it.
if [[ -f "${ROOT_DIR}/.env" ]]; then
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/.env"
fi
if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/.env.local"
fi

JOB="$1"
BASE_URL="${CRON_BASE_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-}"

if [[ -z "$CRON_SECRET" ]]; then
  echo "Error: CRON_SECRET is not set (expected in .env/.env.local or shell env)."
  exit 1
fi

call_cron() {
  local path="$1"
  echo "-> Calling ${BASE_URL}${path}"
  curl --fail --silent --show-error \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    "${BASE_URL}${path}"
  echo ""
}

case "$JOB" in
  race-start)
    call_cron "/api/cron/race-start"
    ;;
  race-close)
    call_cron "/api/cron/race-close"
    ;;
  backyard-dnf)
    call_cron "/api/cron/backyard-dnf"
    ;;
  all)
    call_cron "/api/cron/race-start"
    call_cron "/api/cron/race-close"
    call_cron "/api/cron/backyard-dnf"
    ;;
  *)
    echo "Unknown job: ${JOB}"
    echo "Allowed values: race-start | race-close | backyard-dnf | all"
    exit 1
    ;;
esac
