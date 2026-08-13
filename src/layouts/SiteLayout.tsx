import { Outlet } from 'react-router-dom'
import { FloatingChat } from '../components/FloatingChat/FloatingChat'
import { SiteFooter } from '../components/SiteFooter/SiteFooter'
import { SiteHeader } from '../components/SiteHeader/SiteHeader'
import { StickyMobileCta } from '../components/StickyMobileCta/StickyMobileCta'
import './SiteLayout.css'

export function SiteLayout() {
  return (
    <div className="site-layout">
      <SiteHeader />
      <main className="site-main">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingChat />
      <StickyMobileCta />
    </div>
  )
}
