# Google Calendar source-of-truth and login setup

The app is designed for a **shared Google Calendar** as the authoritative source. There is no application database. The public GitHub Pages build currently contains a mock/local demo only; the steps below are the required path to enable real access.

## 1. Create/select the shared calendar

1. In Google Calendar, create a dedicated calendar such as `Family Planner` under the account that owns the household calendar.
2. Share it with the other organizer's Google account with the **Make changes to events** permission. Do not share the calendar publicly.
3. Copy the calendar ID from **Calendar settings → Integrate calendar → Calendar ID**. Treat it as private configuration even though it is not a password.
4. Decide which calendar is authoritative. The app must read and write only that calendar; personal/work calendars are separate export targets.

## 2. Create the Google Cloud OAuth client

1. Create or select a Google Cloud project dedicated to Family Planner.
2. Enable the **Google Calendar API**.
3. Configure the OAuth consent screen. Keep the app in testing while developing and add only the two organizer test users.
4. Create an OAuth client for a **Web application**.
5. Add exact authorized JavaScript origins for local development (for example `http://localhost:5173`) and the deployed Pages origin `https://paolo-marcatili.github.io`.
6. The app uses the Google Identity Services **token model** in the browser, so login returns through a JavaScript callback rather than sending your Google password to Family Planner. If you later switch to redirect/code flow, add exact callback URIs and a secure code-exchange component; do not use wildcards.
7. Use the least privilege needed. For creating/updating Family Planner events, the implementation uses `https://www.googleapis.com/auth/calendar.events`; review whether narrower scopes are available for your final design.

The OAuth client ID may be used by a public SPA. The client secret must **not** be put in GitHub, the frontend bundle, `.env` files committed to Git, or GitHub Actions artifacts. The implemented static SPA boundary uses Google Identity Services with short-lived access tokens held in memory. It does not store a refresh token. If you require unattended/long-lived access, use a private local companion or revise the no-server architecture; never encode a secret in the public app.

## 3. Configure the app locally

The provider adapter is not enabled by default. When the Google implementation is completed, use an untracked `.env.local` with values like:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-public-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_GOOGLE_SHARED_CALENDAR_ID=your-private-calendar-id
```

Never add the calendar ID, tokens, or any secret to synthetic fixtures or public documentation. The calendar ID is not sufficient to access events, but it identifies a private resource.

## 4. Login and first-run flow

1. Open **Settings → Google Calendar Setup**.
2. Enter and save the public Web OAuth client ID. It is not a password or client secret.
3. Click **Connect Google Calendar**. Google Identity Services displays the provider-managed consent flow with calendar-list and calendar-events scopes. The app never sees the Google password.
4. Keep the returned short-lived access token in memory. Do not put a client secret or refresh token in the browser.
5. Select the authoritative shared calendar and optional proposal-inbox calendar returned by Google. Never guess based on calendar name.
6. Run **Test calendar read** and verify the event count.
7. Perform one explicitly confirmed synthetic marked event write/read/update/delete before real use.
8. Disconnect to revoke the token through Google Identity Services.

Selected calendar IDs are stored only as local configuration. They identify private resources and must not be committed or pasted into public support requests.

## 5. Calendar event rules

- The shared Google Calendar is authoritative after connection.
- Family Planner-owned events carry `X-FAMILY-PLANNER`, version `1.0`, and a stable planner ID in extended properties and the reserved description block.
- Preserve user-written description text outside the reserved metadata block.
- Read back every create/update and compare the provider event ID, timestamps, and metadata.
- Events without the marker are external and must not be changed or deleted by bulk actions.
- An externally added event is a calendar fact; any inferred assignment or duty is a proposal.

## 6. Work-calendar export

Private/work calendars are separate targets. Export only explicitly approved subsets (for example Work category, commute blocks, or selected date range), use a separate target marker, show a preview, and provide a record of provider IDs. Bulk removal must target only records carrying the corresponding marker and must require confirmation. ICS download remains the safe fallback but cannot update or delete remote events.

## 7. Verification before real family use

- Test with a synthetic calendar and two test Google accounts.
- Verify login, logout, revocation, calendar selection, read, create, update, and read-back.
- Verify an unmarked event is never modified or removed.
- Edit an event manually in Google Calendar and verify the app shows an incremental delta.
- Revoke access and confirm the app fails safely without losing local drafts.
- Test duplicate imports, rate limits, network failures, token expiry, mobile browsers, and two devices.
- Only after these checks should you use the real shared family calendar.
