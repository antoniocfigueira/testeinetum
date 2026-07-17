import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ApplicationLayout from './components/layout/ApplicationLayout.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import LocalPage from './pages/LocalPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

const DEFAULT_USER = {
  name: 'Utilizador Inetum',
  email: 'utilizador@inetum.com',
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            isAuthenticated={isAuthenticated}
            onLogin={() => setIsAuthenticated(true)}
          />
        }
      />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route
          element={
            <ApplicationLayout
              onLogout={() => setIsAuthenticated(false)}
              user={DEFAULT_USER}
            />
          }
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
