import { createFileRoute, Link } from '@tanstack/react-router'
import { loadNewsFeed } from '../../lib/newsClient'

export const Route = createFileRoute('/news/')({
  loader: () => loadNewsFeed(),
  head: () => ({
    meta: [
      { title: 'News & Logistics | LeanChem' },
      {
        name: 'description',
        content:
          'Corridor and procurement logistics notes for Ethiopian chemical buyers — Gemini-assisted analysis with static fallback.',
      },
    ],
  }),
  component: NewsPage,
})

function NewsPage() {
  const feed = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">News</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">News & logistics notes</h1>
      <p className="mt-2 text-velvet/65">
        Corridor updates and operational guidance for procurement planners.
      </p>
      <p className="mt-3 text-xs font-semibold text-velvet/50">
        {feed.geminiEnabled
          ? feed.analyzedAt
            ? `Gemini analysis · updated ${new Date(feed.analyzedAt).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' })} EAT`
            : 'Gemini configured · generating / cached'
          : 'Static briefing (set GEMINI_API_KEY on the server to enable live analysis)'}
        {feed.error ? ` · fallback: ${feed.error.slice(0, 120)}` : ''}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {feed.briefs.map((article) => (
          <article
            key={article.slug}
            className="rounded-lg border border-organza/35 bg-white p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-velvet/55">{article.date}</p>
              <span className="rounded bg-canvas px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-organza">
                {article.source}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold">
              <Link
                to="/news/$slug"
                params={{ slug: article.slug }}
                className="text-velvet no-underline hover:text-lapis hover:no-underline"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-velvet/65">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
