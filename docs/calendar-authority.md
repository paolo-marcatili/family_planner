# Shared-calendar source of truth

The Family Planner does not use an application database. The shared family calendar is authoritative for accepted events, tasks that have been scheduled, assignments, work blocks, and recurring calendar items.

## Event metadata

Family Planner-owned events carry a bounded JSON block in the event description:

```text
--- FAMILY PLANNER METADATA ---
{"marker":"X-FAMILY-PLANNER","version":"1.0","plannerId":"...","kind":"event","owner":"Paolo","category":"Childcare","status":"approved","recurrence":"one-off"}
--- END FAMILY PLANNER METADATA ---
```

Provider extended properties should carry the same marker where the calendar API supports them. The description block is the portable fallback. User-written description text outside the reserved block must be preserved.

Metadata is an index and provenance record, not a copy of raw work calendars or school messages. Keep it small, versioned, and tolerant of a user editing the description. Events without the exact marker are external and must not be modified or deleted by bulk operations.

## Authority and local state

- Accepted calendar events are written to and read back from the shared calendar once a provider connector exists.
- Local browser storage is only a temporary cache, draft store, display-name preference, weather cache, and provider-neutral demo fallback.
- Local state must never silently win over a changed shared-calendar event.
- If an event changed outside the app, show a delta and preserve unrelated assignments.

## Direct sync boundary

`src/lib/calendarSync.ts` defines provider-neutral filtering, write mapping, and marker-scoped removal preview. A real provider adapter must implement create/update/delete with OAuth/API permissions and must re-read the event after writes. Until then, the app offers ICS export, which cannot delete or update calendar events.
