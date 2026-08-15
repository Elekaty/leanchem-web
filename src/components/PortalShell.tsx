import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { useShell } from '../context/ShellContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ChevronIcon, MenuIcon, SearchIcon } from './Icons'
import { LeanChemLogo } from './LeanChemLogo'
import { useRfq } from '../context/RfqContext'

export const VERIFICATION_BANNER_ID = 'verification-banner'

const PORTAL_NAV = [
  { to: '/portal/dashboard', label: 'Dashboard' },
  { to: '/portal/orders', label: 'Order History' },
  { to: '/portal/compliance', label: 'Compliance Vault' },
] as const

export function VerificationBanner({ status }: { status: string }) {
  if (status !== 'pending') return null
  return (
    <div
      id={VERIFICATION_BANNER_ID}
      className="relative z-[60] border-b border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-950"
      role="status"
    >
      Account verification pending — pricing and cart actions remain restricted until compliance
      clears.
    </div>
  )
}

export function PortalCommandBar() {
  const { session, logout } = useAuth()
  const { toggleRail, railOpen } = useShell()
  const { itemCount, openDrawer } = useRfq()
  const compact = useMediaQuery('(max-width: 1279px)')
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <header className="relative z-50 border-b border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex h-14 items-center gap-3 px-3 md:px-4">
        {compact ? (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-velvet"
            aria-label="Open workspace navigation"
            aria-expanded={railOpen}
            onClick={toggleRail}
          >
            <MenuIcon />
          </button>
        ) : null}

        <div className="flex min-w-0 items-center gap-2">
          <Link to="/" className="inline-flex no-underline hover:no-underline" aria-label="LeanChem home">
            <LeanChemLogo height={30} />
          </Link>
          <span className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:inline-flex">
            Portal
            <ChevronIcon />
          </span>
        </div>

        <label className="relative ml-auto hidden min-w-0 flex-1 max-w-md md:block">
          <span className="sr-only">Global search</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search catalog by name or CAS…"
            className="h-10 w-full rounded border border-gray-200 bg-gray-50 py-2 pr-3 pl-10 text-sm outline-none focus:border-adamantine"
          />
        </label>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Portal sections">
          {PORTAL_NAV.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded px-3 py-2 text-sm font-semibold no-underline hover:no-underline ${
                  active
                    ? 'bg-gray-100 text-lapis'
                    : 'text-velvet hover:bg-gray-50 hover:text-lapis'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-semibold text-gray-600 sm:inline">
            {session.displayName}
          </span>
          <button
            type="button"
            className="relative inline-flex h-10 items-center gap-1.5 rounded border border-gray-200 px-3 text-sm font-semibold text-lapis hover:border-adamantine"
            aria-label={
              itemCount > 0
                ? `Open RFQ cart, ${itemCount} items`
                : 'Open RFQ cart'
            }
            onClick={openDrawer}
          >
            RFQ
            <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-lapis px-1 text-[0.65rem] font-bold text-white">
              {itemCount}
            </span>
          </button>
          <button type="button" className="btn btn-ghost h-10 min-h-10 px-2 text-xs" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export function PortalLeftRail({ showFacets }: { showFacets: boolean }) {
  const {
    railOpen,
    setRailOpen,
    families,
    purities,
    states,
    selectedFamily,
    selectedPurity,
    selectedState,
    setSelectedFamily,
    setSelectedPurity,
    setSelectedState,
  } = useShell()
  const compact = useMediaQuery('(max-width: 1279px)')
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const closeIfCompact = () => {
    if (compact) setRailOpen(false)
  }

  return (
    <>
      {compact && railOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-velvet/35"
          aria-label="Close navigation"
          onClick={() => setRailOpen(false)}
        />
      ) : null}
      <aside
        className={`z-40 w-[260px] shrink-0 border-r border-gray-200 bg-white transition-transform duration-200 ${
          compact
            ? `fixed top-[var(--shell-top,3.5rem)] bottom-0 left-0 ${
                railOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative translate-x-0'
        }`}
        aria-label="Portal navigation"
      >
        <div className="h-full overflow-y-auto p-4">
          <p className="mb-2 text-[0.68rem] font-semibold tracking-wider text-gray-500 uppercase">
            Workspace
          </p>
          <nav className="mb-6 flex flex-col gap-0.5">
            {PORTAL_NAV.map((item) => {
              const active = pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded px-3 py-2.5 text-sm font-semibold no-underline hover:no-underline ${
                    active
                      ? 'bg-gray-100 text-lapis'
                      : 'text-velvet hover:bg-gray-50'
                  }`}
                  onClick={closeIfCompact}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <p className="mb-2 text-[0.68rem] font-semibold tracking-wider text-gray-500 uppercase">
            Procurement
          </p>
          <nav className="mb-6 flex flex-col gap-0.5">
            <Link
              to="/portal/catalog"
              className={`rounded px-3 py-2.5 text-sm font-semibold no-underline hover:no-underline ${
                pathname.startsWith('/portal/catalog')
                  ? 'bg-gray-100 text-lapis'
                  : 'text-velvet hover:bg-gray-50'
              }`}
              onClick={closeIfCompact}
            >
              Catalog
            </Link>
            <Link
              to="/catalog"
              className="rounded px-3 py-2.5 text-sm font-semibold text-velvet no-underline hover:bg-gray-50 hover:no-underline"
              onClick={closeIfCompact}
            >
              Public catalog
            </Link>
          </nav>

          {showFacets ? (
            <div className="space-y-3">
              <p className="text-[0.68rem] font-semibold tracking-wider text-gray-500 uppercase">
                Filters
              </p>
              <FacetAccordion
                title="Chemical Family"
                options={families}
                selected={selectedFamily}
                onChange={setSelectedFamily}
              />
              <FacetAccordion
                title="Purity Grade"
                options={purities}
                selected={selectedPurity}
                onChange={setSelectedPurity}
              />
              <FacetAccordion
                title="Physical State"
                options={states}
                selected={selectedState}
                onChange={setSelectedState}
              />
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}

function FacetAccordion({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: Array<{ value: string; count: number }>
  selected: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <details className="rounded border border-gray-200 bg-gray-50" open>
      <summary className="cursor-pointer px-3 py-2 text-sm font-bold text-velvet">{title}</summary>
      <ul className="m-0 list-none space-y-1 px-2 pb-2">
        {options.map((option) => (
          <li key={option.value}>
            <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-white">
              <input
                type="checkbox"
                className="accent-lapis"
                checked={selected === option.value}
                onChange={() => onChange(selected === option.value ? null : option.value)}
              />
              <span className="min-w-0 flex-1 truncate font-normal">{option.value}</span>
              <span className="text-xs font-semibold text-gray-500">{option.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </details>
  )
}
