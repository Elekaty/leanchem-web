import { useMemo } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import {
  HazardIcons,
  ProductBreadcrumbs,
  SpecsTable,
} from '../../components/pdp/PdpParts'
import { ProductSidebar } from '../../components/pdp/ProductSidebar'
import { RelatedProducts } from '../../components/pdp/RelatedProducts'
import { useLiveRegion } from '../../components/LiveRegion'
import { useRfq } from '../../context/RfqContext'
import {
  getProductBySlugAsync,
  getRelatedProducts,
} from '../../lib/chemicalCatalog'

export const Route = createFileRoute('/catalog/$slug')({
  loader: async ({ params }) => {
    const product = await getProductBySlugAsync(params.slug)
    if (!product) throw notFound()
    const related = await getRelatedProducts(product, 3)
    return { product, related }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product
    const title =
      product?.seoTitle ??
      (product
        ? `${product.name} | LeanChem Ethiopia`
        : 'Product | LeanChem')
    const description =
      product?.seoDescription ??
      product?.description ??
      'Industrial chemical product specifications from LeanChem Ethiopia.'
    const site = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://leanchems.com'
    const url = product ? `${site.replace(/\/$/, '')}/catalog/${product.slug}` : `${site}/catalog`

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
  notFoundComponent: ProductNotFound,
  component: ProductDetailPage,
})

function formatProductIdLabel(id: string): string {
  if (id.startsWith('REF-')) return `Ref #${id.replace('REF-', '')}`
  if (/^\d[\d-]*\d$/.test(id)) return `CAS ${id}`
  return id
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center md:px-6">
      <h1 className="text-2xl font-bold text-velvet">Product not found</h1>
      <p className="mt-2 text-sm text-velvet/65">
        That catalog link is missing or the grade was renamed. Browse the live catalog instead.
      </p>
      <Link to="/catalog" className="btn btn-primary mt-6 inline-flex no-underline hover:no-underline">
        Back to catalog
      </Link>
    </div>
  )
}

function ProductDetailPage() {
  const { product, related } = Route.useLoaderData()
  const { addProduct, hasProduct, openDrawer } = useRfq()
  const { announce } = useLiveRegion()
  const inRfq = hasProduct(product.id)

  const onAdd = () => {
    addProduct(product)
    announce(inRfq ? 'Updated in your RFQ' : 'Added to RFQ')
  }

  const specRows = useMemo(() => {
    const base = [
      { key: 'Grade / purity', value: product.purity },
      { key: 'Physical state', value: product.physicalState },
      { key: 'Packaging', value: product.packaging },
      { key: 'MOQ', value: product.moq },
      { key: 'Lead time', value: product.leadTime },
      { key: 'HS chapter', value: product.hsChapter },
    ]
    const extras = product.properties.filter(
      (p) => !base.some((b) => b.key.toLowerCase() === p.key.toLowerCase()),
    )
    return [...base, ...extras]
  }, [product])

  const site = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://leanchems.com'
  const jsonLd = {
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
      url: `${site.replace(/\/$/, '')}/catalog/${product.slug}`,
      seller: { '@type': 'Organization', name: 'LeanChem' },
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-36 md:px-6 lg:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductBreadcrumbs category={product.category} productName={product.name} />

      <div className="grid gap-7 lg:grid-cols-[7fr_3fr] lg:gap-8">
        <section className="min-w-0 space-y-5 md:space-y-6">
          <header>
            <p className="text-sm font-semibold text-lapis">
              {formatProductIdLabel(product.casNumber)}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-velvet md:text-[2.15rem]">
              {product.name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-velvet/65">
              Grade: <span className="text-velvet">{product.purity}</span>
            </p>
            <div className="mt-4">
              <HazardIcons hazards={product.hazards} />
            </div>
          </header>

          <div className="rounded border border-organza/30 bg-white p-4 md:p-6">
            <h2 className="text-base font-bold text-lapis md:text-lg">Technical description</h2>
            <p className="mt-2.5 leading-relaxed text-velvet/70">{product.description}</p>

            <h2 className="mt-6 text-base font-bold text-lapis md:mt-7 md:text-lg">
              Technical specifications
            </h2>
            <SpecsTable rows={specRows} />

            <h2 className="mt-6 text-base font-bold text-lapis md:mt-7 md:text-lg">
              Typical applications
            </h2>
            <p className="mt-2 leading-relaxed text-velvet/70">{product.applications}</p>

            <h2 className="mt-6 text-base font-bold text-lapis md:mt-7 md:text-lg">
              Handling &amp; storage
            </h2>
            <p className="mt-2 leading-relaxed text-velvet/70">{product.handlingNotes}</p>
          </div>

          <RelatedProducts products={related} />
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductSidebar
            product={product}
            inRfq={inRfq}
            onAdd={onAdd}
            onReview={openDrawer}
          />
        </aside>
      </div>

      {/* Mobile sticky Add to RFQ — sits above site mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-[4.25rem] z-30 border-t border-organza/30 bg-white/95 p-3 shadow-[0_-6px_20px_rgba(34,34,53,0.08)] backdrop-blur md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <button
            type="button"
            className="btn btn-primary min-h-12 flex-[1.4] text-base shadow-[0_4px_14px_rgba(30,88,151,0.25)]"
            onClick={onAdd}
          >
            {inRfq ? 'Update RFQ' : 'Add to RFQ'}
          </button>
          {inRfq ? (
            <button
              type="button"
              className="btn btn-secondary min-h-12 flex-1"
              onClick={openDrawer}
            >
              Review
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
