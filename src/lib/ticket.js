const STATUS_INFO = {
  open: { key: 'Open', label: 'باز', tone: 'primary' },
  pendingclosure: { key: 'PendingClosure', label: 'در انتظار بسته‌شدن', tone: 'amber' },
  closed: { key: 'Closed', label: 'بسته‌شده', tone: 'ink' },
}

export function ticketStatusInfo(status) {
  const normalized = String(status ?? '').toLowerCase().replace(/[\s_-]/g, '')
  return STATUS_INFO[normalized] ?? { key: String(status ?? ''), label: 'نامشخص', tone: 'ink' }
}

export function isTicketStatus(ticket, status) {
  return ticketStatusInfo(ticket?.status).key === status
}

export function ticketLastActivityAt(ticket) {
  return ticket?.updatedAtUtc ?? ticket?.createdAtUtc
}
