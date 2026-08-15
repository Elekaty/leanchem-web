import { Link } from '@tanstack/react-router'
import { useLiveRegion } from './LiveRegion'
import { CategoryGlyph, HazardPictogramIcon } from './Icons'
import { useRfq } from '../context/RfqContext'
import type { ParametricChemical } from '../data/parametricCatalogMock'
import { parametricToProduct } from '../lib/parametricCatalog'

interface ParametricCatalogCardProps {
  chemical: ParametricChemical
}

/** Dense industrial catalog card — no empty structure placeholders. */
export function ParametricCatalogCard({ chemical }: ParametricCatalogCardProps) {
  const { addProduct, hasProduct } = useRfq()
  const { announce } = useLiveRegion()
  const product = parametricToProduct(chemical)
  const inRfq = hasProduct(product.id)
  const stockLabel = chemical.inStock ? 'In Stock' : 'Made to order'
  const hazards = chemical.hazards.slice(0, 3)

  return (
    <article className="catalog-card group flex flex-col overflow-hidden rounded border border-organza/35 bg-white">
      {/* Visual header — packaging / molecule glyph, not an empty grey box */}
      <div className="relative flex h-16 items-center justify-between gap-3 border-b border-organza/15 bg-[linear-gradient(135deg,#EEF4FA_0%,#F8FAFC_100%)] px-3.5">
        <div className="flex items-center gap-2.5">
          <CategoryGlyph
            category={chemical.physicalState || chemical.markets[0] || 'solid'}
            width={40}
            height={40}
            className="shrink-0"
          />
          <span className="text-[0.65rem] font-semibold tracking-wide text-organza uppercase">
            {chemical.physicalState}
          </span>
        </div>
        {hazards.length > 0 ? (
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
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[0.68rem] font-semibold tracking-wide text-organza/90 uppercase">
          CAS {chemical.casNumber}
        </p>

        <h3 className="mt-1 text-[0.95rem] font-bold leading-snug text-velvet">
          <Link
            to="/catalog/$slug"
            params={{ slug: chemical.slug }}
            className="text-velvet no-underline hover:text-lapis hover:no-underline"
          >
            {chemical.name}
          </Link>
          <span className="mt-0.5 block text-xs font-semibold text-lapis">{chemical.grade} grade</span>
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-[0.8125rem] leading-relaxed text-velvet/60">
          {chemical.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={`badge ${chemical.inStock ? 'badge-stock' : 'badge-mto'}`}
            role="status"
            aria-label={`Stock status: ${stockLabel}`}
          >
            {stockLabel}
          </span>
          <span className="badge badge-neutral" aria-label={`Packaging: ${chemical.packaging}`}>
            {chemical.packaging}
          </span>
          <span className="badge badge-neutral" aria-label={`Purity: ${chemical.purity}`}>
            {chemical.purity}
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
              announce(inRfq ? 'Already in your RFQ cart' : 'Added to RFQ cart')
            }}
          >
            {inRfq ? 'In RFQ' : 'Add to RFQ'}
          </button>
          <a
            href={chemical.tdsUrl}
            download
            className="btn btn-secondary h-10 min-h-10 flex-1 px-2.5 text-xs no-underline hover:no-underline"
          >
            TDS / Specs
          </a>
        </div>
      </div>
    </article>
  )
}
