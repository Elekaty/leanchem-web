import type { ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'LeanChems — Chemicals You Trust, Values You Deserve',
      },
      {
        name: 'description',
        content:
          'Enterprise B2B chemical procurement for Ethiopian industry — catalog, RFQ, and logistics.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <SiteFooter />
      <StickyMobileCta />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-canvas text-velvet">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const NAV = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About' },
  { to: '/news/welcome', label: 'News' },
  { to: '/contact', label: 'Request Quote' },
  { to: '/portal', label: 'Client Portal' },
] as const

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-organza/30 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="no-underline hover:no-underline">
          <span className="block text-xl font-bold tracking-tight text-lapis">LeanChems</span>
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-organza">
            Chemicals You Trust
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:text-lapis hover:no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/contact"
          className="rounded bg-lapis px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-lapis/90 hover:no-underline md:hidden"
        >
          Quote
        </Link>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-organza/20 bg-velvet text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">LeanChems</p>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            Chemicals You Trust, Values You Deserve — B2B procurement for Ethiopian industry.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/catalog" className="text-adamantine hover:underline">
            Catalog
          </Link>
          <Link to="/contact" className="text-adamantine hover:underline">
            Request Quote
          </Link>
          <Link to="/portal" className="text-adamantine hover:underline">
            Client Portal
          </Link>
          <Link to="/admin/documents" className="text-adamantine hover:underline">
            Admin Documents
          </Link>
        </div>
        <div className="text-sm text-white/70">
          <p>Phase 1 foundation scaffold</p>
          <p className="mt-1">TanStack Start · Tailwind v4 · Supabase-ready</p>
        </div>
      </div>
    </footer>
  )
}

function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-organza/30 bg-white/95 p-3 backdrop-blur md:hidden">
      <Link
        to="/contact"
        className="flex min-h-12 w-full items-center justify-center rounded bg-lapis text-sm font-semibold text-white no-underline hover:no-underline"
      >
        Request Quote
      </Link>
    </div>
  )
}
