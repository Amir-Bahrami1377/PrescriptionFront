function base64UrlDecode(segment) {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const decoded = atob(padded)
  try {
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
  } catch {
    return decoded
  }
}

/** Decodes a JWT's payload without verifying the signature (verification is the backend's job). */
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    return null
  }
}

const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
]

/** Reads the role claim from a decoded JWT payload, handling common .NET claim key variants. */
export function readRoleClaim(claims) {
  if (!claims) return null
  for (const key of ROLE_CLAIM_KEYS) {
    const value = claims[key]
    if (!value) continue
    return Array.isArray(value) ? value[0] : value
  }
  return null
}

/**
 * Whether this session belongs to a special patient (prescription renewals). Serialized as the
 * string "true"/"false" in the token. This only decides what the UI offers — the backend
 * re-checks the flag in the database on every renewal call, so a stale token can't grant access.
 */
export function readSpecialPatientClaim(claims) {
  return String(claims?.special_patient ?? '').toLowerCase() === 'true'
}

export function isExpired(claims) {
  if (!claims?.exp) return false
  return Date.now() >= claims.exp * 1000
}
