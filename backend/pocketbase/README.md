# Local PocketBase development

This directory prepares a local backend for Family Planner. The current frontend remains usable without it and still defaults to browser-local demo mode.

The machine-readable [`collection-spec.json`](collection-spec.json) is the versioned checklist for the collection set. The frontend adapter at `src/lib/backend.ts` uses only normal authenticated collection requests; it has no admin API path.

## Option A: Docker Compose

From this directory, run:

```bash
docker compose up -d
```

PocketBase listens on `http://127.0.0.1:8090`. Open `http://127.0.0.1:8090/_/` to create the local admin account. The Compose image version is pinned in `docker-compose.yml`; review and update it deliberately.

## Option B: standalone binary

Download the PocketBase binary for your operating system from the official release page. Keep it outside this repository, then run:

```bash
./pocketbase serve --http=127.0.0.1:8090
```

Create the collections in `collections.md` using the local admin UI. Do not commit the generated `pb_data/` directory.

## Frontend configuration

When the frontend backend adapter is enabled, create an untracked `.env.local` at the repository root:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8090
```

The frontend must use normal user authentication, never an admin token. The app's shared records must be filtered by household membership.

After creating the collections, create two normal organizer accounts in the `users` auth collection. Create one household and two `household_members` records. The application should persist the returned user token in memory or a secure session mechanism, not in source control. Clear the session on logout and refresh it through PocketBase's auth endpoint as appropriate.

## Backup and reset

Stop PocketBase before copying `pb_data/` for a local backup. To reset a disposable development instance, stop the service and remove the local `pb_data/` directory. Never perform that operation on real data without a verified backup.

## Production warning

This is not a production deployment. Before real family use, configure HTTPS, a restricted origin/CORS policy, account recovery, rate limiting, encrypted backups, monitoring, updates, scoped import tokens, and a documented host/data region. Do not expose PocketBase's admin API to the public frontend.
