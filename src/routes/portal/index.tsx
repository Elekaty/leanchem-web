import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, Navigate, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../context/AuthContext'

export const Route = createFileRoute('/portal/')({
  head: () => ({
    meta: [{ title: 'Client Portal | LeanChem' }],
  }),
  component: PortalGatePage,
})

function PortalGatePage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('buyer@example.com')
  const [password, setPassword] = useState('demo')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    login(email)
    void navigate({ to: '/portal/dashboard' })
  }

  // Assume logged-in buyers land on the self-service dashboard.
  if (session.isLoggedIn) {
    return <Navigate to="/portal/dashboard" />
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
        Sign in for dashboard metrics, order history, compliance documents, and RFQ reorder.
      </p>
      <form
        className="mt-8 space-y-4 rounded border border-gray-200 bg-white p-6"
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
            className="mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal"
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
            className="mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal"
          />
        </label>
        <button type="submit" className="btn btn-primary w-full">
          Sign in
        </button>
        <p className="text-center text-xs text-gray-500">Demo: any email / password works.</p>
      </form>
    </div>
  )
}
