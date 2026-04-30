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
