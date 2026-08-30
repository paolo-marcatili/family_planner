# Troubleshooting

## Google login does not open

- Check that the client ID ends in `.apps.googleusercontent.com`.
- Confirm Google Identity Services is reachable and not blocked by a privacy extension or corporate policy.
- Confirm the current origin is present under Authorized JavaScript origins in Google Cloud.
- Do not enter a client secret or Google password into Family Planner.

## No calendars appear

- Verify Google Calendar API is enabled.
- Reconnect and approve both calendar-list and calendar-events scopes.
- Confirm the signed-in account has access to the shared calendar.
- Keep the OAuth app in testing with Paolo and Anna added as test users until verification is complete.

## Writes fail

- Ensure the selected shared calendar grants Make changes to events.
- Check token expiry and reconnect.
- Verify the event has a valid start/end and the marker can be written/read back.
- Never retry deletion against unmarked events.

## ChatGPT Action cannot authenticate

- Confirm the platform can inject a protected token into the JSON body without exposing it in the prompt.
- Apps Script `doPost` does not reliably expose arbitrary custom headers, so the documented baseline uses `auth.token` in the request body.
- If protected Action credentials are unavailable, do not remove bridge authentication. Use JSON file upload.

## Proposal duplicates

- Reuse a stable `request_id` for retries.
- Ensure proposal `external_id` values remain stable.
- Check the proposal calendar for matching fingerprints before deleting anything.

## Recovering safely

- Disconnect/revoke Google access.
- Rotate the Apps Script ingestion token.
- Export marked events before a migration.
- Disabling the app must not delete shared-calendar events.
