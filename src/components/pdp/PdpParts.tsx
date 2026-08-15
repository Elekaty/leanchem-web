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
    <ul className="flex flex-wrap gap-3" aria-label="Hazard pictograms">
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
    <dl className="mt-4">
      {rows.map(({ key, value }) => (
        <div
          key={key}
          className="grid grid-cols-[150px_1fr] gap-3 border-b border-dashed border-organza py-2.5 text-sm last:border-b-0 sm:grid-cols-[180px_1fr]"
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
    { label: 'Technical Data Sheet (TDS)', href: tdsUrl, meta: 'PDF · on request' },
    { label: 'Safety Data Sheet (SDS)', href: sdsUrl, meta: `Updated ${updatedAt}` },
    { label: 'Certificate of Analysis (sample)', href: coaUrl, meta: 'PDF · on request' },
  ]

  return (
    <div>
      <h2 className="text-sm font-bold text-velvet">Document vault</h2>
      <ul className="mt-3 space-y-2">
        {docs.map((doc) => (
          <li key={doc.label}>
            <a
              href={doc.href}
              className="flex items-center justify-between gap-2 rounded border border-organza/35 bg-canvas px-3 py-2.5 text-sm no-underline hover:border-adamantine hover:no-underline"
            >
              <span className="font-semibold text-lapis">{doc.label}</span>
              <span className="shrink-0 text-xs text-velvet/50">{doc.meta}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-velvet/50">
        Document links open placeholders until files are uploaded to storage.
      </p>
    </div>
  )
}
