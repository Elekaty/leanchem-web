import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionHubCard } from '../components/ActionHubCard/ActionHubCard'
import { TimelineNode } from '../components/TimelineNode/TimelineNode'
import { useAuth } from '../context/AuthContext'
import { ApiClientError } from '../api/client'
import { fetchOrders, type OrderListItem } from '../api/leanchem'
import './TrackingPage.css'

export function TrackingPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmptyPreview, setShowEmptyPreview] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrders()
      setOrders(data)
    } catch (err) {
      setOrders([])
      setError(err instanceof ApiClientError ? err.message : 'Unable to retrieve orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session.isLoggedIn) {
      setOrders([])
      return
    }
    void loadOrders()
  }, [session.isLoggedIn, session.tier])

  const visibleOrders = showEmptyPreview ? [] : orders

  const liveMessage = useMemo(() => {
    const required = visibleOrders.some((o) =>
      o.timeline.some((s) => s.status === 'Action_Required'),
    )
    return required ? 'Action required on one or more orders.' : ''
  }, [visibleOrders])

  if (!session.isLoggedIn) {
    return (
      <div className="tracking-page">
        <h1 className="page-title">Order Tracking</h1>
        <p className="page-subtitle">Log in to view active shipments and required actions.</p>
        <Link to="/" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="tracking-page">
      <header className="tracking-page__header">
        <div>
          <h1 className="page-title">Order Tracking</h1>
          <p className="page-subtitle">
            Follow each order as a continuous narrative from placement through delivery.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setShowEmptyPreview((v) => !v)}
        >
          {showEmptyPreview ? 'Show orders' : 'Preview empty state'}
        </button>
      </header>

      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>

      {loading ? <p>Loading orders…</p> : null}
      {error ? (
        <div className="catalog-state">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => void loadOrders()}>
            Retry Connection
          </button>
        </div>
      ) : null}

      {!loading && !error && visibleOrders.length === 0 ? (
        <div className="tracking-empty">
          <div
            className="tracking-empty__visual"
            role="img"
            aria-label="Container ship at industrial port"
          />
          <p className="tracking-empty__title">You have no active orders.</p>
          <Link to="/" className="btn btn-primary">
            Return to Catalog
          </Link>
        </div>
      ) : null}

      {!loading && !error && visibleOrders.length > 0 ? (
        <div className="tracking-orders">
          {visibleOrders.map((order) => (
            <article key={order.id} className="tracking-order">
              <header className="tracking-order__header">
                <div>
                  <h2 className="tracking-order__id">{order.id.slice(0, 8).toUpperCase()}</h2>
                  <p className="tracking-order__product">{order.product_name ?? 'Order'}</p>
                </div>
                <p className="tracking-order__cas">{order.cas_number ?? order.status.ui_display}</p>
              </header>
              <ol className="tracking-timeline" aria-live="polite">
                {order.timeline.map((step, index) => (
                  <TimelineNode
                    key={step.id}
                    status={step.status}
                    label={step.label}
                    isLast={index === order.timeline.length - 1}
                  >
                    {step.taskType ? (
                      <ActionHubCard
                        taskType={step.taskType}
                        isExpanded={step.status === 'Action_Required'}
                        orderId={order.id}
                      />
                    ) : null}
                  </TimelineNode>
                ))}
              </ol>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
