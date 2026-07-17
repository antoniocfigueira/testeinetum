import CountryCard from './CountryCard.jsx'
import styles from './CountryGrid.module.css'

function CountryGrid({ countries }) {
  return (
    <div className={styles.grid}>
      {countries.map((country) => (
        <CountryCard country={country} key={country.id} />
      ))}
    </div>
  )
}

export default CountryGrid

