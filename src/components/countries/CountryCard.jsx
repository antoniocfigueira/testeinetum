import { Flag, Heart, MapPin, Users } from 'lucide-react'
import { useState } from 'react'
import { formatInteger } from '../../utils/formatters.js'
import styles from './CountryCard.module.css'

function CountryCard({
  country,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) {
  const [hasFlagError, setHasFlagError] = useState(false)
  const flagUrl = country.flag.svg || country.flag.png

  return (
    <article className={styles.card}>
      <button
        aria-label={
          isFavorite
            ? `Remover ${country.name} dos favoritos`
            : `Adicionar ${country.name} aos favoritos`
        }
        aria-pressed={isFavorite}
        className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
        onClick={() => onToggleFavorite(country)}
        type="button"
      >
        <Heart fill={isFavorite ? 'currentColor' : 'none'} size={19} />
      </button>
      <button
        aria-label={`Consultar detalhes de ${country.name}`}
        className={styles.cardButton}
        onClick={() => onSelect(country)}
        type="button"
      >
        <div className={styles.flagFrame}>
        {flagUrl && !hasFlagError ? (
          <img
            alt={country.flag.alt}
            loading="lazy"
            onError={() => setHasFlagError(true)}
            src={flagUrl}
          />
        ) : (
          <span className={styles.flagFallback} aria-label={country.flag.alt}>
            {country.flag.emoji || <Flag aria-hidden="true" size={30} />}
          </span>
        )}
        <span className={styles.region}>{country.region}</span>
        </div>

        <div className={styles.content}>
        <div className={styles.titleGroup}>
          <h3>{country.name}</h3>
          {country.officialName !== country.name && (
            <p title={country.officialName}>{country.officialName}</p>
          )}
        </div>

        <dl className={styles.primaryFacts}>
          <div>
            <dt>
              <MapPin aria-hidden="true" size={17} />
              Capital
            </dt>
            <dd>{country.capital}</dd>
          </div>
          <div>
            <dt>
              <Users aria-hidden="true" size={17} />
              População
            </dt>
            <dd>{formatInteger(country.population)}</dd>
          </div>
        </dl>

        </div>
        <span className={styles.revealLabel}>Mostrar informações</span>
      </button>
    </article>
  )
}

export default CountryCard
