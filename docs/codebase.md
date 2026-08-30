# Codebase guide

The production transition keeps the public static deployment but removes the database runtime path. The shared Google Calendar is authoritative.

| Directory | Responsibility |
|---|---|
| `src/domain/` | Planner types, constants, dates, and pure business rules |
| `src/components/` | Reusable UI such as the portal-based quick-action menu |
| `src/features/planner/` | Planner orchestration and current page composition |
| `src/features/setup/` | Google setup wizard and Google connection state |
| `src/features/settings/` | Settings/prompt/ingestion setup panels |
| `src/providers/` | Calendar/auth repositories and proposal-inbox adapters |
| `src/services/` | Browser draft/settings/cache services |
| `src/lib/` | Metadata encoding, JSON import validation, sync filtering, ICS export |
| `apps-script/` | Programmatic ChatGPT ingestion bridge |

`src/main.tsx` is intentionally a thin application entrypoint. New provider logic belongs in `src/providers/`; pure transformations belong in `src/domain/` or `src/lib/`; UI belongs in `src/components/` or a feature directory.

## State modes

- **Disconnected:** Google is not connected. Synthetic/demo data and local drafts are available, but the UI must clearly say they are not authoritative.
- **Connected:** the selected Google shared calendar is authoritative. Refresh replaces stale calendar cache with Google reads while retaining unapproved local/proposal-inbox items.
- **Failure/offline:** writes fail without silently overwriting local or Google state. The user can retry or export drafts.

## Tests

Run:

```bash
npm ci
npm test
npm run check
npm run build
```

Provider tests use mocks and synthetic event data. Real Google credentials are never used in CI.
