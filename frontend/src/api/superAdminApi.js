import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchAdminPasskeys() {
  try {
    const { data } = await api.get('/super-admin/passkeys')
    return data.passkeys || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchAdminPasskeyById(passkeyId) {
  try {
    const { data } = await api.get(`/super-admin/passkeys/${passkeyId}`)
    return data.passkey
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createAdminPasskey(payload) {
  try {
    const { data } = await api.post('/super-admin/passkeys', payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deactivateAdminPasskey(passkeyId) {
  try {
    const { data } = await api.post(`/super-admin/passkeys/${passkeyId}/deactivate`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteAdminPasskey(passkeyId) {
  try {
    const { data } = await api.delete(`/super-admin/passkeys/${passkeyId}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
