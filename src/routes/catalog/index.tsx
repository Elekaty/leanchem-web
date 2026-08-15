import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  CatalogFilterBar,
  type CatalogFiltersState,
} from '../../components/CatalogFilterBar'
import { CatalogTypeahead } from '../../components/CatalogTypeahead'
import { ProductCard, ProductCardSkeleton } from '../../components/ProductCard'
import { useCatalogData } from '../../context/CatalogDataContext'
import { INDUSTRIES } from '../../data/marketing'
import type { CatalogSort } from '../../lib/catalogDiscovery'
import {
  discoverProductsFrom,
  getCatalogFacetsFrom,
} from '../../lib/catalogQuery'

type CatalogSearch = {
  q?: string
  market?: string
  hs?: string
  purity?: string
  pack?: string
  stock?: string
  sort?: CatalogSort
}

function csv(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toCsv(values: string[]): string | undefined {
  return values.length ? values.join(',') : undefined
}

const SORTS: CatalogSort[] = ['name_asc', 'name_desc', 'purity_desc', 'stock_first']

export const Route = createFileRoute('/catalog/')({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    market: typeof search.market === 'string' ? search.market : undefined,
    hs: typeof search.hs === 'string' ? search.hs : undefined,
    purity: typeof search.purity === 'string' ? search.purity : undefined,
    pack: typeof search.pack === 'string' ? search.pack : undefined,
    stock: search.stock === '1' || search.stock === 'true' ? '1' : undefined,
    sort:
      typeof search.sort === 'string' && SORTS.includes(search.sort as CatalogSort)
        ? (search.sort as CatalogSort)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Chemical Catalog | LeanChem' },
      {
        name: 'description',
        content:
          'Browse industrial chemical grades for Ethiopian procurement — packaging, stock status, TDS/SDS, and RFQ.',
      },
    ],
  }),
  component: CatalogPage,
})

function CatalogPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { products: allProducts, loading: catalogLoading, source } = useCatalogData()
  const { q, market } = search
  const marketLabel = INDUSTRIES.find((i) => i.slug === market)?.title
  const [queryDraft, setQueryDraft] = useState(q ?? '')

  const facets = useMemo(() => {
    const raw = getCatalogFacetsFrom(allProducts)
    return {
      hsChapters: raw.hsChapters.map((o) => ({
        ...o,
        label: `HS ${o.value}`,
      })),
      purities: raw.purities,
      packagingSizes: raw.packagingSizes,
    }
  }, [allProducts])

  const hsChapters = csv(search.hs)
  const purities = csv(search.purity)
  const packagingSizes = csv(search.pack)
  const inStockOnly = search.stock === '1'
  const sort = search.sort ?? 'name_asc'

  const filters: CatalogFiltersState = {
    hsChapters,
    purities,
    packagingSizes,
    inStockOnly,
    sort,
  }

  useEffect(() => {
    setQueryDraft(q ?? '')
  }, [q])

  const products = useMemo(
    () =>
      discoverProductsFrom(allProducts, {
        q,
        market,
        hsChapters,
        purities,
        packagingSizes,
        inStockOnly,
        sort,
      }),
    [allProducts, q, market, search.hs, search.purity, search.pack, search.stock, search.sort],
  )

  const pushFilters = (next: CatalogFiltersState) => {
    void navigate({
      to: '/catalog',
      search: {
        q: q || undefined,
        market,
        hs: toCsv(next.hsChapters),
        purity: toCsv(next.purities),
        pack: toCsv(next.packagingSizes),
        stock: next.inStockOnly ? '1' : undefined,
        sort: next.sort === 'name_asc' ? undefined : next.sort,
      },
    })
  }

  const onQueryCommit = (nextQ: string) => {
    setQueryDraft(nextQ)
    void navigate({
      to: '/catalog',
      search: (prev) => ({
        ...prev,
        q: nextQ.trim() || undefined,
      }),
    })
  }

  const loading = catalogLoading

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-6 md:pb-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Catalog</span>
        {marketLabel ? (
          <>
            <span className="mx-2">→</span>
            <span className="font-semibold text-velvet">{marketLabel}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-velvet">Chemical Catalog</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-velvet/60 md:text-base">
            Industrial grades for Ethiopian procurement — filter, open specs, and build a multi-line
            RFQ.
            {source === 'supabase' ? (
              <span className="mt-1 block text-xs font-semibold text-velvet/45">
                {allProducts.length} grades available
              </span>
            ) : null}
          </p>
        </div>
        <CatalogTypeahead
          className="w-full max-w-md"
          value={queryDraft}
          onQueryChange={onQueryCommit}
          navigateOnSelect={false}
        />
      </div>

      {(q || market) && (
        <p className="mt-4 rounded border border-organza/30 bg-white px-4 py-3 text-sm text-velvet/70">
          Active search:{' '}
          {q ? <strong className="text-lapis">“{q}”</strong> : null}
          {q && market ? ' · ' : null}
          {market ? <strong className="text-lapis">{marketLabel ?? market}</strong> : null}
        </p>
      )}

      <div className="mt-6">
        <CatalogFilterBar
          facets={facets}
          value={filters}
          onChange={pushFilters}
          resultCount={products.length}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {!loading && products.length === 0 ? (
        <p className="mt-8 rounded-lg border border-organza/30 bg-white px-4 py-8 text-center text-sm text-velvet/65">
          No products match the current filters.
        </p>
      ) : null}
    </div>
  )
}
