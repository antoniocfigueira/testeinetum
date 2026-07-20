import { GoogleLogin } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth.js'
import useTheme from '../../hooks/useTheme.js'
import styles from './GoogleSignInButton.module.css'

function GoogleSignInButton({ compact = false, onSuccess }) {
  const {
    isGoogleConfigured,
    login,
    reportLoginError,
  } = useAuth()
  const { isDark } = useTheme()
  const [isCompact, setIsCompact] = useState(() =>
    window.matchMedia('(max-width: 600px)').matches,
  )
  const showIconOnly = compact || isCompact

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 600px)')
    const handleChange = (event) => setIsCompact(event.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleSuccess = (credentialResponse) => {
    if (login(credentialResponse)) {
      onSuccess?.()
    }
  }

  const handleError = () => {
    reportLoginError()
  }

  if (!isGoogleConfigured) {
    return (
      <span className={styles.configurationError} role="alert">
        Google não configurado
      </span>
    )
  }

  return (
    <div className={`${styles.wrapper} ${showIconOnly ? styles.compact : ''}`}>
      <GoogleLogin
        key={`${isDark ? 'dark' : 'light'}-${showIconOnly ? 'compact' : 'full'}`}
        locale="pt-PT"
        logo_alignment="left"
        onError={handleError}
        onSuccess={handleSuccess}
        shape={showIconOnly ? 'circle' : 'pill'}
        size="large"
        text="signin_with"
        theme={isDark ? 'filled_black' : 'outline'}
        type={showIconOnly ? 'icon' : 'standard'}
        width={showIconOnly ? undefined : '210'}
      />
    </div>
  )
}

export default GoogleSignInButton
