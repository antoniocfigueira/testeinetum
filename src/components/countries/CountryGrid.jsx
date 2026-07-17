import CountryCard from './CountryCard.jsx'
import useFavorites from '../../hooks/useFavorites.js'
import styles from './CountryGrid.module.css'

function CountryGrid({ countries, onSelectCountry }) {
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <div className={styles.grid}>
      {countries.map((country) => (
        <CountryCard
          country={country}
          isFavorite={isFavorite(country.id)}
          key={country.id}
          onSelect={onSelectCountry}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  )
}

export default CountryGrid
