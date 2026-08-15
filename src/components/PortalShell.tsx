import { Link } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { useShell } from '../context/ShellContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { CartIcon, ChevronIcon, MenuIcon, SearchIcon } from './Icons'
import { LeanChemLogo } from './LeanChemLogo'

export const VERIFICATION_BANNER_ID = 'verification-banner'

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
  const { session } = useAuth()
  const { toggleRail, railOpen } = useShell()
  const compact = useMediaQuery('(max-width: 1279px)')
  const cartRestricted = session.verificationStatus === 'pending'

  return (
    <header className="relative z-50 border-b border-organza/30 bg-white shadow-[0_1px_3px_rgba(34,34,53,0.06)]">
      <div className="flex h-14 items-center gap-3 px-3 md:px-4">
        {compact ? (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-organza/40 text-velvet"
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
          <span className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-wide text-organza sm:inline-flex">
            Portal
            <ChevronIcon />
          </span>
        </div>

        <label className="relative ml-auto hidden min-w-0 flex-1 max-w-md md:block">
          <span className="sr-only">Global search</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-organza" />
          <input
            type="search"
            placeholder="Search catalog by name or CAS…"
            className="h-10 w-full rounded border border-organza/40 bg-canvas py-2 pr-3 pl-10 text-sm outline-none focus:border-adamantine"
          />
        </label>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <Link
            to="/portal/catalog"
            className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:text-lapis hover:no-underline"
          >
            Catalog
          </Link>
          <Link
            to="/portal/orders"
            className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:text-lapis hover:no-underline"
          >
            Orders
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-semibold text-velvet/70 sm:inline">
            {session.displayName}
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-organza/40 text-lapis"
            aria-label={cartRestricted ? 'Cart restricted pending verification' : 'Open cart'}
            aria-disabled={cartRestricted || undefined}
            aria-describedby={cartRestricted ? VERIFICATION_BANNER_ID : undefined}
            onClick={(e) => {
              if (cartRestricted) e.preventDefault()
            }}
          >
            <CartIcon />
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
        className={`z-40 w-[280px] shrink-0 border-r border-organza/30 bg-white transition-transform duration-200 ${
          compact
            ? `fixed top-[var(--shell-top,3.5rem)] bottom-0 left-0 ${
                railOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative translate-x-0'
        }`}
        aria-label="Account and filters"
      >
        <div className="h-full overflow-y-auto p-4">
          <p className="mb-2 text-[0.68rem] font-semibold tracking-wider text-organza uppercase">
            Workspace
          </p>
          <nav className="mb-6 flex flex-col gap-1">
            <Link
              to="/portal/catalog"
              className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:no-underline"
              onClick={closeIfCompact}
            >
              Catalog
            </Link>
            <Link
              to="/portal/orders"
              className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:no-underline"
              onClick={closeIfCompact}
            >
              Orders
            </Link>
            <Link
              to="/portal"
              className="rounded px-3 py-2 text-sm font-semibold text-velvet no-underline hover:bg-canvas hover:no-underline"
              onClick={closeIfCompact}
            >
              Account
            </Link>
          </nav>

          {showFacets ? (
            <div className="space-y-3">
              <p className="text-[0.68rem] font-semibold tracking-wider text-organza uppercase">
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
    <details className="rounded border border-organza/30 bg-canvas/60" open>
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
              <span className="text-xs font-semibold text-organza">{option.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </details>
  )
}
