import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import useToast from '../hooks/useToast.js'
import FavoritesContext from './favoritesContext.js'

const STORAGE_KEY = 'inetum-travel-favorites'

function normalizeFavoritesStore(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).map(([userId, countries]) => {
      if (!Array.isArray(countries)) return [userId, []]

      const uniqueCountries = Array.from(
        new Map(
          countries
            .filter((country) => country?.id && country?.name)
            .map((country) => [country.id, country]),
        ).values(),
      )

      return [userId, uniqueCountries]
    }),
  )
}

function readFavoritesStore() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY)
    return storedValue ? normalizeFavoritesStore(JSON.parse(storedValue)) : {}
  } catch {
    return {}
  }
}

function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [favoritesByUser, setFavoritesByUser] = useState(readFavoritesStore)
  const [persistenceError, setPersistenceError] = useState(null)
  const userId = user?.id ?? null
  const favorites = useMemo(
    () => (userId ? favoritesByUser[userId] ?? [] : []),
    [favoritesByUser, userId],
  )
  const favoriteIds = useMemo(
    () => new Set(favorites.map((country) => country.id)),
    [favorites],
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesByUser))
      setPersistenceError(null)
    } catch {
      setPersistenceError(
        'Não foi possível guardar os favoritos neste dispositivo.',
      )
    }
  }, [favoritesByUser])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return

      try {
        const nextStore = event.newValue
          ? normalizeFavoritesStore(JSON.parse(event.newValue))
          : {}

        setFavoritesByUser(nextStore)
        setPersistenceError(null)
      } catch {
        setPersistenceError(
          'Não foi possível sincronizar os favoritos neste dispositivo.',
        )
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addFavorite = useCallback(
    (country) => {
      if (!userId || !country?.id) return

      setFavoritesByUser((currentStore) => {
        const currentFavorites = currentStore[userId] ?? []

        if (currentFavorites.some((favorite) => favorite.id === country.id)) {
          return currentStore
        }

        return {
          ...currentStore,
          [userId]: [...currentFavorites, country],
        }
      })
    },
    [userId],
  )

  const removeFavorite = useCallback(
    (countryId) => {
      if (!userId) return

      setFavoritesByUser((currentStore) => ({
        ...currentStore,
        [userId]: (currentStore[userId] ?? []).filter(
          (country) => country.id !== countryId,
        ),
      }))
    },
    [userId],
  )

  const toggleFavorite = useCallback(
    (country) => {
      if (!userId || !country?.id) return

      const isStored = favoriteIds.has(country.id)

      if (isStored) {
        removeFavorite(country.id)
      } else {
        addFavorite(country)
      }

      addToast(
        `${country.name} ${isStored ? 'foi removido dos' : 'foi adicionado aos'} favoritos.`,
        {
          title: isStored ? 'Favorito removido' : 'Destino guardado',
          type: 'success',
        },
      )
    },
    [addFavorite, addToast, favoriteIds, removeFavorite, userId],
  )

  const isFavorite = useCallback(
    (countryId) => favoriteIds.has(countryId),
    [favoriteIds],
  )

  const value = useMemo(
    () => ({
      addFavorite,
      favoriteCount: favorites.length,
      favorites,
      isFavorite,
      persistenceError,
      removeFavorite,
      toggleFavorite,
    }),
    [
      addFavorite,
      favorites,
      isFavorite,
      persistenceError,
      removeFavorite,
      toggleFavorite,
    ],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export default FavoritesProvider
