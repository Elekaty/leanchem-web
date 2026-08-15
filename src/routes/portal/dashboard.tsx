import { createFileRoute, Link } from '@tanstack/react-router'
import { CorridorLogisticsTracker } from '../../components/CorridorLogisticsTracker'
import { PORTAL_METRICS, PORTAL_PURCHASE_ORDERS } from '../../data/portalDashboard'

export const Route = createFileRoute('/portal/dashboard')({
  head: () => ({
    meta: [{ title: 'Dashboard | LeanChem Portal' }],
  }),
  component: PortalDashboardPage,
})

function PortalDashboardPage() {
  const recent = PORTAL_PURCHASE_ORDERS.slice(0, 3)

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-velvet md:text-3xl">Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-velvet/65">
          High-level procurement status for your company account.
        </p>
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-3">
        {PORTAL_METRICS.map((metric) => (
          <article
            key={metric.id}
            className="rounded border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-velvet">{metric.value}</p>
            <p className="mt-2 text-sm text-gray-500">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="my-shipments-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="my-shipments-heading" className="text-sm font-bold text-velvet">
            My corridor shipments
          </h2>
          <Link
            to="/portal/tracker"
            className="text-xs font-semibold text-lapis no-underline hover:underline"
          >
            Open Tracker →
          </Link>
        </div>
        <CorridorLogisticsTracker />
      </section>

      <section className="mt-8 rounded border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h2 className="text-sm font-bold text-velvet">Recent purchase orders</h2>
          <p className="text-xs font-semibold text-gray-500">Last 30 days</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {recent.map((po) => (
            <li
              key={po.poNumber}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-bold text-velvet">{po.poNumber}</p>
                <p className="text-xs text-gray-500">
                  {po.date} · {po.items.length} item{po.items.length === 1 ? '' : 's'} ·{' '}
                  {po.totalVolume}
                </p>
              </div>
              <StatusPill status={po.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700',
    Quoted: 'bg-blue-50 text-lapis',
    Processing: 'bg-amber-50 text-amber-900',
    Shipped: 'bg-emerald-50 text-emerald-800',
  }
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-bold ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {status}
    </span>
  )
}
