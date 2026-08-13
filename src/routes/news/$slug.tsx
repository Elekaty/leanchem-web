import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/news/$slug')({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} | LeanChems News` }],
  }),
  component: NewsArticlePage,
})

function NewsArticlePage() {
  const { slug } = Route.useParams()

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-organza">
        <Link to="/" className="text-lapis">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">News</span>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">{slug}</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">{slug}</h1>
      <p className="text-velvet/70">
        Phase 1 news article route. Phase 4 will curate market updates via GNews + Gemini into
        Supabase <code className="text-lapis">market_updates</code>.
      </p>
    </article>
  )
}
