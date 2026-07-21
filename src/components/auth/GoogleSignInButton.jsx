import { GoogleLogin } from '@react-oauth/google'
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
  const showIconOnly = compact

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

  if (showIconOnly) {
    return (
      <div className={`${styles.wrapper} ${styles.compact}`}>
        <div
          aria-hidden={!isDark}
          className={`${styles.compactVariant} ${
            isDark ? styles.compactVariantActive : ''
          }`}
        >
          <GoogleLogin
            locale="pt-PT"
            logo_alignment="center"
            onError={handleError}
            onSuccess={handleSuccess}
            shape="circle"
            size="large"
            text="signin_with"
            theme="filled_black"
            type="icon"
          />
        </div>

        <div
          aria-hidden={isDark}
          className={`${styles.compactVariant} ${
            !isDark ? styles.compactVariantActive : ''
          }`}
        >
          <GoogleLogin
            locale="pt-PT"
            logo_alignment="center"
            onError={handleError}
            onSuccess={handleSuccess}
            shape="circle"
            size="large"
            text="signin_with"
            theme="filled_blue"
            type="icon"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <GoogleLogin
        locale="pt-PT"
        logo_alignment="left"
        onError={handleError}
        onSuccess={handleSuccess}
        shape="pill"
        size="large"
        text="signin_with"
        theme="outline"
        type="standard"
        width="210"
      />
    </div>
  )
}

export default GoogleSignInButton
