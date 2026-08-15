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
import { INDUSTRY_VISUALS, VISUALS } from '../data/visuals'

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

const WHY_VISUALS = [VISUALS.warehouse, VISUALS.lab, VISUALS.drums, VISUALS.freight] as const

function HomePage() {
  return (
    <div className="bg-[#e8eef4]">
      {/* 1. Hero — immersive industrial warehouse */}
      <section
        className="atmosphere atmosphere--hero relative grid min-h-[min(96vh,920px)] items-end overflow-hidden text-white"
        aria-label="LeanChem hero"
      >
        <div
          className="atmosphere-media hero-media-animate scale-[1.05]"
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
            <span className="block max-w-[18ch] text-[clamp(1.45rem,3.4vw,2.25rem)] font-semibold leading-snug text-[#9fd0f5] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              {SITE.taglineLine1}
              <br />
              {SITE.taglineLine2}
            </span>
          </h1>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-white/90 md:text-[1.05rem]">
            {SITE.valueProp}
          </p>

          <div
            className="mt-8 max-w-xl rounded-md border border-white/25 bg-white p-2 shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
            role="search"
          >
            <CatalogTypeahead
              id="home-search"
              navigateOnSelect
              placeholder="Search by product name, grade, or CAS number…"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="btn btn-primary shadow-lg shadow-black/30 no-underline hover:no-underline"
            >
              Request Quote
            </Link>
            <Link to="/catalog" className="btn btn-hero-ghost no-underline hover:no-underline">
              Browse Catalog
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/25 pt-8">
            {SITE.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-adamantine drop-shadow-sm">{stat.value}</dt>
                <dd className="m-0 text-sm text-white/75">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 2. Trust strip over plant texture */}
      <section
        className="atmosphere atmosphere--slate relative z-[1] text-white shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
        aria-label="Trust signals"
      >
        <div
          className="atmosphere-media opacity-50"
          style={{ backgroundImage: `url('${VISUALS.plant}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3 md:gap-8 md:px-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="border-l-2 border-adamantine pl-4">
              <p className="text-lg font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/85">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Capabilities — image-backed cards (not flat white) */}
      <section
        className="atmosphere atmosphere--light py-16 md:py-20"
        aria-labelledby="why-heading"
      >
        <div
          className="atmosphere-media"
          style={{ backgroundImage: `url('${VISUALS.tanks}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <h2 id="why-heading" className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-velvet">
            Why LeanChem
          </h2>
          <p className="mt-2 max-w-[58ch] text-velvet/70">
            Built for procurement and technical buyers who need grades they can defend — and
            logistics they can plan.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item, i) => (
              <article key={item.title} className="visual-card flex flex-col">
                <div
                  className="visual-card-media"
                  style={{ backgroundImage: `url('${WHY_VISUALS[i] ?? VISUALS.warehouse}')` }}
                  role="img"
                  aria-label=""
                />
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <h3 className="text-base font-bold text-lapis">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-velvet/65">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Mid-page cinematic band — drums / operations CTA */}
      <section
        className="atmosphere atmosphere--mid py-20 text-white md:py-28"
        aria-labelledby="ops-heading"
      >
        <div
          className="atmosphere-media"
          style={{ backgroundImage: `url('${VISUALS.drums}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-adamantine uppercase">
            Operations you can plan around
          </p>
          <h2
            id="ops-heading"
            className="mt-3 max-w-[20ch] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight drop-shadow-md"
          >
            From drum and IBC packaging to corridor-ready dispatch
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-white/85 md:text-lg">
            Spec-grade industrials with SDS/TDS packs, packaging options, and Djibouti–Modjo–Addis
            visibility — built for buyers who run plants, not shopping carts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="btn btn-primary shadow-lg shadow-black/25 no-underline hover:no-underline"
            >
              Open catalog
            </Link>
            <Link
              to="/contact"
              className="btn btn-hero-ghost no-underline hover:no-underline"
            >
              Start an RFQ
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Industry markets — photographic cards */}
      <section
        className="atmosphere atmosphere--light py-16 md:py-20"
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
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {INDUSTRIES.map((ind) => (
              <article key={ind.slug} className="visual-card">
                <div
                  className="visual-card-media"
                  style={{
                    backgroundImage: `url('${INDUSTRY_VISUALS[ind.slug] ?? VISUALS.factory}')`,
                  }}
                  role="img"
                  aria-label=""
                >
                  <span className="absolute bottom-3 left-4 z-[1] text-sm font-bold tracking-wide text-white drop-shadow-md">
                    {ind.title}
                  </span>
                </div>
                <div className="p-5 md:p-6">
                  <p className="leading-relaxed text-velvet/65">{ind.body}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Proof — atmospheric slate, not plain white */}
      <section
        className="atmosphere atmosphere--slate py-16 text-white md:py-20"
        aria-labelledby="trusted-heading"
      >
        <div
          className="atmosphere-media opacity-40"
          style={{ backgroundImage: `url('${VISUALS.freight}')` }}
          aria-hidden="true"
        />
        <div className="atmosphere-veil" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <h2
            id="trusted-heading"
            className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold text-white drop-shadow-sm"
          >
            Trusted by
          </h2>
          <p className="mt-2 text-white/75">
            Selected industrial buyers across Ethiopian manufacturing corridors.
          </p>
          <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
            {CLIENT_LOGOS.map((name) => (
              <li
                key={name}
                className="grid min-h-[72px] place-items-center rounded border border-white/20 bg-white/10 px-3 text-center text-sm font-semibold text-white/90 backdrop-blur-[2px]"
              >
                {name}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.org}
                className="m-0 rounded border border-white/15 border-l-[3px] border-l-adamantine bg-black/25 p-5 backdrop-blur-[2px]"
              >
                <p className="leading-relaxed text-white/90">“{t.quote}”</p>
                <footer className="mt-3 text-sm text-white/60">
                  <strong className="text-white/85">{t.name}</strong> · {t.org}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Logistics — deep port corridor */}
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
            <div className="overflow-hidden rounded-lg border border-white/20 shadow-[0_20px_56px_rgba(0,0,0,0.45)]">
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
