import { createFileRoute, Link } from '@tanstack/react-router'
import { NEWS_ARTICLES } from '../../data/marketing'

export const Route = createFileRoute('/news/')({
  head: () => ({
    meta: [{ title: 'News & Logistics | LeanChem' }],
  }),
  component: NewsPage,
})

function NewsPage() {
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
      <div className="mt-8 flex flex-col gap-3">
        {NEWS_ARTICLES.map((article) => (
          <article
            key={article.slug}
            className="rounded-lg border border-organza/35 bg-white p-5"
          >
            <p className="text-xs text-velvet/55">{article.date}</p>
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
