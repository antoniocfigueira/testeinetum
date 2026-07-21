import { Globe2, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'
import GoogleSignInButton from '../auth/GoogleSignInButton.jsx'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import styles from './Header.module.css'

function Header({ isSidebarOpen, onLogout, onMenuOpen, user }) {
  return (
    <header className={styles.header}>
      <button
        aria-controls="app-sidebar"
        aria-expanded={isSidebarOpen}
        aria-label="Abrir navegação"
        className={`${styles.menuButton} ${
          isSidebarOpen ? styles.menuButtonOpen : ''
        }`}
        onClick={onMenuOpen}
        type="button"
      >
        <Globe2 size={23} strokeWidth={1.9} />
      </button>

      <div className={styles.leading}>
        <Link
          aria-label="Inetum Travel - Dashboard"
          className={styles.brand}
          to="/dashboard"
        >
          <Plane
            aria-hidden="true"
            className={styles.brandMark}
            size={21}
            strokeWidth={1.9}
          />
          <strong>Inetum Travel</strong>
        </Link>
      </div>

      <div className={styles.actions}>
        <ThemeToggle />
        {user ? (
          <ProfileMenu onLogout={onLogout} user={user} />
        ) : (
          <GoogleSignInButton compact />
        )}
      </div>
    </header>
  )
}

export default Header
