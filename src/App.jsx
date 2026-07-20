import { Navigate, Route, Routes } from 'react-router-dom'
import ApplicationLayout from './components/layout/ApplicationLayout.jsx'
import useAuth from './hooks/useAuth.js'
import FavoritesPage from './pages/FavoritesPage.jsx'
import LocalPage from './pages/LocalPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function App() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <Routes>
      <Route element={<ApplicationLayout onLogout={logout} user={user} />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="login" element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={null} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="local" element={<LocalPage />} />
        <Route
          path="settings"
          element={
            isAuthenticated ? (
              <SettingsPage />
            ) : (
              <Navigate
                replace
                state={{ loginRequired: 'settings' }}
                to="/dashboard"
              />
            )
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
