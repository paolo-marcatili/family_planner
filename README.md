# Family Planner

A privacy-conscious shared weekly planner for two organizers and their household. The current public demo is a calendar-first, browser-local prototype: click a time slot to add an item, click an event/task to edit it, and click an owner chip to change responsibility.

## Current scope

- Calendar-first weekly view with click-to-add and click-to-edit events, tasks, and ownership
- Browser-local demo persistence, recurring/one-off items, workload, decisions, imports, and settings views
- Suggested versus confirmed work-location display and future calendar-blocking shortcut placeholders
- Explicitly human-reviewed AI proposals (never auto-approved)
- Obfuscated work annotations such as online, listen-only, critical, and fixed
- Future support for events, recurring events, tasks, assignments, and conflict warnings
- JSON file import first; authenticated API import is documented for a future PocketBase-compatible backend
- GitHub Pages deployment workflow for the static frontend

The demo does **not** connect to Outlook, Gmail, Aula, or a production backend. Edits are stored only in the current browser's localStorage and are not shared between organizers. Calendar shortcut cards are intentionally not connected. Do not add Aula feed URLs, raw calendar data, credentials, or confidential work details to this repository.

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

## Repository and deployment

The repository is public: `https://github.com/paolo-marcatili/family_planner`. The workflow in `.github/workflows/deploy-pages.yml` publishes the static frontend at `https://paolo-marcatili.github.io/family_planner/`. A future backend must be hosted separately; GitHub Pages cannot provide authentication or shared persistence.

## Local PocketBase backend setup (future integration)

The current demo has no backend. When implementing shared authentication and persistence, run PocketBase locally as a separate process; the frontend must communicate with it through an environment variable rather than hard-coding a URL.

1. Download the PocketBase release appropriate for your operating system from the official PocketBase release page and keep the binary outside the repository, or run the pinned version in Docker.
2. Start it locally with `./pocketbase serve --http=127.0.0.1:8090`. The admin UI is then available at `http://127.0.0.1:8090/_/`; create a local admin account.
3. Create an `users` auth collection and collections for `households`, `household_members`, `people`, `events`, `tasks`, `work_days`, `work_blocks`, `import_batches`, and `proposals`. Store timestamps as ISO date-times and keep the household ID on every shared record.
4. Add authorization rules so a signed-in user can read/write only records belonging to a household where they are a member. Never use an open rule in production.
5. Set `VITE_API_BASE_URL=http://127.0.0.1:8090` in an untracked `.env.local` file when the frontend adapter is implemented. Never commit `.env.local` or admin credentials.
6. Back up the local `pb_data/` directory while PocketBase is stopped. Test restoring a copy before using the service for real family data.

For production, add HTTPS, a real domain, CORS restricted to the Pages origin, encrypted backups, update monitoring, account recovery, scoped API import tokens, and a documented EU hosting provider. GitHub Pages does not provide any of these backend functions. See [`docs/deployment.md`](docs/deployment.md) and [`docs/privacy.md`](docs/privacy.md).
