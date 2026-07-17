import { Navigate, Route, Routes } from 'react-router-dom'
import ApplicationLayout from './components/layout/ApplicationLayout.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import useAuth from './hooks/useAuth.js'
import DashboardPage from './pages/DashboardPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import LocalPage from './pages/LocalPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function App() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={<ApplicationLayout onLogout={logout} user={user} />}
        >
          <Route index element={<Navigate replace to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="local" element={<LocalPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<NotFoundPage isAuthenticated={isAuthenticated} />}
      />
    </Routes>
  )
}

export default App
