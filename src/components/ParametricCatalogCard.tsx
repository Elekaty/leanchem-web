import { FileDown, FlaskConical } from 'lucide-react'
import { useLiveRegion } from './LiveRegion'
import { useRfq } from '../context/RfqContext'
import type { ParametricChemical } from '../data/parametricCatalogMock'
import { parametricToProduct } from '../lib/parametricCatalog'

interface ParametricCatalogCardProps {
  chemical: ParametricChemical
}

export function ParametricCatalogCard({ chemical }: ParametricCatalogCardProps) {
  const { addProduct, hasProduct } = useRfq()
  const { announce } = useLiveRegion()
  const product = parametricToProduct(chemical)
  const inRfq = hasProduct(product.id)

  return (
    <article className="flex flex-col rounded border border-organza/30 bg-white p-4 transition hover:border-organza/55">
      <div className="flex gap-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-organza/25 bg-[linear-gradient(135deg,#EEF4FA_0%,#F8FAFC_100%)]"
          aria-hidden="true"
        >
          {chemical.structureImageUrl ? (
            <img
              src={chemical.structureImageUrl}
              alt=""
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <FlaskConical className="h-7 w-7 text-lapis/70" strokeWidth={1.5} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-semibold tracking-wide text-organza uppercase">
            CAS {chemical.casNumber}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-[0.95rem] font-bold leading-snug text-velvet">
            {chemical.name}
          </h3>
          <p className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="spec-pill">{chemical.grade}</span>
            {chemical.markets.slice(0, 2).map((m) => (
              <span key={m} className="spec-pill max-w-[9rem]">
                <span className="line-clamp-1">{m}</span>
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={chemical.sdsUrl}
          className="btn btn-ghost h-9 min-h-9 px-2.5 text-xs"
          download
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Download SDS
        </a>
        <a
          href={chemical.tdsUrl}
          className="btn btn-ghost h-9 min-h-9 px-2.5 text-xs"
          download
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Download TDS
        </a>
      </div>

      <button
        type="button"
        className={`btn mt-3 w-full ${inRfq ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => {
          addProduct(product)
          announce(inRfq ? 'Already in your RFQ' : 'Added to RFQ')
        }}
      >
        {inRfq ? 'In RFQ' : 'Add to RFQ'}
      </button>
    </article>
  )
}
