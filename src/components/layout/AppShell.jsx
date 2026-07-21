import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LoginPromptModal from '../auth/LoginPromptModal.jsx'
import LoginPromptContext from '../../context/loginPromptContext.js'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import InteractiveNetworkBackground from './InteractiveNetworkBackground.jsx'
import Sidebar from './Sidebar.jsx'
import styles from './AppShell.module.css'

function AppShell({ children, onLogout, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loginPromptReason, setLoginPromptReason] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const openLoginPrompt = useCallback((reason = 'favorites') => {
    setLoginPromptReason(reason)
  }, [])

  const closeLoginPrompt = useCallback(() => {
    setLoginPromptReason(null)
  }, [])

  useEffect(() => {
    const requestedReason = location.state?.loginRequired

    if (!requestedReason || user) return

    openLoginPrompt(requestedReason)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, openLoginPrompt, user])

  const loginPromptValue = useMemo(
    () => ({ openLoginPrompt }),
    [openLoginPrompt],
  )

  return (
    <LoginPromptContext.Provider value={loginPromptValue}>
      <div className={styles.shell}>
        <InteractiveNetworkBackground />

        <a className={styles.skipLink} href="#main-content">
          Saltar para o conteúdo
        </a>

        <Sidebar
          isAuthenticated={Boolean(user)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLoginRequired={openLoginPrompt}
        />

        {isSidebarOpen && (
          <button
            aria-label="Fechar menu de navegação"
            className={styles.backdrop}
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          />
        )}

        <div className={styles.workspace}>
          <Header
            isSidebarOpen={isSidebarOpen}
            onLogout={onLogout}
            onMenuOpen={() => setIsSidebarOpen((currentValue) => !currentValue)}
            user={user}
          />

          <main className={styles.main} id="main-content" tabIndex="-1">
            {children}
          </main>

          <Footer />
        </div>
      </div>

      {loginPromptReason && !user && (
        <LoginPromptModal
          onClose={closeLoginPrompt}
          reason={loginPromptReason}
        />
      )}
    </LoginPromptContext.Provider>
  )
}

export default AppShell
