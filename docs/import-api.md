# Import contract and API

The canonical contract is `packages/plan-schema/weekly-plan.schema.json`. The same validator should be used for file uploads and the future API.

## File import

1. Select a JSON file in the app.
2. Validate schema, date range, and allowed enum values.
3. Show a preview and source summary.
4. Store the batch as proposals.
5. Review each proposal; only explicit approval creates an accepted event, task, work day, or work block.

## Future API

```text
POST /api/v1/imports/weekly-plan
Authorization: Bearer <scoped-import-token>
Idempotency-Key: <unique-request-key>
Content-Type: application/json
```

The token must be scoped to import creation for one household. It must not read family data, administer the backend, or be bundled in the frontend. Requests should be HTTPS-only, schema-validated, rate-limited, size-limited, and idempotent.

The endpoint should return an import identifier and proposal count. Repeated imports must not silently overwrite approved records; external IDs and fingerprints should be used for reconciliation.

## Privacy rule

The upstream planning assistant sends condensed, obfuscated information only. Do not send raw work calendars, raw school messages, credentials, or private feed URLs.
