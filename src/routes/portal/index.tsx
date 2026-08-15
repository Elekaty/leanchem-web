import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../context/AuthContext'

export const Route = createFileRoute('/portal/')({
  head: () => ({
    meta: [{ title: 'Client Portal | LeanChem' }],
  }),
  component: PortalGatePage,
})

function PortalGatePage() {
  const { session, login, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('buyer@example.com')
  const [password, setPassword] = useState('demo')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    login(email)
    void navigate({ to: '/portal/catalog' })
  }

  if (session.isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-8 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-velvet">Client Portal</h1>
        <p className="mt-2 text-velvet/65">
          Signed in as <strong>{session.displayName}</strong> ({session.roleLabel}).
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/portal/catalog"
            className="btn btn-primary no-underline hover:no-underline"
          >
            Open procurement catalog
          </Link>
          <Link
            to="/portal/orders"
            className="btn btn-secondary no-underline hover:no-underline"
          >
            View orders
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
        <Link to="/" className="mt-8 text-sm font-semibold text-adamantine no-underline hover:underline">
          ← Back to public site
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Portal</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">Client Portal</h1>
      <p className="mt-2 text-velvet/65">
        Sign in for high-density catalog, quick-view TDS drawers, and post-purchase action hubs.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-organza/30 bg-white p-6"
        onSubmit={onSubmit}
      >
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            required
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
          />
        </label>
        <button type="submit" className="btn btn-primary w-full">
          Sign in
        </button>
      </form>
    </div>
  )
}
