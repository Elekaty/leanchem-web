import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserSession } from '../types/catalog'

const DEMO_SESSION: UserSession = {
  tier: 2,
  verificationStatus: 'pending',
  displayName: 'A. Bekele',
  roleLabel: 'Procurement',
  siteLabel: 'Addis HQ',
  isLoggedIn: true,
}

interface AuthContextValue {
  session: UserSession
  login: (email?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'leanchem-portal-session'

function readSession(): UserSession {
  if (typeof window === 'undefined') {
    return { ...DEMO_SESSION, isLoggedIn: false, verificationStatus: 'unverified', tier: 1 }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as UserSession
  } catch {
    /* ignore */
  }
  return { ...DEMO_SESSION, isLoggedIn: false, verificationStatus: 'unverified', tier: 1 }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession>(readSession)

  const login = useCallback((email?: string) => {
    const next: UserSession = {
      ...DEMO_SESSION,
      displayName: email?.split('@')[0] || DEMO_SESSION.displayName,
      isLoggedIn: true,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    const next: UserSession = {
      ...DEMO_SESSION,
      isLoggedIn: false,
      tier: 1,
      verificationStatus: 'unverified',
    }
    window.localStorage.removeItem(STORAGE_KEY)
    setSession(next)
  }, [])

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
