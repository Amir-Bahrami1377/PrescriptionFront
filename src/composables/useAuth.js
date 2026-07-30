import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore, ROLES } from '@/stores/authStore'

export function homeRouteForRole(role) {
  if (role === ROLES.DOCTOR) return { name: 'doctor-dashboard' }
  if (role === ROLES.ADMIN) return { name: 'admin-catalog' }
  return { name: 'customer-dashboard' }
}

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { role, isAuthenticated, isProfileComplete, phoneNumber, isSpecialPatient } = storeToRefs(store)

  async function verifyAndRoute(code) {
    await store.verifyOtp(code)
    if (!store.isProfileComplete) {
      router.push({ name: 'complete-profile' })
      return
    }
    router.push(homeRouteForRole(store.role))
  }

  async function completeProfileAndRoute(profile) {
    await store.completeProfile(profile)
    router.push(homeRouteForRole(store.role))
  }

  function logout() {
    store.logout()
    router.push({ name: 'login' })
  }

  return {
    role,
    isAuthenticated,
    isProfileComplete,
    phoneNumber,
    isSpecialPatient,
    requestOtp: store.requestOtp,
    verifyAndRoute,
    completeProfileAndRoute,
    logout,
  }
}
