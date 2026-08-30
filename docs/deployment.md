# Deployment

## Frontend

The frontend is designed for GitHub Pages. The workflow builds the Vite app and publishes `dist/`. Enable Pages using GitHub Actions in the repository settings. The Vite base path is `/family_planner/`.

## Database architecture superseded

The previous PocketBase preparation is superseded. The active design has no application database: the shared family calendar is authoritative. GitHub Pages serves the application, while a future calendar provider adapter performs authenticated calendar reads/writes.

For historical local backend reference only:

1. Download the PocketBase release matching your operating system from the official PocketBase releases page, or use a pinned Docker image. Keep the binary/image configuration outside the Git repository.
2. Start PocketBase on loopback only: `./pocketbase serve --http=127.0.0.1:8090`.
3. Open `http://127.0.0.1:8090/_/`, create a local admin account, and create the collections described in `docs/architecture.md`: `users`, `households`, `household_members`, `people`, `events`, `tasks`, `work_days`, `work_blocks`, `import_batches`, and `proposals`.
4. Configure the `users` collection as an auth collection. Add a household relation to shared collections. Rules must require an authenticated user and a membership record for the target household; do not use public `true` rules.
5. When a frontend adapter exists, put `VITE_API_BASE_URL=http://127.0.0.1:8090` in an untracked `.env.local`. Never commit admin credentials or tokens.
6. Stop PocketBase before copying `pb_data/` for a local backup. Restore a copy in a disposable directory and verify login and data reads before relying on a backup.

The current frontend does not use PocketBase. Do not provision or connect it as an event database unless the architecture is explicitly amended again.

The repository includes `backend/pocketbase/docker-compose.yml`, `backend/pocketbase/collections.md`, and `backend/pocketbase/README.md` as the canonical local setup assets. `backend/pocketbase/pb_data/` is ignored and must never be committed.

Before production deployment, decide:

- backend provider and data region;
- domain and HTTPS termination;
- authentication and household authorization rules;
- API-token storage, rotation, and revocation;
- encrypted backups and restore testing;
- monitoring and update responsibility;
- CORS policy allowing only the intended frontend origin.

Production must also use HTTPS, a non-admin scoped import token, rate limits, payload size limits, account recovery, audit logging, encrypted backups, restore drills, and an update/monitoring owner. The calendar-sync layer should use provider-approved OAuth scopes and write only the explicitly approved blocks (for example, commute buffers), not raw source data.

No production service or credential is provisioned by the initial repository setup.
