import {
  Coins,
  Heart,
  Languages,
  Map,
  MapPin,
  Users,
  X,
} from 'lucide-react'
import { createElement, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { formatInteger } from '../../utils/formatters.js'
import useFavorites from '../../hooks/useFavorites.js'
import WeatherPanel from '../weather/WeatherPanel.jsx'
import styles from './CountryDetailsModal.module.css'

function joinValues(values, fallback = 'Não disponível') {
  return values.filter(Boolean).join(', ') || fallback
}

function CountryDetailsModal({ country, onClose }) {
  const closeButtonRef = useRef(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const countryIsFavorite = isFavorite(country.id)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const flagUrl = country.flag.svg || country.flag.png
  const currencies = joinValues(
    country.currencies.map((currency) =>
      [currency.name, currency.code, currency.symbol]
        .filter(Boolean)
        .join(' · '),
    ),
  )
  const languages = joinValues(
    country.languages.map((language) => language.name),
  )
  const region = [country.region, country.subregion].filter(Boolean).join(' · ')
  const facts = [
    {
      icon: MapPin,
      label: 'Capital',
      value: country.capital,
    },
    {
      icon: Users,
      label: 'População',
      value: formatInteger(country.population),
    },
    {
      icon: Map,
      label: 'Região',
      value: region,
    },
    {
      icon: Coins,
      label: 'Moeda',
      value: currencies,
    },
    {
      icon: Languages,
      label: 'Idiomas',
      value: languages,
    },
  ]

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="country-details-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <button
          aria-label="Fechar detalhes do país"
          className={styles.closeButton}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X size={20} />
        </button>

        <button
          aria-label={
            countryIsFavorite
              ? `Remover ${country.name} dos favoritos`
              : `Adicionar ${country.name} aos favoritos`
          }
          aria-pressed={countryIsFavorite}
          className={`${styles.favoriteButton} ${countryIsFavorite ? styles.favoriteActive : ''}`}
          onClick={() => toggleFavorite(country)}
          type="button"
        >
          <Heart
            fill={countryIsFavorite ? 'currentColor' : 'none'}
            size={20}
          />
        </button>

        <header className={styles.header}>
          <div className={styles.flagFrame}>
            {flagUrl ? (
              <img alt={country.flag.alt} src={flagUrl} />
            ) : (
              <span aria-hidden="true">{country.flag.emoji}</span>
            )}
          </div>
          <div>
            <span>{country.region}</span>
            <h2 id="country-details-title">{country.name}</h2>
            {country.officialName !== country.name && (
              <p>{country.officialName}</p>
            )}
          </div>
        </header>

        <div className={styles.content}>
          <dl className={styles.facts}>
            {facts.map(({ icon, label, value }) => (
              <div key={label}>
                <dt>
                  {createElement(icon, { 'aria-hidden': true, size: 18 })}
                  {label}
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <WeatherPanel country={country} />
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default CountryDetailsModal
