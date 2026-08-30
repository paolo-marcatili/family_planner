/**
 * Google Calendar integration boundary.
 *
 * The public Pages client must use OAuth authorization-code + PKCE. A client
 * secret and service-account key must never be placed here or in the bundle.
 */
export type GoogleCalendarConfig = {
  clientId: string
  redirectUri: string
  calendarId: string
  scopes: string[]
}

export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

export type GoogleCalendarEvent = {
  id?: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  extendedProperties?: { private?: Record<string, string> }
}

export function validateGoogleCalendarConfig(config: GoogleCalendarConfig) {
  if (!config.clientId || config.clientId.includes('SECRET')) throw new Error('A public OAuth client ID is required; client secrets are not accepted.')
  if (!config.redirectUri.startsWith('https://') && !config.redirectUri.startsWith('http://localhost')) throw new Error('Redirect URI must be HTTPS or localhost for development.')
  if (!config.calendarId) throw new Error('Select a shared Google Calendar ID.')
  if (!config.scopes.includes(GOOGLE_CALENDAR_SCOPE)) throw new Error('Calendar events scope is required for event writes.')
  return config
}

export function googleAuthorizationUrl(config: GoogleCalendarConfig, state: string, codeChallenge: string) {
  validateGoogleCalendarConfig(config)
  const params = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: 'code', scope: config.scopes.join(' '), access_type: 'offline', state, code_challenge: codeChallenge, code_challenge_method: 'S256', include_granted_scopes: 'true' })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function toGoogleEvent(event: { id: string; title: string; description?: string; start: string; end: string; timeZone?: string }): GoogleCalendarEvent {
  return { summary: event.title, description: event.description, start: { dateTime: event.start, timeZone: event.timeZone ?? 'Europe/Copenhagen' }, end: { dateTime: event.end, timeZone: event.timeZone ?? 'Europe/Copenhagen' }, extendedProperties: { private: { familyPlannerId: event.id, familyPlannerMarker: 'X-FAMILY-PLANNER', familyPlannerVersion: '1.0' } } }
}

export function isGoogleEventOwned(event: GoogleCalendarEvent) {
  return event.extendedProperties?.private?.familyPlannerMarker === 'X-FAMILY-PLANNER'
}
