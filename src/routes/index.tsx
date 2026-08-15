import { createFileRoute, Link } from '@tanstack/react-router'
import { CatalogTypeahead } from '../components/CatalogTypeahead'
import { CorridorLogisticsTracker } from '../components/CorridorLogisticsTracker'
import { LeanChemLogo } from '../components/LeanChemLogo'
import {
  CLIENT_LOGOS,
  INDUSTRIES,
  SITE,
  TESTIMONIALS,
  TRUST_ITEMS,
  WHY_ITEMS,
} from '../data/marketing'
import { VISUALS } from '../data/visuals'

export const Route = createFileRoute('/')({
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
  return (
    <div>
      {/* Hero — cinematic industrial warehouse */}
      <section
        className="atmosphere atmosphere--hero relative grid min-h-[min(94vh,880px)] items-end overflow-hidden text-white"
        aria-label="LeanChem hero"
      >
        <div
          className="atmosphere-media hero-media-animate scale-[1.04]"
          style={{ backgroundImage: `url('${VISUALS.hero}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-36">
          <h1>
            <span className="mb-5 block">
              <LeanChemLogo
                inverted
                height={56}
                className="max-w-[min(100%,420px)] drop-shadow-md md:h-14 md:w-auto"
              />
              <span className="sr-only">{SITE.brand}</span>
            </span>
            <span className="block max-w-[18ch] text-[clamp(1.4rem,3.2vw,2.15rem)] font-semibold leading-snug text-[#9fd0f5] drop-shadow-sm">
              {SITE.taglineLine1}
              <br />
              {SITE.taglineLine2}
            </span>
          </h1>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-white/85 md:text-[1.05rem]">
            {SITE.valueProp}
          </p>

          <div
            className="mt-8 max-w-xl rounded-md border border-white/20 bg-white/95 p-2 shadow-[0_12px_40px_rgba(34,34,53,0.35)]"
            role="search"
          >
            <CatalogTypeahead
              id="home-search"
              navigateOnSelect
              placeholder="Search by product name, grade, or CAS number…"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/contact" className="btn btn-primary shadow-lg shadow-lapis/30 no-underline hover:no-underline">
              Request Quote
            </Link>
            <Link to="/catalog" className="btn btn-hero-ghost no-underline hover:no-underline">
              Browse Catalog
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/20 pt-8">
            {SITE.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-adamantine drop-shadow-sm">{stat.value}</dt>
                <dd className="m-0 text-sm text-white/70">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Trust bar */}
      <section
        className="relative z-[1] bg-lapis text-white shadow-[0_-8px_32px_rgba(34,34,53,0.25)]"
        aria-label="Trust signals"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-3 md:gap-8 md:px-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="border-l-2 border-adamantine/60 pl-4">
              <p className="text-lg font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why — clean light, content-heavy */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="why-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Why LeanChem
          </h2>
          <p className="mt-2 max-w-[58ch] text-velvet/65">
            Built for procurement and technical buyers who need grades they can defend — and
            logistics they can plan.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
            {WHY_ITEMS.map((item) => (
              <article
                key={item.title}
                className="rounded border border-organza/30 bg-canvas/80 p-5 shadow-[0_1px_3px_rgba(34,34,53,0.04)] md:p-6"
              >
                <h3 className="text-lg font-bold text-lapis">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-velvet/65">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industries — soft factory atmosphere */}
      <section
        className="atmosphere atmosphere--light section-band py-16 md:py-20"
        aria-labelledby="markets-heading"
      >
        <div
          className="atmosphere-media"
          style={{ backgroundImage: `url('${VISUALS.factory}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="markets-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Industry catalog
          </h2>
          <p className="mt-2 max-w-[58ch] text-velvet/70">
            End-use markets with quote, sample, and SDS/TDS pathways into the live catalog.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {INDUSTRIES.map((ind) => (
              <article key={ind.slug} className="surface-panel p-5 md:p-6">
                <h3 className="text-lg font-bold text-velvet">{ind.title}</h3>
                <p className="mt-2 mb-5 leading-relaxed text-velvet/65">{ind.body}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/contact"
                    search={{ market: ind.slug }}
                    className="btn btn-primary h-10 min-h-10 px-3.5 text-[0.88rem] no-underline hover:no-underline"
                  >
                    Quote
                  </Link>
                  <Link
                    to="/contact"
                    search={{ market: ind.slug, intent: 'sample' }}
                    className="btn btn-secondary h-10 min-h-10 px-3.5 text-[0.88rem] no-underline hover:no-underline"
                  >
                    Sample
                  </Link>
                  <Link
                    to="/catalog"
                    search={{ market: ind.slug }}
                    className="btn btn-ghost h-10 min-h-10 px-3.5 text-[0.88rem] no-underline hover:no-underline"
                  >
                    SDS / TDS
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by — clean light */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="trusted-heading">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="trusted-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Trusted by
          </h2>
          <p className="mt-2 text-velvet/65">
            Selected industrial buyers across Ethiopian manufacturing corridors.
          </p>
          <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
            {CLIENT_LOGOS.map((name) => (
              <li
                key={name}
                className="grid min-h-[72px] place-items-center rounded border border-organza/30 bg-canvas/60 px-3 text-center text-sm font-semibold text-velvet/60 shadow-[0_1px_2px_rgba(34,34,53,0.03)]"
              >
                {name}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.org}
                className="m-0 rounded border border-organza/25 border-l-[3px] border-l-adamantine bg-canvas/50 p-5 shadow-[0_1px_3px_rgba(34,34,53,0.04)]"
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

      {/* Logistics — deep cinematic port / corridor */}
      <section
        className="atmosphere atmosphere--deep py-16 text-white md:py-20"
        aria-labelledby="logistics-heading"
      >
        <div
          className="atmosphere-media"
          style={{ backgroundImage: `url('${VISUALS.port}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <h2
            id="logistics-heading"
            className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-white drop-shadow-sm"
          >
            Track your shipments
          </h2>
          <p className="mt-2 max-w-[58ch] text-white/80">
            Sign in to see only your open and closed purchase orders — and which corridor stage each
            one is in. Other customers&apos; cargo is never shown.
          </p>
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
              <CorridorLogisticsTracker />
            </div>
            <p className="mt-4 text-center text-sm text-white/70">
              Need invoices or your account manager?{' '}
              <Link
                to="/portal/tracker"
                className="font-semibold text-adamantine no-underline hover:underline"
              >
                Open Tracker
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
