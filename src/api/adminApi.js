import axiosClient from './axiosClient'

export function listUsers(role) {
  return axiosClient.get('/api/admin/users', { params: role ? { role } : {} }).then((res) => res.data)
}

/** If phoneNumber already exists, the backend updates that user's role instead of creating a new one. */
export function createOrUpdateStaffUser({ phoneNumber, role }) {
  return axiosClient.post('/api/admin/users', { phoneNumber, role }).then((res) => res.data)
}
