import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle/ThemeToggle.jsx'
import styles from './PublicPage.module.css'

function LoginPage({ isAuthenticated, onLogin }) {
  const location = useLocation()
  const navigate = useNavigate()
  const destination = location.state?.from?.pathname ?? '/dashboard'

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const handlePreviewLogin = () => {
    onLogin()
    navigate(destination, { replace: true })
  }

  return (
    <main className={styles.page}>
      <div className={styles.themeControl}>
        <ThemeToggle />
      </div>

      <section className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <span>
            <strong>Inetum</strong>
            <small>Travel</small>
          </span>
        </div>

        <span className={styles.statusIcon} aria-hidden="true">
          <ShieldCheck size={29} />
        </span>
        <h1>Bem-vindo de volta</h1>
        <p>Inicia sessão para descobrires países e planeares a próxima viagem.</p>

        <button className={styles.primaryButton} onClick={handlePreviewLogin} type="button">
          Iniciar sessão
          <ArrowRight size={18} />
        </button>
      </section>
    </main>
  )
}

export default LoginPage
