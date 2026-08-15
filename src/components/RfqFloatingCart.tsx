import { ShoppingCart } from 'lucide-react'
import { useRfq } from '../context/RfqContext'

/** Sticky floating RFQ cart control — bottom-right, shows live item count. */
export function RfqFloatingCart() {
  const { itemCount, openDrawer, drawerOpen, checkoutOpen } = useRfq()

  if (drawerOpen || checkoutOpen) return null

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="fixed right-5 bottom-6 z-50 flex h-14 items-center gap-2.5 rounded-full bg-lapis px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(30,88,151,0.35)] transition hover:bg-[#184a7f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adamantine"
      aria-label={
        itemCount > 0
          ? `Open RFQ cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`
          : 'Open RFQ cart'
      }
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
      <span>RFQ Cart</span>
      <span
        className={`inline-flex min-h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold leading-none ${
          itemCount > 0 ? 'bg-white text-lapis' : 'bg-white/20 text-white'
        }`}
        aria-hidden="true"
      >
        {itemCount}
      </span>
    </button>
  )
}
