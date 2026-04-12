import axios from 'axios'

/** localStorage key for JWT (used by interceptor + login flow) */
export const TOKEN_STORAGE_KEY = 'weeja_token'

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
