import { Outlet, useLocation } from 'react-router-dom'
import AppShell from './AppShell.jsx'

const PATH_TO_PAGE = {
  '/dashboard': 'dashboard',
  '/favorites': 'favorites',
  '/local': 'local',
  '/settings': 'settings',
}

function ApplicationLayout({ onLogout, user }) {
  const location = useLocation()
  const activePage = PATH_TO_PAGE[location.pathname] ?? 'dashboard'

  return (
    <AppShell activePage={activePage} onLogout={onLogout} user={user}>
      <Outlet />
    </AppShell>
  )
}

export default ApplicationLayout

