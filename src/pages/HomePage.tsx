import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CLIENT_LOGOS,
  INDUSTRIES,
  LOGISTICS_UPDATES,
  SITE,
  TESTIMONIALS,
  TRUST_ITEMS,
  WHY_ITEMS,
} from '../data/marketing'
import './HomePage.css'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog')
  }

  return (
    <div className="home">
      <section className="home-hero" aria-label="LeanChem hero">
        <div className="home-hero__media" aria-hidden="true" />
        <div className="home-hero__veil" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="home-hero__badge">{SITE.location}</p>
          <h1 className="home-hero__brand">
            <span className="home-hero__brand-name">{SITE.brand}</span>
            <span className="home-hero__tagline">
              {SITE.taglineLine1}
              <br />
              {SITE.taglineLine2}
            </span>
          </h1>
          <p className="home-hero__prop">{SITE.valueProp}</p>

          <form className="home-hero__search" onSubmit={onSearch} role="search">
            <label className="sr-only" htmlFor="home-search">
              Search catalog
            </label>
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, grade, or CAS number…"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div className="home-hero__ctas">
            <Link to="/contact" className="btn btn-primary">
              Request Quote
            </Link>
            <Link to="/catalog" className="btn btn-secondary home-hero__ghost">
              Browse Catalog
            </Link>
          </div>

          <dl className="home-hero__stats">
            {SITE.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="home-trust" aria-label="Trust signals">
        <div className="home-section__inner home-trust__grid">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="home-trust__item">
              <p className="home-trust__title">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="why-heading">
        <div className="home-section__inner">
          <h2 id="why-heading">Why LeanChem</h2>
          <p className="home-section__lead">
            Built for procurement and technical buyers who need grades they can defend — and
            logistics they can plan.
          </p>
          <div className="home-why">
            {WHY_ITEMS.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--tint" aria-labelledby="markets-heading">
        <div className="home-section__inner">
          <h2 id="markets-heading">Industry catalog</h2>
          <p className="home-section__lead">
            End-use markets with quote, sample, and SDS/TDS pathways into the live catalog.
          </p>
          <div className="home-markets">
            {INDUSTRIES.map((ind) => (
              <article key={ind.slug} className="home-market">
                <h3>{ind.title}</h3>
                <p>{ind.body}</p>
                <div className="home-market__actions">
                  <Link to={`/contact?market=${ind.slug}`} className="btn btn-primary">
                    Quote
                  </Link>
                  <Link to={`/contact?market=${ind.slug}&intent=sample`} className="btn btn-secondary">
                    Sample
                  </Link>
                  <Link to={`/catalog?market=${ind.slug}`} className="btn btn-ghost">
                    SDS / TDS
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="trusted-heading">
        <div className="home-section__inner">
          <h2 id="trusted-heading">Trusted by</h2>
          <p className="home-section__lead">Logo placeholders — keep until client approvals land.</p>
          <ul className="home-logos">
            {CLIENT_LOGOS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <div className="home-quotes">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.org}>
                <p>“{t.quote}”</p>
                <footer>
                  <strong>{t.name}</strong> · {t.org}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--tint" aria-labelledby="logistics-heading">
        <div className="home-section__inner">
          <h2 id="logistics-heading">Live logistics</h2>
          <p className="home-section__lead">
            Corridor and status-style updates for inbound planning.
          </p>
          <div className="home-logistics">
            {LOGISTICS_UPDATES.map((row) => (
              <article key={row.id} className="home-logistics__row">
                <div>
                  <p className="home-logistics__corridor">{row.corridor}</p>
                  <p>{row.summary}</p>
                </div>
                <div className="home-logistics__meta">
                  <span className={`home-logistics__status status-${row.status.toLowerCase().replace(' ', '-')}`}>
                    {row.status}
                  </span>
                  <Link to={`/news/${row.articleSlug}`}>Read update</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
