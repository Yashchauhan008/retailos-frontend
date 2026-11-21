import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAccessToken, clearTokens } from '@/shared/api/client'
import type { User } from '@/shared/api/auth'
import { logout as apiLogout } from '@/shared/api/auth'

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const signOut = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      clearTokens()
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(getAccessToken()),
      setUser,
      signOut,
    }),
    [user, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}