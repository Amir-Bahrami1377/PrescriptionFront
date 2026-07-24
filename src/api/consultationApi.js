import axiosClient from './axiosClient'

/** Undocumented request body — sends multipart/form-data: orderId, note, and the result photo. */
export function requestConsultation({ orderId, note, file }, onUploadProgress) {
  const form = new FormData()
  form.append('orderId', orderId)
  if (note) form.append('note', note)
  if (file) form.append('file', file)
  return axiosClient
    .post('/api/consultations', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((res) => res.data)
}

export function submitDoctorOpinion(id, opinion) {
  return axiosClient.post(`/api/consultations/${id}/opinion`, { opinion }).then((res) => res.data)
}

export function listPendingConsultations() {
  return axiosClient.get('/api/consultations/pending').then((res) => res.data)
}
