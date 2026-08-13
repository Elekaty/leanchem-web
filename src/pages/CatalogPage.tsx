import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { AlertIcon, SearchIcon } from '../components/Icons'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard/ProductCard'
import { QuickViewDrawer } from '../components/QuickViewDrawer/QuickViewDrawer'
import { useAuth } from '../context/AuthContext'
import { ApiClientError } from '../api/client'
import { fetchProducts } from '../api/leanchem'
import { HS_CHAPTERS, INDUSTRIES, PACKAGING_OPTIONS } from '../data/marketing'
import { mapCatalogItem } from '../data/mapCatalogItem'
import { MOCK_PRODUCTS } from '../data/mockProducts'
import type { Product } from '../types'
import './CatalogPage.css'

type CatalogState = 'loading' | 'ready' | 'error' | 'empty'

export function CatalogPage() {
  const { session } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const market = searchParams.get('market')
  const marketLabel = INDUSTRIES.find((i) => i.slug === market)?.title

  const [query, setQuery] = useState(initialQ)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ)
  const [hsSelected, setHsSelected] = useState<string[]>([])
  const [packSelected, setPackSelected] = useState<string[]>([])
  const [state, setState] = useState<CatalogState>('loading')
  const [products, setProducts] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState(
    'Unable to retrieve catalog data. Please check your connection.',
  )
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (debouncedQuery) next.set('q', debouncedQuery)
    else next.delete('q')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

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
      if (mapped.length === 0) {
        const fallback = filterMock(MOCK_PRODUCTS, debouncedQuery)
        setProducts(fallback)
        setState(fallback.length ? 'ready' : 'empty')
        return
      }
      setProducts(mapped)
      setState('ready')
    } catch (err) {
      const fallback = filterMock(MOCK_PRODUCTS, debouncedQuery)
      if (fallback.length) {
        setProducts(fallback)
        setState('ready')
        return
      }
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (hsSelected.length && !hsSelected.includes(p.hsChapter)) return false
      if (packSelected.length && !packSelected.some((pack) => p.packaging.includes(pack.replace(/^\d+\s*/, '').split(' ')[0]) || p.packaging.includes(pack))) {
        // Match loosely on packaging tokens
        const ok = packSelected.some((pack) =>
          p.packaging.toLowerCase().includes(pack.toLowerCase().split(' ').slice(-1)[0] ?? ''),
        )
        if (!ok) return false
      }
      return true
    })
  }, [products, hsSelected, packSelected])

  const viewState: CatalogState =
    state === 'ready' && filtered.length === 0 ? 'empty' : state

  const openQuickView = (product: Product) => {
    setActiveProductId(product.id)
    setDrawerOpen(true)
  }

  const closeQuickView = () => {
    setDrawerOpen(false)
    window.setTimeout(() => setActiveProductId(null), 220)
  }

  const activeListProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) ?? null,
    [products, activeProductId],
  )

  const toggleValue = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  return (
    <div className="catalog-page catalog-page--site">
      <div className="catalog-page__wrap">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Catalog', to: '/catalog' },
            ...(marketLabel ? [{ label: marketLabel }] : []),
          ]}
        />

        <header className="catalog-page__header">
          <div>
            <h1 className="page-title">Chemical Catalog</h1>
            <p className="page-subtitle">
              Browse industrial grades for Ethiopian procurement — expand specs, open TDS/SDS, and
              send an RFQ without leaving the buying flow.
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
                placeholder="Search by product name, grade, or CAS number…"
              />
            </label>
          </div>
        </header>

        <div className="catalog-layout">
          <aside className="catalog-filters" aria-label="Catalog filters">
            <p className="catalog-filters__label">HS chapter</p>
            <ul className="catalog-filters__list">
              {HS_CHAPTERS.map((hs) => (
                <li key={hs.code}>
                  <label>
                    <input
                      type="checkbox"
                      checked={hsSelected.includes(hs.code)}
                      onChange={() => toggleValue(hsSelected, hs.code, setHsSelected)}
                    />
                    {hs.label}
                  </label>
                </li>
              ))}
            </ul>
            <p className="catalog-filters__label">Packaging size</p>
            <ul className="catalog-filters__list">
              {PACKAGING_OPTIONS.map((pack) => (
                <li key={pack}>
                  <label>
                    <input
                      type="checkbox"
                      checked={packSelected.includes(pack)}
                      onChange={() => toggleValue(packSelected, pack, setPackSelected)}
                    />
                    {pack}
                  </label>
                </li>
              ))}
            </ul>
            {hsSelected.length || packSelected.length ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setHsSelected([])
                  setPackSelected([])
                }}
              >
                Clear filters
              </button>
            ) : null}
          </aside>

          <section className="catalog-grid-wrap" aria-label="Catalog results">
            {viewState === 'loading' ? (
              <div className="catalog-grid" aria-busy="true" aria-label="Loading catalog">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
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
                      setHsSelected([])
                      setPackSelected([])
                    }}
                  >
                    Clear active filters
                  </button>
                  <Link to="/contact" className="btn btn-primary">
                    Request Custom Sourcing
                  </Link>
                </div>
              </div>
            ) : null}

            {viewState === 'ready' ? (
              <div className="catalog-grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={openQuickView} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div className="catalog-sticky-rfq" role="region" aria-label="Request quote">
        <Link to="/contact" className="btn btn-primary">
          Request Quote
        </Link>
      </div>

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

function filterMock(products: Product[], query: string) {
  if (!query) return products
  const q = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.casNumber.toLowerCase().includes(q) ||
      p.purity.toLowerCase().includes(q),
  )
}
