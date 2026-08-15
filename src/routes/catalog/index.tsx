import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ProductCard, ProductCardSkeleton } from '../../components/ProductCard'
import { INDUSTRIES } from '../../data/marketing'
import { filterProducts } from '../../data/mockProducts'

type CatalogSearch = {
  q?: string
  market?: string
}

export const Route = createFileRoute('/catalog/')({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    market: typeof search.market === 'string' ? search.market : undefined,
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
  const { q, market } = Route.useSearch()
  const marketLabel = INDUSTRIES.find((i) => i.slug === market)?.title
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 400)
    return () => window.clearTimeout(t)
  }, [q, market])

  const products = useMemo(() => filterProducts({ q, market }), [q, market])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
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
      <h1 className="text-3xl font-bold tracking-tight text-velvet">Chemical Catalog</h1>
      <p className="mt-2 max-w-2xl text-velvet/65">
        Discrete product cards with hazard identity, packaging status, and direct quote or TDS
        pathways.
      </p>
      {(q || market) && (
        <p className="mt-4 rounded border border-organza/30 bg-white px-4 py-3 text-sm text-velvet/70">
          Active filters:{' '}
          {q ? <strong className="text-lapis">search “{q}”</strong> : null}
          {q && market ? ' · ' : null}
          {market ? <strong className="text-lapis">{marketLabel ?? market}</strong> : null}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
