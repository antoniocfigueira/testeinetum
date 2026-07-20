import {
  BookOpen,
  Clock,
  Coins,
  Compass,
  ExternalLink,
  Heart,
  Info,
  Landmark,
  Languages,
  Map,
  MapPinned,
  MapPin,
  Navigation,
  Plane,
  Route,
  Users,
  X,
} from 'lucide-react'
import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { formatInteger } from '../../utils/formatters.js'
import {
  estimateTravel,
  formatTravelDuration,
} from '../../utils/travelEstimate.js'
import useAuth from '../../hooks/useAuth.js'
import useCountries from '../../hooks/useCountries.js'
import useFavorites from '../../hooks/useFavorites.js'
import useLoginPrompt from '../../hooks/useLoginPrompt.js'
import WeatherPanel from '../weather/WeatherPanel.jsx'
import styles from './CountryDetailsModal.module.css'

function joinValues(values, fallback = 'Não disponível') {
  return values.filter(Boolean).join(', ') || fallback
}

const DETAIL_SECTIONS = [
  { icon: Info, id: 'overview', label: 'Resumo' },
  { icon: Plane, id: 'travel', label: 'Viagem' },
  { icon: Compass, id: 'discover', label: 'Explorar' },
]

function CountryDetailsModal({ country, onClose, origin = null }) {
  const closeButtonRef = useRef(null)
  const modalRef = useRef(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [transitionGeometry, setTransitionGeometry] = useState(null)
  const [transitionPhase, setTransitionPhase] = useState(
    origin ? 'preparing' : 'open',
  )
  const [originCountryId, setOriginCountryId] = useState('PRT')
  const { isAuthenticated } = useAuth()
  const {
    countries: availableCountries,
    error: countriesError,
    isLoading: areCountriesLoading,
  } = useCountries()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { openLoginPrompt } = useLoginPrompt()
  const countryIsFavorite = isFavorite(country.id)

  useEffect(() => {
    if (!availableCountries.length) return

    const currentOriginIsValid = availableCountries.some(
      (availableCountry) =>
        availableCountry.id === originCountryId &&
        availableCountry.id !== country.id,
    )

    if (currentOriginIsValid) return

    const defaultOrigin =
      availableCountries.find(
        (availableCountry) =>
          availableCountry.code === 'PT' && availableCountry.id !== country.id,
      ) ??
      availableCountries.find(
        (availableCountry) => availableCountry.id !== country.id,
      )

    setOriginCountryId(defaultOrigin?.id ?? '')
  }, [availableCountries, country.id, originCountryId])

  useLayoutEffect(() => {
    const modal = modalRef.current

    if (!modal || !origin) return

    const bounds = modal.getBoundingClientRect()
    const startHeight = origin.height ?? 26
    const startWidth = origin.width ?? 36
    const scaleX = startWidth / bounds.width
    const scaleY = startHeight / bounds.height
    const distanceX = origin.x - (bounds.left + bounds.width / 2)
    const distanceY = origin.y - (bounds.top + bounds.height / 2)

    setTransitionGeometry({
      '--transition-inverse-x': 1 / scaleX,
      '--transition-inverse-y': 1 / scaleY,
      '--transition-radius-x': `${14 / scaleX}px`,
      '--transition-radius-y': `${14 / scaleY}px`,
      '--transition-scale-x': scaleX,
      '--transition-scale-y': scaleY,
      '--transition-start-height': `${startHeight}px`,
      '--transition-start-width': `${startWidth}px`,
      '--transition-x': `${distanceX}px`,
      '--transition-y': `${distanceY}px`,
    })

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setTransitionPhase('open')
      return
    }

    setTransitionPhase('entering')
  }, [origin])

  const requestClose = useCallback(() => {
    if (
      !origin ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      onClose()
      return
    }

    setTransitionPhase('closing')
  }, [onClose, origin])

  const handleCountryTransitionEnd = useCallback(
    (event) => {
      if (event.target !== event.currentTarget) return

      if (transitionPhase === 'entering') setTransitionPhase('open')
      if (transitionPhase === 'closing') onClose()
    },
    [onClose, transitionPhase],
  )

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      onClose()
      openLoginPrompt('favorites')
      return
    }

    toggleFavorite(country)
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') requestClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [requestClose])

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
  const encodedCountry = encodeURIComponent(country.name)
  const encodedCapital = encodeURIComponent(`${country.capital}, ${country.name}`)
  const mapUrl = country.coordinates.length
    ? `https://www.openstreetmap.org/?mlat=${country.coordinates[0]}&mlon=${country.coordinates[1]}#map=5/${country.coordinates[0]}/${country.coordinates[1]}`
    : `https://www.openstreetmap.org/search?query=${encodedCountry}`
  const discoveryLinks = [
    {
      description: 'Descobre monumentos, museus e pontos de interesse.',
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`atrações turísticas ${country.name}`)}`,
      icon: Landmark,
      title: 'Locais turísticos',
    },
    {
      description: `Explora o centro, cultura e pontos principais de ${country.capital}.`,
      href: `https://www.google.com/maps/search/?api=1&query=${encodedCapital}`,
      icon: MapPinned,
      title: `Conhecer ${country.capital}`,
    },
    {
      description: 'Consulta geografia, história e outras curiosidades.',
      href: `https://pt.wikipedia.org/w/index.php?search=${encodedCountry}`,
      icon: BookOpen,
      title: 'Guia e curiosidades',
    },
    {
      description: 'Abre o país num mapa detalhado e navegável.',
      href: mapUrl,
      icon: Navigation,
      title: 'Explorar no mapa',
    },
  ]
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
  const originCountry = availableCountries.find(
    (availableCountry) => availableCountry.id === originCountryId,
  )
  const travelEstimate = useMemo(
    () => estimateTravel(originCountry, country),
    [country, originCountry],
  )
  const isClosing = transitionPhase === 'closing'
  const modalTransitionClass = !origin
    ? ''
    : transitionPhase === 'open'
      ? styles.modalRevealed
      : isClosing
        ? styles.modalToHoverCard
        : transitionPhase === 'preparing'
          ? styles.modalPreparing
          : styles.modalFromHoverCard

  return createPortal(
    <div
      className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="country-details-title"
        aria-modal="true"
        className={`${styles.modal} ${modalTransitionClass}`}
        onAnimationEnd={handleCountryTransitionEnd}
        ref={modalRef}
        role="dialog"
        style={transitionGeometry ?? undefined}
      >
        {origin &&
          transitionGeometry &&
          ['entering', 'closing'].includes(transitionPhase) && (
            <div aria-hidden="true" className={styles.sharedPreview}>
              {flagUrl ? (
                <img alt="" src={flagUrl} />
              ) : (
                <span>{country.flag.emoji}</span>
              )}
              <div>
                <strong>{country.name}</strong>
                <small>{country.capital}</small>
              </div>
            </div>
          )}
        <button
          aria-label="Fechar detalhes do país"
          className={styles.closeButton}
          onClick={requestClose}
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
          onClick={handleToggleFavorite}
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
          <div className={styles.heroIdentity}>
            <span>{country.region}</span>
            <h2 id="country-details-title">{country.name}</h2>
            {country.officialName !== country.name && (
              <p>{country.officialName}</p>
            )}
          </div>
        </header>

        <div className={styles.content}>
          <div
            aria-label="Informação do país"
            className={styles.segmentedControl}
            data-active-section={activeSection}
            role="tablist"
          >
            {DETAIL_SECTIONS.map(({ icon, id, label }) => (
              <button
                aria-controls={`country-panel-${id}`}
                aria-selected={activeSection === id}
                className={activeSection === id ? styles.activeSegment : ''}
                id={`country-tab-${id}`}
                key={id}
                onClick={() => setActiveSection(id)}
                role="tab"
                type="button"
              >
                {createElement(icon, { 'aria-hidden': true, size: 17 })}
                {label}
              </button>
            ))}
          </div>

          {activeSection === 'overview' && (
            <div
              aria-labelledby="country-tab-overview"
              className={styles.sectionPanel}
              id="country-panel-overview"
              role="tabpanel"
            >
              <header className={styles.sectionIntro}>
                <span>Visão geral</span>
                <h3>Informação essencial</h3>
                <p>Os principais dados sobre {country.name} num só lugar.</p>
              </header>

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
          )}

          {activeSection === 'travel' && (
            <div
              aria-labelledby="country-tab-travel"
              className={styles.sectionPanel}
              id="country-panel-travel"
              role="tabpanel"
            >
              <header className={styles.sectionIntro}>
                <span>Simulador de viagem</span>
                <h3>Quanto tempo demora?</h3>
                <p>
                  Escolhe o país de partida para obteres uma estimativa até{' '}
                  {country.name}.
                </p>
              </header>

              <div className={styles.travelSimulator}>
                <label className={styles.originSelector}>
                  <span>Partida</span>
                  <select
                    disabled={areCountriesLoading}
                    onChange={(event) => setOriginCountryId(event.target.value)}
                    value={originCountryId}
                  >
                    {availableCountries
                      .filter(
                        (availableCountry) => availableCountry.id !== country.id,
                      )
                      .map((availableCountry) => (
                        <option key={availableCountry.id} value={availableCountry.id}>
                          {availableCountry.flag.emoji} {availableCountry.name}
                        </option>
                      ))}
                  </select>
                </label>

                {originCountry && travelEstimate ? (
                  <>
                    <div className={styles.routeOverview}>
                      <div className={styles.routeCountry}>
                        <span>{originCountry.flag.emoji}</span>
                        <strong>{originCountry.name}</strong>
                        <small>{originCountry.capital}</small>
                      </div>
                      <div className={styles.routeLine} aria-hidden="true">
                        <span />
                        <Plane size={22} />
                        <span />
                      </div>
                      <div className={styles.routeCountry}>
                        <span>{country.flag.emoji}</span>
                        <strong>{country.name}</strong>
                        <small>{country.capital}</small>
                      </div>
                    </div>

                    <div className={styles.travelTotal}>
                      <span><Clock size={22} /></span>
                      <div>
                        <small>Tempo total estimado</small>
                        <strong>
                          {formatTravelDuration(travelEstimate.totalHours)}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.travelBreakdown}>
                      <article>
                        <Route size={19} />
                        <small>Distância aérea</small>
                        <strong>{formatInteger(travelEstimate.distance)} km</strong>
                      </article>
                      <article>
                        <Plane size={19} />
                        <small>Tempo em voo</small>
                        <strong>
                          {formatTravelDuration(travelEstimate.flightHours)}
                        </strong>
                      </article>
                      <article>
                        <Clock size={19} />
                        <small>Aeroporto e ligações</small>
                        <strong>
                          {formatTravelDuration(
                            travelEstimate.airportHours +
                              travelEstimate.connectionHours,
                          )}
                        </strong>
                      </article>
                    </div>

                    <p className={styles.travelNote}>
                      Estimativa indicativa entre capitais, incluindo tempo de
                      aeroporto e uma ligação provável em trajetos longos.
                    </p>
                  </>
                ) : (
                  <div className={styles.travelUnavailable} role="status">
                    {countriesError
                      ? 'Não foi possível preparar o simulador neste momento.'
                      : 'A preparar a simulação da viagem…'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'discover' && (
            <div
              aria-labelledby="country-tab-discover"
              className={styles.sectionPanel}
              id="country-panel-discover"
              role="tabpanel"
            >
              <header className={styles.sectionIntro}>
                <span>Descobrir</span>
                <h3>Continua a explorar</h3>
                <p>Abre mapas, guias e sugestões para planeares a visita.</p>
              </header>

              <div className={styles.discoveryGrid}>
                {discoveryLinks.map(({ description, href, icon, title }) => (
                  <a
                    href={href}
                    key={title}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>{createElement(icon, { size: 23 })}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                    <ExternalLink aria-hidden="true" size={17} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default CountryDetailsModal
