import { Link } from '@tanstack/react-router'
import type { Product } from '../types/catalog'
import { CategoryGlyph, HazardPictogramIcon } from './Icons'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-organza/35 bg-white">
      <div className="relative flex h-[120px] items-center justify-between gap-3 bg-[linear-gradient(135deg,#EEF4FA_0%,#F8FAFC_100%)] px-4">
        <CategoryGlyph category={product.category || product.physicalState} width={56} height={56} />
        <HazardPictogramIcon type={product.hazard} width={36} height={36} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-organza">CAS {product.casNumber}</p>
        <h3 className="mt-1 text-base font-bold leading-snug text-velvet">
          <Link
            to="/catalog/$slug"
            params={{ slug: product.slug }}
            className="text-velvet no-underline hover:text-lapis hover:no-underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-velvet/65">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="spec-pill">{product.packaging.split('/')[0]?.trim()}</span>
          <span className={`spec-pill ${product.inStock ? 'border-success/40 text-success' : ''}`}>
            {product.inStock ? 'In stock' : 'Made to order'}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Link
            to="/contact"
            search={{ product: product.slug }}
            className="btn btn-primary min-h-10 flex-1 px-3 text-xs no-underline hover:no-underline"
          >
            Request Quote
          </Link>
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
      <div className="skel h-[120px] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skel h-3 w-24" />
        <div className="skel h-5 w-11/12" />
        <div className="skel h-10 w-full" />
        <div className="skel h-10 w-full" />
      </div>
    </div>
  )
}
