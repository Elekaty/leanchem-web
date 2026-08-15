import { ShoppingCart } from 'lucide-react'
import { useRfq } from '../context/RfqContext'

/**
 * Global floating RFQ cart — fixed bottom-right, persists across pages via root layout.
 * Alias export: FloatingCart (Task 1 naming).
 */
export function RfqFloatingCart() {
  const { itemCount, openDrawer, drawerOpen, checkoutOpen } = useRfq()

  if (drawerOpen || checkoutOpen) return null

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="fixed right-5 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-lapis text-white shadow-[0_10px_28px_rgba(30,88,151,0.4)] transition hover:bg-[#184a7f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adamantine md:right-6"
      aria-label={
        itemCount > 0
          ? `Open RFQ cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`
          : 'Open RFQ cart'
      }
    >
      <ShoppingCart className="h-6 w-6" aria-hidden="true" strokeWidth={1.75} />
      <span
        className={`absolute -top-1 -right-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold leading-none ${
          itemCount > 0 ? 'bg-white text-lapis ring-2 ring-lapis' : 'bg-velvet/80 text-white'
        }`}
      >
        {itemCount}
        <span className="sr-only"> items in RFQ cart</span>
      </span>
    </button>
  )
}

/** Spec name for the global floating cart control. */
export const FloatingCart = RfqFloatingCart
