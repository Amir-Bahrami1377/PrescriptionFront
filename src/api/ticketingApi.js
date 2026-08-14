import axiosClient from './axiosClient'

export function listMyTickets() {
  return axiosClient.get('/api/tickets/mine').then((res) => res.data)
}

export function getTicket(id) {
  return axiosClient.get(`/api/tickets/${id}`).then((res) => res.data)
}

export function createTicket({ subject, message }) {
  return axiosClient.post('/api/tickets', { subject, message }).then((res) => res.data)
}

export function replyTicket(id, message) {
  return axiosClient.post(`/api/tickets/${id}/reply`, { message }).then((res) => res.data)
}

export function closeTicket(id) {
  return axiosClient.post(`/api/tickets/${id}/close`).then((res) => res.data)
}

export function reopenTicket(id) {
  return axiosClient.post(`/api/tickets/${id}/reopen`).then((res) => res.data)
}

export function listAdminTickets(status) {
  return axiosClient
    .get('/api/admin/tickets', { params: status ? { status } : {} })
    .then((res) => res.data)
}

export function queueTicketClosure(id) {
  return axiosClient.post(`/api/admin/tickets/${id}/queue-closure`).then((res) => res.data)
}
