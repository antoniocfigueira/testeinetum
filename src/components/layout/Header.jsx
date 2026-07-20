import { Menu, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'
import GoogleSignInButton from '../auth/GoogleSignInButton.jsx'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import styles from './Header.module.css'

function Header({ onLogout, onMenuOpen, user }) {
  return (
    <header className={styles.header}>
      <div className={styles.leading}>
        <button
          aria-controls="app-sidebar"
          aria-label="Abrir menu de navegação"
          className={styles.menuButton}
          onClick={onMenuOpen}
          type="button"
        >
          <Menu size={21} />
        </button>

        <Link
          aria-label="Inetum Travel — Dashboard"
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

