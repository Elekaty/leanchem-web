import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { LeftRail } from './components/LeftRail/LeftRail'
import { VerificationBanner } from './components/VerificationBanner/VerificationBanner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ShellProvider } from './context/ShellContext'
import { CatalogPage } from './pages/CatalogPage'
import { SettingsPage } from './pages/SettingsPage'
import { TrackingPage } from './pages/TrackingPage'

function Shell() {
  const { session } = useAuth()
  const hasBanner = session.verificationStatus === 'pending'

  return (
    <div className={`app-shell ${hasBanner ? 'has-banner' : ''}`}>
      <Header />
      <VerificationBanner verificationStatus={session.verificationStatus} />
      <div className="app-body">
        <LeftRail />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShellProvider>
          <Shell />
        </ShellProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
