import { Moon, Sun } from 'lucide-react'
import useTheme from '../../hooks/useTheme.js'
import styles from './ThemeToggle.module.css'

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const nextTheme = isDark ? 'claro' : 'escuro'

  return (
    <button
      aria-label={`Ativar modo ${nextTheme}`}
      className={styles.toggle}
      onClick={toggleTheme}
      title={`Ativar modo ${nextTheme}`}
      type="button"
    >
      <span className={styles.icon} aria-hidden="true">
        {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
      </span>
      <span className={styles.label}>Modo {nextTheme}</span>
    </button>
  )
}

export default ThemeToggle

