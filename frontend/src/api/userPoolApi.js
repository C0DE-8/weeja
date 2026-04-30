import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchUserPoolMeta() {
  try {
    const { data } = await api.get('/user-pools/meta')
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchUserPools() {
  try {
    const { data } = await api.get('/user-pools')
    return data.pools || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createUserPool(payload) {
  try {
    const { data } = await api.post('/user-pools', payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
