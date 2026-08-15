import { Link } from '@tanstack/react-router'
import type { HazardPictogram } from '../../types/catalog'
import { HazardPictogramIcon } from '../Icons'

export function ProductBreadcrumbs({
  category,
  productName,
}: {
  category?: string | null
  productName: string
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
      <Link to="/" className="text-lapis no-underline hover:underline">
        Home
      </Link>
      <span className="mx-2" aria-hidden="true">
        →
      </span>
      <Link to="/catalog" className="text-lapis no-underline hover:underline">
        Catalog
      </Link>
      {category ? (
        <>
          <span className="mx-2" aria-hidden="true">
            →
          </span>
          <Link
            to="/catalog"
            search={{ q: category }}
            className="text-lapis no-underline hover:underline"
          >
            {category}
          </Link>
        </>
      ) : null}
      <span className="mx-2" aria-hidden="true">
        →
      </span>
      <span className="font-semibold text-velvet">{productName}</span>
    </nav>
  )
}

export function HazardIcons({
  hazards,
  size = 56,
}: {
  hazards: HazardPictogram[]
  size?: number
}) {
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Hazard pictograms">
      {hazards.map((h) => (
        <li key={h} className="rounded bg-white p-1.5 shadow-sm ring-1 ring-black/10">
          <HazardPictogramIcon type={h} width={size} height={size} />
        </li>
      ))}
    </ul>
  )
}

export function SpecsTable({
  rows,
}: {
  rows: Array<{ key: string; value: string }>
}) {
  return (
    <dl className="mt-3">
      {rows.map(({ key, value }) => (
        <div
          key={key}
          className="grid grid-cols-[minmax(7.5rem,9.5rem)_1fr] gap-x-3 gap-y-0.5 border-b border-dashed border-organza/55 py-1.5 text-sm last:border-b-0 sm:grid-cols-[11rem_1fr]"
        >
          <dt className="text-velvet/55">{key}</dt>
          <dd className="m-0 font-semibold text-velvet">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DocumentVault({
  tdsUrl,
  sdsUrl,
  coaUrl,
  updatedAt,
}: {
  tdsUrl: string
  sdsUrl: string
  coaUrl: string
  updatedAt: string
}) {
  const docs = [
    {
      label: 'Technical Data Sheet',
      short: 'TDS',
      href: tdsUrl,
      status: 'on-request' as const,
      meta: 'Available on request',
    },
    {
      label: 'Safety Data Sheet',
      short: 'SDS',
      href: sdsUrl,
      status: 'ready' as const,
      meta: `Updated ${updatedAt}`,
    },
    {
      label: 'Certificate of Analysis',
      short: 'COA',
      href: coaUrl,
      status: 'on-request' as const,
      meta: 'Sample COA on request',
    },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold text-velvet">Document vault</h2>
        <p className="text-[0.65rem] font-semibold tracking-wide text-organza uppercase">
          Spec pack
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {docs.map((doc) => (
          <li key={doc.label}>
            <a
              href={doc.href}
              className="group flex items-start justify-between gap-3 rounded border border-organza/35 bg-canvas/80 px-3 py-2.5 no-underline transition hover:border-lapis/40 hover:bg-white hover:no-underline"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-lapis group-hover:text-[#184a7f]">
                  {doc.label}
                  <span className="ml-1.5 text-xs font-semibold text-velvet/45">{doc.short}</span>
                </span>
                <span className="mt-0.5 block text-xs text-velvet/55">{doc.meta}</span>
              </span>
              <span
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase ${
                  doc.status === 'ready'
                    ? 'bg-success/10 text-success'
                    : 'bg-organza/15 text-organza'
                }`}
              >
                {doc.status === 'ready' ? 'Ready' : 'On request'}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-xs leading-relaxed text-velvet/50">
        Request the full pack with your RFQ — commercial team attaches current revisions to the
        quote reply.
      </p>
    </div>
  )
}
