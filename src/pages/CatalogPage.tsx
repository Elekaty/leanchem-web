import { useEffect, useMemo, useRef, useState } from 'react'
import { CatalogRow, CatalogRowSkeleton } from '../components/CatalogRow/CatalogRow'
import {
  QUICK_VIEW_DRAWER_ID,
  QuickViewDrawer,
} from '../components/QuickViewDrawer/QuickViewDrawer'
import { AlertIcon, SearchIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useShell, type FacetOption } from '../context/ShellContext'
import { ApiClientError } from '../api/client'
import { fetchProducts } from '../api/leanchem'
import type { HazardPictogram, Product } from '../types'
import './CatalogPage.css'

type CatalogState = 'loading' | 'ready' | 'error' | 'empty'

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

function mapCatalogItem(item: {
  id: string
  cas_number: string
  name: string
  purity_grade: string
  moq: number
  moq_unit: string
  lead_time_days?: number
  estimated_price?: number | null
  physical_state?: string
  hazard?: string
  category?: string
}): Product {
  const physicalState = item.physical_state ?? '—'
  return {
    id: item.id,
    name: item.name,
    casNumber: item.cas_number,
    purity: item.purity_grade,
    moq: `${item.moq} ${item.moq_unit}`,
    physicalState,
    packaging: '—',
    leadTime: item.lead_time_days != null ? `${item.lead_time_days} business days` : '—',
    estimatedPrice: typeof item.estimated_price === 'number' ? item.estimated_price : null,
    hazard: (item.hazard as HazardPictogram) ?? 'irritant',
    sdsUrl: '#',
    sdsUpdatedAt: '—',
    category: item.category ?? (physicalState.toLowerCase().includes('solid') ? 'Inorganics' : 'Solvents'),
  }
}

export function CatalogPage() {
  const { session } = useAuth()
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
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [state, setState] = useState<CatalogState>('loading')
  const [products, setProducts] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState(
    'Unable to retrieve catalog data. Please check your connection.',
  )
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(t)
  }, [query])

  const loadCatalog = async () => {
    setState('loading')
    try {
      const data = await fetchProducts({
        search: debouncedQuery || undefined,
        page: 1,
        limit: 50,
        sort: 'name_asc',
      })
      const mapped = data.items.map(mapCatalogItem)
      setProducts(mapped)
      setState(mapped.length === 0 ? 'empty' : 'ready')
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to retrieve catalog data. Please check your connection.'
      setErrorMessage(message)
      setProducts([])
      setState('error')
    }
  }

  useEffect(() => {
    void loadCatalog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, session.tier, session.isLoggedIn])

  useEffect(() => {
    setFamilies(countBy(products.map((p) => p.category)))
    setPurities(countBy(products.map((p) => p.purity)))
    setStates(countBy(products.map((p) => p.physicalState)))
  }, [products, setFamilies, setPurities, setStates])

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (selectedFamily && p.category !== selectedFamily) return false
        if (selectedPurity && p.purity !== selectedPurity) return false
        if (selectedState && p.physicalState !== selectedState) return false
        return true
      }),
    [products, selectedFamily, selectedPurity, selectedState],
  )

  const viewState: CatalogState =
    state === 'ready' && filtered.length === 0 ? 'empty' : state

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

  const isTierVerified = session.verificationStatus === 'verified'
  const activeListProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) ?? null,
    [products, activeProductId],
  )

  return (
    <div className="catalog-page">
      <header className="catalog-page__header">
        <div>
          <h1 className="page-title">Chemical Catalog</h1>
          <p className="page-subtitle">
            High-density procurement list for industrial sourcing. Select a row for Quick View
            details, SDS access, and order requests.
          </p>
        </div>
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <span className="sr-only">Search catalog</span>
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or CAS"
            />
          </label>
        </div>
      </header>

      <section className="catalog-list" aria-label="Catalog results">
        {viewState === 'loading' ? (
          <div aria-busy="true" aria-label="Loading catalog">
            <div className="catalog-list-head" aria-hidden="true">
              <span />
              <span>CAS Number</span>
              <span>Chemical Name</span>
              <span>Specs</span>
              <span>MOQ</span>
              <span>Lead Time</span>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <CatalogRowSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {viewState === 'error' ? (
          <div className="catalog-state">
            <AlertIcon className="catalog-state__icon catalog-state__icon--alert" />
            <p>{errorMessage}</p>
            <button type="button" className="btn btn-primary" onClick={() => void loadCatalog()}>
              Retry Connection
            </button>
          </div>
        ) : null}

        {viewState === 'empty' ? (
          <div className="catalog-state">
            <SearchIcon className="catalog-state__icon" />
            <p>No exact matches found for &lsquo;{query || 'current filters'}&rsquo;.</p>
            <div className="catalog-state__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setQuery('')
                  setSelectedFamily(null)
                  setSelectedPurity(null)
                  setSelectedState(null)
                }}
              >
                Clear active filters
              </button>
              <button type="button" className="btn btn-primary">
                Request Custom Sourcing
              </button>
            </div>
          </div>
        ) : null}

        {viewState === 'ready' ? (
          <>
            <div className="catalog-list-head" aria-hidden="true">
              <span />
              <span>CAS Number</span>
              <span>Chemical Name</span>
              <span>Specs</span>
              <span>MOQ</span>
              <span>Lead Time</span>
            </div>
            {filtered.map((product) => (
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
            ))}
          </>
        ) : null}
      </section>

      <QuickViewDrawer
        isOpen={drawerOpen}
        productId={activeProductId}
        listProduct={activeListProduct}
        userTier={session.tier}
        onClose={closeQuickView}
      />
    </div>
  )
}
