import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  CORRIDOR_STEPS,
  DEMO_BUYER_ACCOUNT_ID,
  formatLiveUpdateDate,
  logsForPurchaseOrder,
  ordersForAccount,
  stepLabelForIndex,
  type CorridorPurchaseOrder,
} from '../../data/corridorTracker'

export const Route = createFileRoute('/portal/tracker')({
  head: () => ({
    meta: [
      { title: 'Logistics Tracker | LeanChem Portal' },
      {
        name: 'description',
        content:
          'Private logistics tracker — select an active purchase order and follow the Djibouti–Modjo–Addis corridor.',
      },
    ],
  }),
  component: PortalTrackerPage,
})

function PortalTrackerPage() {
  const { session } = useAuth()
  if (!session.isLoggedIn) return <Navigate to="/portal" />

  const accountId = session.accountId || DEMO_BUYER_ACCOUNT_ID
  const orders = useMemo(() => ordersForAccount(accountId), [accountId])
  const activeOrders = useMemo(
    () => orders.filter((o) => o.lifecycle === 'open'),
    [orders],
  )

  const [selectedPo, setSelectedPo] = useState('')

  useEffect(() => {
    if (activeOrders.length === 0) {
      setSelectedPo('')
      return
    }
    if (!activeOrders.some((o) => o.poNumber === selectedPo)) {
      setSelectedPo(activeOrders[0]!.poNumber)
    }
  }, [activeOrders, selectedPo])

  const selected = activeOrders.find((o) => o.poNumber === selectedPo)

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Private logistics
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-velvet md:text-3xl">
          Corridor Tracker
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Active purchase orders for <span className="font-semibold text-velvet">{session.displayName}</span>
          {session.companyName ? (
            <>
              {' '}
              · <span className="font-semibold text-velvet">{session.companyName}</span>
            </>
          ) : null}
          . Select a PO to follow Origin Port → Addis Delivery.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
        {/* Sidebar — Active POs */}
        <aside className="rounded border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-velvet">Active Purchase Orders</h2>
            <p className="mt-0.5 text-xs text-gray-500">{activeOrders.length} open</p>
          </div>
          {activeOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No active POs.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activeOrders.map((po) => {
                const isSelected = po.poNumber === selectedPo
                return (
                  <li key={po.poNumber}>
                    <button
                      type="button"
                      onClick={() => setSelectedPo(po.poNumber)}
                      className={`w-full px-4 py-3 text-left transition ${
                        isSelected
                          ? 'border-l-2 border-l-lapis bg-blue-50/60'
                          : 'border-l-2 border-l-transparent hover:bg-gray-50'
                      }`}
                    >
                      <p
                        className={`text-sm font-bold ${isSelected ? 'text-lapis' : 'text-velvet'}`}
                      >
                        {po.poNumber}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {po.productSummary}
                      </p>
                      <p className="mt-1 text-[0.65rem] font-semibold tracking-wide text-gray-400 uppercase">
                        {stepLabelForIndex(po.activeStepIndex)}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        {/* Main — stepper + live updates */}
        <div className="min-w-0 space-y-4">
          {selected ? (
            <>
              <section className="rounded border border-gray-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-velvet">{selected.poNumber}</h2>
                    <p className="mt-0.5 text-sm text-gray-500">{selected.productSummary}</p>
                  </div>
                  <span className="rounded border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-lapis">
                    {stepLabelForIndex(selected.activeStepIndex)}
                  </span>
                </div>

                <ul className="mb-6 space-y-1 border-b border-gray-100 pb-4">
                  {selected.chemicals.map((chem) => (
                    <li
                      key={`${selected.poNumber}-${chem.casNumber}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                    >
                      <span>
                        <span className="font-semibold text-velvet">{chem.name}</span>
                        <span className="ml-2 text-xs font-semibold text-gray-400">
                          CAS {chem.casNumber}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-gray-500">{chem.quantity}</span>
                    </li>
                  ))}
                </ul>

                <CorridorStepper order={selected} />
              </section>

              <LiveUpdatesFeed order={selected} />
            </>
          ) : (
            <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-16 text-center text-sm text-gray-500">
              Select an active purchase order to view corridor progress.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CorridorStepper({ order }: { order: CorridorPurchaseOrder }) {
  const activeIndex = order.activeStepIndex
  const isClosed = order.lifecycle === 'closed'

  return (
    <ol
      className="flex list-none items-start gap-0 overflow-x-auto pb-1"
      aria-label={`Logistics corridor for ${order.poNumber}`}
    >
      {CORRIDOR_STEPS.map((step, index) => {
        const isComplete = isClosed || index < activeIndex
        const isActive = !isClosed && index === activeIndex
        const isFuture = !isComplete && !isActive

        return (
          <li
            key={step.id}
            className="relative flex min-w-[5.5rem] flex-1 flex-col items-center px-1"
          >
            {index < CORRIDOR_STEPS.length - 1 ? (
              <span
                className={`absolute top-3 left-[calc(50%+0.75rem)] right-[calc(-50%+0.75rem)] h-0.5 ${
                  isComplete || (isActive && index < activeIndex) || index < activeIndex
                    ? 'bg-emerald-500'
                    : 'bg-gray-200'
                }`}
                aria-hidden="true"
              />
            ) : null}

            <span
              className={`relative z-[1] flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                isComplete
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : isActive
                    ? 'border-lapis bg-lapis text-white'
                    : 'border-gray-300 bg-white text-gray-400'
              }`}
            >
              {isComplete ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              ) : isActive ? (
                <span
                  className="h-2 w-2 rounded-full bg-white timeline-pulse"
                  aria-hidden="true"
                />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" aria-hidden="true" />
              )}
            </span>

            <span
              className={`mt-2 max-w-[6.5rem] text-center text-[0.7rem] font-semibold leading-snug ${
                isActive
                  ? 'text-lapis'
                  : isComplete
                    ? 'text-emerald-700'
                    : isFuture
                      ? 'text-gray-400'
                      : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {isActive ? (
              <span className="mt-1 text-[0.6rem] font-bold tracking-wide text-lapis uppercase">
                Current
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function LiveUpdatesFeed({ order }: { order: CorridorPurchaseOrder }) {
  const logs = logsForPurchaseOrder(order)

  return (
    <section className="rounded border border-gray-200 bg-white p-5 md:p-6">
      <h3 className="text-sm font-bold text-velvet">Live Updates</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        Timestamped events for {order.poNumber} only.
      </p>

      {logs.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No updates yet for this PO.</p>
      ) : (
        <ol className="relative mt-5 space-y-0 border-l border-gray-200 pl-5">
          {logs.map((entry, i) => {
            const isLatest = i === 0
            const stepLabel =
              CORRIDOR_STEPS.find((s) => s.id === entry.stepId)?.label ?? entry.stepId

            return (
              <li key={entry.id} className="relative pb-5 last:pb-0">
                <span
                  className={`absolute top-1.5 -left-[1.4rem] h-2.5 w-2.5 rounded-full border-2 border-white ${
                    isLatest ? 'bg-lapis timeline-pulse' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-xs font-semibold text-gray-500">
                  {formatLiveUpdateDate(entry.timestamp)}
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="text-organza">{stepLabel}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-velvet">{entry.message}</p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
