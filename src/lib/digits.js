/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII.
 *
 * A Persian keyboard layout types ۰-۹, which look like digits to the user but fail every
 * `\d` check and are rejected by the backend. Everything numeric the user can type — national
 * codes, phone numbers, OTPs, fees — is normalized before it is validated or sent.
 * Non-digit characters are left alone.
 */
export function toEnglishDigits(value) {
  if (value === null || value === undefined) return value
  return String(value).replace(/[۰-۹٠-٩]/g, (char) => {
    const code = char.charCodeAt(0)
    // Persian block starts at U+06F0, Arabic-Indic at U+0660.
    const zero = code >= 0x06f0 ? 0x06f0 : 0x0660
    return String(code - zero)
  })
}
