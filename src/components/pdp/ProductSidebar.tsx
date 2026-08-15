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
    <div className="rounded-lg border border-organza/35 bg-white p-6 shadow-[0_1px_3px_rgba(34,34,53,0.05)]">
      <p className="text-xs font-semibold tracking-wide text-organza uppercase">
        Inventory status
      </p>
      <p
        className={`mt-2 text-sm font-bold ${product.inStock ? 'text-success' : 'text-velvet/60'}`}
        role="status"
        aria-label={`Stock status: ${stockLabel}`}
      >
        {stockLabel}
      </p>
      <p className="mt-1 text-sm text-velvet/60">Lead time: {product.leadTime}</p>

      <p className="mt-4">
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

      <button
        type="button"
        className="btn btn-primary mt-6 hidden w-full min-h-12 text-base lg:inline-flex"
        onClick={onAdd}
      >
        {inRfq ? 'Update in RFQ' : 'Add to RFQ'}
      </button>
      {inRfq ? (
        <button
          type="button"
          className="btn btn-secondary mt-2 hidden w-full lg:inline-flex"
          onClick={onReview}
        >
          Review RFQ
        </button>
      ) : null}

      <div className="mt-6 space-y-2">
        <a
          href={product.tdsUrl}
          className="btn btn-secondary flex min-h-10 w-full no-underline hover:no-underline"
        >
          Download TDS
        </a>
        <a
          href={product.sdsUrl}
          className="btn btn-secondary flex min-h-10 w-full no-underline hover:no-underline"
        >
          Download SDS
        </a>
      </div>

      <div className="mt-6">
        <DocumentVault
          tdsUrl={product.tdsUrl}
          sdsUrl={product.sdsUrl}
          coaUrl={product.coaUrl}
          updatedAt={product.sdsUpdatedAt}
        />
      </div>

      <ul className="mt-6 space-y-2 border-t border-organza/25 pt-5 text-xs text-velvet/65">
        <li className="font-semibold text-velvet">✓ Verified industrial grade pathway</li>
        <li className="font-semibold text-velvet">✓ Corridor logistics available</li>
        <li className="font-semibold text-velvet">✓ SDS / TDS on request</li>
      </ul>

      <Link
        to="/portal"
        className="btn btn-ghost mt-4 w-full no-underline hover:no-underline"
      >
        Open Client Portal
      </Link>
    </div>
  )
}
