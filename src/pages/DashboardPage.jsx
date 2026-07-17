import {
  AlertTriangle,
  Globe2,
  Languages,
  Map,
  RefreshCw,
  SearchX,
  Users,
} from 'lucide-react'
import { createElement, useMemo, useState } from 'react'
import CountryGrid from '../components/countries/CountryGrid.jsx'
import CountryGridSkeleton from '../components/countries/CountryGridSkeleton.jsx'
import CountrySearch from '../components/countries/CountrySearch.jsx'
import useCountries from '../hooks/useCountries.js'
import useDebouncedValue from '../hooks/useDebouncedValue.js'
import { countryMatchesSearch } from '../utils/countrySearch.js'
import { formatCompactNumber, formatInteger } from '../utils/formatters.js'
import styles from './DashboardPage.module.css'

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

function DashboardPage() {
  const { countries, error, isLoading, retry } = useCountries()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebouncedValue(searchQuery, 300)
  const isSearchPending = searchQuery !== debouncedQuery
  const stats = useMemo(() => getDashboardStats(countries), [countries])
  const filteredCountries = useMemo(
    () =>
      countries.filter((country) =>
        countryMatchesSearch(country, debouncedQuery),
      ),
    [countries, debouncedQuery],
  )

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

          <div className={styles.explorer} aria-busy={isSearchPending}>
            <CountrySearch
              isPending={isSearchPending}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              resultCount={filteredCountries.length}
              value={searchQuery}
            />

            {filteredCountries.length ? (
              <CountryGrid countries={filteredCountries} />
            ) : (
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
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default DashboardPage
