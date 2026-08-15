import { FileText } from 'lucide-react'
import { useLiveRegion } from './LiveRegion'
import { useRfq } from '../context/RfqContext'
import type { ParametricChemical } from '../data/parametricCatalogMock'
import { parametricToProduct } from '../lib/parametricCatalog'

interface ParametricCatalogCardProps {
  chemical: ParametricChemical
}

/** Product card: name, CAS, structure placeholder, SDS / TDS / Add to RFQ. */
export function ParametricCatalogCard({ chemical }: ParametricCatalogCardProps) {
  const { addProduct, hasProduct } = useRfq()
  const { announce } = useLiveRegion()
  const product = parametricToProduct(chemical)
  const inRfq = hasProduct(product.id)

  return (
    <article className="flex flex-col rounded border border-organza/30 bg-white p-4 transition hover:border-organza/55">
      {/* Gray structure placeholder */}
      <div
        className="mb-3 flex h-24 w-full items-center justify-center rounded bg-gray-100"
        aria-hidden="true"
      >
        {chemical.structureImageUrl ? (
          <img
            src={chemical.structureImageUrl}
            alt=""
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-[0.65rem] font-semibold tracking-wide text-gray-400 uppercase">
            Structure
          </span>
        )}
      </div>

      <p className="text-[0.68rem] font-semibold tracking-wide text-organza uppercase">
        CAS {chemical.casNumber}
      </p>
      <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[0.95rem] font-bold leading-snug text-velvet">
        {chemical.name}
      </h3>
      <p className="mt-2 flex flex-wrap gap-1.5">
        <span className="spec-pill">{chemical.grade}</span>
        {chemical.markets.slice(0, 2).map((m) => (
          <span key={m} className="spec-pill max-w-[9rem]">
            <span className="line-clamp-1">{m}</span>
          </span>
        ))}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={chemical.sdsUrl}
          className="btn btn-ghost h-9 min-h-9 flex-1 px-2 text-xs"
          download
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          SDS
        </a>
        <a
          href={chemical.tdsUrl}
          className="btn btn-ghost h-9 min-h-9 flex-1 px-2 text-xs"
          download
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          TDS
        </a>
      </div>

      <button
        type="button"
        className={`btn mt-2 w-full ${inRfq ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => {
          addProduct(product)
          announce(inRfq ? 'Already in your RFQ cart' : 'Added to RFQ cart')
        }}
      >
        {inRfq ? 'In RFQ' : 'Add to RFQ'}
      </button>
    </article>
  )
}
