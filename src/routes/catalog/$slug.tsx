import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/catalog/$slug')({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug.replace(/-/g, ' ')} Supplier in Ethiopia | LeanChem`,
      },
    ],
  }),
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { slug } = Route.useParams()
  const name = slug.replace(/-/g, ' ')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <Link to="/catalog" className="text-lapis no-underline hover:underline">
          Catalog
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold capitalize text-velvet">{name}</span>
      </nav>

      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm text-velvet/55">CAS —</p>
          <h1 className="mt-1 text-3xl font-bold capitalize tracking-tight text-velvet">{name}</h1>
          <p className="mt-3 max-w-2xl text-velvet/65">
            Indexable product page for procurement review. Specs, grades, packaging, and document
            packs hydrate in Phase 2 from catalog data.
          </p>
        </div>
        <span className="shrink-0 rounded bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          In stock
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg border border-organza/35 bg-white p-6">
          <h2 className="text-lg font-bold text-lapis">Specifications</h2>
          <dl className="mt-4 divide-y divide-dashed divide-organza/35">
            {[
              ['Grade / purity', '—'],
              ['Physical state', '—'],
              ['Packaging', '—'],
              ['MOQ', '—'],
              ['HS chapter', '—'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-sm">
                <dt className="text-velvet/55">{k}</dt>
                <dd className="m-0 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-lg font-bold text-lapis">Documentation</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="#sds" className="btn btn-secondary min-h-10 no-underline hover:no-underline">
              Download SDS
            </a>
            <a href="#tds" className="btn btn-secondary min-h-10 no-underline hover:no-underline">
              Download TDS
            </a>
          </div>
        </section>

        <aside className="rounded-lg border border-organza/35 bg-white p-6">
          <p className="text-sm leading-relaxed text-velvet/65">
            Public RFQs use the contact route. Instant portal ordering stays in Client Portal.
          </p>
          <Link
            to="/contact"
            search={{ product: slug }}
            className="btn btn-primary mt-4 w-full no-underline hover:no-underline"
          >
            Request quote
          </Link>
          <Link
            to="/portal"
            className="btn btn-secondary mt-2 w-full no-underline hover:no-underline"
          >
            Open Client Portal
          </Link>
        </aside>
      </div>
    </div>
  )
}
