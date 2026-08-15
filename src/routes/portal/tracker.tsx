import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Check, Loader2 } from 'lucide-react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from '../../context/AuthContext'
import { getSupabaseBrowser, isSupabaseConfigured } from '../../lib/supabase'
import {
  CORRIDOR_STEPS,
  formatLiveUpdateDate,
  logsForPurchaseOrder,
  makeStageUpdateLog,
  stageLabelToIndex,
  stepLabelForIndex,
  type CorridorLogEntry,
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

interface PurchaseOrderRow {
  id: string
  po_number: string | null
  rfq_id: string | null
  buyer_email: string
  current_stage: string
  last_updated: string
  created_at?: string
}

type TrackerOrder = CorridorPurchaseOrder & {
  id: string
  currentStage: string
  lastUpdated: string
}

function mapDbRowToTrackerOrder(row: PurchaseOrderRow): TrackerOrder {
  const poNumber = row.po_number || row.id.slice(0, 8).toUpperCase()
  const stage = row.current_stage || 'Origin Port'
  const activeStepIndex = stageLabelToIndex(stage)
  const lifecycle = stage === 'Addis Delivery' ? 'closed' : 'open'
  const timestamp = row.last_updated || row.created_at || new Date().toISOString()

  const seedLog: CorridorLogEntry = {
    id: `seed-${row.id}`,
    poNumber,
    stepId: CORRIDOR_STEPS[activeStepIndex]!.id,
    timestamp,
    message: `Current stage: ${stage}`,
  }

  return {
    id: row.id,
    poNumber,
    accountId: row.buyer_email.toLowerCase(),
    productSummary: `RFQ ${row.rfq_id ? row.rfq_id.slice(0, 8) : '—'} · Corridor shipment`,
    chemicals: [],
    lifecycle,
    activeStepIndex,
    currentStage: stage,
    lastUpdated: timestamp,
    logs: [seedLog],
  }
}

function PortalTrackerPage() {
  const { session } = useAuth()
  if (!session.isLoggedIn) return <Navigate to="/portal" />

  const buyerEmail = (session.email || '').trim().toLowerCase()
  const configured = isSupabaseConfigured()

  const [orders, setOrders] = useState<TrackerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPo, setSelectedPo] = useState('')

  const activeOrders = useMemo(
    () => orders.filter((o) => o.lifecycle === 'open'),
    [orders],
  )

  const applyStageUpdate = useCallback(
    (poId: string, stage: string, lastUpdated: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== poId) return order
          if (order.currentStage === stage && order.lastUpdated === lastUpdated) {
            return order
          }
          const activeStepIndex = stageLabelToIndex(stage)
          const log = makeStageUpdateLog({
            poNumber: order.poNumber,
            stage,
            timestamp: lastUpdated || new Date().toISOString(),
          })
          return {
            ...order,
            currentStage: stage,
            lastUpdated: lastUpdated || order.lastUpdated,
            activeStepIndex,
            lifecycle: stage === 'Addis Delivery' ? 'closed' : 'open',
            logs: [log, ...order.logs],
          }
        }),
      )
    },
    [],
  )

  useEffect(() => {
    if (!configured || !buyerEmail) {
      setLoading(false)
      setError(
        configured
          ? 'No email on your session — sign in again to load purchase orders.'
          : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      setOrders([])
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowser()
    if (!supabase) {
      setLoading(false)
      setError('Supabase client unavailable.')
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      const { data, error: qErr } = await supabase
        .from('purchase_orders')
        .select(
          'id, po_number, rfq_id, buyer_email, current_stage, last_updated, created_at',
        )
        .ilike('buyer_email', buyerEmail)
        .order('last_updated', { ascending: false })

      if (cancelled) return
      if (qErr) {
        setError(qErr.message || 'Failed to load purchase orders.')
        setOrders([])
        setLoading(false)
        return
      }

      setOrders(((data as PurchaseOrderRow[]) ?? []).map(mapDbRowToTrackerOrder))
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [configured, buyerEmail])

  // Realtime: advance stepper + prepend timeline when admin updates a PO
  useEffect(() => {
    if (!configured || !buyerEmail) return
    const supabase = getSupabaseBrowser()
    if (!supabase) return

    let channel: RealtimeChannel | null = null
    try {
      channel = supabase
        .channel('public:purchase_orders')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'purchase_orders',
          },
          (payload) => {
            const next = payload.new as PurchaseOrderRow | null
            if (!next?.id) return
            const rowEmail = String(next.buyer_email ?? '')
              .trim()
              .toLowerCase()
            if (rowEmail !== buyerEmail) return

            applyStageUpdate(
              next.id,
              String(next.current_stage ?? 'Origin Port'),
              String(next.last_updated ?? new Date().toISOString()),
            )
          },
        )
        .subscribe()
    } catch (err) {
      console.error('[portal/tracker] realtime subscribe failed', err)
    }

    return () => {
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [configured, buyerEmail, applyStageUpdate])

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
          Live purchase orders for{' '}
          <span className="font-semibold text-velvet">{session.displayName}</span>
          {session.email ? (
            <>
              {' '}
              · <span className="font-semibold text-velvet">{session.email}</span>
            </>
          ) : null}
          . Stages sync in real time from LeanChem Logistics — no refresh needed.
        </p>
      </header>

      {error ? (
        <div
          className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
        <aside className="rounded border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-velvet">Active Purchase Orders</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {loading ? 'Loading…' : `${activeOrders.length} open`}
            </p>
          </div>
          {loading && orders.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading orders…
            </div>
          ) : activeOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No active POs for this email. Ask LeanChem to link a purchase order to{' '}
              <span className="font-semibold">{buyerEmail || 'your account'}</span>.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activeOrders.map((po) => {
                const isSelected = po.poNumber === selectedPo
                return (
                  <li key={po.id}>
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

                {selected.chemicals.length > 0 ? (
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
                        <span className="text-xs font-semibold text-gray-500">
                          {chem.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <CorridorStepper order={selected} />
              </section>

              <LiveUpdatesFeed order={selected} />
            </>
          ) : (
            <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-16 text-center text-sm text-gray-500">
              {loading
                ? 'Loading corridor progress…'
                : 'Select an active purchase order to view corridor progress.'}
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
                  index < activeIndex ? 'bg-emerald-500' : 'bg-gray-200'
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
        Timestamped events for {order.poNumber} — updates appear instantly when Logistics
        advances the stage.
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
