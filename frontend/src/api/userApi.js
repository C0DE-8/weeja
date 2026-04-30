import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchUserProfile() {
  try {
    const { data } = await api.get('/users/profile')
    return data.user
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateUserProfile(payload) {
  try {
    const { data } = await api.patch('/users/profile', payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
