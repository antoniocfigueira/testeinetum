import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { createElement } from 'react'
import { createPortal } from 'react-dom'
import styles from './ToastViewport.module.css'

const toastIcons = {
  error: AlertTriangle,
  info: Info,
  success: CheckCircle2,
}

function ToastViewport({ onDismiss, toasts }) {
  return createPortal(
    <div
      aria-label="Notificações"
      aria-live="polite"
      className={styles.viewport}
    >
      {toasts.map((toast) => (
        <article
          className={`${styles.toast} ${styles[toast.type] ?? styles.info}`}
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className={styles.icon} aria-hidden="true">
            {createElement(toastIcons[toast.type] ?? Info, { size: 20 })}
          </span>
          <div>
            {toast.title && <strong>{toast.title}</strong>}
            <p>{toast.message}</p>
          </div>
          <button
            aria-label="Fechar notificação"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            <X size={16} />
          </button>
        </article>
      ))}
    </div>,
    document.body,
  )
}

export default ToastViewport
