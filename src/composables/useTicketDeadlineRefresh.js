import { onBeforeUnmount, watch } from 'vue'
import { isTicketStatus } from '@/lib/ticket'

const MAX_TIMEOUT_MS = 2_147_000_000
const OVERDUE_RETRY_MS = 60_000

/**
 * Refreshes a ticket list just after its nearest auto-close deadline. If the server's
 * minute-based job has not closed it yet, retry once a minute until the status changes.
 */
export function useTicketDeadlineRefresh(tickets, refresh) {
  let timer = null
  let refreshing = false

  function clearTimer() {
    if (timer) window.clearTimeout(timer)
    timer = null
  }

  function schedule() {
    clearTimer()
    if (typeof window === 'undefined') return

    const deadlines = (tickets.value ?? [])
      .filter((ticket) => isTicketStatus(ticket, 'PendingClosure') && ticket.autoCloseAtUtc)
      .map((ticket) => new Date(ticket.autoCloseAtUtc).getTime())
      .filter(Number.isFinite)

    if (!deadlines.length) return
    const nearest = Math.min(...deadlines)
    const untilDeadline = nearest - Date.now()
    const delay = untilDeadline > 0 ? untilDeadline + 1_000 : OVERDUE_RETRY_MS

    timer = window.setTimeout(async () => {
      if (refreshing) return
      refreshing = true
      try {
        await refresh()
      } catch {
        // The normal manual load path surfaces errors. Background deadline refresh stays quiet.
      } finally {
        refreshing = false
        schedule()
      }
    }, Math.min(delay, MAX_TIMEOUT_MS))
  }

  watch(
    () => (tickets.value ?? []).map((ticket) => `${ticket.id}:${ticket.status}:${ticket.autoCloseAtUtc ?? ''}`).join('|'),
    schedule,
    { immediate: true },
  )

  onBeforeUnmount(clearTimer)
}
