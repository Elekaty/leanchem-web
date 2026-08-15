import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { HazardPictogramIcon } from '../../components/Icons'
import { useLiveRegion } from '../../components/LiveRegion'
import { useRfq } from '../../context/RfqContext'
import { CLIENT_LOGOS } from '../../data/marketing'
import { getProductBySlug } from '../../data/mockProducts'

export const Route = createFileRoute('/catalog/$slug')({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug)
    if (!product) throw notFound()
    return { product }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product
    const title =
      product?.seoTitle ??
      (product
        ? `${product.name} | CAS ${product.casNumber} | LeanChem`
        : 'Product | LeanChem')
    const description =
      product?.seoDescription ??
      product?.description ??
      'Industrial chemical product specifications from LeanChem Ethiopia.'
    const url = product ? `https://leanchem.et/catalog/${product.slug}` : 'https://leanchem.et/catalog'

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'product' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:site_name', content: 'LeanChem' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
    }
  },
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { product } = Route.useLoaderData()
  const { addProduct, hasProduct, openDrawer } = useRfq()
  const { announce } = useLiveRegion()
  const inRfq = hasProduct(product.id)
  const trustedSlice = CLIENT_LOGOS.slice(0, 4)

  const onAdd = () => {
    addProduct(product)
    announce(
      inRfq
        ? `${product.name} updated in your RFQ.`
        : `${product.name} added to your RFQ.`,
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.seoDescription ?? product.description,
            sku: product.slug,
            mpn: product.casNumber,
            category: product.category,
            brand: { '@type': 'Brand', name: 'LeanChem' },
            offers: {
              '@type': 'Offer',
              availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
              priceCurrency: 'USD',
              url: `https://leanchem.et/catalog/${product.slug}`,
              seller: { '@type': 'Organization', name: 'LeanChem' },
            },
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2" aria-hidden="true">
          →
        </span>
        <Link to="/catalog" className="text-lapis no-underline hover:underline">
          Catalog
        </Link>
        <span className="mx-2" aria-hidden="true">
          →
        </span>
        <Link
          to="/catalog"
          search={{ q: product.category }}
          className="text-lapis no-underline hover:underline"
        >
          {product.category}
        </Link>
        <span className="mx-2" aria-hidden="true">
          →
        </span>
        <span className="font-semibold text-velvet">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
        <section className="min-w-0 space-y-6">
          <header>
            <p className="text-sm font-semibold text-lapis">CAS {product.casNumber}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-velvet">
              {product.name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-velvet/70">
              Grade / purity: <span className="text-velvet">{product.purity}</span>
            </p>

            <ul className="mt-4 flex flex-wrap gap-3" aria-label="Hazard pictograms">
              {product.hazards.map((h) => (
                <li key={h} className="rounded bg-white p-1.5 shadow-sm ring-1 ring-black/10">
                  <HazardPictogramIcon type={h} width={56} height={56} />
                </li>
              ))}
            </ul>
          </header>

          <div className="rounded-lg border border-organza/35 bg-white p-6">
            <h2 className="text-lg font-bold text-lapis">Technical description</h2>
            <p className="mt-3 leading-relaxed text-velvet/75">{product.description}</p>

            <h2 className="mt-8 text-lg font-bold text-lapis">
              Physical &amp; chemical properties
            </h2>
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
                  className="grid grid-cols-[150px_1fr] gap-3 border-b border-dashed border-organza py-2.5 text-sm last:border-b-0"
                >
                  <dt className="text-velvet/55">{k}</dt>
                  <dd className="m-0 font-semibold text-velvet">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-8 text-lg font-bold text-lapis">Typical applications</h2>
            <p className="mt-2 leading-relaxed text-velvet/75">{product.applications}</p>

            <h2 className="mt-8 text-lg font-bold text-lapis">Handling &amp; storage</h2>
            <p className="mt-2 leading-relaxed text-velvet/75">{product.handlingNotes}</p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-organza/35 bg-white p-6 shadow-[0_1px_3px_rgba(34,34,53,0.05)]">
            <p className="text-xs font-semibold tracking-wide text-organza uppercase">
              Inventory status
            </p>
            <p
              className={`mt-2 text-sm font-bold ${product.inStock ? 'text-success' : 'text-velvet/60'}`}
              role="status"
              aria-label={
                product.inStock
                  ? 'Stock status: In stock, ready for RFQ'
                  : 'Stock status: Made to order'
              }
            >
              {product.inStock ? 'In stock — ready for RFQ' : 'Made to order'}
            </p>
            <p className="mt-1 text-sm text-velvet/60">Lead time: {product.leadTime}</p>

            <h2 className="mt-5 text-sm font-bold text-velvet">Packaging options</h2>
            <ul className="mt-2 space-y-1.5">
              {product.packagingOptions.map((opt) => (
                <li
                  key={opt}
                  className="rounded border border-organza/30 bg-canvas px-3 py-2 text-sm font-semibold text-velvet"
                >
                  {opt}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="btn btn-primary mt-6 w-full min-h-12 text-base"
              onClick={onAdd}
            >
              {inRfq ? 'Update in RFQ' : 'Add to RFQ'}
            </button>
            {inRfq ? (
              <button
                type="button"
                className="btn btn-secondary mt-2 w-full"
                onClick={openDrawer}
              >
                Review RFQ
              </button>
            ) : null}

            <h2 className="mt-6 text-sm font-bold text-velvet">Document vault</h2>
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
              <a
                href={product.coaUrl}
                className="btn btn-ghost min-h-10 border border-organza/35 no-underline hover:no-underline"
              >
                COA sample
              </a>
              <p className="text-xs text-velvet/50">SDS updated {product.sdsUpdatedAt}</p>
            </div>

            <div className="mt-6 border-t border-organza/25 pt-5">
              <p className="text-xs font-semibold tracking-wide text-organza uppercase">
                Trusted in this category
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {trustedSlice.map((name) => (
                  <li
                    key={name}
                    className="rounded border border-organza/25 bg-canvas px-2 py-2 text-center text-[0.65rem] font-bold tracking-wide text-velvet/70 uppercase"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/portal"
              className="btn btn-ghost mt-4 w-full no-underline hover:no-underline"
            >
              Open Client Portal
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
