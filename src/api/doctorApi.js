import axiosClient from './axiosClient'

/** Resolves to { feeInRials: number | null }. */
export function getMyFee() {
  return axiosClient.get('/api/doctors/me/fee').then((res) => res.data)
}

export function setMyFee(feeInRials) {
  return axiosClient.put('/api/doctors/me/fee', { feeInRials }).then((res) => res.data)
}

/** The fixed fee added on top of the visit fee when a customer requests consultation. */
export function getMyConsultationFee() {
  return axiosClient.get('/api/doctors/me/consultation-fee').then((res) => res.data)
}

export function setMyConsultationFee(feeInRials) {
  return axiosClient.put('/api/doctors/me/consultation-fee', { feeInRials }).then((res) => res.data)
}

/** Charged for a prescription renewal; approving one without this set is rejected. */
export function getMyRenewalFee() {
  return axiosClient.get('/api/doctors/me/renewal-fee').then((res) => res.data)
}

export function setMyRenewalFee(feeInRials) {
  return axiosClient.put('/api/doctors/me/renewal-fee', { feeInRials }).then((res) => res.data)
}
