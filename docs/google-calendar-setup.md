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
6. Add exact redirect URIs for the local callback and deployed callback route used by the app. Do not use wildcards.
7. Use the least privilege needed. For creating/updating Family Planner events, the implementation uses `https://www.googleapis.com/auth/calendar.events`; review whether narrower scopes are available for your final design.

The OAuth client ID may be used by a public SPA. The client secret must **not** be put in GitHub, the frontend bundle, `.env` files committed to Git, or GitHub Actions artifacts. A static SPA should use authorization-code + PKCE and short-lived session handling. If Google policy or the required refresh-token behavior needs a confidential client, use a private local companion or revise the no-server architecture; never encode the secret.

## 3. Configure the app locally

The provider adapter is not enabled by default. When the Google implementation is completed, use an untracked `.env.local` with values like:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-public-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_GOOGLE_SHARED_CALENDAR_ID=your-private-calendar-id
```

Never add the calendar ID, tokens, or any secret to synthetic fixtures or public documentation. The calendar ID is not sufficient to access events, but it identifies a private resource.

## 4. Login and first-run flow

1. Click **Connect Google Calendar**.
2. Generate a cryptographically random `state` and PKCE verifier/challenge in the browser.
3. Redirect to Google authorization with the exact redirect URI and calendar-events scope.
4. Verify `state` on return and exchange the authorization code according to Google's public-client flow. Do not place a client secret in the browser.
5. Store the short-lived session in memory or a carefully scoped browser session; provide logout and disconnect/revoke actions.
6. List the user's calendars and require explicit selection of the shared calendar. Never guess based on a calendar name.
7. Perform a read-only test first. Display the selected calendar ID in Settings without exposing tokens.

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
