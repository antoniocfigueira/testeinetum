function normalizeSearchValue(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-PT')
    .trim()
}

function countryMatchesSearch(country, query) {
  const normalizedQuery = normalizeSearchValue(query)

  if (!normalizedQuery) return true

  const searchableValues = [
    country.name,
    country.officialName,
    country.capital,
    country.region,
    country.subregion,
    country.code,
    country.code3,
    ...country.alternativeNames,
    ...country.currencies.flatMap((currency) => [currency.code, currency.name]),
    ...country.languages.flatMap((language) => [
      language.name,
      language.nativeName,
    ]),
  ]

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedQuery),
  )
}

export { countryMatchesSearch, normalizeSearchValue }

