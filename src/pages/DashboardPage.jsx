import {
  AlertTriangle,
  Globe2,
  Languages,
  LayoutGrid,
  Map,
  RefreshCw,
  SearchX,
  Shuffle,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  createElement,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import CountryGrid from '../components/countries/CountryGrid.jsx'
import CountryGridSkeleton from '../components/countries/CountryGridSkeleton.jsx'
import CountrySearch from '../components/countries/CountrySearch.jsx'
import CountryDetailsModal from '../components/countries/CountryDetailsModal.jsx'
import MobileCountryDeck from '../components/countries/MobileCountryDeck.jsx'
import TravelQuizModal from '../components/quiz/TravelQuizModal.jsx'
import useCountries from '../hooks/useCountries.js'
import useDebouncedValue from '../hooks/useDebouncedValue.js'
import useMediaQuery from '../hooks/useMediaQuery.js'
import { countryMatchesSearch } from '../utils/countrySearch.js'
import { loadCountryGlobe } from '../utils/countryGlobeLoader.js'
import { getQuizRecommendations } from '../utils/travelQuiz.js'
import { formatCompactNumber, formatInteger } from '../utils/formatters.js'
import styles from './DashboardPage.module.css'

const CountryGlobe = lazy(loadCountryGlobe)
const SUGGESTION_LIMIT = 8

function getSuggestedCountries(countries, seed) {
  const shuffledCountries = [...countries]
  let randomState = Math.floor(seed * 2147483646) + 1
  const getRandomValue = () => {
    randomState = (randomState * 16807) % 2147483647
    return (randomState - 1) / 2147483646
  }

  for (let index = shuffledCountries.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(getRandomValue() * (index + 1))
    const currentCountry = shuffledCountries[index]

    shuffledCountries[index] = shuffledCountries[randomIndex]
    shuffledCountries[randomIndex] = currentCountry
  }

  return shuffledCountries.slice(0, SUGGESTION_LIMIT)
}

function getDashboardStats(countries) {
  const regions = new Set(countries.map((country) => country.region))
  const languages = new Set(
    countries.flatMap((country) =>
      country.languages.map((language) => language.code),
    ),
  )
  const population = countries.reduce(
    (total, country) => total + country.population,
    0,
  )

  return [
    {
      icon: Globe2,
      label: 'Países e territórios',
      value: formatInteger(countries.length),
    },
    {
      icon: Map,
      label: 'Regiões',
      value: formatInteger(regions.size),
    },
    {
      icon: Users,
      label: 'População representada',
      value: formatCompactNumber(population),
    },
    {
      icon: Languages,
      label: 'Idiomas',
      value: formatInteger(languages.size),
    },
  ]
}

function DashboardPage({ isActive = true }) {
  const { countries, error, isLoading, retry } = useCountries()
  const isMobile = useMediaQuery('(max-width: 600px)')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [modalOrigin, setModalOrigin] = useState(null)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizCountryIds, setQuizCountryIds] = useState(null)
  const [suggestionSeed, setSuggestionSeed] = useState(() => Math.random())
  const [viewMode, setViewMode] = useState('globe')
  const debouncedQuery = useDebouncedValue(searchQuery, 300)
  const isSearchPending = searchQuery !== debouncedQuery
  const stats = useMemo(() => getDashboardStats(countries), [countries])
  const searchMatchedCountries = useMemo(
    () =>
      countries.filter((country) =>
        countryMatchesSearch(country, debouncedQuery),
      ),
    [countries, debouncedQuery],
  )
  const filteredCountries = useMemo(
    () =>
      quizCountryIds
        ? searchMatchedCountries.filter((country) =>
            quizCountryIds.has(country.id),
          )
        : searchMatchedCountries,
    [quizCountryIds, searchMatchedCountries],
  )
  const matchingCountryIds = useMemo(
    () => new Set(filteredCountries.map((country) => country.id)),
    [filteredCountries],
  )
  const focusedCountry = debouncedQuery ? filteredCountries[0] : null
  const listCountryPool = useMemo(() => {
    if (quizCountryIds) return filteredCountries
    return searchQuery.trim() ? searchMatchedCountries : countries
  }, [countries, filteredCountries, quizCountryIds, searchMatchedCountries, searchQuery])
  const suggestedCountries = useMemo(
    () => getSuggestedCountries(listCountryPool, suggestionSeed),
    [listCountryPool, suggestionSeed],
  )

  useEffect(() => {
    loadCountryGlobe().catch(() => null)
  }, [])

  useEffect(() => {
    if (!isActive) {
      setSelectedCountry(null)
      setModalOrigin(null)
    }
  }, [isActive])

  const selectCountry = useCallback((country, origin = null) => {
    flushSync(() => {
      setModalOrigin(origin)
      setSelectedCountry(country)
    })
  }, [])

  const closeCountryDetails = useCallback(() => {
    setSelectedCountry(null)
    setModalOrigin(null)
  }, [])

  const randomizeSuggestions = () => {
    setSuggestionSeed(Math.random())
  }

  const completeQuiz = useCallback(
    (answers) => {
      const recommendations = getQuizRecommendations(countries, answers)

      setQuizAnswers(answers)
      setQuizCountryIds(new Set(recommendations.map((country) => country.id)))
      setSearchQuery('')
      setSuggestionSeed(Math.random())
      setIsQuizOpen(false)
    },
    [countries],
  )

  const clearQuizFilter = useCallback(() => {
    setQuizCountryIds(null)
    setSuggestionSeed(Math.random())
  }, [])

  return (
    <section className={styles.dashboard}>
      <header className={styles.hero}>
        <h1>O mundo está à tua espera.</h1>
        <p>
          Explora destinos, conhece novas culturas e reúne a informação
          essencial para a próxima viagem.
        </p>
      </header>

      {isLoading && <CountryGridSkeleton />}

      {error && (
        <div className={`${styles.statusPanel} ${styles.errorPanel}`} role="alert">
          <AlertTriangle size={25} />
          <div>
            <strong>Não foi possível carregar os países</strong>
            <p>{error.message}</p>
          </div>
          <button onClick={retry} type="button">
            <RefreshCw size={17} />
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className={styles.explorer} aria-busy={isSearchPending}>
            <CountrySearch
              activeFilter={
                quizCountryIds
                  ? {
                      label: 'Sugeridos',
                      onClear: clearQuizFilter,
                    }
                  : null
              }
              controls={
                <div className={styles.explorerControls}>
                  <div
                    aria-label="Modo de exploração"
                    className={styles.viewToggle}
                    data-view-mode={viewMode}
                    role="group"
                  >
                    <button
                      aria-pressed={viewMode === 'globe'}
                      className={viewMode === 'globe' ? styles.activeView : ''}
                      onClick={() => setViewMode('globe')}
                      type="button"
                    >
                      <Globe2 size={18} />
                      Globo
                    </button>
                    <button
                      aria-pressed={viewMode === 'list'}
                      className={viewMode === 'list' ? styles.activeView : ''}
                      onClick={() => setViewMode('list')}
                      type="button"
                    >
                      <LayoutGrid size={18} />
                      Lista
                    </button>
                  </div>
                  <button
                    className={`${styles.quizButton} ${quizCountryIds ? styles.quizButtonActive : ''}`}
                    onClick={() => setIsQuizOpen(true)}
                    type="button"
                  >
                    <Sparkles size={17} />
                    Quiz
                  </button>
                </div>
              }
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              value={searchQuery}
            />

            <div
              className={styles.explorerView}
              hidden={viewMode !== 'globe' || !filteredCountries.length}
            >
              <Suspense
                fallback={
                  <div className={styles.globeLoading} role="status">
                    <span aria-hidden="true">
                      <Globe2 size={30} strokeWidth={1.7} />
                    </span>
                    <strong>A preparar o globo…</strong>
                  </div>
                }
              >
                <CountryGlobe
                  countries={countries}
                  focusedCountry={focusedCountry}
                  isActive={
                    isActive &&
                    viewMode === 'globe' &&
                    Boolean(filteredCountries.length)
                  }
                  matchingCountryIds={matchingCountryIds}
                  onSelectCountry={selectCountry}
                  selectedCountry={selectedCountry}
                />
              </Suspense>
            </div>

            {!filteredCountries.length ? (
              <div className={styles.emptyState} role="status">
                <span aria-hidden="true">
                  <SearchX size={28} />
                </span>
                <h3>Nenhum destino encontrado</h3>
                <p>Experimenta pesquisar outro país, capital, moeda ou idioma.</p>
                <button onClick={() => setSearchQuery('')} type="button">
                  Limpar pesquisa
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <section className={`${styles.suggestions} ${styles.explorerView}`}>
                <header className={styles.suggestionsHeader}>
                  <div>
                    <h2>
                      {debouncedQuery
                        ? 'Resultados em destaque'
                        : 'Sugestões para ti'}
                    </h2>
                    <p>
                      {debouncedQuery
                        ? `A mostrar até ${SUGGESTION_LIMIT} resultados da pesquisa.`
                        : `Uma seleção de ${SUGGESTION_LIMIT} destinos para começares a explorar.`}
                    </p>
                  </div>
                  {listCountryPool.length > 1 && (
                    <button onClick={randomizeSuggestions} type="button">
                      <Shuffle
                        className={styles.shuffleIcon}
                        key={suggestionSeed}
                        size={17}
                      />
                      Novas sugestões
                    </button>
                  )}
                </header>
                {isMobile ? (
                  <MobileCountryDeck
                    countries={listCountryPool}
                    key={suggestionSeed}
                    onSelectCountry={selectCountry}
                  />
                ) : (
                  <div className={styles.suggestedGrid} key={suggestionSeed}>
                    <CountryGrid
                      countries={suggestedCountries}
                      onSelectCountry={selectCountry}
                    />
                  </div>
                )}
              </section>
            ) : null}
          </div>

          <div className={styles.stats} aria-label="Resumo dos destinos disponíveis">
            {stats.map(({ icon, label, value }) => (
              <article className={styles.statCard} key={label}>
                <span className={styles.statIcon} aria-hidden="true">
                  {createElement(icon, { size: 21, strokeWidth: 1.9 })}
                </span>
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
        </>
      )}

      {selectedCountry && (
        <CountryDetailsModal
          country={selectedCountry}
          onClose={closeCountryDetails}
          origin={modalOrigin}
        />
      )}

      {isQuizOpen && (
        <TravelQuizModal
          initialAnswers={quizAnswers}
          onClose={() => setIsQuizOpen(false)}
          onComplete={completeQuiz}
        />
      )}
    </section>
  )
}

export default DashboardPage
