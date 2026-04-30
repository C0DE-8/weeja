import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchWallets() {
  try {
    const { data } = await api.get('/wallet')
    return data.wallets || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchWalletTransactions(limit = 20) {
  try {
    const { data } = await api.get('/wallet/transactions', {
      params: { limit },
    })
    return data.transactions || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
