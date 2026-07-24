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
