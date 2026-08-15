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
            <div className="rounded-lg border border-dashed border-organza/40 bg-canvas p-6 text-center">
              <p className="text-sm text-velvet/65">
                Add grades from the catalog or product pages, then submit one multi-line RFQ.
              </p>
              <Link
                to="/catalog"
                className="btn btn-secondary mt-4 no-underline hover:no-underline"
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

  return (
    <button
      type="button"
      className="relative inline-flex h-10 items-center gap-2 rounded border border-organza/40 px-3 text-sm font-semibold text-lapis hover:border-adamantine"
      onClick={openDrawer}
      aria-label={
        itemCount > 0 ? `Review RFQ, ${itemCount} items` : 'Review RFQ'
      }
    >
      Review RFQ
      {itemCount > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-lapis px-1.5 text-[0.65rem] font-bold text-white">
          {itemCount}
          <span className="sr-only"> items in RFQ</span>
        </span>
      ) : null}
    </button>
  )
}
