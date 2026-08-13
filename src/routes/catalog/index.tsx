import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/catalog/')({
  head: () => ({
    meta: [{ title: 'Catalog & Markets | LeanChems' }],
  }),
  component: CatalogPage,
})

function CatalogPage() {
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Catalog</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">Catalog & Markets</h1>
      <p className="max-w-2xl text-velvet/70">
        Phase 1 placeholder. Phase 2 will add the product card grid, HS/packaging filters, and
        stock status powered by <code className="text-lapis">products.json</code>.
      </p>
      <Link
        to="/catalog/$slug"
        params={{ slug: 'example-chemical' }}
        className="inline-flex rounded border border-organza/40 bg-white px-4 py-2 text-sm font-semibold text-lapis no-underline hover:border-adamantine hover:no-underline"
      >
        Open example PDP →
      </Link>
    </div>
  )
}
