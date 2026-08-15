import { Link } from '@tanstack/react-router'
import type { Product } from '../../types/catalog'
import { DocumentVault } from './PdpParts'

interface ProductSidebarProps {
  product: Product
  inRfq: boolean
  onAdd: () => void
  onReview: () => void
}

export function ProductSidebar({ product, inRfq, onAdd, onReview }: ProductSidebarProps) {
  const stockLabel = product.inStock ? 'In stock — ready for RFQ' : 'Made to order'

  return (
    <div className="rounded border border-organza/35 bg-white p-5 shadow-[0_1px_3px_rgba(34,34,53,0.05)] md:p-6">
      <p className="text-xs font-semibold tracking-wide text-organza uppercase">
        Inventory status
      </p>
      <p
        className={`mt-1.5 text-sm font-bold ${product.inStock ? 'text-success' : 'text-velvet/60'}`}
        role="status"
        aria-label={`Stock status: ${stockLabel}`}
      >
        {stockLabel}
      </p>
      <p className="mt-1 text-sm text-velvet/60">Lead time: {product.leadTime}</p>

      <p className="mt-3.5">
        <span
          className="spec-pill border-lapis/30 text-lapis"
          aria-label={`Purity grade: ${product.purity}`}
        >
          {product.purity}
        </span>
      </p>

      <h2 className="mt-5 text-sm font-bold text-velvet">Packaging options</h2>
      <ul className="mt-2 space-y-1.5">
        {product.packagingOptions.map((opt) => (
          <li
            key={opt}
            className="rounded border border-organza/30 bg-canvas px-3 py-2 text-sm font-semibold text-velvet"
          >
            {opt}
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden space-y-2 lg:block">
        <button
          type="button"
          className="btn btn-primary w-full min-h-12 text-base shadow-[0_6px_16px_rgba(30,88,151,0.28)]"
          onClick={onAdd}
        >
          {inRfq ? 'Update in RFQ' : 'Add to RFQ'}
        </button>
        {inRfq ? (
          <button type="button" className="btn btn-secondary w-full" onClick={onReview}>
            Review RFQ
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-organza/25 pt-5">
        <DocumentVault
          tdsUrl={product.tdsUrl}
          sdsUrl={product.sdsUrl}
          coaUrl={product.coaUrl}
          updatedAt={product.sdsUpdatedAt}
        />
      </div>

      <ul className="mt-5 space-y-1.5 text-xs text-velvet/65">
        <li className="font-semibold text-velvet">Verified industrial grade pathway</li>
        <li className="font-semibold text-velvet">Corridor logistics available</li>
        <li className="font-semibold text-velvet">SDS / TDS available on request</li>
      </ul>

      <Link
        to="/portal"
        className="btn btn-ghost mt-3 w-full no-underline hover:no-underline"
      >
        Open Client Portal
      </Link>
    </div>
  )
}
