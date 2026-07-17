import axios from 'axios'

const PAGE_SIZE = 100
const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY?.trim() ?? ''
const RESPONSE_FIELDS = [
  'names',
  'codes',
  'capitals',
  'flag',
  'currencies',
  'languages',
  'region',
  'subregion',
  'population',
  'timezones',
  'coordinates',
].join(',')

const countriesClient = axios.create({
  baseURL: 'https://api.restcountries.com/countries/v5',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

let countriesCache = null
let pendingRequest = null

class CountriesAPIError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'CountriesAPIError'
    this.code = code
  }
}

function getCapital(country) {
  return (
    country.capitals?.find((capital) => capital.attributes?.primary) ??
    country.capitals?.[0] ??
    null
  )
}

function normalizeCountry(country) {
  const capital = getCapital(country)
  const translations = Object.values(country.names?.translations ?? {})
    .flatMap((translation) => [translation.common, translation.official])
    .filter(Boolean)

  return {
    id: country.codes?.alpha_3 ?? country.codes?.alpha_2 ?? country.uuid,
    code: country.codes?.alpha_2 ?? '',
    code3: country.codes?.alpha_3 ?? '',
    numericCode: country.codes?.ccn3 ?? '',
    name: country.names?.common ?? 'País sem nome',
    officialName: country.names?.official ?? country.names?.common ?? '',
    alternativeNames: [
      ...(country.names?.alternates ?? []),
      ...translations,
    ],
    capital: capital?.name ?? 'Sem capital',
    capitalCoordinates: capital?.coordinates
      ? [capital.coordinates.lat, capital.coordinates.lng]
      : [],
    coordinates: country.coordinates
      ? [country.coordinates.lat, country.coordinates.lng]
      : [],
    currencies: (country.currencies ?? []).map((currency) => ({
      code: currency.code ?? '',
      name: currency.name ?? currency.code ?? '',
      symbol: currency.symbol ?? '',
    })),
    flag: {
      alt: country.flag?.description ?? `Bandeira de ${country.names?.common}`,
      emoji: country.flag?.emoji ?? '',
      png: country.flag?.url_png ?? '',
      svg: country.flag?.url_svg ?? '',
    },
    languages: (country.languages ?? []).map((language) => ({
      code: language.bcp47 ?? language.iso639_1 ?? language.name,
      name: language.name ?? '',
      nativeName: language.native_name ?? '',
    })),
    population: Number(country.population) || 0,
    region: country.region || 'Sem região',
    subregion: country.subregion || '',
    timezones: country.timezones ?? [],
  }
}

function normalizeRequestError(error) {
  if (error instanceof CountriesAPIError) return error

  if (!axios.isAxiosError(error)) {
    return new CountriesAPIError(
      'Ocorreu um erro inesperado ao carregar os países.',
      'UNKNOWN',
    )
  }

  if (error.code === 'ECONNABORTED') {
    return new CountriesAPIError(
      'O serviço de países demorou demasiado a responder.',
      'TIMEOUT',
    )
  }

  if (!error.response) {
    return new CountriesAPIError(
      'Não foi possível ligar ao serviço de países. Verifica a ligação à internet.',
      'NETWORK',
    )
  }

  if ([401, 403].includes(error.response.status)) {
    return new CountriesAPIError(
      'A chave de acesso ao serviço de países não é válida ou não permite esta origem.',
      'AUTHORIZATION',
    )
  }

  if (error.response.status === 429) {
    return new CountriesAPIError(
      'Foram efetuados demasiados pedidos. Tenta novamente dentro de instantes.',
      'RATE_LIMIT',
    )
  }

  return new CountriesAPIError(
    'O serviço de países está temporariamente indisponível.',
    'SERVICE',
  )
}

async function fetchCountriesPage(offset) {
  const response = await countriesClient.get('', {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    params: {
      limit: PAGE_SIZE,
      offset,
      response_fields: RESPONSE_FIELDS,
    },
  })

  return {
    countries: response.data?.data?.objects ?? [],
    total: Number(response.data?.data?.meta?.total) || 0,
  }
}

async function loadAllCountries() {
  if (!API_KEY) {
    throw new CountriesAPIError(
      'Define VITE_REST_COUNTRIES_API_KEY para carregar os países.',
      'CONFIGURATION',
    )
  }

  try {
    const firstPage = await fetchCountriesPage(0)
    const offsets = []

    for (let offset = PAGE_SIZE; offset < firstPage.total; offset += PAGE_SIZE) {
      offsets.push(offset)
    }

    const remainingPages = await Promise.all(offsets.map(fetchCountriesPage))
    const rawCountries = [
      ...firstPage.countries,
      ...remainingPages.flatMap((page) => page.countries),
    ]

    if (!rawCountries.length) {
      throw new CountriesAPIError(
        'O serviço não devolveu nenhum país.',
        'EMPTY_RESPONSE',
      )
    }

    return rawCountries
      .map(normalizeCountry)
      .filter((country) => country.id)
      .sort((first, second) =>
        first.name.localeCompare(second.name, 'pt-PT', {
          sensitivity: 'base',
        }),
      )
  } catch (error) {
    throw normalizeRequestError(error)
  }
}

function getAllCountries({ forceRefresh = false } = {}) {
  if (countriesCache && !forceRefresh) {
    return Promise.resolve(countriesCache)
  }

  if (pendingRequest) return pendingRequest

  pendingRequest = loadAllCountries()
    .then((countries) => {
      countriesCache = countries
      return countries
    })
    .finally(() => {
      pendingRequest = null
    })

  return pendingRequest
}

export { CountriesAPIError, getAllCountries }
