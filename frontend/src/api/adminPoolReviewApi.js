import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchAdminPoolReviews(reviewStatus) {
  try {
    const { data } = await api.get('/admin/pool-reviews', {
      params: reviewStatus ? { review_status: reviewStatus } : {},
    })
    return data.pools || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchCreationFeeSettings() {
  try {
    const { data } = await api.get('/admin/pool-reviews/settings')
    return data.fee_settings || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateCreationFee(currencyId, amount) {
  try {
    const { data } = await api.put(`/admin/pool-reviews/settings/${currencyId}`, { amount })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function approvePoolSubmission(poolId, payload) {
  try {
    const { data } = await api.post(`/admin/pool-reviews/${poolId}/approve`, payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function rejectPoolSubmission(poolId, payload) {
  try {
    const { data } = await api.post(`/admin/pool-reviews/${poolId}/reject`, payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
