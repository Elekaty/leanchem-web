import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CatalogRow, CatalogRowSkeleton } from '../../components/CatalogRow'
import { AlertIcon, SearchIcon } from '../../components/Icons'
import { useLiveRegion } from '../../components/LiveRegion'
import {
  QUICK_VIEW_DRAWER_ID,
  QuickViewDrawer,
} from '../../components/QuickViewDrawer'
import { useAuth } from '../../context/AuthContext'
import { useShell, type FacetOption } from '../../context/ShellContext'
import { filterProducts, MOCK_PRODUCTS } from '../../data/mockProducts'
import type { PricingStatus, Product } from '../../types/catalog'

export const Route = createFileRoute('/portal/catalog')({
  head: () => ({
    meta: [{ title: 'Procurement Catalog | LeanChem Portal' }],
  }),
  component: PortalCatalogPage,
})

function countBy(values: string[]): FacetOption[] {
  const map = new Map<string, number>()
  for (const value of values) {
    if (!value) continue
    map.set(value, (map.get(value) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function PortalCatalogPage() {
  const { session } = useAuth()
  const { announce } = useLiveRegion()
  const {
    selectedFamily,
    selectedPurity,
    selectedState,
    setFamilies,
    setPurities,
    setStates,
    setSelectedFamily,
    setSelectedPurity,
    setSelectedState,
  } = useShell()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setProducts(MOCK_PRODUCTS)
      setLoading(false)
    }, 450)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    setFamilies(countBy(products.map((p) => p.category)))
    setPurities(countBy(products.map((p) => p.purity)))
    setStates(countBy(products.map((p) => p.physicalState)))
  }, [products, setFamilies, setPurities, setStates])

  const filtered = useMemo(
    () =>
      filterProducts({
        q: query,
        category: selectedFamily ?? undefined,
        purity: selectedPurity ?? undefined,
        physicalState: selectedState ?? undefined,
      }),
    [query, selectedFamily, selectedPurity, selectedState],
  )

  const openQuickView = (product: Product) => {
    setActiveProductId(product.id)
    setDrawerOpen(true)
  }

  const closeQuickView = () => {
    const id = activeProductId
    setDrawerOpen(false)
    window.setTimeout(() => {
      setActiveProductId(null)
      if (id) triggerRefs.current.get(id)?.focus()
    }, 220)
  }

  const activeListProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) ?? null,
    [products, activeProductId],
  )

  const pricingStatus: PricingStatus =
    session.verificationStatus !== 'verified'
      ? 'Tier1Locked'
      : activeListProduct?.estimatedPrice == null
        ? 'Unavailable'
        : 'Available'

  const isTierVerified = session.verificationStatus === 'verified'

  return (
    <div>
      <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-velvet md:text-3xl">
            Procurement catalog
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-velvet/65">
            High-density list for verified buyers. Select a row for Quick View, SDS access, and
            order requests.
          </p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Search catalog</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-organza" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or CAS"
            className="h-11 w-full rounded border border-organza/40 bg-white py-2 pr-3 pl-10 text-sm outline-none focus:border-adamantine"
          />
        </label>
      </header>

      <section aria-label="Portal catalog results" className="space-y-2">
        {!loading ? (
          <div
            className="mb-1 hidden grid-cols-[64px_7.5rem_minmax(0,1.4fr)_auto_5.5rem_6.5rem] gap-4 px-4 text-[0.68rem] font-semibold tracking-wide text-organza uppercase md:grid"
            aria-hidden="true"
          >
            <span />
            <span>CAS Number</span>
            <span>Chemical Name</span>
            <span>Specs</span>
            <span>MOQ</span>
            <span>Lead Time</span>
          </div>
        ) : null}

        {loading ? (
          <div aria-busy="true" aria-label="Loading catalog" className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CatalogRowSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {!loading && filtered.length === 0 ? (
          <div className="rounded-lg border border-organza/30 bg-white px-6 py-12 text-center">
            <SearchIcon className="mx-auto text-organza" />
            <p className="mt-3 text-sm text-velvet/70">
              No exact matches found for &lsquo;{query || 'current filters'}&rsquo;.
            </p>
            <button
              type="button"
              className="btn btn-secondary mt-4"
              onClick={() => {
                setQuery('')
                setSelectedFamily(null)
                setSelectedPurity(null)
                setSelectedState(null)
              }}
            >
              Clear active filters
            </button>
          </div>
        ) : null}

        {!loading && filtered.length > 0
          ? filtered.map((product) => (
              <CatalogRow
                key={product.id}
                productData={product}
                isTierVerified={isTierVerified}
                onRowClick={openQuickView}
                isExpanded={drawerOpen && activeProductId === product.id}
                drawerId={QUICK_VIEW_DRAWER_ID}
                rowRef={(el) => {
                  if (el) triggerRefs.current.set(product.id, el)
                  else triggerRefs.current.delete(product.id)
                }}
              />
            ))
          : null}
      </section>

      {!session.isLoggedIn ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-error" role="alert">
          <AlertIcon />
          Session required for portal catalog.
        </div>
      ) : null}

      <QuickViewDrawer
        isOpen={drawerOpen}
        product={activeListProduct}
        pricingStatus={
          session.tier === 1 || session.verificationStatus !== 'verified'
            ? pricingStatus
            : pricingStatus
        }
        onClose={closeQuickView}
        onSubmitOrder={async () => {
          if (session.verificationStatus !== 'verified') {
            const msg = 'Order request blocked until verification completes.'
            announce(msg)
            throw new Error(msg)
          }
          await new Promise((r) => setTimeout(r, 400))
          announce('Order request submitted successfully.')
        }}
        onRequestSample={async () => {
          await new Promise((r) => setTimeout(r, 300))
          announce('Sample request submitted.')
        }}
      />
    </div>
  )
}
