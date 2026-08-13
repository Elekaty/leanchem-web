import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/documents')({
  head: () => ({
    meta: [{ title: 'Admin · Document Management | LeanChems' }],
  }),
  component: AdminDocumentsPage,
})

function AdminDocumentsPage() {
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">Admin Documents</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">TDS / SDS Management</h1>
      <p className="max-w-2xl text-velvet/70">
        Phase 1 admin upload shell. Phase 3 maps uploads to the Supabase{' '}
        <code className="text-lapis">product-documents</code> bucket (<code>tds/</code>,{' '}
        <code>sds/</code>).
      </p>
      <div className="rounded-lg border border-dashed border-organza/50 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-velvet">Drop PDF documents here (coming soon)</p>
        <p className="mt-2 text-xs text-velvet/60">Max 20MB · PDF only</p>
      </div>
    </div>
  )
}
