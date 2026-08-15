import { useMemo, useRef, useState, type FormEvent } from 'react'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { Check, Mail, Phone, Upload } from 'lucide-react'
import { useLiveRegion } from '../../components/LiveRegion'
import { useAuth } from '../../context/AuthContext'
import { useCommunication } from '../../context/CommunicationContext'
import {
  CORRIDOR_STEPS,
  DEMO_BUYER_ACCOUNT_ID,
  formatEatTimestamp,
  ordersForAccount,
  stepLabelForIndex,
  type CorridorPurchaseOrder,
} from '../../data/corridorTracker'

export const Route = createFileRoute('/portal/tracker')({
  head: () => ({
    meta: [{ title: 'Tracker | LeanChem Portal' }],
  }),
  component: PortalTrackerPage,
})

function PortalTrackerPage() {
  const { session } = useAuth()
  if (!session.isLoggedIn) return <Navigate to="/portal" />

  const accountId = session.accountId || DEMO_BUYER_ACCOUNT_ID
  const orders = useMemo(() => ordersForAccount(accountId), [accountId])
  const openOrders = orders.filter((o) => o.lifecycle === 'open')
  const closedOrders = orders.filter((o) => o.lifecycle === 'closed')

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Communication Engine · Front Engine
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-velvet md:text-3xl">
          Tracker
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-velvet/65">
          Personalized for <strong>{session.displayName}</strong>
          {session.companyName ? (
            <>
              {' '}
              at <strong>{session.companyName}</strong>
            </>
          ) : null}
          . See every chemical order on your account, its corridor stage, upload invoices, and reach
          your account manager.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="open-orders-heading">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 id="open-orders-heading" className="text-sm font-bold text-velvet">
                Open orders ({openOrders.length})
              </h2>
              <p className="text-xs font-semibold text-gray-500">Concurrent chemical POs</p>
            </div>
            {openOrders.length === 0 ? (
              <EmptyState text="No open shipments on your account right now." />
            ) : (
              <ul className="space-y-4">
                {openOrders.map((po) => (
                  <li key={po.poNumber}>
                    <OrderStageCard order={po} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="closed-orders-heading">
            <h2 id="closed-orders-heading" className="mb-3 text-sm font-bold text-velvet">
              Closed orders ({closedOrders.length})
            </h2>
            {closedOrders.length === 0 ? (
              <EmptyState text="No closed orders yet." />
            ) : (
              <ul className="space-y-4">
                {closedOrders.map((po) => (
                  <li key={po.poNumber}>
                    <OrderStageCard order={po} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <AccountManagerPanel />
          <InvoiceUploadPanel orders={orders} />
          <CommsThreadPanel />
        </aside>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
      {text}
    </p>
  )
}

function OrderStageCard({ order }: { order: CorridorPurchaseOrder }) {
  const isClosed = order.lifecycle === 'closed'
  const activeIndex = order.activeStepIndex
  const stage = stepLabelForIndex(activeIndex)

  return (
    <article className="rounded border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-velvet">{order.poNumber}</p>
          <p className="mt-0.5 text-xs text-gray-500">{order.productSummary}</p>
        </div>
        <span
          className={`rounded px-2.5 py-1 text-xs font-bold ${
            isClosed ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-lapis'
          }`}
        >
          {isClosed ? 'Closed · Delivered' : `Open · ${stage}`}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
        {order.chemicals.map((chem) => (
          <li
            key={`${order.poNumber}-${chem.casNumber}-${chem.name}`}
            className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
          >
            <span>
              <span className="font-semibold text-velvet">{chem.name}</span>
              <span className="ml-2 text-xs font-semibold text-lapis">CAS {chem.casNumber}</span>
            </span>
            <span className="text-xs font-semibold text-gray-500">{chem.quantity}</span>
          </li>
        ))}
      </ul>

      {/* Compact multi-order stage strip */}
      <ol
        className="mt-4 flex list-none items-center gap-0 overflow-x-auto pb-1"
        aria-label={`Stage for ${order.poNumber}`}
      >
        {CORRIDOR_STEPS.map((step, index) => {
          const isComplete = isClosed || index < activeIndex
          const isActive = !isClosed && index === activeIndex
          return (
            <li key={step.id} className="relative flex min-w-[4.5rem] flex-1 flex-col items-center">
              {index < CORRIDOR_STEPS.length - 1 ? (
                <span
                  className={`absolute top-2.5 left-[55%] right-[-45%] h-0.5 ${
                    isClosed || index < activeIndex ? 'bg-success' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={`relative z-[1] flex h-5 w-5 items-center justify-center rounded-full border text-[0.55rem] font-bold ${
                  isComplete
                    ? 'border-success bg-success text-white'
                    : isActive
                      ? 'timeline-pulse border-lapis bg-lapis text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-400'
                }`}
              >
                {isComplete ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={`mt-1 max-w-[4.2rem] text-center text-[0.58rem] font-semibold leading-tight ${
                  isActive ? 'text-lapis' : isComplete ? 'text-success' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </article>
  )
}

function AccountManagerPanel() {
  const { accountManager } = useCommunication()

  if (!accountManager) {
    return (
      <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-500">
        No account manager assigned yet.
      </div>
    )
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Your account manager
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-lapis text-sm font-bold text-white"
          aria-hidden="true"
        >
          {accountManager.photoInitials}
        </div>
        <div>
          <p className="text-sm font-bold text-velvet">{accountManager.fullName}</p>
          <p className="text-xs text-gray-500">{accountManager.title}</p>
        </div>
      </div>
      <dl className="mt-3 space-y-1.5 text-xs text-gray-600">
        <div>
          <dt className="sr-only">Languages</dt>
          <dd>{accountManager.languages.join(' · ')}</dd>
        </div>
        <div>
          <dt className="sr-only">Availability</dt>
          <dd>{accountManager.availability}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <a
          href={`mailto:${accountManager.email}?subject=LeanChem%20account%20question`}
          className="btn btn-primary h-10 min-h-10 text-xs no-underline hover:no-underline"
        >
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          Email {accountManager.fullName.split(' ')[0]}
        </a>
        <a
          href={`tel:${accountManager.phone}`}
          className="btn btn-secondary h-10 min-h-10 text-xs no-underline hover:no-underline"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          Call {accountManager.phoneDisplay}
        </a>
        <a
          href={accountManager.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost h-9 min-h-9 text-xs no-underline hover:no-underline"
        >
          WhatsApp
        </a>
      </div>
      <p className="mt-3 break-all text-xs text-gray-500">{accountManager.email}</p>
    </div>
  )
}

function InvoiceUploadPanel({ orders }: { orders: CorridorPurchaseOrder[] }) {
  const { invoices, uploadInvoice } = useCommunication()
  const { announce } = useLiveRegion()
  const fileRef = useRef<HTMLInputElement>(null)
  const [poNumber, setPoNumber] = useState(orders[0]?.poNumber ?? '')

  const onPick = () => fileRef.current?.click()

  const onFile = (file: File | undefined) => {
    if (!file || !poNumber) return
    uploadInvoice(poNumber, file)
    announce(`Invoice ${file.name} uploaded for ${poNumber}.`)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Upload invoices
      </p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Attach commercial invoices to a PO. Files stay on this device for now — ready for the
        Communication Engine API later.
      </p>
      <label className="mt-3 block text-xs font-semibold text-velvet">
        Purchase order
        <select
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          className="mt-1 h-10 w-full rounded border border-gray-200 bg-gray-50 px-2 text-sm font-normal"
        >
          {orders.map((o) => (
            <option key={o.poNumber} value={o.poNumber}>
              {o.poNumber}
            </option>
          ))}
        </select>
      </label>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button type="button" className="btn btn-secondary mt-3 w-full text-xs" onClick={onPick}>
        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
        Choose invoice file
      </button>
      {invoices.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {invoices.slice(0, 5).map((inv) => (
            <li key={inv.id} className="text-xs">
              <p className="font-semibold text-velvet">{inv.fileName}</p>
              <p className="text-gray-500">
                {inv.poNumber} · {formatEatTimestamp(inv.uploadedAt)} · {inv.status}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function CommsThreadPanel() {
  const { messages, sendMessage, accountManager } = useCommunication()
  const [draft, setDraft] = useState('')
  const { announce } = useLiveRegion()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    sendMessage(draft)
    announce('Message sent to your account manager.')
    setDraft('')
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Messages
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Early Communication Engine thread with{' '}
        {accountManager?.fullName ?? 'your account manager'}.
      </p>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded px-2.5 py-2 text-xs leading-relaxed ${
              m.direction === 'buyer'
                ? 'ml-4 bg-lapis/10 text-velvet'
                : 'mr-4 bg-gray-50 text-gray-700'
            }`}
          >
            <p className="font-semibold text-[0.65rem] tracking-wide uppercase text-gray-500">
              {m.direction === 'buyer' ? 'You' : accountManager?.fullName.split(' ')[0] ?? 'Manager'}{' '}
              · {formatEatTimestamp(m.createdAt)}
            </p>
            <p className="mt-0.5">{m.body}</p>
          </li>
        ))}
      </ul>
      <form className="mt-3 space-y-2" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="comms-draft">
          Message
        </label>
        <textarea
          id="comms-draft"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about a PO stage, invoice, or delivery slot…"
          className="w-full rounded border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-adamantine"
        />
        <button type="submit" className="btn btn-primary w-full text-xs">
          Send message
        </button>
      </form>
      <p className="mt-2 text-[0.65rem] text-gray-400">
        Or{' '}
        <Link to="/contact" className="font-semibold text-lapis no-underline hover:underline">
          open a formal RFQ
        </Link>{' '}
        from the Front Engine.
      </p>
    </div>
  )
}
