import {
  Globe2,
  Heart,
  LayoutDashboard,
  MapPin,
  Settings,
  X,
} from 'lucide-react'
import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Favoritos', icon: Heart, path: '/favorites' },
  { label: 'Local', icon: MapPin, path: '/local' },
  {
    label: 'Definições',
    icon: Settings,
    path: '/settings',
    requiresAuth: true,
  },
]

function Sidebar({ isAuthenticated, isOpen, onClose, onLoginRequired }) {
  return (
    <>
      <div aria-hidden="true" className={styles.edgeTrigger} />
      <aside
        aria-label="Navegação principal"
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        id="app-sidebar"
      >
      <div className={styles.brandRow}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            <Globe2 size={24} strokeWidth={1.9} />
          </span>
          <span>
            <strong>Inetum</strong>
            <small>Travel</small>
          </span>
        </div>

        <button
          aria-label="Fechar menu"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      <nav className={styles.navigation}>
        <span className={styles.navigationLabel}>Explorar</span>
        <ul className={styles.navigationList}>
          {NAVIGATION_ITEMS.map(
            ({ icon: Icon, label, path, requiresAuth }) => (
              <li key={path}>
                <NavLink
                  aria-label={label}
                  className={({ isActive }) =>
                    `${styles.navigationItem} ${isActive ? styles.active : ''}`
                  }
                  onClick={(event) => {
                    if (requiresAuth && !isAuthenticated) {
                      event.preventDefault()
                      onLoginRequired('settings')
                    }
                    onClose()
                  }}
                  to={path}
                >
                  {createElement(Icon, { size: 20, strokeWidth: 2 })}
                  <span>{label}</span>
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </nav>
      </aside>
    </>
  )
}

export default Sidebar
