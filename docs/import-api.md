# Import contract and API

The canonical contract is `packages/plan-schema/weekly-plan.schema.json` (JSON Schema draft 2020-12, version `1.0`). The same validator should be used for file uploads and the future API. The public-safe synthetic example is `packages/plan-schema/example-weekly-plan.json`.

## File import

1. Select a JSON file in the app.
2. Validate schema, date range, and allowed enum values.
3. Show a preview and source summary.
4. Store the batch as proposals.
5. Review each proposal; only explicit approval creates an accepted event, task, work day, or work block.

## Ontology reference

The top-level **weekly proposal envelope** contains:

- `schema_version`: currently exactly `1.0`.
- `week_start`: ISO calendar date, intended to be the Monday starting the planning week.
- `timezone`: currently exactly `Europe/Copenhagen`.
- `generated_at`: ISO 8601 date-time with an offset.
- `source_summary`: optional privacy-safe source categories (`work_schedule`, `private_calendar`, `school`, `manual`) and short notes.
- `proposals`: required array of proposed records.

Every proposal contains:

- `external_id`: stable source identifier used for duplicate detection; only letters, numbers, `.`, `_`, `:`, and `-`.
- `type`: one of `event`, `task`, `work_day`, or `work_block`.
- `status`: always `proposed` at import time. Approval is an application-side action, not an import value.
- `source`: one of `work_schedule`, `private_calendar`, `school`, or `manual`.

Type-specific fields are:

| Type | Purpose | Relevant fields |
|---|---|---|
| `event` | Time-bound school, childcare, activity, appointment, family, travel, or other item | `title`, `person`, `date`, `start`, `end`, `suggested_assignee`, `reason` |
| `task` | Action that needs completion, optionally associated with a date | `title`, `person`, `date`, `suggested_assignee`, `priority`, `reason`, `confidence` |
| `work_day` | Daily work-location suggestion | `person`, `date`, `location`, `work_status`, `reason` |
| `work_block` | Obfuscated work meeting or availability block | `person`, `start`, `end`, `label`, `priority`, `flexibility` |

Allowed controlled values:

- Assignee: `organizer_1`, `organizer_2`, `both`, `unassigned`.
- Location: `office`, `home`, `leave`, `unknown`.
- Work status: `suggested`, `confirmed`, `rejected`.
- Work label: `online`, `listen_only`, `active`, `obfuscated`.
- Priority: `critical`, `important`, `normal`, `low`.
- Flexibility: `fixed`, `flexible`, `unknown`.
- Confidence: optional number from `0` to `1`.

Application labels for accepted items are currently School, Childcare, Activity, Appointment, Family, Work, Travel, Task, and Other. Current recurrence choices in the prototype are one-off and weekly; recurrence rules are not yet serialized in schema `1.0`.

## Review and reconciliation

The lifecycle is `proposed → approved`, `proposed → edited`, `proposed → rejected`, or `proposed → deferred`. A proposal must never overwrite an accepted record silently. Re-importing the same `external_id` should update a pending proposal or report a change against an accepted record; it should not create an uncontrolled duplicate. API requests should additionally use an `Idempotency-Key`.

The schema intentionally has no fields for raw email bodies, raw calendar payloads, feed URLs, passwords, access tokens, or confidential meeting titles. A source is a category, not a copy of the source system.

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
