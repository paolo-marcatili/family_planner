# Family Planner

A privacy-conscious shared weekly planner for two organizers and their household. The current public demo is a calendar-first, browser-local prototype: click an item for quick actions, double-click it to edit on desktop, and use the visible Edit action on touch devices.

## Current scope

- Calendar-first weekly view with click-to-add and click-to-edit events, tasks, and ownership
- Browser-local demo persistence, recurring/one-off items, workload, decisions, imports, and settings views
- Suggested versus confirmed work-location display and future calendar-blocking shortcut placeholders
- Explicitly human-reviewed AI proposals (never auto-approved)
- Obfuscated work annotations such as online, listen-only, critical, and fixed
- Future support for events, recurring events, tasks, assignments, and conflict warnings
- JSON file import first; accepted events are intended to be written to a shared family calendar rather than an application database
- GitHub Pages deployment workflow for the static frontend

The demo does **not** connect to Outlook, Gmail, Aula, or a production calendar provider. Edits are stored only as a non-authoritative browser cache and are not shared between organizers. Calendar shortcut cards are intentionally not connected. Do not add Aula feed URLs, raw calendar data, credentials, or confidential work details to this repository.

## Calendar-authoritative operating model

The shared family calendar is the source of truth. When a provider connector is configured, accepted events are created or modified there and carry a small, versioned Family Planner JSON block in their description. The browser cache is only for drafts/settings/weather and is not authoritative. Events without the `X-FAMILY-PLANNER` marker are never changed by Family Planner bulk actions. See [`docs/calendar-authority.md`](docs/calendar-authority.md).

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

Then open the local URL printed by Vite. Validate with:

```bash
npm run check
npm run build
```

## Test the current app

1. Run `npm ci`, `npm run check`, and `npm run build`.
2. Run `npm run dev` and open the printed localhost URL.
3. Click a blank calendar time slot and add an event or task.
4. Click the new item to edit its title, type, category, time, owner, child/people, note, and recurrence.
5. Click an owner chip and verify that the edit form opens; choose You, Wife, Both, or Unassigned.
6. Open Workload, Decisions, Imports, and Settings from the left navigation.
7. In Imports, choose the synthetic file at `packages/plan-schema/example-weekly-plan.json`; it should show a safe import-preview notice.
8. Click a time-blocking shortcut and verify that it reports the integration is not connected.
9. Use “Reset demo data” to return to the synthetic starting state.

The complete test and deployment checklist is in [`docs/testing.md`](docs/testing.md).

## JSON import format

Imports are JSON documents validated against [`packages/plan-schema/weekly-plan.schema.json`](packages/plan-schema/weekly-plan.schema.json). The synthetic example is [`packages/plan-schema/example-weekly-plan.json`](packages/plan-schema/example-weekly-plan.json).

### Ontology

The top-level document is a **weekly proposal envelope**:

| Field | Required | Meaning |
|---|---|---|
| `schema_version` | yes | Contract version. Current value is `1.0`. |
| `week_start` | yes | ISO date for the Monday beginning the planning week. |
| `timezone` | yes | Current value is `Europe/Copenhagen`; all date-times use ISO 8601 offsets. |
| `generated_at` | yes | ISO date-time when the upstream summary was produced. |
| `source_summary` | no | High-level source categories and privacy-safe notes; never raw source content. |
| `proposals` | yes | Array of suggested records. Every record starts with `status: proposed`. |

Each **proposal** has an `external_id`, `type`, `status`, and `source`:

| Type | Use | Main fields |
|---|---|---|
| `event` | A time-bound family, school, activity, appointment, travel, or other commitment | `title`, `person`, `start`, `end`, `date`, `suggested_assignee`, `reason` |
| `task` | Work with a due date or time that needs completion | `title`, `date`, `suggested_assignee`, `priority`, `reason` |
| `work_day` | A daily work location/availability suggestion | `person`, `date`, `location`, `work_status`, `reason` |
| `work_block` | An obfuscated work meeting or availability block | `person`, `start`, `end`, `label`, `priority`, `flexibility` |

### Categories and allowed values

- **Sources:** `work_schedule`, `private_calendar`, `school`, `manual`.
- **Assignees:** `organizer_1`, `organizer_2`, `both`, `unassigned`. The app maps these to the organizers' display names after household setup.
- **Work locations:** `office`, `home`, `leave`, `unknown`.
- **Work status:** `suggested`, `confirmed`, `rejected`. A suggested work-from-home day is not a confirmed commitment.
- **Work labels:** `online`, `listen_only`, `active`, `obfuscated`. Do not include meeting titles or confidential details.
- **Priority:** `critical`, `important`, `normal`, `low`.
- **Flexibility:** `fixed`, `flexible`, `unknown`.
- **App event categories:** School, Childcare, Activity, Appointment, Family, Work, Travel, Task, Other. These are application labels; the import schema uses `type` and `source` and may be extended compatibly in a later schema version.
- **Recurrence:** The application supports `one-off` and `weekly` items. Recurrence expansion is an application operation and is not currently a required schema field; future schema versions may add an explicit recurrence rule.

### Review lifecycle

