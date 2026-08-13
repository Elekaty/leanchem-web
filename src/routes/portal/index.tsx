import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/')({
  head: () => ({
    meta: [{ title: 'Client Portal | LeanChem' }],
  }),
  component: PortalPage,
})

function PortalPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Portal</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">Client Portal</h1>
      <p className="mt-2 text-velvet/65">
        Sign in to access dense procurement catalog, orders, and document vault. Supabase Auth
        wires in Phase 3.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-organza/30 bg-white p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            name="email"
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            required
            name="password"
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
