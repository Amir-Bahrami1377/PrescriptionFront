import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/authApi'
import { getStoredToken, setStoredToken } from '@/api/axiosClient'
import { decodeJwt, isExpired, readRoleClaim } from '@/lib/jwt'

export const ROLES = { CUSTOMER: 'customer', DOCTOR: 'doctor', ADMIN: 'admin' }

function normalizeRole(role) {
  return typeof role === 'string' ? role.toLowerCase() : null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getStoredToken())
  const role = ref(normalizeRole(readRoleClaim(decodeJwt(token.value))))
  const phoneNumber = ref('')
  const isProfileComplete = ref(true)

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    const claims = decodeJwt(token.value)
    return !isExpired(claims)
  })

  function applySession({ accessToken, isProfileCompleted, role: sessionRole }) {
    token.value = accessToken
    setStoredToken(accessToken)
    const claims = decodeJwt(accessToken)
    role.value = normalizeRole(sessionRole) ?? normalizeRole(readRoleClaim(claims)) ?? ROLES.CUSTOMER
    isProfileComplete.value = Boolean(isProfileCompleted)
  }

  async function requestOtp(phone) {
    phoneNumber.value = phone
    await authApi.requestOtp(phone)
  }

  async function verifyOtp(code) {
    const session = await authApi.verifyOtp(phoneNumber.value, code)
    applySession(session)
    return session
  }

  async function completeProfile(profile) {
    await authApi.completeProfile(profile)
    isProfileComplete.value = true
  }

  function logout() {
    token.value = null
    role.value = null
    phoneNumber.value = ''
    isProfileComplete.value = true
    setStoredToken(null)
  }

  return {
    token,
    role,
    phoneNumber,
    isProfileComplete,
    isAuthenticated,
    requestOtp,
    verifyOtp,
    completeProfile,
    logout,
  }
})
