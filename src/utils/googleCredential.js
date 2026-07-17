import { jwtDecode } from 'jwt-decode'

const GOOGLE_ISSUERS = new Set([
  'accounts.google.com',
  'https://accounts.google.com',
])

function hasExpectedAudience(audience, clientId) {
  return Array.isArray(audience)
    ? audience.includes(clientId)
    : audience === clientId
}

function parseGoogleCredential(credential, clientId) {
  if (!credential || !clientId) {
    throw new Error('INVALID_GOOGLE_CREDENTIAL')
  }

  try {
    const claims = jwtDecode(credential)
    const expiresAt = Number(claims.exp) * 1000
    const isValid =
      claims.sub &&
      claims.email &&
      claims.email_verified !== false &&
      GOOGLE_ISSUERS.has(claims.iss) &&
      hasExpectedAudience(claims.aud, clientId) &&
      Number.isFinite(expiresAt) &&
      expiresAt > Date.now()

    if (!isValid) {
      throw new Error('INVALID_GOOGLE_CREDENTIAL')
    }

    return {
      expiresAt,
      user: {
        id: claims.sub,
        name: claims.name || claims.email.split('@')[0],
        email: claims.email,
        picture: claims.picture || '',
        givenName: claims.given_name || '',
        familyName: claims.family_name || '',
      },
    }
  } catch {
    throw new Error('INVALID_GOOGLE_CREDENTIAL')
  }
}

export default parseGoogleCredential

