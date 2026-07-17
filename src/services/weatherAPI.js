import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim() ?? ''

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 12000,
  headers: {
    Accept: 'application/json',
  },
})

const weatherCache = new Map()

class WeatherAPIError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'WeatherAPIError'
    this.code = code
  }
}

function normalizeWeather(data) {
  const condition = data.weather?.[0] ?? {}

  return {
    description: condition.description || 'Estado do tempo indisponível',
    feelsLike: Number(data.main?.feels_like) || 0,
    humidity: Number(data.main?.humidity) || 0,
    icon: condition.icon || '',
    location: data.name || '',
    observedAt: data.dt ? new Date(data.dt * 1000) : null,
    pressure: Number(data.main?.pressure) || 0,
    temperature: Number(data.main?.temp) || 0,
    windSpeed: Number(data.wind?.speed) || 0,
  }
}

function normalizeWeatherError(error) {
  if (error instanceof WeatherAPIError) return error

  if (!axios.isAxiosError(error)) {
    return new WeatherAPIError(
      'Ocorreu um erro inesperado ao carregar a meteorologia.',
      'UNKNOWN',
    )
  }

  if (error.code === 'ECONNABORTED') {
    return new WeatherAPIError(
      'O serviço meteorológico demorou demasiado a responder.',
      'TIMEOUT',
    )
  }

  if (!error.response) {
    return new WeatherAPIError(
      'Não foi possível ligar ao serviço meteorológico. Verifica a ligação à internet.',
      'NETWORK',
    )
  }

  if (error.response.status === 401) {
    return new WeatherAPIError(
      'A chave do OpenWeatherMap não é válida ou ainda não está ativa.',
      'AUTHORIZATION',
    )
  }

  if (error.response.status === 404) {
    return new WeatherAPIError(
      'Não foram encontrados dados meteorológicos para esta capital.',
      'NOT_FOUND',
    )
  }

  if (error.response.status === 429) {
    return new WeatherAPIError(
      'O limite de pedidos meteorológicos foi atingido. Tenta novamente mais tarde.',
      'RATE_LIMIT',
    )
  }

  return new WeatherAPIError(
    'O serviço meteorológico está temporariamente indisponível.',
    'SERVICE',
  )
}

function getLocationParams(country) {
  if (country.capitalCoordinates.length === 2) {
    return {
      lat: country.capitalCoordinates[0],
      lon: country.capitalCoordinates[1],
    }
  }

  if (!country.capital || country.capital === 'Sem capital') {
    throw new WeatherAPIError(
      'Este destino não tem uma capital disponível para consultar a meteorologia.',
      'NO_CAPITAL',
    )
  }

  return {
    q: [country.capital, country.code].filter(Boolean).join(','),
  }
}

async function getCurrentWeather(
  country,
  { forceRefresh = false, signal } = {},
) {
  if (!API_KEY) {
    throw new WeatherAPIError(
      'Define VITE_OPENWEATHER_API_KEY para consultar a meteorologia.',
      'CONFIGURATION',
    )
  }

  const cacheKey = `${country.id}:${country.capital}`

  if (!forceRefresh && weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey)
  }

  try {
    const response = await weatherClient.get('/weather', {
      params: {
        ...getLocationParams(country),
        appid: API_KEY,
        lang: 'pt',
        units: 'metric',
      },
      signal,
    })
    const weather = normalizeWeather(response.data)

    weatherCache.set(cacheKey, weather)
    return weather
  } catch (error) {
    if (axios.isCancel(error)) throw error
    throw normalizeWeatherError(error)
  }
}

export { getCurrentWeather, WeatherAPIError }
