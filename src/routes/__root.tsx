import { useState, type ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { LiveRegionProvider } from '../components/LiveRegion'
import { LeanChemLogo } from '../components/LeanChemLogo'
import { RfqCheckoutModal } from '../components/RfqCheckoutModal'
import { RfqDrawer, RfqHeaderButton } from '../components/RfqDrawer'
import { RfqFloatingCart } from '../components/RfqFloatingCart'
import { AuthProvider } from '../context/AuthContext'
import { CatalogDataProvider } from '../context/CatalogDataContext'
import { RfqProvider, useRfq } from '../context/RfqContext'
import { SITE } from '../data/marketing'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'LeanChem — Chemicals You Trust, Values You Deserve',
      },
      {
        name: 'description',
        content:
          'Enterprise B2B chemical procurement for Ethiopian industry — catalog, RFQ, and corridor-aware logistics.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.png', type: 'image/png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isPortal = pathname.startsWith('/portal')

  return (
    <RootDocument>
      <AuthProvider>
        <LiveRegionProvider>
          <CatalogDataProvider>
            <RfqProvider>
              {isPortal ? (
                <Outlet />
              ) : (
                <>
                  <SiteHeader />
                  <main className="w-full flex-1 bg-canvas pb-24 md:pb-0">
                    <Outlet />
                  </main>
                  <SiteFooter />
                  <FloatingChat />
                  <StickyMobileCta />
                  <RfqFloatingCart />
                  <RfqDrawer />
                  <RfqCheckoutModal />
                </>
              )}
            </RfqProvider>
          </CatalogDataProvider>
        </LiveRegionProvider>
      </AuthProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-velvet">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const NAV = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Request Quote' },
] as const

function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-organza/40 bg-white/95 shadow-[0_1px_3px_rgba(34,34,53,0.05)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          to="/"
          className="inline-flex items-center no-underline hover:no-underline"
          onClick={() => setOpen(false)}
          aria-label="LeanChem home"
        >
          <LeanChemLogo height={34} />
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded border border-organza/40 text-velvet md:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>

        <nav
          id="site-nav"
          className={`${
            open ? 'flex' : 'hidden'
          } absolute left-0 right-0 top-16 flex-col gap-1 border-b border-organza/30 bg-white px-4 py-3 shadow-md md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:text-lapis hover:no-underline"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-1 md:mt-0 md:ml-1" onClick={() => setOpen(false)}>
            <RfqHeaderButton />
          </div>
          <Link
            to="/portal"
            className="mt-1 rounded border border-organza px-3 py-2 text-center text-sm font-semibold text-lapis no-underline hover:border-adamantine hover:no-underline md:mt-0 md:ml-2"
            onClick={() => setOpen(false)}
          >
            Sign in / Portal
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-auto bg-velvet text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <LeanChemLogo inverted height={40} className="opacity-95" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Enterprise B2B chemical procurement for Ethiopian industry — catalog, RFQ, and
            corridor-aware logistics.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-organza">Explore</p>
          <Link to="/catalog" className="text-adamantine no-underline hover:underline">
            Catalog
          </Link>
          <Link to="/about" className="text-adamantine no-underline hover:underline">
            About
          </Link>
          <Link to="/news" className="text-adamantine no-underline hover:underline">
            News
          </Link>
          <Link to="/contact" className="text-adamantine no-underline hover:underline">
            Request Quote
          </Link>
          <Link to="/portal" className="text-adamantine no-underline hover:underline">
            Client portal
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-organza">Contact</p>
          <a
            href={`mailto:${SITE.emails.commercial}`}
            className="text-adamantine no-underline hover:underline"
          >
            {SITE.emails.commercial}
          </a>
          <a
            href={`tel:${SITE.phones.primary.replace(/\s/g, '')}`}
            className="text-adamantine no-underline hover:underline"
          >
            {SITE.phones.primary}
          </a>
          <a
            href={`tel:${SITE.phones.secondary.replace(/\s/g, '')}`}
            className="text-adamantine no-underline hover:underline"
          >
            {SITE.phones.secondary}
          </a>
          <p className="mt-1 text-white/55">{SITE.location}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-organza">Legal</p>
          <a href="#privacy" className="text-adamantine no-underline hover:underline">
            Privacy
          </a>
          <a href="#terms" className="text-adamantine no-underline hover:underline">
            Terms
          </a>
          <a href="#cookies" className="text-adamantine no-underline hover:underline">
            Cookies
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} LeanChem. All rights reserved.
      </div>
    </footer>
  )
}

function StickyMobileCta() {
  const { itemCount, openDrawer } = useRfq()
  const reviewLabel = itemCount > 0 ? `Review RFQ (${itemCount})` : 'Review RFQ'
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-organza/30 bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary relative flex-1"
          onClick={openDrawer}
          aria-label={
            itemCount > 0
              ? `Review RFQ, ${itemCount} item${itemCount === 1 ? '' : 's'}`
              : 'Review RFQ'
          }
        >
          {reviewLabel}
        </button>
        <Link
          to="/contact"
          search={{ fromRfq: '1' }}
          className="btn btn-primary flex flex-1 no-underline hover:no-underline"
        >
          Submit RFQ
        </Link>
      </div>
    </div>
  )
}

function FloatingChat() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed right-5 bottom-24 z-40 flex flex-col items-end gap-2 md:bottom-24">
      {open ? (
        <div
          className="flex w-52 flex-col gap-2 rounded-lg border border-organza/30 bg-white p-3 shadow-xl"
          role="dialog"
          aria-label="Chat with LeanChem"
        >
          <p className="text-sm font-semibold text-velvet">Talk to LeanChem</p>
          <a
            href={SITE.chat.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-canvas px-3 py-2 text-sm font-semibold text-lapis no-underline hover:bg-adamantine/15 hover:no-underline"
          >
            WhatsApp
          </a>
          <a
            href={SITE.chat.telegram}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-canvas px-3 py-2 text-sm font-semibold text-lapis no-underline hover:bg-adamantine/15 hover:no-underline"
          >
            Telegram
          </a>
        </div>
      ) : null}
      <button
        type="button"
        className="min-h-12 rounded-full bg-lapis px-5 text-sm font-semibold text-white shadow-lg shadow-lapis/30"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Chat'}
      </button>
    </div>
  )
}
