import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'prescription_access_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_PRESCRIPTION_API_BASE_URL || '',
})

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null)
      // The backend does not currently expose a refresh-token endpoint, so a 401
      // just ends the session. App.vue listens for this to route back to /login.
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export default axiosClient
