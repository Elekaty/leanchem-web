import { useEffect, useId, useRef, useState } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { PricingStatus, Product } from '../types/catalog'
import { CloseIcon, HazardPictogramIcon } from './Icons'
import { PricingBlock } from './PricingBlock'

export const QUICK_VIEW_DRAWER_ID = 'quick-view-drawer'

type DrawerTab = 'overview' | 'properties' | 'safety'

interface QuickViewDrawerProps {
  isOpen: boolean
  product: Product | null
  pricingStatus: PricingStatus
  onClose: () => void
  onSubmitOrder: () => Promise<void>
  onRequestSample: () => Promise<void>
}

function Ledger({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="m-0">
      {rows.map(([key, value]) => (
        <div
          key={key}
          className="grid grid-cols-[140px_1fr] gap-3 border-b border-dashed border-organza py-2.5 text-sm last:border-b-0"
        >
          <dt className="text-velvet/55">{key}</dt>
          <dd className="m-0 font-semibold text-velvet">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function QuickViewDrawer({
  isOpen,
  product,
  pricingStatus,
  onClose,
  onSubmitOrder,
  onRequestSample,
}: QuickViewDrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [tab, setTab] = useState<DrawerTab>('overview')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sampleExhausted, setSampleExhausted] = useState(false)
  const [loading, setLoading] = useState(false)

  useFocusTrap(panelRef, isOpen)

  useEffect(() => {
    if (!isOpen) {
      setSubmitError(null)
      setSubmitting(false)
      setTab('overview')
      setSampleExhausted(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 280)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose, product?.id])

  const handlePrimary = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmitOrder()
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit order request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSample = async () => {
    if (sampleExhausted) return
    try {
      await onRequestSample()
      setSampleExhausted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit sample request.')
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-velvet/40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        id={QUICK_VIEW_DRAWER_ID}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute flex flex-col bg-white shadow-2xl outline-none transition-transform duration-200 ${
          isMobile
            ? `inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}`
            : `top-0 right-0 h-full w-full max-w-[640px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
        }`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-organza/30 bg-white px-4 py-3">
          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold leading-snug text-velvet">
                {product?.name ?? 'Product'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-lapis">{product?.casNumber}</p>
            </div>
            {product ? <HazardPictogramIcon type={product.hazard} /> : null}
          </div>
          <button
            type="button"
            className="btn btn-ghost min-h-10 px-2"
            onClick={onClose}
            aria-label="Close quick view"
          >
            <CloseIcon />
          </button>
        </header>

        {loading || !product ? (
          <div className="flex-1 space-y-3 overflow-auto p-4" aria-hidden="true">
            <div className="skel h-9 w-64" />
            <div className="skel h-16 w-full" />
            <div className="skel h-28 w-full" />
          </div>
        ) : (
          <>
            <div className="flex gap-1 border-b border-organza/25 px-3" role="tablist" aria-label="Technical data sheet">
              {(
                [
                  ['overview', 'Overview'],
                  ['properties', 'Properties'],
                  ['safety', 'Safety'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={`min-h-11 border-b-2 px-3 text-sm font-semibold transition ${
                    tab === id
                      ? 'border-lapis text-lapis'
                      : 'border-transparent text-velvet/60 hover:text-lapis'
                  }`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto px-4 py-4 pb-4">
              {tab === 'overview' ? (
                <section>
                  <p className="mb-4 text-sm leading-relaxed text-velvet/70">{product.description}</p>
                  <Ledger
                    rows={[
                      ['MOQ', product.moq],
                      ['Lead Time', product.leadTime],
                      ['Physical State', product.physicalState],
                    ]}
                  />
                </section>
              ) : null}

              {tab === 'properties' ? (
                <Ledger
                  rows={[
                    ['Purity Grade', product.purity],
                    ['Physical State', product.physicalState],
                    ['Standard Packaging', product.packaging],
                    ['MOQ', product.moq],
                    ['Lead Time', product.leadTime],
                    ...product.properties.map((p) => [p.key, p.value] as [string, string]),
                  ]}
                />
              ) : null}

              {tab === 'safety' ? (
                <section>
                  {product.sdsUrl ? (
                    <div className="rounded-lg border border-organza/30 bg-canvas p-4">
                      <a
                        href={product.sdsUrl}
                        className="font-semibold text-lapis no-underline hover:underline"
                      >
                        Safety Data Sheet (SDS)
                      </a>
                      <p className="mt-1 text-xs text-velvet/55">
                        Last Updated: {product.sdsUpdatedAt}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-organza/50 bg-canvas p-6 text-center">
                      <p className="font-semibold text-velvet">No documents currently attached.</p>
                      <p className="mt-1 text-sm text-velvet/55">
                        Contact sales if documentation is required.
                      </p>
                    </div>
                  )}
                </section>
              ) : null}
            </div>
          </>
        )}

        <footer className="sticky bottom-0 z-10 border-t border-organza/30 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(34,34,53,0.06)]">
          {loading || !product ? (
            <div className="skel h-24 w-full" />
          ) : (
            <PricingBlock
              price={product.estimatedPrice}
              status={pricingStatus}
              onPrimaryAction={() => void handlePrimary()}
              onSampleAction={() => void handleSample()}
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
