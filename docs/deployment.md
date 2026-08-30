# Deployment and production setup

## Static frontend

GitHub Pages hosts the Vite frontend from `.github/workflows/deploy-pages.yml`. The deployed base path is `/family_planner/`.

## Google Cloud configuration

Follow `docs/google-calendar-setup.md`:

1. Create a Google Cloud project and enable Google Calendar API.
2. Configure OAuth consent and add Paolo/Anna as test users during development.
3. Create a Web OAuth client with exact localhost and `https://paolo-marcatili.github.io` origins.
4. Put only the public client ID in local/deployment configuration. Never add a client secret.
5. Create/share a dedicated Google Calendar and select it through the setup wizard.

## Apps Script ingestion bridge

Follow `apps-script/README.md`:

1. Deploy the Apps Script under the proposal-calendar owner account.
2. Run the one-time setup to create a private proposal calendar and random ingestion token.
3. Configure the company ChatGPT custom Action if available, otherwise use `curl` for testing and retain JSON file upload.
4. Rotate the ingestion token independently of Google OAuth.

## Production release

Do not use real family data until `docs/production-release.md` is complete. At minimum, test two users/devices, login/logout/revoke, calendar selection, marked round-trip writes, external edits, duplicate ingestion, failure recovery, mobile/accessibility, and data export/removal.
