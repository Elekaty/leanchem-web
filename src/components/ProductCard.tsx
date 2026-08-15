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
  const stockLabel = product.inStock ? 'In Stock' : 'Made to order'
  const hazards = (product.hazards?.length ? product.hazards : [product.hazard]).slice(0, 3)

  return (
    <article className="catalog-card group flex flex-col overflow-hidden rounded border border-organza/35 bg-white">
      <div className="relative flex h-16 items-center justify-between gap-3 border-b border-organza/15 bg-[linear-gradient(135deg,#EEF4FA_0%,#F8FAFC_100%)] px-3.5">
        <div className="flex items-center gap-2.5">
          <CategoryGlyph
            category={product.category || product.physicalState}
            width={40}
            height={40}
            className="shrink-0"
          />
          <span className="text-[0.65rem] font-semibold tracking-wide text-organza uppercase">
            {product.physicalState}
          </span>
        </div>
        <ul className="m-0 flex list-none items-center gap-1 p-0" aria-label="Hazard pictograms">
          {hazards.map((h) => (
            <li
              key={h}
              className="inline-flex h-7 w-7 items-center justify-center rounded bg-white shadow-sm ring-1 ring-black/8"
            >
              <HazardPictogramIcon type={h} width={18} height={18} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[0.68rem] font-semibold tracking-wide text-organza/90 uppercase">
          {/^\d/.test(product.casNumber) ? `CAS ${product.casNumber}` : product.casNumber}
        </p>
        <h3 className="mt-1 text-[0.95rem] font-bold leading-snug text-velvet">
          <Link
            to="/catalog/$slug"
            params={{ slug: product.slug }}
            className="text-velvet no-underline hover:text-lapis hover:no-underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-[0.8125rem] leading-relaxed text-velvet/60">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={`badge ${product.inStock ? 'badge-stock' : 'badge-mto'}`}
            role="status"
            aria-label={`Stock status: ${stockLabel}`}
          >
            {stockLabel}
          </span>
          <span className="badge badge-neutral" aria-label={`Packaging: ${packLabel}`}>
            {packLabel}
          </span>
          <span
            className="badge badge-neutral max-w-full"
            title={product.purity}
            aria-label={`Purity: ${product.purity}`}
          >
            <span className="line-clamp-1">{product.purity}</span>
          </span>
        </div>

        <div className="mt-auto flex gap-2 pt-4">
          <button
            type="button"
            className={`btn h-10 min-h-10 flex-[1.35] px-3 text-xs ${
              inRfq ? 'btn-secondary' : 'btn-primary'
            }`}
            onClick={() => {
              addProduct(product)
              announce(inRfq ? 'Already in your RFQ' : 'Added to RFQ')
            }}
          >
            {inRfq ? 'In RFQ' : 'Add to RFQ'}
          </button>
          <Link
            to="/catalog/$slug"
            params={{ slug: product.slug }}
            className="btn btn-secondary h-10 min-h-10 flex-1 px-2.5 text-xs no-underline hover:no-underline"
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
    <div
      className="overflow-hidden rounded border border-organza/30 bg-white shadow-[0_1px_2px_rgba(34,34,53,0.04)]"
      aria-hidden="true"
    >
      <div className="skel h-16 rounded-none" />
      <div className="space-y-2.5 p-3.5">
        <div className="skel h-3 w-24" />
        <div className="skel h-5 w-11/12" />
        <div className="skel h-9 w-full" />
        <div className="flex gap-1.5">
          <div className="skel h-5 w-16" />
          <div className="skel h-5 w-20" />
        </div>
        <div className="skel h-10 w-full" />
      </div>
    </div>
  )
}
