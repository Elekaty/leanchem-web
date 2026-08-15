import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PackageSearch } from 'lucide-react'
import { ParametricCatalogCard } from '../../components/ParametricCatalogCard'
import {
  ParametricCatalogSidebar,
  type ParametricFilters,
} from '../../components/ParametricCatalogSidebar'
import {
  filterParametricCatalog,
  PARAMETRIC_CATALOG_MOCK,
} from '../../data/parametricCatalogMock'

export const Route = createFileRoute('/catalog/')({
  head: () => ({
    meta: [
      { title: 'Chemical Catalog | LeanChem' },
      {
        name: 'description',
        content:
          'Industrial chemical catalog — filter by CAS or name, market, and grade, then add lines to your RFQ cart.',
      },
    ],
  }),
  component: CatalogPage,
})

const INITIAL_FILTERS: ParametricFilters = {
  query: '',
  markets: [],
  grades: [],
}

function CatalogPage() {
  const [filters, setFilters] = useState<ParametricFilters>(INITIAL_FILTERS)
  const catalog = PARAMETRIC_CATALOG_MOCK

  const products = useMemo(
    () =>
      filterParametricCatalog(catalog, {
        query: filters.query,
        markets: filters.markets,
        grades: filters.grades,
      }),
    [catalog, filters],
  )

  const hasActiveFilters =
    Boolean(filters.query.trim()) || filters.markets.length > 0 || filters.grades.length > 0

  return (
    <div className="min-h-[70vh] bg-canvas pb-28 md:pb-12">
      <div className="border-b border-organza/20 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-organza">
            <Link to="/" className="text-lapis no-underline hover:underline">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="font-semibold text-velvet">Catalog</span>
          </nav>

          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-velvet">Chemical Catalog</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-velvet/60 md:text-[0.95rem]">
                Spec-grade industrials with SDS/TDS pathways — filter by CAS, market, or grade, then
                build a multi-line RFQ.
              </p>
            </div>
            <p className="rounded border border-organza/25 bg-canvas px-3 py-2 text-sm font-semibold text-velvet">
              {products.length} of {catalog.length} grades
            </p>
          </header>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(240px,1fr)_minmax(0,3fr)] lg:gap-8">
          <div>
            <ParametricCatalogSidebar
              value={filters}
              onChange={setFilters}
              resultCount={products.length}
              totalCount={catalog.length}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-organza/20 pb-3">
              <p className="text-sm font-bold text-velvet">
                {products.length === 0
                  ? 'No matching chemicals'
                  : `${products.length} result${products.length === 1 ? '' : 's'}`}
                {hasActiveFilters ? (
                  <span className="ml-2 text-xs font-semibold text-organza">· filtered</span>
                ) : null}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-lapis hover:underline"
                  onClick={() => setFilters(INITIAL_FILTERS)}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {products.length === 0 ? (
              <div className="rounded border border-dashed border-organza/40 bg-white px-4 py-14 text-center shadow-[0_1px_2px_rgba(34,34,53,0.04)]">
                <PackageSearch
                  className="mx-auto h-8 w-8 text-organza"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-bold text-velvet">No products match these filters</p>
                <p className="mx-auto mt-1.5 max-w-[36ch] text-sm text-velvet/60">
                  Clear a Market or Grade checkbox, or broaden the CAS / name search.
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-5 px-4 text-xs"
                  onClick={() => setFilters(INITIAL_FILTERS)}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((chemical) => (
                  <ParametricCatalogCard key={chemical.id} chemical={chemical} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
