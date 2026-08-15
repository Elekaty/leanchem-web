import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
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
          'Parametric catalog — filter by CAS or name, market, and grade, then add chemicals to your RFQ cart.',
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-6 md:pb-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Catalog</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-velvet">Chemical Catalog</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-velvet/60 md:text-base">
          Filter by CAS or name, market, and grade — then add lines to the global RFQ cart.
        </p>
      </header>

      {/* Two-column: ~25% sticky filters / ~75% results */}
      <div className="grid gap-6 lg:grid-cols-[minmax(240px,1fr)_minmax(0,3fr)]">
        <div>
          <ParametricCatalogSidebar
            value={filters}
            onChange={setFilters}
            resultCount={products.length}
            totalCount={catalog.length}
          />
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-velvet">
              {products.length === 0
                ? 'No matching chemicals'
                : `${products.length} result${products.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded border border-dashed border-organza/40 bg-white px-4 py-12 text-center">
              <p className="text-sm font-semibold text-velvet">No products match these filters</p>
              <p className="mx-auto mt-1.5 max-w-[36ch] text-sm text-velvet/60">
                Clear a Market or Grade checkbox, or broaden the CAS / name search.
              </p>
              <button
                type="button"
                className="btn btn-secondary mt-4"
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
  )
}
