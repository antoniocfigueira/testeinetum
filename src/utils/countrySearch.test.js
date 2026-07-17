import { describe, expect, it } from 'vitest'
import { countryMatchesSearch, normalizeSearchValue } from './countrySearch.js'

const portugal = {
  alternativeNames: ['República Portuguesa'],
  capital: 'Lisboa',
  code: 'PT',
  code3: 'PRT',
  currencies: [{ code: 'EUR', name: 'Euro' }],
  languages: [{ name: 'Português', nativeName: 'Português' }],
  name: 'Portugal',
  officialName: 'República Portuguesa',
  region: 'Europa',
  subregion: 'Europa do Sul',
}

describe('normalizeSearchValue', () => {
  it('remove acentos, espaços exteriores e diferenças entre maiúsculas', () => {
    expect(normalizeSearchValue('  São Tomé  ')).toBe('sao tome')
  })
})

describe('countryMatchesSearch', () => {
  it('aceita uma pesquisa vazia', () => {
    expect(countryMatchesSearch(portugal, '  ')).toBe(true)
  })

  it.each(['portugal', 'lisboa', 'prt', 'euro', 'portugues', 'europa do sul'])(
    'encontra o país através de “%s”',
    (query) => {
      expect(countryMatchesSearch(portugal, query)).toBe(true)
    },
  )

  it('rejeita uma pesquisa sem correspondência', () => {
    expect(countryMatchesSearch(portugal, 'Tóquio')).toBe(false)
  })
})