An import is never an instruction to overwrite the plan. The app should validate the entire envelope, show a preview, deduplicate using `external_id`/fingerprints, and keep each proposal separate until an organizer explicitly **approves**, **edits**, **rejects**, or **defers** it. Approved records become normal events, tasks, work-day statuses, or work blocks. Invalid JSON, unknown enum values, missing required fields, raw source content, and credentials must be rejected.

The same contract is intended for file upload and a future authenticated API. See [`docs/import-api.md`](docs/import-api.md) for the future endpoint and token boundary.

## Non-time-bound tasks

Tasks can remain in the overview without a start/end time. Each task shows Paolo, Anna, Both, or Unassigned, and can be completed with one click. Use **Schedule** to convert it into a linked timed calendar event; the original task remains traceable and is not silently completed.

## Incremental planning

Use **Weekly Review** once per week for a complete reconciliation over a chosen horizon. Use **Incremental Update** when an organizer adds or changes an event: only the affected impact window should be reconsidered, while existing duties remain protected. Use **Urgent Change** for same-day/next-day conflicts. The horizon is configurable to 7, 14, 21, or 28 days; start with 7 days to reduce noise. Reassignments remain proposals until approved. See [`docs/planning-operating-model.md`](docs/planning-operating-model.md).

## Workload and contribution

The Workload view separates scheduled time from household contribution. Donut charts break down organizer time by category; contribution bars use effort estimates, split Both assignments 50/50 by default, and show Unassigned separately. These are discussion indicators, not an objective fairness score.

## ChatGPT prompt library

Settings contains editable preliminary prompts for **Weekly/long-term**, **Incremental**, and **Urgent** planning. Copy a prompt, replace its placeholders with your condensed/obfuscated summary, and revise it in your company ChatGPT. The default prompts instruct ChatGPT to:

- treat the shared calendar as authoritative;
- preserve accepted events and duties;
- return only affected deltas for incremental/urgent requests;
- keep inferred assignments as proposals requiring approval;
- return schema-versioned JSON; and
- exclude raw emails, raw calendar payloads, feed URLs, passwords, tokens, and confidential work details.

These prompts are starting points, not a replacement for validating the generated JSON and reviewing changes.

## Route to the final functional product

The current public app is a local/demo client. The remaining path is:

1. **Select the shared-calendar provider:** confirm whether the authoritative shared calendar is Google Calendar, Outlook/Exchange, Apple/iCloud, or another provider. Verify API support for event descriptions, extended properties, stable IDs, OAuth PKCE, and web-app redirects.
2. **Prove login and read-only access:** register a development OAuth app with exact localhost and Pages redirect URIs, implement PKCE/session/logout, and read only the selected shared calendar. Do not use a password in the frontend.
3. **Prove one marked write:** create one synthetic event with the `X-FAMILY-PLANNER` metadata block, read it back, update it, and verify an unmarked event is untouched.
4. **Make calendar authority operational:** map app actions to provider create/update/delete, preserve user description text, reconcile external changes, and disable destructive operations when the marker cannot be preserved.
5. **Add safe planning workflows:** connect file/API JSON imports, weekly/incremental/urgent modes, protected accepted duties, delta previews, and non-time-bound task conversion.
6. **Add filtered work-calendar export:** export only approved subsets using a separate target marker. Provide preview, audit information, and marker-scoped bulk removal.
7. **Pilot with synthetic data, then household data:** test two devices and both organizers, recovery/revocation, provider rate limits, offline behavior, backups/exports, accessibility, and deletion before real use.

There is no final-product definition of done until the provider login, marked event write/read-back, external-change reconciliation, filtered export, and multi-device household pilot all pass.

## Repository and deployment

The repository is public: `https://github.com/paolo-marcatili/family_planner`. The workflow in `.github/workflows/deploy-pages.yml` publishes the static frontend at `https://paolo-marcatili.github.io/family_planner/`. A future backend must be hosted separately; GitHub Pages cannot provide authentication or shared persistence.

## Shared calendar and local credentials

The current demo has no calendar provider connection. The planned source of truth is a shared family calendar: accepted event creates/updates are mirrored there, and Family Planner-owned events carry a versioned JSON metadata block plus a stable marker. See [`docs/calendar-authority.md`](docs/calendar-authority.md).

Passwords cannot be safely encoded into a public GitHub Pages app. Use provider OAuth with PKCE and short-lived session tokens where supported. If a provider requires a secret, use a local OS-keychain/local-companion workflow; never commit the password, refresh token, or client secret. See [`docs/security-credentials.md`](docs/security-credentials.md).

For production calendar synchronization, add provider OAuth scopes, exact redirect URIs, HTTPS, token revocation, provider-specific rate/error handling, marker-scoped deletion, and a tested export/import fallback. GitHub Pages does not itself provide synchronization or secret storage. See [`docs/deployment.md`](docs/deployment.md), [`docs/security-credentials.md`](docs/security-credentials.md), and [`docs/privacy.md`](docs/privacy.md).

The older PocketBase preparation in [`backend/pocketbase/`](backend/pocketbase/) is retained for history but is superseded by the shared-calendar architecture. It is not an active event store.
