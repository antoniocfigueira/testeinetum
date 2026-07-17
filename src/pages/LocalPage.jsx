import {
  AlertTriangle,
  Droplets,
  Gauge,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Thermometer,
  Wind,
} from 'lucide-react'
import useLocalWeather from '../hooks/useLocalWeather.js'
import styles from './LocalPage.module.css'

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatCoordinate(value, positiveLabel, negativeLabel) {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? positiveLabel : negativeLabel}`
}

function LocalPage() {
  const {
    coordinates,
    error,
    isLocating,
    isWeatherLoading,
    requestLocation,
    status,
    weather,
  } = useLocalWeather()
  const isLoading = isLocating || isWeatherLoading

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>O teu local, agora.</h1>
        <p>
          Usa a tua posição para consultar as condições meteorológicas onde te
          encontras.
        </p>
      </header>

      {status === 'idle' && (
        <div className={styles.permissionCard}>
          <span className={styles.permissionIcon} aria-hidden="true">
            <LocateFixed size={34} strokeWidth={1.7} />
          </span>
          <h2>Descobre o tempo à tua volta</h2>
          <p>
            A localização só é pedida quando carregas no botão e não é guardada
            pela aplicação.
          </p>
          <button onClick={requestLocation} type="button">
            <Navigation size={17} />
            Usar a minha localização
          </button>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingCard} aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <div>
            <h2>
              {isLocating
                ? 'A obter a tua localização…'
                : 'A consultar a meteorologia…'}
            </h2>
            <p>Isto deverá demorar apenas alguns segundos.</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorCard} role="alert">
          <span aria-hidden="true">
            <AlertTriangle size={26} />
          </span>
          <div>
            <h2>Não foi possível apresentar o teu local</h2>
            <p>{error?.message}</p>
            <button onClick={requestLocation} type="button">
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {status === 'success' && weather && coordinates && (
        <div className={styles.weatherLayout}>
          <article className={styles.weatherCard}>
            <div className={styles.locationRow}>
              <span>
                <MapPin size={18} />
                {weather.location || 'Localização atual'}
              </span>
              <button
                aria-label="Atualizar localização e meteorologia"
                onClick={requestLocation}
                title="Atualizar"
                type="button"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className={styles.currentWeather}>
              <div>
                <strong>{Math.round(weather.temperature)}°</strong>
                <p>{weather.description}</p>
              </div>
              {weather.icon && (
                <img
                  alt={weather.description}
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                />
              )}
            </div>

            <p className={styles.observedAt}>
              Atualizado às{' '}
              {weather.observedAt
                ? dateFormatter.format(weather.observedAt)
                : 'agora'}
            </p>
          </article>

          <div className={styles.metrics}>
            <article>
              <Droplets aria-hidden="true" size={22} />
              <span>Humidade</span>
              <strong>{weather.humidity}%</strong>
            </article>
            <article>
              <Wind aria-hidden="true" size={22} />
              <span>Vento</span>
              <strong>{weather.windSpeed.toFixed(1)} m/s</strong>
            </article>
            <article>
              <Thermometer aria-hidden="true" size={22} />
              <span>Sensação</span>
              <strong>{Math.round(weather.feelsLike)}°</strong>
            </article>
            <article>
              <Gauge aria-hidden="true" size={22} />
              <span>Pressão</span>
              <strong>{weather.pressure} hPa</strong>
            </article>
          </div>

          <aside className={styles.coordinatesCard}>
            <div>
              <span>Coordenadas aproximadas</span>
              <strong>
                {formatCoordinate(coordinates.latitude, 'N', 'S')},{' '}
                {formatCoordinate(coordinates.longitude, 'E', 'O')}
              </strong>
            </div>
            <small>
              Precisão estimada: {Math.round(coordinates.accuracy)} metros
            </small>
          </aside>
        </div>
      )}
    </section>
  )
}

export default LocalPage
