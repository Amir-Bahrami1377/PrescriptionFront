import { useAuthStore } from '@/stores/authStore'
import { homeRouteForRole } from '@/composables/useAuth'

export function roleGuard(to, from, next) {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    next(auth.isProfileComplete ? homeRouteForRole(auth.role) : { name: 'complete-profile' })
    return
  }

  if (
    auth.isAuthenticated &&
    !auth.isProfileComplete &&
    to.name !== 'complete-profile' &&
    to.meta.requiresAuth
  ) {
    next({ name: 'complete-profile' })
    return
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    next(homeRouteForRole(auth.role))
    return
  }

  next()
}
