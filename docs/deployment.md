# Deployment

## Frontend

The frontend is designed for GitHub Pages. The workflow builds the Vite app and publishes `dist/`. Enable Pages using GitHub Actions in the repository settings. The Vite base path is `/family_planner/`.

## Backend

GitHub Pages cannot run authentication or a database. A future PocketBase-compatible backend needs a continuously available host, HTTPS, backups, and an operational owner. A small EU VPS is one possible option; the provider is deliberately not selected by this scaffold.

Before production deployment, decide:

- backend provider and data region;
- domain and HTTPS termination;
- authentication and household authorization rules;
- API-token storage, rotation, and revocation;
- encrypted backups and restore testing;
- monitoring and update responsibility;
- CORS policy allowing only the intended frontend origin.

No production service or credential is provisioned by the initial repository setup.
