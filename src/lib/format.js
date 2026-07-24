const rialFormatter = new Intl.NumberFormat('fa-IR')
const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Order price is null until a doctor approves and their fixed fee is applied. */
export function formatRials(amount) {
  if (amount === null || amount === undefined) return 'هنوز تعیین نشده'
  return `${rialFormatter.format(Number(amount))} ریال`
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateFormatter.format(date)
}

/** The order's price is the reviewing doctor's fixed visit fee — null until they approve it. */
export function orderTotal(order) {
  return order?.priceInRials ?? null
}

export function orderCreatedAt(order) {
  return order?.createdAtUtc ?? order?.createdAt
}

/**
 * Minutes left on a doctor's 30-minute review claim. Field name on the order is unconfirmed
 * (guessed as claimExpiresAtUtc, matching the backend's other …AtUtc fields) — returns null
 * when absent so callers can hide the countdown rather than show a wrong number.
 */
export function claimMinutesLeft(order) {
  const expiresAt = order?.claimExpiresAtUtc ?? order?.claimExpiresAt
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  return ms > 0 ? Math.ceil(ms / 60000) : 0
}
