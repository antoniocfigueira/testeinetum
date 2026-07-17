import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ToastViewport from '../components/common/ToastViewport.jsx'
import ToastContext from './toastContext.js'

function createToastId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((toastId) => {
    const timer = timersRef.current.get(toastId)

    if (timer) window.clearTimeout(timer)
    timersRef.current.delete(toastId)
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    )
  }, [])

  const addToast = useCallback(
    (message, { duration = 3200, title, type = 'info' } = {}) => {
      const id = createToastId()
      const toast = { id, message, title, type }

      setToasts((currentToasts) => [...currentToasts.slice(-3), toast])

      if (duration > 0) {
        const timer = window.setTimeout(() => removeToast(id), duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [removeToast],
  )

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current.clear()
    },
    [],
  )

  const value = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport onDismiss={removeToast} toasts={toasts} />
    </ToastContext.Provider>
  )
}

export default ToastProvider
