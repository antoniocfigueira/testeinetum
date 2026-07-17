import { Navigate, Outlet, useLocation } from 'react-router-dom'

function ProtectedRoute({ isAuthenticated }) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}

export default ProtectedRoute

