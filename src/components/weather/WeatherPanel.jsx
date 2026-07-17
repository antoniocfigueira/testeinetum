import {
  AlertTriangle,
  Droplets,
  Gauge,
  RefreshCw,
  ThermometerSun,
  Wind,
} from 'lucide-react'
import { createElement } from 'react'
import useWeather from '../../hooks/useWeather.js'
import styles from './WeatherPanel.module.css'

const decimalFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 1,
})

function WeatherPanel({ country }) {
  const { error, isLoading, retry, weather } = useWeather(country)

  if (isLoading) {
    return (
      <section className={styles.panel} aria-busy="true" aria-label="Meteorologia">
        <div className={styles.loadingHeader}>
          <span className={styles.skeletonIcon} />
          <div>
            <span className={styles.skeletonLine} />
            <span className={styles.skeletonLineShort} />
          </div>
        </div>
        <div className={styles.loadingGrid}>
          {Array.from({ length: 4 }, (_, index) => (
            <span className={styles.skeletonCard} key={index} />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`${styles.panel} ${styles.error}`} role="alert">
        <AlertTriangle aria-hidden="true" size={24} />
        <div>
          <strong>Não foi possível obter a meteorologia</strong>
          <p>{error.message}</p>
        </div>
        <button onClick={retry} type="button">
          <RefreshCw aria-hidden="true" size={16} />
          Tentar novamente
        </button>
      </section>
    )
  }

  if (!weather) return null

  const iconUrl = weather.icon
    ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
    : ''
  const facts = [
    {
      icon: Droplets,
      label: 'Humidade',
      value: `${weather.humidity}%`,
    },
    {
      icon: Wind,
      label: 'Vento',
      value: `${decimalFormatter.format(weather.windSpeed)} m/s`,
    },
    {
      icon: ThermometerSun,
      label: 'Sensação',
      value: `${decimalFormatter.format(weather.feelsLike)} °C`,
    },
    {
      icon: Gauge,
      label: 'Pressão',
      value: `${weather.pressure} hPa`,
    },
  ]

  return (
    <section className={styles.panel} aria-label="Meteorologia atual">
      <div className={styles.currentWeather}>
        <div className={styles.conditionIcon}>
          {iconUrl ? (
            <img alt="" src={iconUrl} />
          ) : (
            <ThermometerSun aria-hidden="true" size={32} />
          )}
        </div>
        <div>
          <span>Meteorologia em {weather.location || country.capital}</span>
          <strong>{decimalFormatter.format(weather.temperature)} °C</strong>
          <p>{weather.description}</p>
        </div>
      </div>

      <dl className={styles.weatherFacts}>
        {facts.map(({ icon, label, value }) => (
          <div key={label}>
            <dt>
              {createElement(icon, { 'aria-hidden': true, size: 17 })}
              {label}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default WeatherPanel
