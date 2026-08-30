# Production architecture

## Source of truth

The selected shared Google Calendar is the authoritative event store. Family Planner does not use an application database.

- Google Calendar holds accepted timed events and scheduled tasks.
- Family Planner metadata is stored in Google private extended properties and a portable, versioned description block.
- Local browser storage holds only drafts, UI settings, prompt templates, selected calendar ID, and a replaceable cache.
- A changed Google event wins over a stale local cache. The app must show a delta rather than overwrite external changes.

## Frontend modules

| Area | Responsibility |
|---|---|
| `src/domain/` | Planner types, constants, dates, pure rules |
| `src/components/` | Presentation-only calendar, tasks, workload, decisions, settings |
| `src/features/setup/` | Guided Google onboarding and connection state |
| `src/providers/` | Google Identity, Google Calendar repository, mock repository |
| `src/services/` | Local draft/settings/cache persistence |
| `src/lib/` | Calendar metadata, import validation, ICS export, sync filtering |
| `apps-script/` | Authenticated ChatGPT ingestion bridge and proposal-inbox calendar staging |

## Google connection

The public browser app loads Google Identity Services and requests short-lived calendar-list and calendar-events scopes. The Google password is entered only into Google's consent UI; Family Planner never receives or stores it. The OAuth client ID and selected calendar ID are configuration, while access tokens remain in memory.

When connected, `GoogleCalendarRepository` provides calendar list/read/create/update/delete operations. Unmarked events are read-only. Every managed write includes `X-FAMILY-PLANNER`, a version, and stable planner ID, and must be read back after the operation.

## Programmatic ingestion

Company ChatGPT submits the Family Planner 1.0 JSON envelope to a Google Apps Script web app. The bridge validates a separate ingestion token and request ID, rejects invalid or duplicate proposals, and stages proposals in a private proposal-inbox Google Calendar. The app reviews these proposals and promotes only approved items into the authoritative shared calendar. JSON file upload remains available when a custom Action is not supported.

## Trust boundaries

- No Google password, client secret, access token, refresh token, calendar ID, ingestion token, Aula feed URL, or raw work/school content is committed.
- The Apps Script ingestion token is separate from Google login and is rotated independently.
- Public weather requests include only Copenhagen coordinates and weather fields.
- External/unmarked calendar events are never modified or deleted by bulk operations.
