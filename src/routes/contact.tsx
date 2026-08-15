import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveRegion } from '../components/LiveRegion'
import { MOCK_PRODUCTS } from '../data/mockProducts'

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
    meta: [
      { title: 'Request Quote | LeanChem' },
      {
        name: 'description',
        content:
          'Structured RFQ for LeanChem — company identity, product, volume, delivery date, and location.',
      },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { product, market, intent } = Route.useSearch()
  const { announce } = useLiveRegion()
  const title = intent === 'sample' ? 'Request a sample' : 'Request a quote'
  const initialSlug = useMemo(() => {
    if (product && MOCK_PRODUCTS.some((p) => p.slug === product)) return product
    return MOCK_PRODUCTS[0]?.slug ?? ''
  }, [product])
  const [selectedProduct, setSelectedProduct] = useState(initialSlug)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setSelectedProduct(initialSlug)
  }, [initialSlug])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    announce('RFQ submitted successfully. Our commercial team will respond shortly.')
  }

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
        Structured RFQ — company identity, product, estimated volume, target delivery date, and
        delivery location.
      </p>

      {submitted ? (
        <div
          className="mt-8 rounded-lg border border-success/40 bg-success/5 p-6"
          role="status"
          aria-live="polite"
        >
          <p className="font-bold text-success">RFQ received</p>
          <p className="mt-2 text-sm text-velvet/70">
            We will confirm packaging and corridor options for your selected grade.
          </p>
          <Link
            to="/catalog"
            className="btn btn-secondary mt-4 no-underline hover:no-underline"
          >
            Return to catalog
          </Link>
        </div>
      ) : (
        <form
          className="mt-8 space-y-4 rounded-lg border border-organza/30 bg-white p-6"
          onSubmit={onSubmit}
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-lapis">Company identity</legend>
            <label className="block text-sm font-semibold">
              Company name
              <input
                required
                name="company"
                className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Contact name
                <input
                  required
                  name="contactName"
                  className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                Work email
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
                />
              </label>
            </div>
          </fieldset>

          <label className="block text-sm font-semibold">
            Product
            <select
              name="product"
              required
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
            >
              {MOCK_PRODUCTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} (CAS {p.casNumber})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Estimated volume
            <input
              required
              name="volume"
              placeholder="e.g. 4 × 200 L drums / month"
              className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
            />
          </label>

          <label className="block text-sm font-semibold">
            Target delivery date
            <input
              required
              type="date"
              name="deliveryDate"
              className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
            />
          </label>

          <label className="block text-sm font-semibold">
            Delivery location
            <input
              required
              name="deliveryLocation"
              placeholder="e.g. Bole Lemi Industrial Park, Addis Ababa"
              className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
            />
          </label>

          {market ? <input type="hidden" name="market" value={market} /> : null}

          <button type="submit" className="btn btn-primary">
            Submit RFQ
          </button>
        </form>
      )}
    </div>
  )
}
