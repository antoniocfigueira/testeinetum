import { Outlet } from 'react-router-dom'
import AppShell from './AppShell.jsx'

function ApplicationLayout({ onLogout, user }) {
  return (
    <AppShell onLogout={onLogout} user={user}>
      <Outlet />
    </AppShell>
  )
}

export default ApplicationLayout

