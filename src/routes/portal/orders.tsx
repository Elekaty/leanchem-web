import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ActionHubCard } from '../../components/ActionHubCard'
import { useLiveRegion } from '../../components/LiveRegion'
import { TimelineNode } from '../../components/TimelineNode'
import { MOCK_ORDERS } from '../../data/mockOrders'

export const Route = createFileRoute('/portal/orders')({
  head: () => ({
    meta: [{ title: 'Orders & Action Hub | LeanChem Portal' }],
  }),
  component: PortalOrdersPage,
})

function PortalOrdersPage() {
  const { announce } = useLiveRegion()
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_ORDERS[0]?.id ?? null)

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-velvet md:text-3xl">
          Orders & action hub
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-velvet/65">
          Track fulfillment steppers and complete required document uploads without leaving the
          portal.
        </p>
      </header>

      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => {
          const expanded = expandedId === order.id
          return (
            <article
              key={order.id}
              className="rounded-lg border border-organza/35 bg-white p-5 shadow-[0_1px_2px_rgba(34,34,53,0.04)]"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setExpandedId(expanded ? null : order.id)}
                aria-expanded={expanded}
              >
                <div>
                  <p className="text-xs font-semibold text-organza">{order.id}</p>
                  <h2 className="mt-1 text-lg font-bold text-velvet">{order.productName}</h2>
                  <p className="mt-1 text-sm font-semibold text-lapis">CAS {order.casNumber}</p>
                </div>
                <span className="text-sm font-semibold text-adamantine">
                  {expanded ? 'Collapse' : 'Expand'}
                </span>
              </button>

              {expanded ? (
                <ol className="mt-6 list-none p-0">
                  {order.steps.map((step, index) => (
                    <TimelineNode
                      key={step.id}
                      status={step.status}
                      label={step.label}
                      timestamp={step.timestamp}
                      isLast={index === order.steps.length - 1}
                    >
                      {step.taskType ? (
                        <ActionHubCard
                          taskType={step.taskType}
                          orderId={order.id}
                          onAnnounce={announce}
                        />
                      ) : null}
                    </TimelineNode>
                  ))}
                </ol>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}
