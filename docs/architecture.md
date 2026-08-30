# Architecture

## Boundary

The static React frontend is hosted separately from the future authenticated backend. GitHub Pages serves assets only; it must not hold credentials or shared household state.

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
