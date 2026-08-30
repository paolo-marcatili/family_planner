# Testing Family Planner

This repository currently contains a calendar-first browser-local prototype. It is published at https://paolo-marcatili.github.io/family_planner/. Edits are saved in the current browser's localStorage; there is no authentication, shared database, real calendar synchronization, or API import yet.

## Prerequisites

- Node.js 20 or newer
- npm
- A modern browser

## Automated local checks

From the repository root:

```bash
npm ci
npm run check
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The smoke test uses an ephemeral localhost port, requests the built `/family_planner/` page, and checks that a generated asset is served.

## Manual browser checklist

1. Run `npm run dev` and open the printed localhost URL.
2. Confirm the Calendar view shows Monday through Sunday, time slots, synthetic events, owner chips, and Suggested/Confirmed/Needs decision legend items.
3. Click a blank day/time slot, add an event or task, and verify it appears in the calendar.
4. Click an existing event/task and edit its title, type, category, day, start/end time, owner, people involved, note, and one-off/weekly recurrence. Save and confirm the calendar updates.
5. Click an owner chip, change between You, Wife, Both, and Unassigned, and verify the new owner is displayed.
6. Open Workload and confirm assignment counts and clickable open items.
7. Open Decisions, approve or defer the synthetic proposal, and confirm its status changes.
8. Open Imports, choose `packages/plan-schema/example-weekly-plan.json`, and confirm a preview notice appears without automatically adding data.
9. Open Settings and confirm the local-demo and future-integration boundaries are explicit.
10. Click the private-calendar, work-calendar, and commute-buffer shortcuts. Confirm they report that integration is not connected rather than pretending to write to a calendar.
11. Refresh the browser and confirm local edits remain. Use Reset demo data and confirm the synthetic starting state returns.
12. Verify one click opens quick actions, double-click opens the full editor, and touch users can use the Edit action.
13. Verify the non-time-bound task list, one-click completion, and Schedule conversion flow.
14. Open Settings, change organizer display names, switch planning mode, and select a 7/14/21/28-day horizon.
15. Verify export options can target all approved items or Work items, and bulk removal is preview-first and marker-scoped.

## GitHub Pages check

After a push to `main`, inspect the Actions workflow `Deploy frontend to GitHub Pages`. It must pass checkout, Node setup, `npm ci`, type-check, build, artifact upload, and Pages deployment. Open https://paolo-marcatili.github.io/family_planner/ and repeat the visual checklist.

## Current limitations

- localStorage is per browser/device and is not shared with the other organizer;
- authentication and shared-calendar provider persistence are not implemented in the public demo;
- JSON import validates the envelope and creates local proposal records in demo mode; provider persistence is not enabled;
- Outlook, Gmail, and school-calendar connections are not implemented;
- time-blocking cards are future OAuth/API integration placeholders;
- conflict detection, notifications, and server-side audit history are not implemented.
- the shared-calendar connector and real Outlook/Gmail OAuth are not configured; ICS is the active export handoff.

Never test with raw work calendars, raw school messages, private feed URLs, credentials, or confidential meeting titles in this public repository.
