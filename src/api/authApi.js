import axiosClient from './axiosClient'

export function requestOtp(phoneNumber) {
  return axiosClient.post('/api/auth/otp/request', { phoneNumber })
}

/** Resolves to { accessToken, expiresAtUtc, role, isProfileCompleted }. */
export function verifyOtp(phoneNumber, code) {
  return axiosClient.post('/api/auth/otp/verify', { phoneNumber, code }).then((res) => res.data)
}

export function completeProfile({ nationalCode, fullName, age, gender }) {
  return axiosClient
    .post('/api/auth/profile/complete', { nationalCode, fullName, age, gender })
    .then((res) => res.data)
}
