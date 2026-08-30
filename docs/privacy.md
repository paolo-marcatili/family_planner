# Privacy and security

This project handles family routines and may receive work-availability metadata. Treat all schedule data as private.

- Never commit Aula feed URLs, raw Aula messages, calendar exports, credentials, access tokens, or confidential meeting titles.
- Store only condensed, obfuscated work annotations such as online, listen-only, critical, fixed, or flexible.
- Keep secrets in deployment configuration, never in the frontend bundle or Git history.
- Use separate organizer accounts and enforce household-level authorization in the backend.
- Use a dedicated, revocable, import-only API token for the external planning assistant.
- Provide import history, approval history, export, and deletion capabilities before production use.
- Prefer EU hosting for the backend and encrypted backups with tested restore procedures.
- Rotate any calendar-feed URL that has been exposed outside its intended private context.

The repository's example payload uses synthetic dates and names. It is not a household fixture.
