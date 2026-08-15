import { useRef, useState, type FormEvent } from 'react'
import { useLiveRegion } from './LiveRegion'
import { generateRfqReference, useRfq } from '../context/RfqContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { CloseIcon } from './Icons'
import type {
  RfqIncoterm,
  RfqPreferredPackaging,
  RfqQuotePayload,
  RfqVolumeUnit,
} from '../types/catalog'

const VOLUME_UNITS: RfqVolumeUnit[] = ['MT', 'L', 'kg']
const PACKAGING_OPTIONS: RfqPreferredPackaging[] = ['Drums', 'IBCs', 'Bags']
const INCOTERMS: RfqIncoterm[] = ['FOB', 'DDP']

const fieldClass =
  'mt-1.5 w-full rounded border border-organza/40 bg-canvas px-3 py-2.5 text-sm font-normal text-velvet outline-none focus:border-adamantine'

export function RfqCheckoutModal() {
  const { items, checkoutOpen, closeCheckout, openDrawer, clear } = useRfq()
  const { announce } = useLiveRegion()
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, checkoutOpen)

  const [expectedVolume, setExpectedVolume] = useState('')
  const [unit, setUnit] = useState<RfqVolumeUnit>('MT')
  const [packaging, setPackaging] = useState<RfqPreferredPackaging>('Drums')
  const [incoterms, setIncoterms] = useState<RfqIncoterm>('FOB')
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  if (!checkoutOpen) return null

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      announce('Add at least one chemical before submitting a quote request.')
      return
    }

    const volume = Number(expectedVolume)
    if (!Number.isFinite(volume) || volume <= 0) {
      announce('Enter a valid expected volume greater than zero.')
      return
    }

    const reference = generateRfqReference()
    const payload: RfqQuotePayload = {
      reference,
      submittedAt: new Date().toISOString(),
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        casNumber: item.casNumber,
        lineQuantity: item.quantity,
        linePackaging: item.packaging,
        lineNotes: item.notes,
      })),
      batch: {
        expectedVolume: volume,
        unit,
        packaging,
        incoterms,
      },
    }

    console.log(JSON.stringify(payload, null, 2))
    console.log('[LeanChem RFQ] Quote payload', payload)

    setSubmittedRef(reference)
    clear()
    announce(`Quote request ${reference} prepared. Payload logged to console.`)
  }

  const onClose = () => {
    setSubmittedRef(null)
    closeCheckout()
  }

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-velvet/45"
        aria-label="Close quote form"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-checkout-title"
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl outline-none md:inset-y-8 md:bottom-auto md:rounded-xl"
      >
        <header className="flex items-center justify-between border-b border-organza/30 px-5 py-4">
          <div>
            <h2 id="rfq-checkout-title" className="text-lg font-bold text-velvet">
              Request Quote
            </h2>
            <p className="text-xs text-velvet/55">
              Global order details for {items.length} chemical
              {items.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-organza/40 text-velvet"
            aria-label="Close quote form"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {submittedRef ? (
            <div className="rounded border border-success/35 bg-success/5 p-5" role="status">
              <p className="text-xs font-semibold tracking-wide text-success uppercase">
                Quote payload ready
              </p>
              <p className="mt-2 text-xl font-bold text-velvet">{submittedRef}</p>
              <p className="mt-2 text-sm leading-relaxed text-velvet/65">
                Structured JSON was logged to the browser console for API handoff. Cart cleared.
              </p>
              <button type="button" className="btn btn-primary mt-5" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form id="rfq-checkout-form" className="space-y-6" onSubmit={onSubmit}>
              <section>
                <h3 className="text-sm font-bold text-lapis">Selected chemicals</h3>
                {items.length === 0 ? (
                  <p className="mt-2 rounded border border-dashed border-organza/40 bg-canvas px-3 py-4 text-sm text-velvet/60">
                    Your RFQ cart is empty. Add grades from the catalog first.
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-organza/25 rounded border border-organza/30">
                    {items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-start justify-between gap-3 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-velvet">{item.name}</p>
                          <p className="text-xs font-semibold text-lapis">CAS {item.casNumber}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-lapis">Global order details</h3>

                <div>
                  <span className="text-sm font-semibold text-velvet">Expected Volume</span>
                  <div className="mt-1.5 grid grid-cols-[1fr_7rem] gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={expectedVolume}
                      onChange={(e) => setExpectedVolume(e.target.value)}
                      placeholder="e.g. 24"
                      className={`${fieldClass} mt-0`}
                      aria-label="Expected volume"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as RfqVolumeUnit)}
                      className={`${fieldClass} mt-0`}
                      aria-label="Unit"
                    >
                      {VOLUME_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="block text-sm font-semibold text-velvet">
                  Packaging
                  <select
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value as RfqPreferredPackaging)}
                    className={fieldClass}
                  >
                    {PACKAGING_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-velvet">
                  Incoterms
                  <select
                    value={incoterms}
                    onChange={(e) => setIncoterms(e.target.value as RfqIncoterm)}
                    className={fieldClass}
                  >
                    {INCOTERMS.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
            </form>
          )}
        </div>

        {!submittedRef ? (
          <footer className="border-t border-organza/30 p-4">
            <button
              type="submit"
              form="rfq-checkout-form"
              className="btn btn-primary w-full"
              disabled={items.length === 0}
            >
              Submit quote request
            </button>
            <button
              type="button"
              className="btn btn-ghost mt-2 w-full"
              onClick={() => {
                closeCheckout()
                openDrawer()
              }}
            >
              Back to cart
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  )
}
