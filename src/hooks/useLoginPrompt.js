import { useContext } from 'react'
import LoginPromptContext from '../context/loginPromptContext.js'

function useLoginPrompt() {
  const context = useContext(LoginPromptContext)

  if (!context) {
    throw new Error(
      'useLoginPrompt deve ser utilizado dentro do layout da aplicação.',
    )
  }

  return context
}

export default useLoginPrompt
