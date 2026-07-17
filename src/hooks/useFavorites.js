import { useContext } from 'react'
import FavoritesContext from '../context/favoritesContext.js'

function useFavorites() {
  const context = useContext(FavoritesContext)

  if (!context) {
    throw new Error(
      'useFavorites deve ser utilizado dentro de FavoritesProvider.',
    )
  }

  return context
}

export default useFavorites
