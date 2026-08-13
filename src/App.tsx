import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PortalIndexRedirect, PortalLayout } from './layouts/PortalLayout'
import { SiteLayout } from './layouts/SiteLayout'
import { AboutPage } from './pages/AboutPage'
import { CatalogPage } from './pages/CatalogPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { NewsArticlePage, NewsPage } from './pages/NewsPage'
import { PortalCatalogPage } from './pages/PortalCatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { SettingsPage } from './pages/SettingsPage'
import { TrackingPage } from './pages/TrackingPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="catalog/:slug" element={<ProductDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:slug" element={<NewsArticlePage />} />
          </Route>

          <Route path="portal" element={<PortalLayout />}>
            <Route index element={<PortalIndexRedirect />} />
            <Route path="catalog" element={<PortalCatalogPage />} />
            <Route path="orders" element={<TrackingPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="tracking" element={<Navigate to="/portal/orders" replace />} />
          <Route path="settings" element={<Navigate to="/portal/settings" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
