import { createFileRoute } from '@tanstack/react-router'
import { useLiveRegion } from '../../components/LiveRegion'
import { useRfq } from '../../context/RfqContext'
import {
  PORTAL_PURCHASE_ORDERS,
  portalLineToProduct,
  type PortalOrderStatus,
  type PortalPurchaseOrder,
} from '../../data/portalDashboard'

export const Route = createFileRoute('/portal/orders')({
  head: () => ({
    meta: [{ title: 'Order History | LeanChem Portal' }],
  }),
  component: PortalOrdersPage,
})

const STATUS_CLASS: Record<PortalOrderStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Quoted: 'bg-blue-50 text-lapis',
  Processing: 'bg-amber-50 text-amber-900',
  Shipped: 'bg-emerald-50 text-emerald-800',
}

function PortalOrdersPage() {
  const { addProduct, openDrawer } = useRfq()
  const { announce } = useLiveRegion()

  const reorder = (po: PortalPurchaseOrder) => {
    po.items.forEach((line, index) => {
      addProduct(portalLineToProduct(line), {
        packaging: line.packaging,
        quantity: line.quantity,
        openDrawer: index === po.items.length - 1,
      })
    })
    if (po.items.length === 0) openDrawer()
    announce(`Reordered ${po.poNumber} — ${po.items.length} item(s) added to RFQ cart.`)
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-velvet md:text-3xl">
          Order History
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-velvet/65">
          Purchase orders for your company. Reorder pushes line items into the RFQ cart.
        </p>
      </header>

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
                  PO Number
                </th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Items
                </th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Total Volume
                </th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-600 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PORTAL_PURCHASE_ORDERS.map((po) => (
                <tr key={po.poNumber} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-bold whitespace-nowrap text-velvet">
                    {po.poNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{po.date}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="font-semibold text-velvet">{po.items.length}</span>
                    <span className="mt-0.5 block max-w-xs truncate text-xs text-gray-500">
                      {po.items.map((i) => i.name).join(', ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap text-velvet">
                    {po.totalVolume}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded px-2 py-1 text-xs font-bold ${STATUS_CLASS[po.status]}`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      type="button"
                      className="btn btn-secondary h-9 min-h-9 px-3 text-xs"
                      onClick={() => reorder(po)}
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
