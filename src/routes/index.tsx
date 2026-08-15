import { createFileRoute, Link } from '@tanstack/react-router'
import { CatalogTypeahead } from '../components/CatalogTypeahead'
import { LeanChemLogo } from '../components/LeanChemLogo'
import { LogisticsFeed } from '../components/LogisticsFeed'
import {
  CLIENT_LOGOS,
  INDUSTRIES,
  SITE,
  TESTIMONIALS,
  TRUST_ITEMS,
  WHY_ITEMS,
} from '../data/marketing'
import { loadNewsFeed } from '../lib/newsClient'
import type { NewsFeedPayload } from '../types/news'

async function loadHomeNews(): Promise<NewsFeedPayload | null> {
  try {
    return await loadNewsFeed()
  } catch {
    return null
  }
}

export const Route = createFileRoute('/')({
  loader: async () => ({ news: await loadHomeNews() }),
  head: () => ({
    meta: [
      {
        title: 'LeanChem — Chemicals You Trust, Values You Deserve',
      },
      {
        name: 'description',
        content: SITE.valueProp,
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const { news } = Route.useLoaderData()

  return (
    <div>
      {/* Hero — full bleed */}
      <section className="relative grid min-h-[min(92vh,820px)] items-end overflow-hidden text-white" aria-label="LeanChem hero">
        <div
          className="hero-media-animate absolute inset-0 scale-[1.02] bg-[linear-gradient(120deg,rgba(30,88,151,0.35),rgba(34,34,53,0.15)),url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,34,53,0.88)_0%,rgba(34,34,53,0.55)_55%,rgba(30,88,151,0.35)_100%),linear-gradient(0deg,rgba(34,34,53,0.75)_0%,transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-28 md:px-6 md:pb-20 md:pt-32">
          <h1>
            <span className="mb-5 block">
              <LeanChemLogo
                inverted
                height={56}
                className="max-w-[min(100%,420px)] drop-shadow-md md:h-14 md:w-auto"
              />
              <span className="sr-only">{SITE.brand}</span>
            </span>
            <span className="block max-w-[18ch] text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-snug text-[#9fd0f5]">
              {SITE.taglineLine1}
              <br />
              {SITE.taglineLine2}
            </span>
          </h1>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-white/80 md:text-[1.05rem]">
            {SITE.valueProp}
          </p>

          <div className="mt-8 max-w-xl rounded-md bg-white/95 p-2 shadow-lg shadow-velvet/20" role="search">
            <CatalogTypeahead
              id="home-search"
              navigateOnSelect
              placeholder="Search by product name, grade, or CAS number…"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/contact" className="btn btn-primary no-underline hover:no-underline">
              Request Quote
            </Link>
            <Link to="/catalog" className="btn btn-hero-ghost no-underline hover:no-underline">
              Browse Catalog
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-8">
            {SITE.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-adamantine">{stat.value}</dt>
                <dd className="m-0 text-sm text-white/65">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-lapis text-white" aria-label="Trust signals">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 md:grid-cols-3 md:px-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title}>
              <p className="text-lg font-bold">{item.title}</p>
              <p className="mt-1 text-sm text-white/80">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="py-14 md:py-16" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="why-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Why LeanChem
          </h2>
          <p className="mt-2 max-w-[58ch] text-velvet/65">
            Built for procurement and technical buyers who need grades they can defend — and
            logistics they can plan.
          </p>
          <div className="mt-7 grid gap-5 md:grid-cols-2 md:gap-6">
            {WHY_ITEMS.map((item) => (
              <article key={item.title}>
                <h3 className="text-lg font-bold text-lapis">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-velvet/65">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-organza/10 py-14 md:py-16" aria-labelledby="markets-heading">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="markets-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Industry catalog
          </h2>
          <p className="mt-2 max-w-[58ch] text-velvet/65">
            End-use markets with quote, sample, and SDS/TDS pathways into the live catalog.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {INDUSTRIES.map((ind) => (
              <article
                key={ind.slug}
                className="rounded border border-organza/35 bg-white p-5 md:p-6"
              >
                <h3 className="text-lg font-bold text-velvet">{ind.title}</h3>
                <p className="mt-2 mb-4 leading-relaxed text-velvet/65">{ind.body}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/contact"
                    search={{ market: ind.slug }}
                    className="btn btn-primary px-3.5 text-[0.88rem] no-underline hover:no-underline"
                  >
                    Quote
                  </Link>
                  <Link
                    to="/contact"
                    search={{ market: ind.slug, intent: 'sample' }}
                    className="btn btn-secondary px-3.5 text-[0.88rem] no-underline hover:no-underline"
                  >
                    Sample
                  </Link>
                  <Link
                    to="/catalog"
                    search={{ market: ind.slug }}
                    className="btn btn-ghost px-3.5 text-[0.88rem] no-underline hover:no-underline"
                  >
                    SDS / TDS
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-14 md:py-16" aria-labelledby="trusted-heading">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="trusted-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Trusted by
          </h2>
          <p className="mt-2 text-velvet/65">
            Selected industrial buyers across Ethiopian manufacturing corridors.
          </p>
          <ul className="mt-7 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
            {CLIENT_LOGOS.map((name) => (
              <li
                key={name}
                className="grid min-h-[72px] place-items-center rounded-md border border-dashed border-organza/45 bg-white px-3 text-center text-sm font-semibold text-velvet/55"
              >
                {name}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.org}
                className="m-0 rounded-r-lg border-l-[3px] border-adamantine bg-white p-5"
              >
                <p className="leading-relaxed text-velvet">“{t.quote}”</p>
                <footer className="mt-3 text-sm text-velvet/55">
                  <strong className="text-velvet/80">{t.name}</strong> · {t.org}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics */}
      <section className="bg-organza/10 py-16" aria-labelledby="logistics-heading">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2
            id="logistics-heading"
            className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet"
          >
            Live logistics
          </h2>
          <p className="mt-2 text-velvet/65">
            Vertically scrolling feed of active regional corridors with status chips and timestamps.
          </p>
          <div className="mt-8">
            <LogisticsFeed
              rows={news?.logistics}
              geminiEnabled={news?.geminiEnabled}
              analyzedAt={news?.analyzedAt}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
