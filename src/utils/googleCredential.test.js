import { describe, expect, it } from 'vitest'
import parseGoogleCredential from './googleCredential.js'

const CLIENT_ID = 'inetum-travel.apps.googleusercontent.com'

function encodeTokenPart(value) {
  return globalThis
    .btoa(JSON.stringify(value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function createCredential(overrides = {}) {
  const claims = {
    aud: CLIENT_ID,
    email: 'viajante@example.com',
    email_verified: true,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'https://accounts.google.com',
    name: 'Viajante Inetum',
    picture: 'https://example.com/profile.jpg',
    sub: 'google-user-123',
    ...overrides,
  }

  return `${encodeTokenPart({ alg: 'RS256', typ: 'JWT' })}.${encodeTokenPart(claims)}.signature`
}

describe('parseGoogleCredential', () => {
  it('normaliza os dados de uma credencial Google válida', () => {
    const session = parseGoogleCredential(createCredential(), CLIENT_ID)

    expect(session.user).toMatchObject({
      email: 'viajante@example.com',
      id: 'google-user-123',
      name: 'Viajante Inetum',
      picture: 'https://example.com/profile.jpg',
    })
    expect(session.expiresAt).toBeGreaterThan(Date.now())
  })

  it.each([
    ['a audiência não corresponde', { aud: 'outro-client-id' }],
    ['o emissor não é Google', { iss: 'https://example.com' }],
    ['o email não está verificado', { email_verified: false }],
    ['a credencial expirou', { exp: Math.floor(Date.now() / 1000) - 60 }],
  ])('rejeita a credencial quando %s', (_, overrides) => {
    expect(() => parseGoogleCredential(createCredential(overrides), CLIENT_ID)).toThrow(
      'INVALID_GOOGLE_CREDENTIAL',
    )
  })

  it('rejeita valores em falta ou malformados', () => {
    expect(() => parseGoogleCredential('', CLIENT_ID)).toThrow(
      'INVALID_GOOGLE_CREDENTIAL',
    )
    expect(() => parseGoogleCredential('not-a-jwt', CLIENT_ID)).toThrow(
      'INVALID_GOOGLE_CREDENTIAL',
    )
  })
})
