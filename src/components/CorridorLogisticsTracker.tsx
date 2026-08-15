import { Check } from 'lucide-react'
import {
  ACTIVE_CORRIDOR_PO,
  CORRIDOR_STEPS,
  formatEatTimestamp,
  logsForPurchaseOrder,
  type CorridorPurchaseOrder,
} from '../data/corridorTracker'

interface CorridorLogisticsTrackerProps {
  /** Optional override; defaults to the active mock PO. */
  purchaseOrder?: CorridorPurchaseOrder
}

export function CorridorLogisticsTracker({
  purchaseOrder = ACTIVE_CORRIDOR_PO,
}: CorridorLogisticsTrackerProps) {
  const activeIndex = Math.min(
    Math.max(purchaseOrder.activeStepIndex, 0),
    CORRIDOR_STEPS.length - 1,
  )
  const liveUpdates = logsForPurchaseOrder(purchaseOrder)
  const activeStep = CORRIDOR_STEPS[activeIndex]!

  return (
    <div className="rounded border border-organza/30 bg-white p-5 shadow-[0_1px_3px_rgba(34,34,53,0.05)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-organza uppercase">
            Corridor Logistics Tracker
          </p>
          <h3 className="mt-1 text-lg font-bold text-velvet">{purchaseOrder.poNumber}</h3>
          <p className="mt-0.5 text-sm text-velvet/60">{purchaseOrder.productSummary}</p>
        </div>
        <p className="rounded bg-lapis/10 px-3 py-1.5 text-xs font-bold text-lapis">
          Active: {activeStep.label}
        </p>
      </div>

      {/* Horizontal progress stepper */}
      <ol
        className="mt-8 flex list-none items-start gap-0 overflow-x-auto pb-2"
        aria-label="Import corridor pipeline"
      >
        {CORRIDOR_STEPS.map((step, index) => {
          const isComplete = index < activeIndex
          const isActive = index === activeIndex
          const isFuture = index > activeIndex

          return (
            <li
              key={step.id}
              className="relative flex min-w-[7.5rem] flex-1 flex-col items-center px-1 sm:min-w-0"
            >
              {index < CORRIDOR_STEPS.length - 1 ? (
                <span
                  className={`absolute top-4 left-[calc(50%+1.1rem)] right-[calc(-50%+1.1rem)] h-0.5 ${
                    index < activeIndex ? 'bg-success' : 'bg-organza/35'
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
              <span className="sr-only">
                {isComplete ? 'Completed' : isActive ? 'Active' : 'Upcoming'}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Live Updates timeline — PO-filtered, EAT timestamps */}
      <div className="mt-8 border-t border-organza/25 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-sm font-bold text-velvet">Live Updates</h4>
          <p className="text-xs font-semibold text-velvet/45">
            {liveUpdates.length} event{liveUpdates.length === 1 ? '' : 's'} · {purchaseOrder.poNumber}
          </p>
        </div>

        {liveUpdates.length === 0 ? (
          <p className="mt-4 rounded border border-dashed border-organza/40 bg-canvas px-4 py-6 text-center text-sm text-velvet/55">
            No live updates for this purchase order yet.
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
                      isLatest ? 'bg-lapis timeline-pulse' : 'bg-organza/60'
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
    </div>
  )
}
