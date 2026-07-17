import { Menu } from 'lucide-react'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import styles from './Header.module.css'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  favorites: 'Favoritos',
  local: 'Local',
  settings: 'Definições',
}

function Header({ activePage, onLogout, onMenuOpen, user }) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <button
          aria-controls="app-sidebar"
          aria-label="Abrir menu de navegação"
          className={styles.menuButton}
          onClick={onMenuOpen}
          type="button"
        >
          <Menu size={21} />
        </button>

        <div>
          <span className={styles.websiteName}>Inetum Travel</span>
          <strong className={styles.pageName}>
            {PAGE_TITLES[activePage] ?? 'Dashboard'}
          </strong>
        </div>
      </div>

      <div className={styles.actions}>
        <ThemeToggle />
        <ProfileMenu onLogout={onLogout} user={user} />
      </div>
    </header>
  )
}

export default Header

