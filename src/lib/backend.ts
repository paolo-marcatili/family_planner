export type BackendConfig = {
  baseUrl: string
  configured: boolean
}

/** Credential-free boundary for the future PocketBase adapter. */
export function getBackendConfig(): BackendConfig {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
  return { baseUrl, configured: baseUrl.length > 0 }
}

export function backendUnavailableMessage() {
  return 'Shared backend is not configured; this browser is using local demo mode.'
}

export type AuthSession = { token: string; record: { id: string; email?: string } }

/** Small provider-neutral adapter. It deliberately exposes no admin operations. */
export class FamilyPlannerBackend {
  constructor(private readonly config = getBackendConfig()) {}

  get configured() { return this.config.configured }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.config.configured) throw new Error(backendUnavailableMessage())
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    })
    if (!response.ok) throw new Error(`Backend request failed (${response.status})`)
    return response.json() as Promise<T>
  }

  signIn(email: string, password: string) {
    return this.request<AuthSession>('/api/collections/users/auth-with-password', { method: 'POST', body: JSON.stringify({ identity: email, password }) })
  }

  createProposal(token: string, payload: unknown) {
    return this.request('/api/collections/proposals/records', { method: 'POST', headers: { Authorization: token }, body: JSON.stringify(payload) })
  }
}
