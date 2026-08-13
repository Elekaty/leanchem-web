import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/')({
  head: () => ({
    meta: [{ title: 'Client Portal | LeanChems' }],
  }),
  component: PortalPage,
})

function PortalPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Portal</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">Client Portal</h1>
      <p className="text-velvet/70">
        Phase 1 login/dashboard shell. Phase 3 wires Supabase Auth and{' '}
        <code className="text-lapis">client_orders</code>.
      </p>
      <form
        className="space-y-4 rounded-lg border border-organza/30 bg-white p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2 font-normal"
            name="email"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            required
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2 font-normal"
            name="password"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-lapis px-4 py-2 text-sm font-semibold text-white"
        >
          Sign in (Phase 3)
        </button>
      </form>
    </div>
  )
}
