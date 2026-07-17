import { GoogleLogin } from '@react-oauth/google'
import { AlertCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle/ThemeToggle.jsx'
import useAuth from '../hooks/useAuth.js'
import useTheme from '../hooks/useTheme.js'
import styles from './PublicPage.module.css'

function LoginPage() {
  const {
    authError,
    isAuthenticated,
    isGoogleConfigured,
    login,
    reportLoginError,
  } = useAuth()
  const { isDark } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const requestedLocation = location.state?.from
  const destination = requestedLocation
    ? `${requestedLocation.pathname}${requestedLocation.search}${requestedLocation.hash}`
    : '/dashboard'

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const handleGoogleSuccess = (credentialResponse) => {
    if (login(credentialResponse)) {
      navigate(destination, { replace: true })
    }
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

        <div className={styles.googleButton}>
          {isGoogleConfigured ? (
            <GoogleLogin
              key={isDark ? 'dark' : 'light'}
              locale="pt-PT"
              logo_alignment="left"
              onError={reportLoginError}
              onSuccess={handleGoogleSuccess}
              shape="pill"
              size="large"
              text="continue_with"
              theme={isDark ? 'filled_black' : 'outline'}
              width="320"
            />
          ) : (
            <div className={styles.configurationNotice} role="alert">
              Define <code>VITE_GOOGLE_CLIENT_ID</code> para ativar o início de
              sessão Google.
            </div>
          )}
        </div>

        {authError && (
          <div className={styles.authError} role="alert">
            <AlertCircle aria-hidden="true" size={18} />
            <span>{authError}</span>
          </div>
        )}

        <small className={styles.securityNote}>
          A autenticação é processada de forma segura pela Google.
        </small>
      </section>
    </main>
  )
}

export default LoginPage
