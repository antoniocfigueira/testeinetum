import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google'
import { useCallback, useEffect, useMemo, useState } from 'react'
import parseGoogleCredential from '../utils/googleCredential.js'
import AuthContext from './authContext.js'

const SESSION_KEY = 'inetum-travel-auth-session'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''
const SCRIPT_ERROR =
  'Não foi possível carregar o início de sessão Google. Verifica a ligação e tenta novamente.'
const LOGIN_ERROR =
  'Não foi possível iniciar sessão com a conta Google. Tenta novamente.'

function removeStoredSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    return false
  }

  return true
}

function readStoredSession() {
  try {
    const storedValue = sessionStorage.getItem(SESSION_KEY)

    if (!storedValue) return null

    const session = JSON.parse(storedValue)
    const hasValidUser =
      session?.user?.id && session.user.name && session.user.email

    if (!hasValidUser || session.expiresAt <= Date.now()) {
      removeStoredSession()
      return null
    }

    return session
  } catch {
    removeStoredSession()
    return null
  }
}

function persistSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    return false
  }

  return true
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)
  const [authError, setAuthError] = useState(null)
  const isGoogleConfigured = Boolean(GOOGLE_CLIENT_ID)

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const logout = useCallback(() => {
    googleLogout()
    removeStoredSession()
    setSession(null)
    setAuthError(null)
  }, [])

  const login = useCallback((credentialResponse) => {
    try {
      const nextSession = parseGoogleCredential(
        credentialResponse?.credential,
        GOOGLE_CLIENT_ID,
      )

      persistSession(nextSession)
      setSession(nextSession)
      setAuthError(null)
      return true
    } catch {
      removeStoredSession()
      setSession(null)
      setAuthError(LOGIN_ERROR)
      return false
    }
  }, [])

  const reportLoginError = useCallback(() => {
    setAuthError(LOGIN_ERROR)
  }, [])

  const handleScriptLoadError = useCallback(() => {
    setAuthError(SCRIPT_ERROR)
  }, [])

  const handleScriptLoadSuccess = useCallback(() => {
    setAuthError((currentError) =>
      currentError === SCRIPT_ERROR ? null : currentError,
    )
  }, [])

  useEffect(() => {
    if (!session?.expiresAt) return undefined

    const remainingTime = session.expiresAt - Date.now()

    if (remainingTime <= 0) {
      logout()
      return undefined
    }

    const expirationTimer = window.setTimeout(logout, remainingTime)
    return () => window.clearTimeout(expirationTimer)
  }, [logout, session?.expiresAt])

  const value = useMemo(
    () => ({
      authError,
      clearAuthError,
      isAuthenticated: Boolean(session?.user),
      isGoogleConfigured,
      login,
      logout,
      reportLoginError,
      user: session?.user ?? null,
    }),
    [
      authError,
      clearAuthError,
      isGoogleConfigured,
      login,
      logout,
      reportLoginError,
      session?.user,
    ],
  )

  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={handleScriptLoadError}
      onScriptLoadSuccess={handleScriptLoadSuccess}
    >
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </GoogleOAuthProvider>
  )
}

export default AuthProvider
