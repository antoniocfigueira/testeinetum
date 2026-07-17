import {
  AlertTriangle,
  Globe2,
  Languages,
  LoaderCircle,
  Map,
  RefreshCw,
  Users,
} from 'lucide-react'
import { createElement } from 'react'
import useCountries from '../hooks/useCountries.js'
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
  const stats = getDashboardStats(countries)

  return (
    <section className={styles.dashboard}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>A tua próxima aventura</span>
        <h1>O mundo está à tua espera.</h1>
        <p>
          Explora destinos, conhece novas culturas e reúne a informação
          essencial para a próxima viagem.
        </p>
      </header>

      {isLoading && (
        <div className={styles.statusPanel} aria-live="polite">
          <LoaderCircle className={styles.spinner} size={28} />
          <div>
            <strong>A carregar o mundo</strong>
            <p>Estamos a reunir os dados dos destinos.</p>
          </div>
        </div>
      )}

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
      )}
    </section>
  )
}

export default DashboardPage

