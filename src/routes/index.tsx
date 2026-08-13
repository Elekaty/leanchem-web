import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'LeanChems — Chemicals You Trust, Values You Deserve',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-lg bg-gradient-to-br from-velvet via-lapis to-adamantine px-6 py-16 text-white md:px-10">
        <p className="mb-4 inline-flex rounded border border-adamantine/50 bg-velvet/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-adamantine">
          Addis Ababa · Direct Import
        </p>
        <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
          Chemicals You Trust,
          <br />
          Values You Deserve
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
          Phase 1 scaffold — homepage, catalog, PDP, RFQ, portal, and admin routes are mounted.
          Product data and Supabase wiring arrive in later phases.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="rounded bg-white px-5 py-3 text-sm font-semibold text-lapis no-underline hover:bg-canvas hover:no-underline"
          >
            Request Quote
          </Link>
          <Link
            to="/catalog"
            className="rounded border border-white/40 px-5 py-3 text-sm font-semibold text-white no-underline hover:border-adamantine hover:no-underline"
          >
            Browse Catalog
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-lapis">Foundation checklist</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-velvet/80">
          <li>TanStack Start + Vite + React 19 SSR</li>
          <li>Tailwind CSS v4 with LeanChems brand tokens</li>
          <li>File-based routes for marketing, portal, and admin</li>
          <li>Sticky header + mobile Request Quote CTA</li>
        </ul>
      </section>
    </div>
  )
}
