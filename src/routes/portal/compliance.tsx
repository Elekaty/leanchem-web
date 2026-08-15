import { createFileRoute } from '@tanstack/react-router'
import { FileDown } from 'lucide-react'
import { PORTAL_COMPLIANCE_DOCS } from '../../data/portalDashboard'

export const Route = createFileRoute('/portal/compliance')({
  head: () => ({
    meta: [{ title: 'Compliance Vault | LeanChem Portal' }],
  }),
  component: PortalCompliancePage,
})

function PortalCompliancePage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-velvet md:text-3xl">
          Compliance Vault
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-velvet/65">
          Updated COA and SDS files for chemicals previously purchased on your account.
        </p>
      </header>

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <ul className="divide-y divide-gray-100">
          {PORTAL_COMPLIANCE_DOCS.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-velvet">{doc.chemicalName}</p>
                <p className="mt-0.5 text-xs font-semibold text-lapis">CAS {doc.casNumber}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Last purchase {doc.lastPurchasePo} · {doc.lastPurchaseDate} · SDS updated{' '}
                  {doc.sdsUpdatedAt}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={doc.coaUrl}
                  download
                  className="btn btn-secondary h-9 min-h-9 px-3 text-xs no-underline hover:no-underline"
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Download COA
                </a>
                <a
                  href={doc.sdsUrl}
                  download
                  className="btn btn-secondary h-9 min-h-9 px-3 text-xs no-underline hover:no-underline"
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Download SDS
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
