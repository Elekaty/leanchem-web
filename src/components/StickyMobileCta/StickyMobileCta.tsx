import { Link, useLocation } from 'react-router-dom'
import './StickyMobileCta.css'

export function StickyMobileCta() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/contact') || pathname.startsWith('/portal')) return null

  return (
    <div className="sticky-mobile-cta" role="region" aria-label="Request quote">
      <Link to="/contact" className="sticky-mobile-cta__btn">
        Request Quote
      </Link>
    </div>
  )
}
