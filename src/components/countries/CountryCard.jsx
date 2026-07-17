import { Coins, Flag, Languages, MapPin, Users } from 'lucide-react'
import { useState } from 'react'
import { formatInteger } from '../../utils/formatters.js'
import styles from './CountryCard.module.css'

function joinValues(values, fallback = 'Não disponível') {
  return values.filter(Boolean).join(', ') || fallback
}

function CountryCard({ country }) {
  const [hasFlagError, setHasFlagError] = useState(false)
  const flagUrl = country.flag.svg || country.flag.png
  const currencyLabel = joinValues(
    country.currencies.map((currency) =>
      [currency.code, currency.symbol].filter(Boolean).join(' '),
    ),
  )
  const languageLabel = joinValues(
    country.languages.map((language) => language.name),
  )

  return (
    <article className={styles.card}>
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

        <div className={styles.secondaryFacts}>
          <div title={currencyLabel}>
            <Coins aria-hidden="true" size={17} />
            <span>{currencyLabel}</span>
          </div>
          <div title={languageLabel}>
            <Languages aria-hidden="true" size={17} />
            <span>{languageLabel}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CountryCard

