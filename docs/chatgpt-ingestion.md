# Programmatic ChatGPT ingestion

## Recommended data path

```text
Company ChatGPT → HTTPS JSON → Google Apps Script bridge
                                   ↓
                         proposal-inbox Google Calendar
                                   ↓
                        Family Planner Decisions review
                                   ↓ approve
                         authoritative shared calendar
```

The bridge lives under `apps-script/`. It validates the version 1.0 JSON envelope, enforces `status: proposed`, checks request IDs and duplicate fingerprints, and writes only to the private proposal-inbox calendar. It never auto-approves or writes directly to the authoritative family calendar.

## One-time bridge setup

1. Create a standalone Google Apps Script project under the Google account that owns the proposal calendar.
2. Copy `apps-script/Code.gs` and `apps-script/appsscript.json` into it.
3. Run `setupFamilyPlannerBridge()` manually. Authorize Calendar access.
4. Store the returned ingestion token in a password manager. Never put it in GitHub, the Pages app, a prompt transcript, or screenshots.
5. Keep the automatically created **Family Planner Proposal Inbox** calendar private.
6. Deploy the script as a Web app that executes as the deploying user. Choose the narrowest audience supported by the ChatGPT environment.
7. Copy the `/exec` deployment URL.

## Test outside ChatGPT

From the repository root:

```bash
export FAMILY_PLANNER_INGEST_URL='https://script.google.com/macros/s/.../exec'
export FAMILY_PLANNER_INGEST_TOKEN='copy-from-script-properties'
bash apps-script/examples/curl-ingest.sh
```

Confirm that marked `[PROPOSAL]` events appear in the proposal-inbox calendar and not in the authoritative calendar. Repeating the same request ID/external IDs should report duplicates.

## Company ChatGPT Action

Use `apps-script/openapi.yaml` as the starting schema, replacing the deployment URL. Before enabling it, determine whether the corporate ChatGPT platform supports either:

1. a hidden secret injected into the JSON body; or
2. Google-authenticated requests to the Apps Script web app.

Apps Script web apps do not reliably expose arbitrary custom request headers to `doPost`, so an ordinary hidden `Authorization` header cannot be assumed. The baseline bridge validates `auth.token` in the JSON body. Do **not** paste that token into a normal conversational prompt. Store it only in the Action's protected authentication/configuration facility if that facility can insert a hidden body field.

If protected Action authentication is unavailable, do not deploy an unauthenticated endpoint. Keep the JSON file-upload path as the operational fallback and ask corporate ChatGPT administrators whether a secured custom Action, Google identity, or managed proxy is supported.

## Request format

```json
{
  "request_id": "weekly-2026-09-07-v1",
  "auth": { "token": "<INJECTED_SECRET>" },
  "payload": {
    "schema_version": "1.0",
    "week_start": "2026-09-07",
    "timezone": "Europe/Copenhagen",
    "generated_at": "2026-09-06T18:00:00+02:00",
    "proposals": []
  }
}
```

## Rotation and incident response

- Run `rotateFamilyPlannerToken()` and update the sender after suspected exposure.
- Delete/redeploy the web-app deployment if its access configuration is wrong.
- Never log the token or full private payload.
- Review and delete proposal-inbox events independently of accepted family events.
- Keep JSON file upload usable during bridge outages.
