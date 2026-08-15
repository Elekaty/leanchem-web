import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, Navigate, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../context/AuthContext'
import { useLiveRegion } from '../../components/LiveRegion'

export const Route = createFileRoute('/portal/')({
  head: () => ({
    meta: [{ title: 'Client Portal | LeanChem' }],
  }),
  component: PortalGatePage,
})

type Mode = 'login' | 'register'

const fieldClass =
  'mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal outline-none focus:border-adamantine'

function PortalGatePage() {
  const { session, login, register } = useAuth()
  const navigate = useNavigate()
  const { announce } = useLiveRegion()
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [email, setEmail] = useState('buyer@example.com')
  const [password, setPassword] = useState('demo123')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')

  if (session.isLoggedIn) {
    return <Navigate to="/portal/tracker" />
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const result = await login(email, password)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      announce(result.error)
      return
    }
    announce('Signed in. Opening your personalized tracker.')
    void navigate({ to: '/portal/tracker' })
  }

  const onRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const result = await register({
      email,
      password,
      fullName,
      companyName,
      phone,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      announce(result.error)
      return
    }
    announce('Account created. Your personalized order tracker is ready.')
    void navigate({ to: '/portal/tracker' })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Portal</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">Client Portal</h1>
      <p className="mt-2 text-velvet/65">
        Register with basic company details, then track your chemical orders, stages, and messages
        on a page that is only yours.
      </p>

      <div
        className="mt-6 inline-flex rounded border border-gray-200 bg-gray-50 p-1"
        role="tablist"
        aria-label="Account"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`rounded px-4 py-2 text-sm font-bold ${
            mode === 'login' ? 'bg-white text-lapis shadow-sm' : 'text-gray-500'
          }`}
          onClick={() => {
            setMode('login')
            setError(null)
            setEmail('buyer@example.com')
            setPassword('demo123')
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={`rounded px-4 py-2 text-sm font-bold ${
            mode === 'register' ? 'bg-white text-lapis shadow-sm' : 'text-gray-500'
          }`}
          onClick={() => {
            setMode('register')
            setError(null)
            setEmail('')
            setPassword('')
            setFullName('')
            setCompanyName('')
            setPhone('')
          }}
        >
          Register
        </button>
      </div>

      {mode === 'login' ? (
        <form
          className="mt-4 space-y-4 rounded border border-gray-200 bg-white p-6"
          onSubmit={onLogin}
        >
          <label className="block text-sm font-semibold">
            Work email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </label>
          {error ? (
            <p className="rounded border border-error/30 bg-error/5 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in to my tracker'}
          </button>
          <p className="text-center text-xs text-gray-500">
            Demo account: <strong>buyer@example.com</strong> / <strong>demo123</strong>
          </p>
        </form>
      ) : (
        <form
          className="mt-4 space-y-4 rounded border border-gray-200 bg-white p-6"
          onSubmit={onRegister}
        >
          <label className="block text-sm font-semibold">
            Full name
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Meron Tadesse"
            />
          </label>
          <label className="block text-sm font-semibold">
            Company
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Hawassa Coatings PLC"
            />
          </label>
          <label className="block text-sm font-semibold">
            Work email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            Phone (optional)
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              placeholder="+251 …"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password (min 6 characters)
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </label>
          {error ? (
            <p className="rounded border border-error/30 bg-error/5 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account & open tracker'}
          </button>
          <p className="text-center text-xs text-gray-500">
            After register you land on your personalized Tracker with starter sample orders.
          </p>
        </form>
      )}
    </div>
  )
}
