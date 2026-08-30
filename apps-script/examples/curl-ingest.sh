#!/usr/bin/env bash
set -euo pipefail
: "${FAMILY_PLANNER_INGEST_URL:?Set the Apps Script /exec URL}"
: "${FAMILY_PLANNER_INGEST_TOKEN:?Set the private ingestion token}"

curl --fail --silent --show-error \
  --request POST \
  --header "Content-Type: application/json" \
  --data "{\"request_id\":\"weekly-2026-09-07-v1\",\"auth\":{\"token\":\"${FAMILY_PLANNER_INGEST_TOKEN}\"},\"payload\":$(cat packages/plan-schema/example-weekly-plan.json)}" \
  "${FAMILY_PLANNER_INGEST_URL}"
