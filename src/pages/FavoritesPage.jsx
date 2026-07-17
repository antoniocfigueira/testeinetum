import { AlertTriangle, Heart, Map } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CountryDetailsModal from '../components/countries/CountryDetailsModal.jsx'
import CountryGrid from '../components/countries/CountryGrid.jsx'
import useFavorites from '../hooks/useFavorites.js'
import styles from './FavoritesPage.module.css'

function FavoritesPage() {
  const { favoriteCount, favorites, persistenceError } = useFavorites()
  const [selectedCountry, setSelectedCountry] = useState(null)

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Destinos favoritos.</h1>
          <p>
            Guarda os países que queres voltar a consultar e prepara a próxima
            viagem ao teu ritmo.
          </p>
        </div>
        <span className={styles.count} aria-live="polite">
          <Heart fill="currentColor" size={17} />
          {favoriteCount === 1 ? '1 destino' : `${favoriteCount} destinos`}
        </span>
      </header>

      {persistenceError && (
        <div className={styles.warning} role="alert">
          <AlertTriangle aria-hidden="true" size={20} />
          <span>{persistenceError}</span>
        </div>
      )}

      {favorites.length ? (
        <CountryGrid
          countries={favorites}
          onSelectCountry={setSelectedCountry}
        />
      ) : (
        <div className={styles.emptyState}>
          <span aria-hidden="true">
            <Map size={31} strokeWidth={1.7} />
          </span>
          <h2>A tua lista ainda está vazia</h2>
          <p>
            Explora a dashboard e toca no coração dos países que queres guardar.
          </p>
          <Link to="/dashboard">Explorar destinos</Link>
        </div>
      )}

      {selectedCountry && (
        <CountryDetailsModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </section>
  )
}

export default FavoritesPage
