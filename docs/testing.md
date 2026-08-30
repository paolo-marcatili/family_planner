# Testing Family Planner

This repository currently contains a calendar-first browser-local prototype. It is published at https://paolo-marcatili.github.io/family_planner/. Accepted calendar items are modeled as shared-calendar records with Family Planner metadata; until a provider connector is configured, the browser stores only a non-authoritative demo cache.

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
5. Single-click an item, choose between Paolo, Anna, Both, and Unassigned in quick actions, and verify the owner changes. Double-click an item to open the full editor.
6. Open Workload and confirm assignment counts and clickable open items.
7. Open Decisions, approve or defer the synthetic proposal, and confirm its status changes.
8. Open Imports, choose `packages/plan-schema/example-weekly-plan.json`, and confirm validated proposals appear in Decisions without automatic approval.
9. Open Settings, change the Paolo/Anna display names, and confirm the settings are retained locally.
10. Click export and removal controls. Confirm export is approved-only, removal is marker-scoped and confirmation-based, and unconnected provider actions do not pretend to write remotely.
11. Refresh the browser and confirm local edits remain. Use Reset demo data and confirm the synthetic starting state returns.
12. Verify the non-time-bound task list, one-click completion, owner assignment, and Schedule conversion flow.
13. Switch planning mode between Weekly Review, Incremental Update, and Urgent Change, and select a 7/14/21/28-day horizon.
14. Verify scheduled-time donut charts and household-contribution allocation, including shared and unassigned buckets.
15. Verify task-to-event conversion retains the task link/metadata and does not silently mark the task complete.

## GitHub Pages check

After a push to `main`, inspect the Actions workflow `Deploy frontend to GitHub Pages`. It must pass checkout, Node setup, `npm ci`, type-check, build, artifact upload, and Pages deployment. Open https://paolo-marcatili.github.io/family_planner/ and repeat the visual checklist.

## Current limitations

- localStorage is per browser/device and is not shared with the other organizer;
- authentication and shared-calendar provider persistence are not implemented in the public demo;
- JSON import validates the envelope and creates local proposal records in demo mode; provider persistence is not enabled;
- Outlook, Gmail, and school-calendar connections are not implemented;
- time-blocking cards and direct provider writes are future OAuth/API integration placeholders;
- conflict detection, notifications, and server-side audit history are not implemented.
- the shared-calendar connector and real Outlook/Gmail OAuth are not configured; ICS is the active export handoff.
- the shared family calendar is authoritative in the planned architecture; localStorage is not a second authoritative database.

Never test with raw work calendars, raw school messages, private feed URLs, credentials, or confidential meeting titles in this public repository.
