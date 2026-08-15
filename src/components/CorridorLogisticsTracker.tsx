import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  CORRIDOR_STEPS,
  DEMO_BUYER_ACCOUNT_ID,
  formatEatTimestamp,
  logsForPurchaseOrder,
  ordersForAccount,
  stepLabelForIndex,
  type CorridorOrderLifecycle,
  type CorridorPurchaseOrder,
} from '../data/corridorTracker'

interface CorridorLogisticsTrackerProps {
  /** Force a specific account's orders (defaults to signed-in buyer). */
  accountId?: string
}

export function CorridorLogisticsTracker({ accountId }: CorridorLogisticsTrackerProps) {
  const { session } = useAuth()
  const resolvedAccountId = accountId ?? session.accountId ?? DEMO_BUYER_ACCOUNT_ID
  const isLoggedIn = session.isLoggedIn

  const myOrders = useMemo(
    () => (isLoggedIn ? ordersForAccount(resolvedAccountId) : []),
    [isLoggedIn, resolvedAccountId],
  )

  const [lifecycleFilter, setLifecycleFilter] = useState<CorridorOrderLifecycle | 'all'>('open')
  const [selectedPo, setSelectedPo] = useState<string>('')

  const filteredOrders = useMemo(() => {
    if (lifecycleFilter === 'all') return myOrders
    return myOrders.filter((po) => po.lifecycle === lifecycleFilter)
  }, [myOrders, lifecycleFilter])

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedPo('')
      return
    }
    if (!filteredOrders.some((po) => po.poNumber === selectedPo)) {
      setSelectedPo(filteredOrders[0]!.poNumber)
    }
  }, [filteredOrders, selectedPo])

  const purchaseOrder: CorridorPurchaseOrder | undefined = filteredOrders.find(
    (po) => po.poNumber === selectedPo,
  )

  if (!isLoggedIn) {
    return (
      <div className="rounded border border-organza/30 bg-white p-6 shadow-[0_1px_3px_rgba(34,34,53,0.05)] md:p-8">
        <p className="text-xs font-semibold tracking-wide text-organza uppercase">
          Your corridor shipments
        </p>
        <h3 className="mt-2 text-xl font-bold text-velvet">Track your orders only</h3>
        <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-velvet/65">
          Sign in to see open and closed purchase orders on your account — with the live stage of
          each shipment from origin port to final delivery. You will never see other customers&apos;
          cargo.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/portal" className="btn btn-primary no-underline hover:no-underline">
            Sign in or register
          </Link>
          <Link
            to="/portal/tracker"
            className="btn btn-secondary no-underline hover:no-underline"
          >
            Go to Tracker
          </Link>
        </div>
      </div>
    )
  }

  const openCount = myOrders.filter((o) => o.lifecycle === 'open').length
  const closedCount = myOrders.filter((o) => o.lifecycle === 'closed').length

  return (
    <div className="rounded border border-organza/30 bg-white p-5 shadow-[0_1px_3px_rgba(34,34,53,0.05)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-organza uppercase">
            Your corridor tracker
          </p>
          <h3 className="mt-1 text-lg font-bold text-velvet">
            Orders for {session.displayName}
          </h3>
          <p className="mt-0.5 text-sm text-velvet/60">
            {session.companyName ? `${session.companyName} · ` : null}
            {openCount} open · {closedCount} closed — only your account&apos;s POs.{' '}
            <Link
              to="/portal/tracker"
              className="font-semibold text-lapis no-underline hover:underline"
            >
              Open full Tracker
            </Link>
          </p>
        </div>
      </div>

      {/* Open / Closed filter */}
      <div
        className="mt-5 inline-flex rounded border border-organza/35 bg-canvas p-1"
        role="tablist"
        aria-label="Order status"
      >
        {(
          [
            { id: 'open', label: `Open (${openCount})` },
            { id: 'closed', label: `Closed (${closedCount})` },
            { id: 'all', label: 'All' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={lifecycleFilter === tab.id}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              lifecycleFilter === tab.id
                ? 'bg-white text-lapis shadow-sm'
                : 'text-velvet/55 hover:text-velvet'
            }`}
            onClick={() => setLifecycleFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-organza/40 bg-canvas px-4 py-8 text-center text-sm text-velvet/60">
          No {lifecycleFilter === 'all' ? '' : lifecycleFilter} orders on your account yet.
        </p>
      ) : (
        <>
          {/* PO picker */}
          <div className="mt-5">
            <label className="block text-xs font-semibold tracking-wide text-organza uppercase">
              Select your purchase order
              <select
                value={selectedPo}
                onChange={(e) => setSelectedPo(e.target.value)}
                className="mt-1.5 h-11 w-full max-w-md rounded border border-organza/40 bg-canvas px-3 text-sm font-semibold text-velvet outline-none focus:border-adamantine"
              >
                {filteredOrders.map((po) => (
                  <option key={po.poNumber} value={po.poNumber}>
                    {po.poNumber} — {stepLabelForIndex(po.activeStepIndex)} (
                    {po.lifecycle})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {purchaseOrder ? <OrderPipelineDetail purchaseOrder={purchaseOrder} /> : null}
        </>
      )}
    </div>
  )
}

function OrderPipelineDetail({ purchaseOrder }: { purchaseOrder: CorridorPurchaseOrder }) {
  const isClosed = purchaseOrder.lifecycle === 'closed'
  const activeIndex = Math.min(
    Math.max(purchaseOrder.activeStepIndex, 0),
    CORRIDOR_STEPS.length - 1,
  )
  const liveUpdates = logsForPurchaseOrder(purchaseOrder)
  const activeStep = CORRIDOR_STEPS[activeIndex]!

  return (
    <>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-3 border-t border-organza/25 pt-5">
        <div>
          <h4 className="text-base font-bold text-velvet">{purchaseOrder.poNumber}</h4>
          <p className="mt-0.5 text-sm text-velvet/60">{purchaseOrder.productSummary}</p>
        </div>
        <p
          className={`rounded px-3 py-1.5 text-xs font-bold ${
            isClosed ? 'bg-success/10 text-success' : 'bg-lapis/10 text-lapis'
          }`}
        >
          {isClosed ? 'Delivered · Closed' : `Current stage: ${activeStep.label}`}
        </p>
      </div>

      <ol
        className="mt-6 flex list-none items-start gap-0 overflow-x-auto pb-2"
        aria-label={`Pipeline for ${purchaseOrder.poNumber}`}
      >
        {CORRIDOR_STEPS.map((step, index) => {
          const isComplete = isClosed || index < activeIndex
          const isActive = !isClosed && index === activeIndex
          const isFuture = !isClosed && index > activeIndex

          return (
            <li
              key={step.id}
              className="relative flex min-w-[7.5rem] flex-1 flex-col items-center px-1 sm:min-w-0"
            >
              {index < CORRIDOR_STEPS.length - 1 ? (
                <span
                  className={`absolute top-4 left-[calc(50%+1.1rem)] right-[calc(-50%+1.1rem)] h-0.5 ${
                    isComplete || (isActive && index < activeIndex) || index < activeIndex
                      ? 'bg-success'
                      : isClosed
                        ? 'bg-success'
                        : 'bg-organza/35'
                  }`}
                  aria-hidden="true"
                />
              ) : null}

              <span
                className={`relative z-[1] flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  isComplete
                    ? 'border-success bg-success text-white'
                    : isActive
                      ? 'timeline-pulse border-lapis bg-lapis text-white'
                      : 'border-organza/50 bg-canvas text-organza'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
              </span>

              <span
                className={`mt-2 max-w-[6.5rem] text-center text-[0.7rem] font-semibold leading-snug sm:text-xs ${
                  isActive
                    ? 'text-lapis'
                    : isComplete
                      ? 'text-success'
                      : isFuture
                        ? 'text-velvet/40'
                        : 'text-velvet'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-8 border-t border-organza/25 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-sm font-bold text-velvet">Live updates for this order</h4>
          <p className="text-xs font-semibold text-velvet/45">
            {liveUpdates.length} event{liveUpdates.length === 1 ? '' : 's'} ·{' '}
            {purchaseOrder.poNumber}
          </p>
        </div>

        {liveUpdates.length === 0 ? (
          <p className="mt-4 rounded border border-dashed border-organza/40 bg-canvas px-4 py-6 text-center text-sm text-velvet/55">
            No updates posted for this purchase order yet.
          </p>
        ) : (
          <ol className="mt-4 list-none space-y-0 p-0">
            {liveUpdates.map((entry, index) => {
              const stepLabel =
                CORRIDOR_STEPS.find((s) => s.id === entry.stepId)?.label ?? entry.stepId
              const isLatest = index === 0
              return (
                <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < liveUpdates.length - 1 ? (
                    <span
                      className="absolute top-3 left-[0.55rem] bottom-0 w-px bg-organza/35"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={`relative z-[1] mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      isLatest && !isClosed ? 'bg-lapis timeline-pulse' : 'bg-organza/60'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <time
                        dateTime={entry.timestamp}
                        className="text-xs font-semibold text-velvet/50"
                      >
                        {formatEatTimestamp(entry.timestamp)}
                      </time>
                      <span className="text-[0.65rem] font-bold tracking-wide text-organza uppercase">
                        {stepLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-velvet/75">{entry.message}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </>
  )
}
