import { Link } from '@tanstack/react-router'
import { useRfq } from '../context/RfqContext'
import { useLiveRegion } from './LiveRegion'
import type { Product } from '../types/catalog'
import { CategoryGlyph, HazardPictogramIcon } from './Icons'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct, hasProduct } = useRfq()
  const { announce } = useLiveRegion()
  const inRfq = hasProduct(product.id)
  const packLabel = product.packagingOptions[0] ?? product.packaging.split('/')[0]?.trim()
  const stockLabel = product.inStock ? 'In stock' : 'Made to order'

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-organza/30 bg-white transition hover:border-organza/55">
      <div className="relative flex h-[100px] items-center justify-between gap-3 bg-[linear-gradient(135deg,#EEF4FA_0%,#F8FAFC_100%)] px-4">
        <CategoryGlyph category={product.category || product.physicalState} width={48} height={48} />
        <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm ring-1 ring-black/8">
          <HazardPictogramIcon type={product.hazard} width={22} height={22} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.7rem] font-semibold tracking-wide text-organza uppercase">
          {/^\d/.test(product.casNumber) ? `CAS ${product.casNumber}` : product.casNumber}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[0.95rem] font-bold leading-snug text-velvet">
          <Link
            to="/catalog/$slug"
            params={{ slug: product.slug }}
            className="text-velvet no-underline hover:text-lapis hover:no-underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-velvet/60">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="spec-pill" aria-label={`Packaging: ${packLabel}`}>
            {packLabel}
          </span>
          <span
            className={`spec-pill ${product.inStock ? 'border-success/40 text-success' : ''}`}
            role="status"
            aria-label={`Stock status: ${stockLabel}`}
          >
            {stockLabel}
          </span>
          <span className="spec-pill max-w-[9rem] truncate" aria-label={`Grade: ${product.purity}`}>
            {product.purity}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            className={`btn min-h-10 flex-1 px-3 text-xs ${
              inRfq ? 'btn-secondary' : 'btn-primary'
            }`}
            onClick={() => {
              addProduct(product)
              announce(
                inRfq
                  ? `${product.name} is in your RFQ.`
                  : `Added ${product.name} to RFQ.`,
              )
            }}
          >
            {inRfq ? 'In RFQ ✓' : 'Add to RFQ'}
          </button>
          <Link
            to="/catalog/$slug"
            params={{ slug: product.slug }}
            className="btn btn-secondary min-h-10 flex-1 px-3 text-xs no-underline hover:no-underline"
          >
            TDS / Specs
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-organza/30 bg-white" aria-hidden="true">
      <div className="skel h-[100px] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skel h-3 w-24" />
        <div className="skel h-5 w-11/12" />
        <div className="skel h-10 w-full" />
        <div className="skel h-10 w-full" />
      </div>
    </div>
  )
}
