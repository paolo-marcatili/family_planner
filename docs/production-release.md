# Production migration and release gate

The repository now contains production-oriented boundaries, but it is not production-ready until every required gate below is completed with synthetic data and then repeated by both organizers.

## Phase 1 — Code and environment

- [ ] `npm ci`, `npm test`, `npm run check`, and `npm run build` pass.
- [ ] Public secret scan passes.
- [ ] Superseded database/PocketBase runtime is absent.
- [ ] Google OAuth client ID and calendar IDs exist only in untracked/deployment configuration.

## Phase 2 — Google setup

- [ ] Dedicated private shared family calendar created and shared with both organizer accounts.
- [ ] Google Calendar API enabled.
- [ ] OAuth consent screen remains in testing with only organizer test users.
- [ ] Public Web OAuth client has exact local and Pages JavaScript origins; Google Identity Services access tokens are held in memory only.
- [ ] Both organizers can connect and disconnect through Google Identity Services.
- [ ] Both select the same shared calendar through the setup wizard.
- [ ] Read-only preflight succeeds on two browsers/devices.

## Phase 3 — Calendar authority

- [ ] One synthetic marked event is created, read back, updated, and deleted.
- [ ] The description metadata block and Google private extended properties survive round trips.
- [ ] Existing user-authored description text is preserved.
- [ ] An unmarked event is never changed or deleted.
- [ ] A Google-side edit appears as a delta rather than being overwritten by stale local cache.
- [ ] Network and token-expiry failures are non-destructive.

## Phase 4 — ChatGPT ingestion

- [ ] Apps Script proposal calendar and ingestion token created.
- [ ] Repeated request IDs/external IDs do not duplicate proposals.
- [ ] Invalid, oversized, unauthorized, or non-proposed records are rejected.
- [ ] Company ChatGPT protected Action authentication is confirmed, or file upload remains the selected operating mode.
- [ ] Proposal events appear only in the proposal inbox.
- [ ] Approval promotes a proposal to the authoritative calendar exactly once.

## Phase 5 — Household pilot

- [ ] Weekly Review, Incremental Update, and Urgent Change tested.
- [ ] Non-time-bound tasks, assignment, completion, and task-to-event conversion tested.
- [ ] Workload/contribution charts reviewed for understandable assumptions.
- [ ] Filtered export and marker-scoped bulk removal tested.
- [ ] Mobile, keyboard, screen-reader basics, and tooltip placement tested.
- [ ] Token revocation, reconnect, data export, and recovery tested.
- [ ] Privacy review completed before any real work/school information is used.

## Migration from demo

Do not upload the built-in synthetic demo records to the real calendar. Connect Google first, select the shared calendar, confirm an empty/synthetic test, then clear the browser demo cache. Import only reviewed proposal JSON. Keep an ICS export of accepted events before major migrations.

## Rollback

Disconnect Google and revoke the token. Because the shared calendar is authoritative, disabling the app does not delete calendar events. Marker-scoped removal is a separate previewed operation. The JSON file-import path and ICS export remain available when the Apps Script bridge or OAuth connection is unavailable.
