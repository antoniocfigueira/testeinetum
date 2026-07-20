import { GoogleLogin } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth.js'
import useTheme from '../../hooks/useTheme.js'
import useToast from '../../hooks/useToast.js'
import styles from './GoogleSignInButton.module.css'

function GoogleSignInButton({ onSuccess }) {
  const {
    isGoogleConfigured,
    login,
    reportLoginError,
  } = useAuth()
  const { isDark } = useTheme()
  const { addToast } = useToast()
  const [isCompact, setIsCompact] = useState(() =>
    window.matchMedia('(max-width: 600px)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 600px)')
    const handleChange = (event) => setIsCompact(event.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleSuccess = (credentialResponse) => {
    if (login(credentialResponse)) {
      addToast('A sessão foi iniciada com sucesso.', {
        title: 'Bem-vindo',
        type: 'success',
      })
      onSuccess?.()
      return
    }

    addToast('Não foi possível iniciar sessão com a conta Google.', {
      title: 'Falha na autenticação',
      type: 'error',
    })
  }

  const handleError = () => {
    reportLoginError()
    addToast('Não foi possível iniciar sessão com a conta Google.', {
      title: 'Falha na autenticação',
      type: 'error',
    })
  }

  if (!isGoogleConfigured) {
    return (
      <span className={styles.configurationError} role="alert">
        Google não configurado
      </span>
    )
  }

  return (
    <div className={styles.wrapper}>
      <GoogleLogin
        key={`${isDark ? 'dark' : 'light'}-${isCompact ? 'compact' : 'full'}`}
        locale="pt-PT"
        logo_alignment="left"
        onError={handleError}
        onSuccess={handleSuccess}
        shape="pill"
        size="large"
        text="signin_with"
        theme={isDark ? 'filled_black' : 'outline'}
        type={isCompact ? 'icon' : 'standard'}
        width={isCompact ? undefined : '210'}
      />
    </div>
  )
}

export default GoogleSignInButton
