import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchAdminPools() {
  try {
    const { data } = await api.get('/admin/pools')
    return data.pools || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createAdminPool(payload) {
  try {
    const { data } = await api.post('/admin/pools', payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateAdminPool(poolId, payload) {
  try {
    const { data } = await api.patch(`/admin/pools/${poolId}`, payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function lockAdminPool(poolId) {
  try {
    const { data } = await api.post(`/admin/pools/${poolId}/lock`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function setAdminPoolResult(poolId, winningOptionId) {
  try {
    const { data } = await api.post(`/admin/pools/${poolId}/result`, {
      winning_option_id: winningOptionId,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function settleAdminPool(poolId) {
  try {
    const { data } = await api.post(`/admin/pools/${poolId}/settle`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function cancelAdminPool(poolId) {
  try {
    const { data } = await api.post(`/admin/pools/${poolId}/cancel`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
