import { toEnglishDigits } from '@/lib/digits'

/** Standard Iranian national-code checksum — matches the backend's shared NationalCodeValidator. */
export function isValidNationalCode(code) {
  // Inputs normalize as you type, but a paste or autofill can still deliver Persian digits.
  const normalized = toEnglishDigits(code)
  if (!/^\d{10}$/.test(normalized)) return false
  const digits = normalized.split('').map(Number)
  if (new Set(digits).size === 1) return false // e.g. 1111111111 — digitally valid, never real
  const check = digits[9]
  const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0)
  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}
