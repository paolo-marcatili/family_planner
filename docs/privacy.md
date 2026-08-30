# Privacy and security

Family Planner handles private household schedules and work-availability metadata.

- Never commit Google client secrets, access/refresh tokens, calendar IDs, ingestion tokens, Aula feed URLs, raw emails, raw calendar exports, or confidential meeting titles.
- The Google password is entered only into Google Identity Services. Family Planner never creates, transmits, or stores it.
- The public OAuth client ID is configuration, not a secret. Keep exact origins/redirects and minimum scopes.
- Local storage is a replaceable draft/settings/cache layer, not the source of truth.
- The shared Google Calendar is private and shared only with intended organizer accounts.
- Apps Script proposals are stored in a separate private proposal calendar and never auto-approved.
- Rotate/revoke the Apps Script token and Google session after suspected exposure.
- Bulk deletion applies only to exactly marked Family Planner events after preview/confirmation.
- Use synthetic calendars and test accounts until the production release checklist passes.
