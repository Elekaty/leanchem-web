import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useShell } from '../../context/ShellContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { CartIcon, ChevronIcon, MenuIcon } from '../Icons'
import { VERIFICATION_BANNER_ID } from '../VerificationBanner/VerificationBanner'
import './Header.css'

export function Header() {
  const { session } = useAuth()
  const { toggleRail, railOpen } = useShell()
  const compact = useMediaQuery('(max-width: 1279px)')
  const cartRestricted = session.verificationStatus === 'pending'

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {compact ? (
          <button
            type="button"
            className="app-header__menu"
            aria-label="Open workspace navigation"
            aria-expanded={railOpen}
            onClick={toggleRail}
          >
            <MenuIcon />
          </button>
        ) : null}
        <div className="app-header__brand">
          <NavLink to="/" className="app-header__logo">
            LeanChem
          </NavLink>
          <span className="app-header__site" aria-hidden="true">
            Portal
            <ChevronIcon className="app-header__site-chevron" />
          </span>
        </div>

        <nav className="app-header__nav" aria-label="Primary">
          <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Catalog
          </NavLink>
          <NavLink
            to="/portal/orders"
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            Orders
          </NavLink>
          <NavLink
            to="/portal/settings"
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            Settings
          </NavLink>
        </nav>

        <div className="app-header__actions">
          <span className="app-header__role" role="presentation">
            {session.displayName}
          </span>
          <button
            type="button"
            className="app-header__cart"
            aria-label={cartRestricted ? 'Cart restricted pending verification' : 'Open cart'}
            aria-disabled={cartRestricted ? true : undefined}
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
