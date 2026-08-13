import { Navigate, Outlet } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { LeftRail } from '../components/LeftRail/LeftRail'
import { VerificationBanner } from '../components/VerificationBanner/VerificationBanner'
import { useAuth } from '../context/AuthContext'
import { ShellProvider } from '../context/ShellContext'

export function PortalLayout() {
  const { session } = useAuth()
  const hasBanner = session.verificationStatus === 'pending'

  return (
    <ShellProvider>
      <div className={`app-shell ${hasBanner ? 'has-banner' : ''}`}>
        <Header />
        <VerificationBanner verificationStatus={session.verificationStatus} />
        <div className="app-body">
          <LeftRail />
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </ShellProvider>
  )
}

export function PortalIndexRedirect() {
  return <Navigate to="/portal/catalog" replace />
}
