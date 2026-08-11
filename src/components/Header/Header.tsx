import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CartIcon, ChevronIcon } from '../Icons';
import { VERIFICATION_BANNER_ID } from '../VerificationBanner/VerificationBanner';
import './Header.css';

export function Header() {
  const { session } = useAuth();
  const cartRestricted = session.verificationStatus === 'pending';

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <NavLink to="/" className="app-header__logo">
            LeanChem
          </NavLink>
          <span className="app-header__site" aria-hidden="true">
            {session.siteLabel}
            <ChevronIcon className="app-header__site-chevron" />
          </span>
        </div>

        <nav className="app-header__nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Catalog
          </NavLink>
          <NavLink
            to="/tracking"
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            Orders
          </NavLink>
          <NavLink
            to="/settings"
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
              if (cartRestricted) e.preventDefault();
            }}
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
