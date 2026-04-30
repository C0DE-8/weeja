import api from './axios'
import { getErrorMessage } from './apiUtils'

export async function fetchActiveCategories() {
  try {
    const { data } = await api.get('/categories')
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchAdminCategories() {
  try {
    const { data } = await api.get('/admin/categories')
    return data.categories || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createAdminCategory(payload) {
  try {
    const { data } = await api.post('/admin/categories', payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateAdminCategory(categoryId, payload) {
  try {
    const { data } = await api.patch(`/admin/categories/${categoryId}`, payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deactivateAdminCategory(categoryId) {
  try {
    const { data } = await api.post(`/admin/categories/${categoryId}/deactivate`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteAdminCategory(categoryId) {
  try {
    const { data } = await api.delete(`/admin/categories/${categoryId}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
