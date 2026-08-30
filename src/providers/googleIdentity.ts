import type { CalendarAuthProvider, CalendarSession } from './calendar'

export const GOOGLE_LIST_SCOPE = 'https://www.googleapis.com/auth/calendar.calendarlist.readonly'

type TokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void
}

type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string
      scope: string
      callback: (response: TokenResponse) => void
      error_callback?: (error: unknown) => void
    }) => TokenClient
    revoke: (token: string, callback?: () => void) => void
  }
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts }
  }
}

let scriptPromise: Promise<void> | null = null

function loadGoogleIdentityServices() {
  if (window.google?.accounts) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-family-planner-gis]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google Identity Services failed to load.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.familyPlannerGis = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Identity Services failed to load.'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** Google Identity Services token model for a public/static browser client. */
export class GoogleIdentityAuth implements CalendarAuthProvider {
  private current: CalendarSession | null = null
  constructor(private readonly clientId: string, private readonly scopes: string[]) {}
  session() { return this.current }

  async connect(): Promise<CalendarSession> {
    if (!this.clientId.endsWith('.apps.googleusercontent.com')) throw new Error('Enter a valid Google public OAuth client ID.')
    await loadGoogleIdentityServices()
    return new Promise<CalendarSession>((resolve, reject) => {
      const accounts = window.google?.accounts
      if (!accounts) { reject(new Error('Google Identity Services is unavailable.')); return }
      const client = accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes.join(' '),
        callback: (response) => {
          if (response.error || !response.access_token) { reject(new Error(response.error_description ?? response.error ?? 'Google authorization failed.')); return }
          this.current = { accessToken: response.access_token, expiresAt: Date.now() + Math.max((response.expires_in ?? 3600) - 60, 60) * 1000 }
          resolve(this.current)
        },
        error_callback: reject,
      })
      client.requestAccessToken({ prompt: 'consent' })
    })
  }

  async disconnect() {
    const token = this.current?.accessToken
    this.current = null
    if (token && window.google?.accounts) await new Promise<void>((resolve) => window.google!.accounts.oauth2.revoke(token, resolve))
  }
}
