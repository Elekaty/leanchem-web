import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiClientError } from '../api/client'
import {
  createOrder,
  fetchProduct,
  requestSample,
  type ProductDetail,
} from '../api/leanchem'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { PricingBlock } from '../components/PricingBlock/PricingBlock'
import { useAuth } from '../context/AuthContext'
import { mapCatalogItem } from '../data/mapCatalogItem'
import { MOCK_PRODUCTS } from '../data/mockProducts'
import type { PricingStatus, Product } from '../types'
import './ProductDetailPage.css'

function resolvePricingStatus(detail: ProductDetail | null, tier: 1 | 2 | 3): PricingStatus {
  if (tier === 1) return 'Tier1Locked'
  const price = detail?.pricing?.estimated_price
  if (price == null) return 'Unavailable'
  return 'Available'
}

function detailToListProduct(detail: ProductDetail): Product {
  return mapCatalogItem({
    id: detail.id,
    slug: detail.slug,
    cas_number: detail.cas_number,
    name: detail.name,
    purity_grade: detail.specs.purity_grade,
    in_stock: true,
    moq: detail.specs.moq,
    moq_unit: detail.specs.moq_unit,
    lead_time_days: detail.specs.lead_time_days,
    estimated_price: detail.pricing?.estimated_price ?? null,
    physical_state: detail.specs.physical_state,
    hazard: detail.hazard,
    packaging: detail.packaging_options ?? detail.packaging,
    packaging_options: detail.packaging_options ?? detail.packaging,
    hs_chapter: detail.hs_chapter,
    industry_tags: detail.industry_tags,
    seo_description: detail.seo_description,
  })
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
        const d = await fetchProduct(slug)
        if (cancelled) return
        setDetail(d)
        setListProduct(detailToListProduct(d))
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
  const productSlugValue = detail?.slug ?? listProduct?.slug ?? slug
  const packaging =
    detail?.packaging_options ?? detail?.packaging ?? listProduct?.packaging ?? '—'
  const pricingStatus = resolvePricingStatus(detail, session.tier)
  const price = detail?.pricing?.estimated_price ?? listProduct?.estimatedPrice ?? null
  const seo =
    detail?.seo_description ??
    listProduct?.seoDescription ??
    `${displayName} (CAS ${cas}). Specs, packaging, stock status, TDS/SDS, and RFQ via LeanChem Ethiopia.`

  const jsonLd = useMemo(() => {
    if (!listProduct && !detail) return null
    const canonicalSlug = productSlugValue
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
              item: `${window.location.origin}/catalog/${canonicalSlug}`,
            },
          ],
        },
        {
          '@type': 'Product',
          name: displayName,
          sku: listProduct?.id ?? detail?.id,
          mpn: cas,
          description: seo,
          brand: { '@type': 'Brand', name: 'LeanChem' },
        },
      ],
    }
  }, [listProduct, detail, displayName, cas, productSlugValue, seo])

  useEffect(() => {
    const prev = document.title
    document.title = listProduct || detail ? `${displayName} | CAS ${cas} | LeanChem` : 'Product | LeanChem'
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = seo
    return () => {
      document.title = prev
    }
  }, [listProduct, detail, displayName, cas, seo])

  const onPrimary = async () => {
    if (!listProduct && !detail) return
    const productId = detail?.id ?? listProduct!.id
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
            product_id: productId,
            requested_quantity: detail?.specs.moq ?? 1,
            packaging_preference: packaging !== '—' ? packaging : undefined,
          },
        ],
        delivery_address: 'Main HQ Warehouse, Addis Ababa, Ethiopia',
        internal_notes: 'Submitted from public PDP (authenticated buyer).',
      })
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Unable to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  const onSample = async () => {
    const productId = detail?.id ?? listProduct?.id
    if (!productId) return
    setSubmitError(null)
    try {
      setSubmitting(true)
      await requestSample(productId)
      const refreshed = await fetchProduct(productId)
      setDetail(refreshed)
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

  if (!listProduct && !detail) {
    return (
      <div className="pdp">
        <div className="pdp__wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Catalog', to: '/catalog' },
              { label: 'Not found' },
            ]}
          />
          <h1 className="page-title">Product not found</h1>
          <p className="page-subtitle">This grade is not in the current catalog index.</p>
          <Link to="/catalog" className="btn btn-primary">
            Back to catalog
          </Link>
        </div>
      </div>
    )
  }

  const purity = detail?.specs.purity_grade ?? listProduct?.purity ?? '—'
  const state = detail?.specs.physical_state ?? listProduct?.physicalState ?? '—'
  const moq =
    detail?.specs != null ? `${detail.specs.moq} ${detail.specs.moq_unit}` : (listProduct?.moq ?? '—')
  const lead =
    detail?.specs != null
      ? `${detail.specs.lead_time_days} business days`
      : (listProduct?.leadTime ?? '—')
  const hs = detail?.hs_chapter ?? listProduct?.hsChapter ?? '—'
  const inStock = listProduct?.inStock ?? true

  return (
    <div className="pdp">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
            <p className="page-subtitle">{seo}</p>
          </div>
          <span className={`pdp__stock ${inStock ? 'is-in' : 'is-out'}`}>
            {inStock ? 'In stock' : 'Made to order'}
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
                <dt>HS chapter</dt>
                <dd>{hs}</dd>
              </div>
            </dl>

            <h2>Documentation</h2>
            <div className="pdp__docs">
              <a className="btn btn-secondary" href={listProduct?.sdsUrl ?? '#'}>
                Download SDS
              </a>
              <a className="btn btn-secondary" href="#tds">
                Download TDS
              </a>
            </div>
          </section>

          <aside className="pdp__aside">
            {session.isLoggedIn ? (
              <PricingBlock
                price={price}
                status={pricingStatus}
                onPrimaryAction={() => void onPrimary()}
                onSampleAction={() => void onSample()}
                submitError={submitError}
                sampleExhausted={detail?.user_context.sample_already_requested}
                isSubmitting={submitting}
              />
            ) : (
              <div className="pdp__public-cta">
                <p>
                  Public RFQs use the contact route. Verified buyers can order instantly from the
                  Client Portal Quick View.
                </p>
              </div>
            )}
            <Link
              className="btn btn-primary pdp__rfq"
              to={`/contact?product=${encodeURIComponent(productSlugValue)}`}
            >
              Request quote
            </Link>
            {!session.isLoggedIn ? (
              <Link className="btn btn-secondary pdp__rfq" to="/portal/catalog">
                Open Client Portal
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}
