import CountryCard from './CountryCard.jsx'
import styles from './CountryGrid.module.css'

function CountryGrid({ countries, onSelectCountry }) {
  return (
    <div className={styles.grid}>
      {countries.map((country) => (
        <CountryCard
          country={country}
          key={country.id}
          onSelect={onSelectCountry}
        />
      ))}
    </div>
  )
}

export default CountryGrid
