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

export async function joinPool(poolId, payload) {
  try {
    const { data } = await api.post(`/pools/${poolId}/join`, payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
