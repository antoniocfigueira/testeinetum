import { LogIn, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useAuth from '../../hooks/useAuth.js'
import GoogleSignInButton from './GoogleSignInButton.jsx'
import styles from './LoginPromptModal.module.css'

const promptContent = {
  favorites: {
    description:
      'Inicia sessão para guardares destinos e consultares os teus favoritos em qualquer momento.',
    title: 'Guarda os teus destinos.',
  },
  settings: {
    description:
      'Inicia sessão para acederes às definições e atualizares os dados do teu perfil.',
    title: 'A tua conta primeiro.',
  },
}

function LoginPromptModal({ onClose, reason }) {
  const { authError, clearAuthError } = useAuth()
  const closeButtonRef = useRef(null)
  const content = promptContent[reason] ?? promptContent.favorites

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      clearAuthError()
    }
  }, [clearAuthError, onClose])

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="login-prompt-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <button
          aria-label="Fechar"
          className={styles.closeButton}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X size={18} />
        </button>

        <span className={styles.icon} aria-hidden="true">
          <LogIn size={27} />
        </span>
        <h2 id="login-prompt-title">{content.title}</h2>
        <p>{content.description}</p>

        <div className={styles.googleButton}>
          <GoogleSignInButton onSuccess={onClose} />
        </div>

        {authError && <small role="alert">{authError}</small>}
      </section>
    </div>,
    document.body,
  )
}

export default LoginPromptModal
