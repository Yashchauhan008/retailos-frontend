const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3007'

const ACCESS_KEY = 'retailos_access_token'
const REFRESH_KEY = 'retailos_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refresh }),
        })
        if (!res.ok) {
          clearTokens()
          return false
        }
        const data = (await res.json()) as {
          access_token?: string
          refresh_token?: string
          accessToken?: string
          refreshToken?: string
        }
        const access = data.access_token ?? data.accessToken
        const nextRefresh = data.refresh_token ?? data.refreshToken ?? refresh
        if (access) {
          setTokens(access, nextRefresh)
          return true
        }
        clearTokens()
        return false
      } catch {
        clearTokens()
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, headers: extraHeaders, ...rest } = options

  const headers = new Headers(extraHeaders)
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const doFetch = () =>
    fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

  let res = await doFetch()

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      res = await doFetch()
    }
  }

  if (!res.ok) {
    let errBody: unknown
    try {
      errBody = await res.json()
    } catch {
      errBody = await res.text()
    }
    const msg =
      typeof errBody === 'object' &&
      errBody !== null &&
      'message' in errBody &&
      typeof (errBody as { message: unknown }).message === 'string'
        ? (errBody as { message: string }).message
        : res.statusText || 'Request failed'
    throw new ApiError(res.status, msg, errBody)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}