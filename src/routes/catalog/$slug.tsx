import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { HazardPictogramIcon } from '../../components/Icons'
import { getProductBySlug } from '../../data/mockProducts'

export const Route = createFileRoute('/catalog/$slug')({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug)
    if (!product) throw notFound()
    return { product }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product
    const title = product
      ? `${product.name} | CAS ${product.casNumber} | LeanChem`
      : 'Product | LeanChem'
    const description =
      product?.seoDescription ??
      product?.description ??
      'Industrial chemical product specifications from LeanChem Ethiopia.'
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    }
  },
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { product } = Route.useLoaderData()

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
        <span className="font-semibold text-velvet">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
        <section className="min-w-0">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-lapis">CAS {product.casNumber}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-velvet">{product.name}</h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-velvet/65">{product.description}</p>
            </div>
            <HazardPictogramIcon type={product.hazard} width={48} height={48} />
          </header>

          <div className="rounded-lg border border-organza/35 bg-white p-6">
            <h2 className="text-lg font-bold text-lapis">Technical specifications</h2>
            <dl className="mt-4">
              {[
                ['Grade / purity', product.purity],
                ['Physical state', product.physicalState],
                ['Packaging', product.packaging],
                ['MOQ', product.moq],
                ['Lead time', product.leadTime],
                ['HS chapter', product.hsChapter],
                ...product.properties.map((p) => [p.key, p.value] as [string, string]),
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[140px_1fr] gap-3 border-b border-dashed border-organza py-2.5 text-sm last:border-b-0"
                >
                  <dt className="text-velvet/55">{k}</dt>
                  <dd className="m-0 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-8 text-lg font-bold text-lapis">Applications</h2>
            <p className="mt-2 leading-relaxed text-velvet/70">{product.applications}</p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-organza/35 bg-white p-6 shadow-[0_1px_3px_rgba(34,34,53,0.05)]">
            <p className="text-xs font-semibold tracking-wide text-organza uppercase">
              Inventory status
            </p>
            <p
              className={`mt-2 text-sm font-bold ${product.inStock ? 'text-success' : 'text-velvet/60'}`}
            >
              {product.inStock ? 'In stock — ready for RFQ' : 'Made to order'}
            </p>
            <p className="mt-1 text-sm text-velvet/60">Lead time: {product.leadTime}</p>

            <h2 className="mt-6 text-sm font-bold text-velvet">Document download vault</h2>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={product.tdsUrl}
                className="btn btn-secondary min-h-10 no-underline hover:no-underline"
              >
                Download TDS
              </a>
              <a
                href={product.sdsUrl}
                className="btn btn-secondary min-h-10 no-underline hover:no-underline"
              >
                Download SDS
              </a>
              <p className="text-xs text-velvet/50">SDS updated {product.sdsUpdatedAt}</p>
            </div>

            <Link
              to="/contact"
              search={{ product: product.slug }}
              className="btn btn-primary mt-6 w-full min-h-12 text-base no-underline hover:no-underline"
            >
              Request Custom Quote
            </Link>
            <Link
              to="/portal"
              className="btn btn-ghost mt-2 w-full no-underline hover:no-underline"
            >
              Open Client Portal
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
