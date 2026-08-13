import { createFileRoute, Link } from '@tanstack/react-router'
import { INDUSTRIES } from '../../data/marketing'

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
    meta: [{ title: 'Catalog & Markets | LeanChem' }],
  }),
  component: CatalogPage,
})

function CatalogPage() {
  const { q, market } = Route.useSearch()
  const marketLabel = INDUSTRIES.find((i) => i.slug === market)?.title

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
        Browse industrial grades for Ethiopian procurement. Product cards and filters from Phase 2
        will hydrate this grid — search and market deep-links already work.
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
        {['example-chemical', 'sodium-hydroxide-pellets', 'isopropyl-alcohol-hplc'].map(
          (slug) => (
            <article
              key={slug}
              className="flex flex-col rounded-lg border border-organza/35 bg-white p-5"
            >
              <h2 className="text-lg font-bold text-velvet capitalize">
                <Link
                  to="/catalog/$slug"
                  params={{ slug }}
                  className="text-velvet no-underline hover:text-lapis hover:no-underline"
                >
                  {slug.replace(/-/g, ' ')}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-velvet/60">Placeholder card — Phase 2 data.</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Link
                  to="/catalog/$slug"
                  params={{ slug }}
                  className="btn btn-secondary min-h-10 px-3 text-xs no-underline hover:no-underline"
                >
                  View specs
                </Link>
                <Link
                  to="/contact"
                  search={{ product: slug }}
                  className="btn btn-primary min-h-10 px-3 text-xs no-underline hover:no-underline"
                >
                  Request quote
                </Link>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  )
}
