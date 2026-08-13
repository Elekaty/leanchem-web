import { createFileRoute, Link } from '@tanstack/react-router'

type ContactSearch = {
  product?: string
  market?: string
  intent?: string
  cas?: string
}

export const Route = createFileRoute('/contact')({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    product: typeof search.product === 'string' ? search.product : undefined,
    market: typeof search.market === 'string' ? search.market : undefined,
    intent: typeof search.intent === 'string' ? search.intent : undefined,
    cas: typeof search.cas === 'string' ? search.cas : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Request Quote | LeanChem' }],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { product, market, intent, cas } = Route.useSearch()
  const title = intent === 'sample' ? 'Request a sample' : 'Request a quote'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Contact</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">{title}</h1>
      <p className="mt-2 text-velvet/65">
        Public RFQ route — company, product, volume, and delivery terms. Supabase insert wires in
        Phase 3.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-organza/30 bg-white p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block text-sm font-semibold">
          Company
          <input
            required
            name="company"
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Product
            <input
              name="product"
              defaultValue={product ?? ''}
              className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold">
            CAS
            <input
              name="cas"
              defaultValue={cas ?? ''}
              className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
            />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Volume
          <input
            name="volume"
            placeholder="e.g. 4 × 200 L drums / month"
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
          />
        </label>
        <label className="block text-sm font-semibold">
          Delivery terms
          <select
            name="deliveryTerms"
            defaultValue="CIF Djibouti"
            className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
          >
            <option>CIF Djibouti</option>
            <option>DAP Addis Ababa</option>
            <option>Ex Works</option>
          </select>
        </label>
        {market ? (
          <input type="hidden" name="market" value={market} />
        ) : null}
        <button type="submit" className="btn btn-primary">
          Submit RFQ
        </button>
      </form>
    </div>
  )
}
