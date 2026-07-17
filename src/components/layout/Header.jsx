import { Menu } from 'lucide-react'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import styles from './Header.module.css'

function Header({ onLogout, onMenuOpen, user }) {
  return (
    <header className={styles.header}>
      <button
        aria-controls="app-sidebar"
        aria-label="Abrir menu de navegação"
        className={styles.menuButton}
        onClick={onMenuOpen}
        type="button"
      >
        <Menu size={21} />
      </button>

      <div className={styles.actions}>
        <ThemeToggle />
        <ProfileMenu onLogout={onLogout} user={user} />
      </div>
    </header>
  )
}

export default Header

