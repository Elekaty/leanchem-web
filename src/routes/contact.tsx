import { createFileRoute, Link } from '@tanstack/react-router'

type ContactSearch = {
  product?: string
}

export const Route = createFileRoute('/contact')({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    product: typeof search.product === 'string' ? search.product : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Request Quote | LeanChems' }],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { product } = Route.useSearch()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Contact</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">B2B Request for Quote</h1>
      <p className="text-velvet/70">
        Phase 1 form shell. Phase 3 will insert submissions into Supabase{' '}
        <code className="text-lapis">contact_submissions</code>.
      </p>
      <form
        className="space-y-4 rounded-lg border border-organza/30 bg-white p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block text-sm font-semibold">
          Company
          <input
            required
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2 font-normal"
            name="company"
          />
        </label>
        <label className="block text-sm font-semibold">
          Product
          <input
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2 font-normal"
            name="product"
            defaultValue={product ?? ''}
          />
        </label>
        <label className="block text-sm font-semibold">
          Volume
          <input
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2 font-normal"
            name="volume"
            placeholder="e.g. 4 × 200 L drums / month"
          />
        </label>
        <label className="block text-sm font-semibold">
          Delivery terms
          <select
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2 font-normal"
            name="deliveryTerms"
            defaultValue="CIF Djibouti"
          >
            <option>CIF Djibouti</option>
            <option>DAP Addis Ababa</option>
            <option>Ex Works</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded bg-lapis px-4 py-2 text-sm font-semibold text-white"
        >
          Submit RFQ (Phase 3 wiring)
        </button>
      </form>
    </div>
  )
}
