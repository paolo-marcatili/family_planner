# Family Planner ChatGPT ingestion bridge

This Apps Script web app receives a Family Planner JSON envelope and stages every item in a **private proposal-inbox Google Calendar**. It does not write directly to the authoritative shared calendar and does not auto-approve proposals.

## Deploy

1. Create a new standalone Google Apps Script project under the Google account that will own the proposal calendar.
2. Copy `Code.gs` and `appsscript.json` into the project, or use `clasp` after reviewing the project configuration.
3. Run `setupFamilyPlannerBridge()` once from the editor. Authorize Calendar access. Copy the returned token and proposal-calendar ID into a password manager; never commit them.
4. Deploy as a Web app, execute as the deploying user. Choose the narrowest access setting compatible with your company ChatGPT Action. The bridge still requires the ingestion token in every request body.
5. Copy the deployment `/exec` URL.
6. Test with `examples/curl-ingest.sh` after setting environment variables locally.
7. Rotate the token with `rotateFamilyPlannerToken()` after suspected exposure or when changing senders.

## Request

```json
{
  "request_id": "weekly-2026-09-07-v1",
  "auth": { "token": "<INGESTION_TOKEN>" },
  "payload": { "schema_version": "1.0", "week_start": "2026-09-07", "timezone": "Europe/Copenhagen", "generated_at": "2026-09-06T18:00:00+02:00", "proposals": [] }
}
```

Apps Script web apps do not expose arbitrary request headers consistently, so the baseline uses a body token. If your company ChatGPT supports signed requests, extend the bridge with a timestamped HMAC and short replay window. The file-upload path remains available if custom Action authentication is not supported.

## Security

- Never use your Google password as the ingestion token.
- Keep the proposal calendar private.
- Proposals remain unapproved and are visually marked.
- Reject oversized, malformed, duplicate, or non-proposed records.
- Do not send raw Outlook calendars, raw school messages, feed URLs, or credentials.
