import { api, clearTokens, getRefreshToken, setTokens } from './client'

export type User = {
  id: string
  email: string
  name?: string
  role?: string
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  user?: User
  tenant?: {
    id: string
    name: string
    onboarding_completed: boolean
    onboarding_step: string
  }
  onboarding_completed?: boolean
  onboarding_step?: string
}

export type RegisterPayload = {
  email: string
  password: string
  name: string
  business_name: string
  industry_id: string
  phone?: string
}

export type LoginPayload = {
  email: string
  password: string
}

function persistAuth(data: AuthResponse) {
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function registerRetailer(payload: RegisterPayload) {
  const data = await api<AuthResponse>('/auth/register-retailer', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  })
  return persistAuth(data)
}

export async function login(payload: LoginPayload) {
  const data = await api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  })
  return persistAuth(data)
}

export async function logout() {
  try {
    const refresh = getRefreshToken()
    if (refresh) {
      await api('/auth/logout', {
        method: 'POST',
        body: { refresh_token: refresh },
      })
    }
  } finally {
    clearTokens()
  }
}

export async function superAdminLogin(payload: LoginPayload) {
  const data = await api<AuthResponse>('/super-admin/auth/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  })
  return persistAuth(data)
}
