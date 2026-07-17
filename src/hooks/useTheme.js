import { useContext } from 'react'
import ThemeContext from '../context/themeContext.js'

function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de ThemeProvider.')
  }

  return context
}

export default useTheme

