import { createFileRoute, Link } from '@tanstack/react-router'
import { NEWS_ARTICLES } from '../../data/marketing'

export const Route = createFileRoute('/news/$slug')({
  head: ({ params }) => {
    const article = NEWS_ARTICLES.find((a) => a.slug === params.slug)
    return {
      meta: [{ title: `${article?.title ?? params.slug} | LeanChem News` }],
    }
  },
  component: NewsArticlePage,
})

function NewsArticlePage() {
  const { slug } = Route.useParams()
  const article = NEWS_ARTICLES.find((a) => a.slug === slug)

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <h1 className="text-3xl font-bold text-velvet">Article not found</h1>
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
        <span className="font-semibold text-velvet">{article.title}</span>
      </nav>
      <p className="text-sm text-velvet/55">{article.date}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-velvet">{article.title}</h1>
      {article.body.map((para) => (
        <p key={para.slice(0, 32)} className="mt-4 text-[1.02rem] leading-relaxed text-velvet">
          {para}
        </p>
      ))}
    </article>
  )
}
