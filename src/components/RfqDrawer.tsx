import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useRfq } from '../context/RfqContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { CloseIcon } from './Icons'

export function RfqDrawer() {
  const {
    items,
    itemCount,
    drawerOpen,
    closeDrawer,
    updateItem,
    removeItem,
  } = useRfq()
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, drawerOpen)

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-velvet/40"
        aria-label="Close RFQ drawer"
        onClick={closeDrawer}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-drawer-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl outline-none"
      >
        <header className="flex items-center justify-between border-b border-organza/30 px-4 py-4">
          <div>
            <h2 id="rfq-drawer-title" className="text-lg font-bold text-velvet">
              Your RFQ
            </h2>
            <p className="text-xs text-velvet/55">
              {itemCount === 0
                ? 'No products yet'
                : `${itemCount} product${itemCount === 1 ? '' : 's'} selected`}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-organza/40 text-velvet"
            aria-label="Close RFQ"
            onClick={closeDrawer}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-organza/35 bg-canvas px-5 py-12 text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lapis/8 text-lapis"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M8 7h11l-1.2 10.2a2 2 0 0 1-2 1.8H11a2 2 0 0 1-2-1.8L7.2 4H4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="20" r="1.2" fill="currentColor" stroke="none" />
                  <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <p className="text-sm font-bold text-velvet">No products in this RFQ yet</p>
              <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-relaxed text-velvet/60">
                Add grades from the catalog or a product page, then submit one multi-line request.
              </p>
              <Link
                to="/catalog"
                className="btn btn-secondary mt-5 no-underline hover:no-underline"
                onClick={closeDrawer}
              >
                Browse catalog
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="rounded-lg border border-organza/30 bg-canvas/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to="/catalog/$slug"
                        params={{ slug: item.slug }}
                        className="text-sm font-bold text-velvet no-underline hover:text-lapis hover:no-underline"
                        onClick={closeDrawer}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs font-semibold text-lapis">
                        CAS {item.casNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-semibold text-error hover:underline"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>

                  <label className="mt-3 block text-xs font-semibold text-velvet/70">
                    Packaging
                    <input
                      value={item.packaging}
                      onChange={(e) =>
                        updateItem(item.productId, { packaging: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-organza/40 bg-white px-2 py-1.5 text-sm font-normal text-velvet"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-semibold text-velvet/70">
                    Quantity / volume
                    <input
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.productId, { quantity: e.target.value })
                      }
                      placeholder="e.g. 4 × 200 L / month"
                      className="mt-1 w-full rounded border border-organza/40 bg-white px-2 py-1.5 text-sm font-normal text-velvet"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-semibold text-velvet/70">
                    Line notes
                    <textarea
                      value={item.notes}
                      onChange={(e) =>
                        updateItem(item.productId, { notes: e.target.value })
                      }
                      rows={2}
                      placeholder="Grade preference, Incoterms, trial vs offtake…"
                      className="mt-1 w-full resize-y rounded border border-organza/40 bg-white px-2 py-1.5 text-sm font-normal text-velvet"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-organza/30 p-4">
          <Link
            to="/contact"
            search={{ fromRfq: '1' }}
            className={`btn btn-primary flex w-full no-underline hover:no-underline ${
              items.length === 0 ? 'pointer-events-none opacity-50' : ''
            }`}
            onClick={closeDrawer}
            aria-disabled={items.length === 0}
          >
            Submit RFQ
          </Link>
          <Link
            to="/catalog"
            className="btn btn-ghost mt-2 flex w-full no-underline hover:no-underline"
            onClick={closeDrawer}
          >
            Add more products
          </Link>
        </footer>
      </div>
    </div>
  )
}

export function RfqHeaderButton() {
  const { itemCount, openDrawer } = useRfq()
  const label = itemCount > 0 ? `Review RFQ (${itemCount})` : 'Review RFQ'

  return (
    <button
      type="button"
      className={`relative inline-flex h-11 items-center gap-2 rounded border px-3.5 text-sm font-semibold transition ${
        itemCount > 0
          ? 'border-lapis/45 bg-lapis/5 text-lapis'
          : 'border-organza/40 text-lapis hover:border-adamantine'
      }`}
      onClick={openDrawer}
      aria-label={
        itemCount > 0
          ? `Review RFQ, ${itemCount} item${itemCount === 1 ? '' : 's'}`
          : 'Review RFQ'
      }
    >
      {label}
      {itemCount > 0 ? (
        <span
          className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-lapis px-1.5 text-[0.65rem] font-bold leading-none text-white"
          aria-hidden="true"
        >
          {itemCount}
        </span>
      ) : null}
    </button>
  )
}
