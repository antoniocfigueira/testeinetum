import { useState } from 'react'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import styles from './AppShell.module.css'

function AppShell({ activePage, children, onLogout, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Saltar para o conteúdo
      </a>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
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
          activePage={activePage}
          onLogout={onLogout}
          onMenuOpen={() => setIsSidebarOpen(true)}
          user={user}
        />

        <main className={styles.main} id="main-content" tabIndex="-1">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default AppShell
