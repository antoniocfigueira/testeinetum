import CountryCard from './CountryCard.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFavorites from '../../hooks/useFavorites.js'
import useLoginPrompt from '../../hooks/useLoginPrompt.js'
import styles from './CountryGrid.module.css'

function CountryGrid({ countries, onSelectCountry }) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { openLoginPrompt } = useLoginPrompt()

  const handleToggleFavorite = (country) => {
    if (!isAuthenticated) {
      openLoginPrompt('favorites')
      return
    }

    toggleFavorite(country)
  }

  return (
    <div className={styles.grid}>
      {countries.map((country) => (
        <CountryCard
          country={country}
          isFavorite={isFavorite(country.id)}
          key={country.id}
          onSelect={onSelectCountry}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  )
}

export default CountryGrid
