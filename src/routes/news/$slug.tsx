import { createFileRoute, Link } from '@tanstack/react-router'
import { loadNewsBrief } from '../../lib/newsClient'

export const Route = createFileRoute('/news/$slug')({
  loader: async ({ params }) => {
    const { brief } = await loadNewsBrief(params.slug)
    return { brief }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.brief
          ? `${loaderData.brief.title} | LeanChem News`
          : 'News | LeanChem',
      },
      {
        name: 'description',
        content: loaderData?.brief?.excerpt ?? 'LeanChem logistics and procurement update.',
      },
    ],
  }),
  component: NewsArticlePage,
})

function NewsArticlePage() {
  const { brief } = Route.useLoaderData()
  const slug = Route.useParams({ select: (p) => p.slug })

  if (!brief) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold text-velvet">Article not found</h1>
        <p className="mt-2 text-sm text-velvet/65">No briefing matches “{slug}”.</p>
        <Link to="/news" className="btn btn-secondary mt-4 inline-flex no-underline hover:no-underline">
          Back to news
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <Link to="/news" className="text-lapis no-underline hover:underline">
          News
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">{brief.title}</span>
      </nav>
      <p className="text-xs font-semibold text-velvet/55">
        {brief.date}
        <span className="mx-2 text-organza">·</span>
        <span className="uppercase tracking-wide text-organza">{brief.source}</span>
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-velvet">{brief.title}</h1>
      {brief.corridor ? (
        <p className="mt-2 text-sm font-semibold text-lapis">
          {brief.corridor}
          {brief.status ? ` · ${brief.status}` : ''}
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        {brief.body.map((para) => (
          <p key={para.slice(0, 48)} className="leading-relaxed text-velvet/75">
            {para}
          </p>
        ))}
      </div>
    </article>
  )
}
