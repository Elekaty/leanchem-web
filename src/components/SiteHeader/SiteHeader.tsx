import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MenuIcon } from '../Icons'
import './SiteHeader.css'

const NAV = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Request Quote' },
]

export function SiteHeader() {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" onClick={() => setOpen(false)}>
          <span className="site-header__mark">LeanChem</span>
          <span className="site-header__tag">Industrial Procurement</span>
        </Link>

        <button
          type="button"
          className="site-header__menu"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon />
        </button>

        <nav id="site-nav" className={`site-header__nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/portal/orders"
            className={({ isActive }) => `site-header__portal ${isActive ? 'is-active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {session.isLoggedIn ? 'Client portal' : 'Sign in'}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
