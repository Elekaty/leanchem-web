import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchCompanyStatus,
  login as apiLogin,
  logout as apiLogout,
} from '../api/leanchem'
import { clearTokens } from '../api/client'
import type { UserSession, UserTier, VerificationStatus } from '../types'

interface AuthContextValue {
  session: UserSession
  loading: boolean
  setTierDemo: (tier: UserTier) => void
  setVerificationDemo: (status: VerificationStatus) => void
  login: (email?: string, password?: string) => Promise<void>
  logout: () => Promise<void>
  refreshStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const GUEST_SESSION: UserSession = {
  tier: 1,
  verificationStatus: 'unverified',
  displayName: 'Guest',
  roleLabel: 'Account Level: Guest',
  siteLabel: 'Main HQ',
  isLoggedIn: false,
}

function tierFromApi(tier: 'tier_1' | 'tier_2' | 'tier_3'): UserTier {
  if (tier === 'tier_3') return 3
  if (tier === 'tier_2') return 2
  return 1
}

function sessionFromStatus(status: {
  tier: 'tier_1' | 'tier_2' | 'tier_3'
  verification_status: 'pending' | 'verified' | 'rejected'
  company_name: string
  role: string
}): UserSession {
  const verificationStatus: VerificationStatus =
    status.verification_status === 'verified'
      ? 'verified'
      : status.verification_status === 'pending'
        ? 'pending'
        : 'unverified'

  return {
    tier: tierFromApi(status.tier),
    verificationStatus,
    displayName: status.company_name,
    roleLabel: `Account Level: ${status.role === 'super_admin' ? 'Admin' : status.role}`,
    siteLabel: 'Main HQ',
    isLoggedIn: true,
  }
}

const DEMO_ACCOUNTS: Record<UserTier, { email: string; password: string } | null> = {
  1: null,
  2: { email: 'pending@leanchem.demo', password: 'DemoPass123!' },
  3: { email: 'buyer@leanchem.demo', password: 'DemoPass123!' },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession>(GUEST_SESSION)
  const [loading, setLoading] = useState(true)

  const refreshStatus = useCallback(async () => {
    try {
      const status = await fetchCompanyStatus()
      setSession(sessionFromStatus(status))
    } catch {
      clearTokens()
      setSession(GUEST_SESSION)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('leanchem_access_token')
    if (!token) {
      setLoading(false)
      return
    }
    refreshStatus().finally(() => setLoading(false))
  }, [refreshStatus])

  const login = useCallback(async (email?: string, password?: string) => {
    await apiLogin(email ?? 'buyer@leanchem.demo', password ?? 'DemoPass123!')
    const status = await fetchCompanyStatus()
    setSession(sessionFromStatus(status))
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setSession(GUEST_SESSION)
  }, [])

  const setTierDemo = useCallback(
    async (tier: UserTier) => {
      const account = DEMO_ACCOUNTS[tier]
      if (!account) {
        await logout()
        return
      }
      await login(account.email, account.password)
    },
    [login, logout],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      setTierDemo,
      setVerificationDemo: (status) => {
        if (status === 'unverified') void setTierDemo(1)
        else if (status === 'pending') void setTierDemo(2)
        else void setTierDemo(3)
      },
      login,
      logout,
      refreshStatus,
    }),
    [session, loading, setTierDemo, login, logout, refreshStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
