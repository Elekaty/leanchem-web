import { Link } from 'react-router-dom'
import { SITE } from '../../data/marketing'
import './SiteFooter.css'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__logo">{SITE.brand}</p>
          <p className="site-footer__blurb">
            Enterprise B2B chemical procurement for Ethiopian industry — catalog, RFQ, and
            corridor-aware logistics.
          </p>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__label">Explore</p>
          <Link to="/catalog">Catalog</Link>
          <Link to="/about">About</Link>
          <Link to="/news">News</Link>
          <Link to="/contact">Request Quote</Link>
          <Link to="/portal/orders">Client portal</Link>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__label">Contact</p>
          <a href={`mailto:${SITE.emails.commercial}`}>{SITE.emails.commercial}</a>
          <a href={`mailto:${SITE.emails.compliance}`}>{SITE.emails.compliance}</a>
          <p className="site-footer__muted">{SITE.location}</p>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__label">Legal</p>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#cookies">Cookies</a>
        </div>
      </div>
      <div className="site-footer__bar">
        <p>© {new Date().getFullYear()} LeanChem. All rights reserved.</p>
      </div>
    </footer>
  )
}
