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
