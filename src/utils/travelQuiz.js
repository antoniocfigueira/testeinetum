import { calculateDistance } from './travelEstimate.js'

const PORTUGAL_REFERENCE = {
  capitalCoordinates: [38.7223, -9.1393],
}

const QUIZ_QUESTIONS = [
  {
    id: 'region',
    title: 'Que parte do mundo te chama mais?',
    description: 'Escolhe a região que mais gostarias de explorar agora.',
    options: [
      { label: 'Europa', value: 'europe' },
      { label: 'Ásia', value: 'asia' },
      { label: 'África', value: 'africa' },
      { label: 'Américas', value: 'americas' },
      { label: 'Oceânia', value: 'oceania' },
      { label: 'Surpreende-me', value: 'open' },
    ],
  },
  {
    id: 'climate',
    title: 'Qual é o teu clima ideal?',
    description: 'Usamos a latitude do destino para aproximar o clima.',
    options: [
      { label: 'Quente e tropical', value: 'warm' },
      { label: 'Ameno', value: 'mild' },
      { label: 'Fresco e nórdico', value: 'cool' },
      { label: 'É indiferente', value: 'open' },
    ],
  },
  {
    id: 'distance',
    title: 'Até onde queres viajar?',
    description: 'A distância é calculada a partir de Portugal.',
    options: [
      { label: 'Perto, até 3 000 km', value: 'near' },
      { label: 'Média distância', value: 'medium' },
      { label: 'O mais longe possível', value: 'far' },
      { label: 'Sem preferência', value: 'open' },
    ],
  },
  {
    id: 'scale',
    title: 'Que ritmo procuras?',
    description: 'A dimensão populacional ajuda a encontrar o ambiente certo.',
    options: [
      { label: 'Calmo e intimista', value: 'quiet' },
      { label: 'Equilibrado', value: 'balanced' },
      { label: 'Vibrante e movimentado', value: 'vibrant' },
      { label: 'Quero variedade', value: 'open' },
    ],
  },
  {
    id: 'language',
    title: 'Como queres comunicar?',
    description: 'Escolhe entre familiaridade e uma experiência linguística nova.',
    options: [
      { label: 'Em português', value: 'portuguese' },
      { label: 'Em inglês', value: 'english' },
      { label: 'Numa língua latina', value: 'romance' },
      { label: 'Quero algo diferente', value: 'different' },
    ],
  },
  {
    id: 'timezone',
    title: 'Quanto jet lag toleras?',
    description: 'Comparamos o fuso principal do destino com Lisboa.',
    options: [
      { label: 'Quase nenhum', value: 'close' },
      { label: 'Algumas horas', value: 'medium' },
      { label: 'Não me incomoda', value: 'far' },
      { label: 'É indiferente', value: 'open' },
    ],
  },
  {
    id: 'discovery',
    title: 'Que sensação queres encontrar?',
    description: 'A última escolha define o equilíbrio final das sugestões.',
    options: [
      { label: 'Conforto e familiaridade', value: 'familiar' },
      { label: 'Um pouco de tudo', value: 'balanced' },
      { label: 'Contraste e aventura', value: 'adventure' },
      { label: 'Surpreende-me', value: 'open' },
    ],
  },
]

function normalizeValue(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function getDistanceFromPortugal(country) {
  return calculateDistance(PORTUGAL_REFERENCE, country) ?? 0
}

function getTimezoneOffset(country) {
  const timezone = country.timezones?.[0]
  const timezoneValue =
    typeof timezone === 'string'
      ? timezone
      : timezone?.name ?? timezone?.utc_offset ?? ''
  const match = String(timezoneValue).match(/UTC\s*([+-])(\d{1,2})(?::?(\d{2}))?/i)

  if (!match) return 0

  const direction = match[1] === '-' ? -1 : 1
  return direction * (Number(match[2]) + Number(match[3] ?? 0) / 60)
}

function scoreRegion(country, answer) {
  if (answer === 'open') return 1
  return normalizeValue(country.region) === answer ? 7 : 0
}

function scoreClimate(country, answer) {
  if (answer === 'open') return 1

  const latitude = Math.abs(country.coordinates?.[0] ?? 45)
  const climate = latitude < 24 ? 'warm' : latitude < 52 ? 'mild' : 'cool'
  return climate === answer ? 5 : 0
}

function scoreDistance(country, answer) {
  if (answer === 'open') return 1

  const distance = getDistanceFromPortugal(country)
  const category = distance < 3000 ? 'near' : distance < 7500 ? 'medium' : 'far'
  return category === answer ? 5 : 0
}

function scoreScale(country, answer) {
  if (answer === 'open') return 1

  const population = country.population ?? 0
  const scale =
    population < 8_000_000
      ? 'quiet'
      : population < 55_000_000
        ? 'balanced'
        : 'vibrant'
  return scale === answer ? 4 : 0
}

function scoreLanguage(country, answer) {
  const languages = country.languages.map((language) =>
    normalizeValue(language.name),
  )
  const hasPortuguese = languages.some((language) =>
    language.includes('portugu'),
  )
  const hasEnglish = languages.some((language) => language.includes('english'))
  const hasRomanceLanguage = languages.some((language) =>
    ['portugu', 'spanish', 'french', 'italian', 'romanian'].some((name) =>
      language.includes(name),
    ),
  )

  if (answer === 'portuguese') return hasPortuguese ? 6 : 0
  if (answer === 'english') return hasEnglish ? 6 : 0
  if (answer === 'romance') return hasRomanceLanguage ? 6 : 0
  return !hasPortuguese && !hasEnglish && !hasRomanceLanguage ? 5 : 1
}

function scoreTimezone(country, answer) {
  if (answer === 'open') return 1

  const offset = Math.abs(getTimezoneOffset(country))
  const category = offset <= 2 ? 'close' : offset <= 6 ? 'medium' : 'far'
  return category === answer ? 4 : 0
}

function scoreDiscovery(country, answer) {
  if (answer === 'open' || answer === 'balanced') return 2

  const distance = getDistanceFromPortugal(country)
  const isEuropean = normalizeValue(country.region) === 'europe'
  const languages = country.languages.map((language) =>
    normalizeValue(language.name),
  )
  const hasFamiliarLanguage = languages.some((language) =>
    ['portugu', 'spanish', 'english', 'french', 'italian'].some((name) =>
      language.includes(name),
    ),
  )
  const familiarity = Number(isEuropean) + Number(hasFamiliarLanguage) + Number(distance < 3500)

  if (answer === 'familiar') return familiarity * 2
  return (3 - familiarity) * 2
}

function scoreCountry(country, answers) {
  return (
    scoreRegion(country, answers.region) +
    scoreClimate(country, answers.climate) +
    scoreDistance(country, answers.distance) +
    scoreScale(country, answers.scale) +
    scoreLanguage(country, answers.language) +
    scoreTimezone(country, answers.timezone) +
    scoreDiscovery(country, answers.discovery)
  )
}

function getQuizRecommendations(countries, answers, limit = 14) {
  return [...countries]
    .map((country) => ({ country, score: scoreCountry(country, answers) }))
    .sort(
      (first, second) =>
        second.score - first.score ||
        second.country.population - first.country.population,
    )
    .slice(0, limit)
    .map(({ country }) => country)
}

export { QUIZ_QUESTIONS, getQuizRecommendations }
