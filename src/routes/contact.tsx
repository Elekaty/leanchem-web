import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveRegion } from '../components/LiveRegion'
import { generateRfqReference, useRfq } from '../context/RfqContext'
import { useCatalogData } from '../context/CatalogDataContext'
import { getProductBySlugAsync } from '../lib/chemicalCatalog'
import type { RfqLineItem } from '../types/catalog'

type ContactSearch = {
  product?: string
  market?: string
  intent?: string
  cas?: string
  fromRfq?: string
}

export const Route = createFileRoute('/contact')({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    product: typeof search.product === 'string' ? search.product : undefined,
    market: typeof search.market === 'string' ? search.market : undefined,
    intent: typeof search.intent === 'string' ? search.intent : undefined,
    cas: typeof search.cas === 'string' ? search.cas : undefined,
    fromRfq: typeof search.fromRfq === 'string' ? search.fromRfq : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Request Quote | LeanChem' },
      {
        name: 'description',
        content:
          'Multi-product RFQ for LeanChem — company identity, line items, volume, delivery date, and location.',
      },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { product, market, intent } = Route.useSearch()
  const { announce } = useLiveRegion()
  const { items, addProduct, updateItem, removeItem, clear } = useRfq()
  const { products: catalogProducts } = useCatalogData()
  const title = intent === 'sample' ? 'Request a sample' : 'Submit multi-product RFQ'

  const [lines, setLines] = useState<RfqLineItem[]>([])
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  // Seed from RFQ cart; optionally add deep-linked single product.
  useEffect(() => {
    setLines(items)
  }, [items])

  useEffect(() => {
    if (!product) return
    let cancelled = false
    ;(async () => {
      const p = await getProductBySlugAsync(product)
      if (cancelled || !p) return
      if (!items.some((i) => i.productId === p.id)) {
        addProduct(p, { openDrawer: false })
      }
    })()
    return () => {
      cancelled = true
    }
    // Intentionally only when deep-link product changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const lineCount = lines.length

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (lineCount === 0) {
      announce('Add at least one product before submitting your RFQ.')
      return
    }
    const ref = generateRfqReference()
    setSubmittedRef(ref)
    clear()
    announce(`RFQ ${ref} submitted. Our commercial team will respond within one business day.`)
  }

  const addFromCatalog = (slug: string) => {
    const p = catalogProducts.find((x) => x.slug === slug)
    if (p) addProduct(p, { openDrawer: false })
  }

  const emptyHint = useMemo(
    () =>
      lineCount === 0
        ? 'Your RFQ has no line items yet. Search below or return to the catalog.'
        : null,
    [lineCount],
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Contact</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">{title}</h1>
      <p className="mt-2 text-velvet/65">
        Structured multi-line RFQ — company identity, products, volumes, target delivery, and
        location.
      </p>

      {submittedRef ? (
        <div
          className="mt-8 rounded-lg border border-success/40 bg-success/5 p-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-semibold tracking-wide text-success uppercase">
            RFQ received
          </p>
          <p className="mt-2 text-2xl font-bold text-velvet">{submittedRef}</p>
          <p className="mt-3 text-sm leading-relaxed text-velvet/70">
            Expect a commercial response within <strong>1 business day</strong> with packaging,
            corridor options, and next steps. Keep this reference for follow-up.
          </p>
          <div className="mt-6 rounded-lg border border-organza/30 bg-white p-4">
            <p className="text-sm font-bold text-lapis">Need repeat orders &amp; documents?</p>
            <p className="mt-1 text-sm text-velvet/65">
              Client Portal unlocks order tracking, SDS vaults, and verified pricing for your
              company.
            </p>
            <Link
              to="/portal"
              className="btn btn-primary mt-3 no-underline hover:no-underline"
            >
              Open Client Portal
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/catalog"
              className="btn btn-secondary no-underline hover:no-underline"
            >
              Return to catalog
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setSubmittedRef(null)}
            >
              Submit another RFQ
            </button>
          </div>
        </div>
      ) : (
        <form
          className="mt-8 space-y-6 rounded-lg border border-organza/30 bg-white p-6"
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
            <label className="block text-sm font-semibold">
              Phone (optional)
              <input
                name="phone"
                type="tel"
                className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-lapis">
              Line items ({lineCount})
            </legend>
            {emptyHint ? (
              <p className="rounded border border-dashed border-organza/40 bg-canvas px-3 py-3 text-sm text-velvet/65">
                {emptyHint}
              </p>
            ) : null}

            <ul className="space-y-3">
              {lines.map((item) => (
                <li
                  key={item.productId}
                  className="rounded-lg border border-organza/30 bg-canvas/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-velvet">{item.name}</p>
                      <p className="text-xs font-semibold text-lapis">CAS {item.casNumber}</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-error hover:underline"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-velvet/70">
                      Packaging
                      <input
                        value={item.packaging}
                        onChange={(e) =>
                          updateItem(item.productId, { packaging: e.target.value })
                        }
                        className="mt-1 w-full rounded border border-organza/40 bg-white px-2 py-1.5 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-velvet/70">
                      Quantity / volume
                      <input
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.productId, { quantity: e.target.value })
                        }
                        className="mt-1 w-full rounded border border-organza/40 bg-white px-2 py-1.5 text-sm font-normal"
                      />
                    </label>
                  </div>
                  <label className="mt-2 block text-xs font-semibold text-velvet/70">
                    Notes
                    <textarea
                      value={item.notes}
                      onChange={(e) =>
                        updateItem(item.productId, { notes: e.target.value })
                      }
                      rows={2}
                      className="mt-1 w-full rounded border border-organza/40 bg-white px-2 py-1.5 text-sm font-normal"
                    />
                  </label>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border border-organza/30 bg-white p-3">
              <label className="block text-xs font-semibold text-velvet/60">
                Add another product
                <select
                  className="mt-2 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 text-sm font-normal text-velvet"
                  defaultValue=""
                  onChange={(e) => {
                    const slug = e.target.value
                    if (slug) {
                      addFromCatalog(slug)
                      e.target.value = ''
                    }
                  }}
                >
                  <option value="" disabled>
                    Select a grade to add…
                  </option>
                  {catalogProducts
                    .filter((p) => !lines.some((l) => l.productId === p.id))
                    .slice(0, 80)
                    .map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.casNumber})
                    </option>
                  ))}
                </select>
              </label>
              <Link
                to="/catalog"
                className="mt-2 inline-block text-xs font-semibold text-adamantine no-underline hover:underline"
              >
                Or browse full catalog →
              </Link>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
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
              Delivery terms
              <select
                name="deliveryTerms"
                className="mt-1 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 font-normal"
                defaultValue="CIF Djibouti"
              >
                <option>CIF Djibouti</option>
                <option>DAP Addis Ababa</option>
                <option>EXW supplier</option>
                <option>Other / discuss</option>
              </select>
            </label>
          </div>

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

          <button type="submit" className="btn btn-primary" disabled={lineCount === 0}>
            Submit RFQ
          </button>
        </form>
      )}
    </div>
  )
}
