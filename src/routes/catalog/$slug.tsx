import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/catalog/$slug')({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug} Supplier in Ethiopia | LeanChems`,
      },
    ],
  }),
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { slug } = Route.useParams()

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <Link to="/catalog" className="text-lapis">
          Catalog
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">{slug}</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">{slug}</h1>
      <p className="max-w-2xl text-velvet/70">
        Phase 1 PDP scaffold. Specs sidebar, grade list, TDS/SDS links, and RFQ triggers land in
        Phase 2.
      </p>
      <Link
        to="/contact"
        search={{ product: slug }}
        className="inline-flex rounded bg-lapis px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-lapis/90 hover:no-underline"
      >
        Request Quote
      </Link>
    </div>
  )
}
