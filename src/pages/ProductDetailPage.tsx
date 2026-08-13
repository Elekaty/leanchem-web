import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiClientError } from '../api/client'
import { createOrder, fetchProduct, fetchProducts, requestSample, type ProductDetail } from '../api/leanchem'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { PricingBlock } from '../components/PricingBlock/PricingBlock'
import { useAuth } from '../context/AuthContext'
import { mapCatalogItem } from '../data/mapCatalogItem'
import { MOCK_PRODUCTS } from '../data/mockProducts'
import type { PricingStatus, Product } from '../types'
import { productSlug } from '../utils/slug'
import './ProductDetailPage.css'

function resolvePricingStatus(detail: ProductDetail | null, tier: 1 | 2 | 3): PricingStatus {
  if (tier === 1) return 'Tier1Locked'
  const price = detail?.pricing?.estimated_price
  if (price == null) return 'Unavailable'
  return 'Available'
}

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { session, login } = useAuth()
  const [listProduct, setListProduct] = useState<Product | null>(null)
  const [detail, setDetail] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setSubmitError(null)
      try {
        const data = await fetchProducts({ page: 1, limit: 100, sort: 'name_asc' })
        const mapped = data.items.map(mapCatalogItem)
        const found =
          mapped.find((p) => p.slug === slug || p.id === slug) ??
          MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) ??
          null
        if (cancelled) return
        setListProduct(found)
        if (found) {
          try {
            const d = await fetchProduct(found.id)
            if (!cancelled) setDetail(d)
          } catch {
            if (!cancelled) setDetail(null)
          }
        }
      } catch {
        const found = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) ?? null
        if (!cancelled) {
          setListProduct(found)
          setDetail(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug, session.tier, session.isLoggedIn])

  const displayName = detail?.name ?? listProduct?.name ?? 'Product'
  const cas = detail?.cas_number ?? listProduct?.casNumber ?? '—'
  const pricingStatus = resolvePricingStatus(detail, session.tier)
  const price = detail?.pricing?.estimated_price ?? listProduct?.estimatedPrice ?? null

  const jsonLd = useMemo(() => {
    if (!listProduct) return null
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Catalog',
              item: `${window.location.origin}/catalog`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: displayName,
              item: `${window.location.origin}/catalog/${listProduct.slug}`,
            },
          ],
        },
        {
          '@type': 'Product',
          name: displayName,
          sku: listProduct.id,
          mpn: cas,
          description: `${displayName} (CAS ${cas}) available through LeanChem industrial procurement.`,
          brand: { '@type': 'Brand', name: 'LeanChem' },
        },
      ],
    }
  }, [listProduct, displayName, cas])

  useEffect(() => {
    const prev = document.title
    document.title = listProduct
      ? `${displayName} | CAS ${cas} | LeanChem`
      : 'Product | LeanChem'
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = listProduct
      ? `${displayName} (CAS ${cas}). Specs, packaging, stock status, TDS/SDS, and RFQ via LeanChem Ethiopia.`
      : 'LeanChem chemical product detail.'
    return () => {
      document.title = prev
    }
  }, [listProduct, displayName, cas])

  const onPrimary = async () => {
    if (!listProduct) return
    setSubmitError(null)
    if (pricingStatus === 'Tier1Locked') {
      try {
        setSubmitting(true)
        await login()
      } catch (err) {
        setSubmitError(err instanceof ApiClientError ? err.message : 'Unable to sign in.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    try {
      setSubmitting(true)
      await createOrder({
        items: [
          {
            product_id: listProduct.id,
            requested_quantity: detail?.specs.moq ?? 1,
            packaging_preference: packaging !== '—' ? packaging : undefined,
          },
        ],
        delivery_address: 'Main HQ Warehouse, Addis Ababa, Ethiopia',
        internal_notes: 'Submitted from product detail page.',
      })
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Unable to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  const onSample = async () => {
    if (!listProduct) return
    setSubmitError(null)
    try {
      setSubmitting(true)
      await requestSample(listProduct.id)
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Unable to request sample.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="pdp">
        <div className="pdp__wrap">
          <div className="skel" style={{ height: 28, width: 220, marginBottom: 24 }} />
          <div className="skel" style={{ height: 40, width: '60%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 200, width: '100%' }} />
        </div>
      </div>
    )
  }

  if (!listProduct) {
    return (
      <div className="pdp">
        <div className="pdp__wrap">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Catalog', to: '/catalog' }, { label: 'Not found' }]} />
          <h1 className="page-title">Product not found</h1>
          <p className="page-subtitle">This grade is not in the current catalog index.</p>
          <Link to="/catalog" className="btn btn-primary">
            Back to catalog
          </Link>
        </div>
      </div>
    )
  }

  const purity = detail?.specs.purity_grade ?? listProduct.purity
  const state = detail?.specs.physical_state ?? listProduct.physicalState
  const packaging = detail?.packaging ?? listProduct.packaging
  const moq =
    detail?.specs != null ? `${detail.specs.moq} ${detail.specs.moq_unit}` : listProduct.moq
  const lead =
    detail?.specs != null
      ? `${detail.specs.lead_time_days} business days`
      : listProduct.leadTime

  return (
    <div className="pdp">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <div className="pdp__wrap">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Catalog', to: '/catalog' },
            { label: displayName },
          ]}
        />

        <header className="pdp__header">
          <div>
            <p className="pdp__cas">CAS {cas}</p>
            <h1 className="page-title">{displayName}</h1>
            <p className="page-subtitle">
              Indexable product page for procurement and technical review — specs, grades,
              packaging, documentation, and RFQ.
            </p>
          </div>
          <span className={`pdp__stock ${listProduct.inStock ? 'is-in' : 'is-out'}`}>
            {listProduct.inStock ? 'In stock' : 'Made to order'}
          </span>
        </header>

        <div className="pdp__grid">
          <section className="pdp__panel" aria-labelledby="specs-heading">
            <h2 id="specs-heading">Specifications</h2>
            <dl className="pdp__ledger">
              <div>
                <dt>Grade / purity</dt>
                <dd>{purity}</dd>
              </div>
              <div>
                <dt>Physical state</dt>
                <dd>{state}</dd>
              </div>
              <div>
                <dt>Packaging</dt>
                <dd>{packaging}</dd>
              </div>
              <div>
                <dt>MOQ</dt>
                <dd>{moq}</dd>
              </div>
              <div>
                <dt>Lead time</dt>
                <dd>{lead}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{listProduct.category}</dd>
              </div>
              <div>
                <dt>HS chapter</dt>
                <dd>{listProduct.hsChapter}</dd>
              </div>
            </dl>

            <h2>Documentation</h2>
            <div className="pdp__docs">
              <a className="btn btn-secondary" href={listProduct.sdsUrl}>
                Download SDS
              </a>
              <a className="btn btn-secondary" href="#tds">
                Download TDS
              </a>
            </div>
          </section>

          <aside className="pdp__aside">
            <PricingBlock
              price={price}
              status={pricingStatus}
              onPrimaryAction={() => void onPrimary()}
              onSampleAction={() => void onSample()}
              submitError={submitError}
              sampleExhausted={detail?.user_context.sample_already_requested}
              isSubmitting={submitting}
            />
            <Link
              className="btn btn-primary pdp__rfq"
              to={`/contact?product=${encodeURIComponent(displayName)}&cas=${encodeURIComponent(cas)}`}
            >
              Request quote on /contact
            </Link>
            <p className="pdp__slug-note">Canonical slug: {productSlug(listProduct)}</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
