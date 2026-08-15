import type { Product } from '../types/catalog'
import { CategoryGlyph } from './Icons'

interface CatalogRowProps {
  productData: Product
  isTierVerified: boolean
  onRowClick: (product: Product) => void
  isExpanded?: boolean
  drawerId?: string
  rowRef?: (el: HTMLButtonElement | null) => void
}

export function CatalogRow({
  productData,
  isTierVerified,
  onRowClick,
  isExpanded = false,
  drawerId = 'quick-view-drawer',
  rowRef,
}: CatalogRowProps) {
  return (
    <button
      type="button"
      ref={rowRef}
      onClick={() => onRowClick(productData)}
      aria-expanded={isExpanded}
      aria-controls={drawerId}
      className="hover-lift grid w-full grid-cols-1 items-start gap-3 rounded-lg border border-organza/35 bg-white p-3 text-left shadow-[0_1px_2px_rgba(34,34,53,0.04)] md:grid-cols-[64px_7.5rem_minmax(0,1.4fr)_auto_5.5rem_6.5rem] md:items-center md:gap-4 md:px-4 md:py-3"
    >
      <span className="shrink-0">
        <CategoryGlyph category={productData.category || productData.physicalState} />
      </span>

      <span className="font-semibold whitespace-nowrap text-lapis md:text-sm">
        {productData.casNumber}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-velvet">{productData.name}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5 md:hidden">
          <span className="spec-pill">{productData.purity} Purity</span>
          <span className="spec-pill">{productData.physicalState}</span>
          {!isTierVerified ? (
            <span className="spec-pill border-error/30 text-error">Pricing locked</span>
          ) : null}
        </span>
        <span className="mt-2 grid grid-cols-2 gap-2 text-xs text-velvet/60 md:hidden">
          <span>
            <span className="font-semibold text-velvet/80">MOQ</span> {productData.moq}
          </span>
          <span>
            <span className="font-semibold text-velvet/80">Lead</span> {productData.leadTime}
          </span>
        </span>
      </span>

      <span className="hidden flex-wrap gap-1.5 md:flex">
        <span className="spec-pill">{productData.purity} Purity</span>
        <span className="spec-pill">{productData.physicalState}</span>
        {!isTierVerified ? (
          <span className="spec-pill border-error/30 text-error">Pricing locked</span>
        ) : null}
      </span>

      <span className="hidden text-sm font-semibold text-velvet md:block">{productData.moq}</span>
      <span className="hidden text-sm text-velvet/70 md:block">{productData.leadTime}</span>
    </button>
  )
}

export function CatalogRowSkeleton() {
  return (
    <div
      className="grid grid-cols-1 items-center gap-3 rounded-lg border border-organza/25 bg-white p-3 md:grid-cols-[64px_7.5rem_minmax(0,1.4fr)_auto_5.5rem_6.5rem] md:gap-4 md:px-4"
      aria-hidden="true"
    >
      <span className="skel h-16 w-16" />
      <span className="skel h-4 w-24" />
      <span className="skel h-4 w-full" />
      <span className="skel hidden h-6 w-28 md:block" />
      <span className="skel hidden h-4 w-16 md:block" />
      <span className="skel hidden h-4 w-20 md:block" />
    </div>
  )
}
