import axiosClient from './axiosClient'

export function listUsers(role) {
  return axiosClient.get('/api/admin/users', { params: role ? { role } : {} }).then((res) => res.data)
}

/**
 * If phoneNumber already exists, the backend updates that user's role instead of creating a
 * new one — so this doubles as "edit role" (re-post the same phone with a new role).
 */
export function createOrUpdateStaffUser({ phoneNumber, role }) {
  return axiosClient.post('/api/admin/users', { phoneNumber, role }).then((res) => res.data)
}

/**
 * Conventional hard-delete the admin grid's delete button calls — the backend endpoint is
 * expected to be added (currently returns 404).
 */
export function deleteUser(id) {
  return axiosClient.delete(`/api/admin/users/${id}`).then((res) => res.data)
}

/**
 * Opens (or closes) prescription renewals for a customer. The backend authorizes renewals off
 * the database rather than the JWT, so this takes effect immediately — the patient keeps using
 * the token they already have, and revoking locks them out just as fast.
 */
export function setSpecialPatient(id, isSpecialPatient) {
  return axiosClient.put(`/api/admin/users/${id}/special-patient`, { isSpecialPatient }).then((res) => res.data)
}
