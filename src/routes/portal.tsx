import { Outlet, createFileRoute, Navigate, useRouterState } from '@tanstack/react-router'
import { RfqCheckoutModal } from '../components/RfqCheckoutModal'
import { RfqDrawer } from '../components/RfqDrawer'
import { RfqFloatingCart } from '../components/RfqFloatingCart'
import {
  PortalCommandBar,
  PortalLeftRail,
  VerificationBanner,
} from '../components/PortalShell'
import { useAuth } from '../context/AuthContext'
import { ShellProvider } from '../context/ShellContext'

export const Route = createFileRoute('/portal')({
  component: PortalLayoutRoute,
})

function PortalLayoutRoute() {
  const { session } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isGate = pathname === '/portal' || pathname === '/portal/'
  const showFacets = pathname.startsWith('/portal/catalog')
  const hasBanner = session.isLoggedIn && session.verificationStatus === 'pending'

  if (isGate) {
    return <Outlet />
  }

  if (!session.isLoggedIn) {
    return <Navigate to="/portal" />
  }

  return (
    <ShellProvider>
      <div
        className="flex min-h-dvh flex-col bg-gray-50"
        style={{
          ['--shell-top' as string]: hasBanner ? '6.25rem' : '3.5rem',
        }}
      >
        <div className="sticky top-0 z-[60]">
          <VerificationBanner status={session.verificationStatus} />
          <PortalCommandBar />
        </div>
        <div className="relative flex min-h-0 flex-1">
          <PortalLeftRail showFacets={showFacets} />
          <main className="min-w-0 flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
        <RfqFloatingCart />
        <RfqDrawer />
        <RfqCheckoutModal />
      </div>
    </ShellProvider>
  )
}
