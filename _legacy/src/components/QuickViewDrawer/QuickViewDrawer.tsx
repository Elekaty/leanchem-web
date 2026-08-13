import { useEffect, useId, useRef, useState } from 'react'
import { ApiClientError } from '../../api/client'
import { createOrder, fetchProduct, requestSample, type ProductDetail } from '../../api/leanchem'
import { useAuth } from '../../context/AuthContext'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { HazardPictogram, PricingStatus, Product, UserTier } from '../../types'
import { CloseIcon, HazardPictogramIcon } from '../Icons'
import { PricingBlock } from '../PricingBlock/PricingBlock'
import { EmptyDocumentVault } from '../DocumentDropzone/DocumentDropzone'
import './QuickViewDrawer.css'

export const QUICK_VIEW_DRAWER_ID = 'quick-view-drawer'

type DrawerTab = 'overview' | 'properties' | 'safety'

interface QuickViewDrawerProps {
  isOpen: boolean
  productId: string | null
  listProduct: Product | null
  userTier: UserTier
  onClose: () => void
}

function resolvePricingStatus(detail: ProductDetail | null, userTier: UserTier): PricingStatus {
  if (userTier === 1) return 'Tier1Locked'
  const price = detail?.pricing?.estimated_price
  if (price == null) return 'Unavailable'
  return 'Available'
}

function Ledger({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="qv-ledger">
      {rows.map(([key, value]) => (
        <div key={key} className="qv-ledger__row">
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function QuickViewDrawer({
  isOpen,
  productId,
  listProduct,
  userTier,
  onClose,
}: QuickViewDrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { login } = useAuth()
  const [detail, setDetail] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState<DrawerTab>('overview')

  useFocusTrap(panelRef, isOpen)

  useEffect(() => {
    if (!isOpen) {
      setSubmitError(null)
      setSubmitting(false)
      setDetail(null)
      setTab('overview')
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !productId) return
    let cancelled = false
    setLoading(true)
    setDetail(null)
    fetchProduct(productId)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, productId])

  const status = resolvePricingStatus(detail, userTier)
  const title = detail?.name ?? listProduct?.name ?? 'Product'
  const cas = detail?.cas_number ?? listProduct?.casNumber ?? ''
  const hazard = (detail?.hazard ?? listProduct?.hazard ?? 'irritant') as HazardPictogram
  const moq = detail != null ? `${detail.specs.moq} ${detail.specs.moq_unit}` : (listProduct?.moq ?? '—')
  const leadTime =
    detail != null ? `${detail.specs.lead_time_days} business days` : (listProduct?.leadTime ?? '—')
  const purity = detail?.specs.purity_grade ?? listProduct?.purity ?? '—'
  const physicalState = detail?.specs.physical_state ?? listProduct?.physicalState ?? '—'
  const packaging = detail?.packaging ?? listProduct?.packaging ?? '—'
  const sds = detail?.documents.find((d) => d.type === 'SDS')
  const price = detail?.pricing?.estimated_price ?? null
  const sampleExhausted = Boolean(detail?.user_context.sample_already_requested)

  const handlePrimary = async () => {
    if (status === 'Tier1Locked') {
      await login()
      return
    }
    if (!productId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createOrder({
        items: [
          {
            product_id: productId,
            requested_quantity: detail?.specs.moq ?? 1,
            packaging_preference: packaging !== '—' ? packaging : undefined,
          },
        ],
        delivery_address: 'Main HQ Warehouse, Addis Ababa, Ethiopia',
        internal_notes: 'Submitted from Quick View drawer.',
      })
      onClose()
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to submit order request. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSample = async () => {
    if (!productId || sampleExhausted) return
    try {
      await requestSample(productId)
      const refreshed = await fetchProduct(productId)
      setDetail(refreshed)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to submit sample request.'
      setSubmitError(message)
    }
  }

  return (
    <div className={`qv-root ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="qv-backdrop" onClick={onClose} />
      <div
        id={QUICK_VIEW_DRAWER_ID}
        ref={panelRef}
        className={`qv-panel ${isMobile ? 'qv-panel--sheet' : 'qv-panel--drawer'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="qv-header">
          <div className="qv-identity">
            <div className="qv-identity__text">
              <h2 id={titleId} className="qv-identity__name">
                {title}
              </h2>
              <p className="qv-identity__cas">{cas}</p>
            </div>
            <HazardPictogramIcon type={hazard} />
          </div>
          <button
            type="button"
            className="qv-close btn-ghost"
            onClick={onClose}
            aria-label="Close quick view"
          >
            <CloseIcon />
          </button>
        </header>

        {loading || !detail ? (
          <QuickViewSkeleton />
        ) : (
          <>
            <div className="qv-tabs" role="tablist" aria-label="Technical data sheet">
              {(
                [
                  ['overview', 'Overview'],
                  ['properties', 'Properties'],
                  ['safety', 'Safety (SDS)'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={tab === id ? 'is-active' : undefined}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="qv-body">
              {tab === 'overview' ? (
                <section>
                  <p className="qv-overview">
                    {detail.description ??
                      'Industrial procurement grade material for qualified buyers. Review properties and SDS before submitting an order request.'}
                  </p>
                  <Ledger
                    rows={[
                      ['MOQ', moq],
                      ['Lead Time', leadTime],
                      ['Physical State', physicalState],
                    ]}
                  />
                </section>
              ) : null}

              {tab === 'properties' ? (
                <Ledger
                  rows={[
                    ['Purity Grade', purity],
                    ['Physical State', physicalState],
                    ['Standard Packaging', packaging],
                    ['MOQ', moq],
                    ['Lead Time', leadTime],
                  ]}
                />
              ) : null}

              {tab === 'safety' ? (
                <section>
                  {sds ? (
                    <div className="qv-sds">
                      <a href={sds.url}>Safety Data Sheet (SDS)</a>
                      <span className="qv-sds__updated">Last Updated: {sds.last_updated}</span>
                    </div>
                  ) : (
                    <EmptyDocumentVault />
                  )}
                </section>
              ) : null}
            </div>
          </>
        )}

        <footer className="qv-footer">
          {loading || !detail ? (
            <div className="skel skel-action-footer" />
          ) : (
            <PricingBlock
              price={price}
              status={status}
              onPrimaryAction={handlePrimary}
              onSampleAction={handleSample}
              submitError={submitError}
              sampleExhausted={sampleExhausted}
              isSubmitting={submitting}
            />
          )}
        </footer>
      </div>
    </div>
  )
}

function QuickViewSkeleton() {
  return (
    <div className="qv-skeleton" aria-hidden="true">
      <div className="skel skel-tab" />
      <div className="skel skel-line" />
      <div className="skel skel-line" />
      <div className="skel skel-ledger" />
    </div>
  )
}
