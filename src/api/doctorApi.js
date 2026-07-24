import axiosClient from './axiosClient'

/** Resolves to { feeInRials: number | null }. */
export function getMyFee() {
  return axiosClient.get('/api/doctors/me/fee').then((res) => res.data)
}

export function setMyFee(feeInRials) {
  return axiosClient.put('/api/doctors/me/fee', { feeInRials }).then((res) => res.data)
}
