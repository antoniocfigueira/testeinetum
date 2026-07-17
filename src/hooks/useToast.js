import { useContext } from 'react'
import ToastContext from '../context/toastContext.js'

function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de ToastProvider.')
  }

  return context
}

export default useToast
