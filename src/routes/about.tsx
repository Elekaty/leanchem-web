import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'About LeanChems | Mission & Leadership' }],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">About</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">About LeanChems</h1>
      <p className="max-w-3xl text-velvet/70">
        Phase 1 placeholder for mission, compliance posture, and leadership. Content and structure
        expand in Phase 2 UI construction.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {['Trust', 'Technical depth', 'Delivery discipline'].map((pillar) => (
          <article
            key={pillar}
            className="rounded-lg border border-organza/30 bg-white p-5"
          >
            <h2 className="font-bold text-lapis">{pillar}</h2>
            <p className="mt-2 text-sm text-velvet/70">Scaffold section — copy arrives later.</p>
          </article>
        ))}
      </div>
    </div>
  )
}
