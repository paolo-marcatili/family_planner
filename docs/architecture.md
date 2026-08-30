# Architecture

## Boundary

The static React frontend is hosted separately from the future authenticated backend. GitHub Pages serves assets only; it must not hold credentials or shared household state. The current browser-local prototype intentionally stores synthetic demo edits in localStorage so the interaction model can be tested before backend selection.

The planned backend boundary is a PocketBase-compatible HTTPS API, but provider, hosting, and operational choices remain deferred. The backend will own authentication, household membership, events, recurring events, tasks, assignments, work-day statuses, proposal batches, and audit history.

## Core concepts

- **People:** two organizers plus children/household members. Leo and Elliott participate in routine childcare planning; Matilde is recorded but excluded from that default view.
- **Events:** time-bound commitments.
- **Tasks:** work that can have a due date without a fixed time.
- **Work days:** first-class office/home/leave/unknown status with suggested or confirmed state.
- **Proposals:** imported records that remain proposed until a human approves, edits, defers, or rejects them.

## MVP sequence

1. Static scaffold and import contract (this repository state).
2. Backend/authentication and household access control.
3. Event/task/recurrence management.
4. Proposal review and deterministic conflict warnings.
5. API import and production deployment.

Meals and school-food planning are intentionally reserved for a later domain module.

## Current implementation boundary

The public GitHub Pages application is currently a browser-local prototype. It renders synthetic records, writes edits to localStorage, and has no user authentication or shared database. This is useful for testing interaction design but is not suitable for real household data or two-device synchronization.

## Backend collection outline

When the shared backend is implemented, use household-scoped records with these relationships:

| Collection | Purpose | Key relationships |
|---|---|---|
| `users` | PocketBase authentication accounts | Organizer identity |
| `households` | Shared family container and timezone defaults | One or more members |
| `household_members` | Membership and role | `household`, `user` |
| `people` | Organizers, children, and other household members | `household` |
| `events` | Accepted time-bound commitments | `household`, optional `people`, `assigned_to` |
| `tasks` | Accepted actions and due dates | `household`, optional `people`, `assigned_to` |
| `work_days` | Daily office/home/leave states | `household`, organizer person |
| `work_blocks` | Obfuscated work time blocks | `household`, organizer person |
| `import_batches` | Source import metadata and audit trail | `household` |
| `proposals` | Pending/reviewed imported records | `import_batch`, optional accepted record |

All shared records should carry a household relation and be protected by membership-based API rules. Do not expose PocketBase admin APIs to the frontend.
