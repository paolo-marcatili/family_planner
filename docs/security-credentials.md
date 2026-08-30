# Credentials without an external application server

## Encoding is not protection

Base64, hex, URL encoding, or any other reversible encoding does not protect a password. Anything shipped in a public GitHub Pages bundle is readable by every visitor. Never put a password, refresh token, client secret, Aula URL, or calendar export credential in GitHub, `.env` committed to Git, browser source, or a static workflow artifact.

## Recommended model

1. Use the calendar provider's OAuth authorization-code flow with PKCE when the provider permits a public client.
2. Keep the client identifier public only if the provider defines it as public; keep redirect URIs tightly allowlisted.
3. Use short-lived access tokens in memory or a carefully scoped browser session. Do not persist long-lived refresh tokens in a public static app unless the provider explicitly supports secure public-client rotation and the threat model is accepted.
4. Request the minimum scopes: read/write only to the chosen shared calendar and, separately, explicitly approved work-calendar blocks.
5. Revoke access at the provider and remove the local session when disconnecting.

## Local-only alternative

If a provider requires a client secret or password, use an optional local companion/CLI or operating-system keychain. The companion can hold a secret locally and expose a loopback-only interface to the browser. The secret must never be committed or sent through GitHub Pages. This is not cross-device synchronization and requires the companion to be running.

An encrypted local file is acceptable only when the encryption key is supplied separately by the OS keychain/password prompt. An encrypted file with its key beside it is equivalent to plaintext. There is no safe way for a password encoded into a public static bundle to remain secret.

## Operational checklist

- Rotate/revoke tokens after suspected exposure.
- Keep provider apps restricted to exact redirect URIs.
- Log event IDs and operation outcomes, not raw event descriptions or credentials.
- Add preview and confirmation before export or bulk removal.
- Never delete an event lacking the `X-FAMILY-PLANNER` marker.

## Shared-calendar implication

Because the calendar—not an application database—is authoritative, a future connector must treat provider event IDs and the `X-FAMILY-PLANNER` metadata marker as security boundaries. A local cache may contain only a copy for rendering and reconciliation. If a provider cannot preserve or expose the marker, disable update/delete operations and offer export only.
