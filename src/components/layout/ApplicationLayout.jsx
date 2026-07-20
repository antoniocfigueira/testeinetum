import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardPage from '../../pages/DashboardPage.jsx'
import AppShell from './AppShell.jsx'

function ApplicationLayout({ onLogout, user }) {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'
  const [hasVisitedDashboard, setHasVisitedDashboard] = useState(isDashboard)

  useEffect(() => {
    if (isDashboard) setHasVisitedDashboard(true)
  }, [isDashboard])

  return (
    <AppShell onLogout={onLogout} user={user}>
      {(hasVisitedDashboard || isDashboard) && (
        <div hidden={!isDashboard}>
          <DashboardPage isActive={isDashboard} />
        </div>
      )}
      {!isDashboard && <Outlet />}
    </AppShell>
  )
}

export default ApplicationLayout

