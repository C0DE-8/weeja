import { TOKEN_STORAGE_KEY } from './axios'

export const USER_STORAGE_KEY = 'weeja_user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function setSession({ token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function isAdminUser(user) {
  return user?.role === 'admin' || user?.role === 'super_admin'
}
