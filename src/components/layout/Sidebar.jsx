import {
  Heart,
  LayoutDashboard,
  MapPin,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { createElement } from 'react'
import styles from './Sidebar.module.css'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'local', label: 'Local', icon: MapPin },
  { id: 'settings', label: 'Definições', icon: Settings },
]

function Sidebar({ activePage, isOpen, onClose, onNavigate }) {
  return (
    <aside
      aria-label="Navegação principal"
      className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
      id="app-sidebar"
    >
      <div className={styles.brandRow}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            <Sparkles size={20} strokeWidth={2.25} />
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
          {NAVIGATION_ITEMS.map(({ icon: Icon, id, label }) => {
            const isActive = activePage === id

            return (
              <li key={id}>
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={`${styles.navigationItem} ${isActive ? styles.active : ''}`}
                  onClick={() => onNavigate(id)}
                  type="button"
                >
                  {createElement(Icon, { size: 20, strokeWidth: 2 })}
                  <span>{label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={styles.tip}>
        <span className={styles.tipIcon} aria-hidden="true">
          ✦
        </span>
        <p>
          <strong>Descobre sem limites</strong>
          Explora países e guarda os teus destinos favoritos.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
