import axiosClient from './axiosClient'

export function listTests(search) {
  return axiosClient.get('/api/catalog/tests', { params: search ? { search } : {} }).then((res) => res.data)
}

export function createTest({ name, description }) {
  return axiosClient.post('/api/catalog/tests', { name, description }).then((res) => res.data)
}

export function updateTest(id, { name, description, isActive }) {
  return axiosClient.put(`/api/catalog/tests/${id}`, { name, description, isActive }).then((res) => res.data)
}

/**
 * The list endpoint only ever returns active tests, so deactivating a test (updateTest with
 * isActive:false) already hides it from the catalog. This hard-delete is the conventional
 * DELETE the admin grid's delete button calls — the backend endpoint is expected to be added.
 */
export function deleteTest(id) {
  return axiosClient.delete(`/api/catalog/tests/${id}`).then((res) => res.data)
}
