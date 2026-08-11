const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'

export interface ApiError {
  code: string
  message: string
}

export interface ApiEnvelope<T> {
  data: T | null
  error: ApiError | null
}

export class ApiClientError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('leanchem_access_token')
}

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem('leanchem_access_token', access)
  if (refresh) localStorage.setItem('leanchem_refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('leanchem_access_token')
  localStorage.removeItem('leanchem_refresh_token')
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiClientError(
      'NETWORK_ERROR',
      'Unable to retrieve catalog data. Please check your connection.',
      0,
    )
  }

  const body = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || body.error) {
    throw new ApiClientError(
      body.error?.code ?? 'REQUEST_FAILED',
      body.error?.message ?? 'Request failed.',
      response.status,
    )
  }
  return body.data as T
}
