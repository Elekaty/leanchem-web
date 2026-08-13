import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { NEWS_ARTICLES } from '../data/marketing'
import './NewsPage.css'

export function NewsPage() {
  return (
    <div className="news-page">
      <div className="news-page__wrap">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'News' }]} />
        <h1 className="page-title">News & logistics notes</h1>
        <p className="page-subtitle">
          Corridor updates and operational guidance for procurement planners.
        </p>
        <div className="news-list">
          {NEWS_ARTICLES.map((article) => (
            <article key={article.slug}>
              <p className="news-list__date">{article.date}</p>
              <h2>
                <Link to={`/news/${article.slug}`}>{article.title}</Link>
              </h2>
              <p>{article.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NewsArticlePage() {
  const { slug = '' } = useParams()
  const article = NEWS_ARTICLES.find((a) => a.slug === slug)

  if (!article) {
    return (
      <div className="news-page">
        <div className="news-page__wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'News', to: '/news' },
              { label: 'Not found' },
            ]}
          />
          <h1 className="page-title">Article not found</h1>
          <Link to="/news" className="btn btn-secondary">
            Back to news
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="news-page">
      <div className="news-page__wrap news-article">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'News', to: '/news' },
            { label: article.title },
          ]}
        />
        <p className="news-list__date">{article.date}</p>
        <h1 className="page-title">{article.title}</h1>
        {article.body.map((para) => (
          <p key={para.slice(0, 24)} className="news-article__p">
            {para}
          </p>
        ))}
      </div>
    </article>
  )
}
