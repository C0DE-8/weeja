import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchPublicPools(params = {}) {
  try {
    const { data } = await api.get('/pools', { params })
    return data.pools || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
