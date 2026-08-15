import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_BUYER_ACCOUNT_ID } from '../data/corridorTracker'
import {
  authenticateCustomer,
  ensureDemoCustomer,
  registerCustomer,
  type RegisterInput,
} from '../lib/customerAuth'
import type { UserSession } from '../types/catalog'

const LOGGED_OUT: UserSession = {
  tier: 1,
  verificationStatus: 'unverified',
  displayName: '',
  roleLabel: 'Guest',
  siteLabel: '',
  isLoggedIn: false,
  accountId: '',
  email: '',
  companyName: '',
  phone: '',
}

interface AuthContextValue {
  session: UserSession
  /** Email + password sign-in against the local customer registry. */
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  /** Create a buyer account with basic profile and starter orders. */
  register: (
    input: RegisterInput,
  ) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'leanchem-portal-session'

function sessionFromCustomer(customer: {
  accountId: string
  email: string
  fullName: string
  companyName: string
  phone: string
}): UserSession {
  return {
    tier: 3,
    verificationStatus: 'verified',
    displayName: customer.fullName,
    roleLabel: 'Procurement',
    siteLabel: customer.companyName,
    isLoggedIn: true,
    accountId: customer.accountId || DEMO_BUYER_ACCOUNT_ID,
    email: customer.email,
    companyName: customer.companyName,
    phone: customer.phone,
  }
}

function normalizeSession(raw: Partial<UserSession> & { isLoggedIn?: boolean }): UserSession {
  if (!raw.isLoggedIn) return { ...LOGGED_OUT }
  return {
    ...LOGGED_OUT,
    ...raw,
    isLoggedIn: true,
    accountId: raw.accountId || DEMO_BUYER_ACCOUNT_ID,
    email: raw.email ?? '',
    companyName: raw.companyName ?? raw.siteLabel ?? '',
    phone: raw.phone ?? '',
    displayName: raw.displayName || 'Buyer',
    roleLabel: raw.roleLabel || 'Procurement',
    tier: (raw.tier as UserSession['tier']) || 3,
    verificationStatus: raw.verificationStatus || 'verified',
  }
}

function readSession(): UserSession {
  if (typeof window === 'undefined') return { ...LOGGED_OUT }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeSession(JSON.parse(raw) as Partial<UserSession>)
  } catch {
    /* ignore */
  }
  return { ...LOGGED_OUT }
}

function persist(session: UserSession) {
  if (session.isLoggedIn) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession>(readSession)

  useEffect(() => {
    void ensureDemoCustomer()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authenticateCustomer(email, password)
    if (!result.ok) return { ok: false as const, error: result.error }
    const next = sessionFromCustomer(result.customer)
    persist(next)
    setSession(next)
    return { ok: true as const }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const result = await registerCustomer(input)
    if (!result.ok) return { ok: false as const, error: result.error }
    const next = sessionFromCustomer(result.customer)
    persist(next)
    setSession(next)
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    persist(LOGGED_OUT)
    setSession({ ...LOGGED_OUT })
  }, [])

  const value = useMemo(
    () => ({ session, login, logout, register }),
    [session, login, logout, register],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
