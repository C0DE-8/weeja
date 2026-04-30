import api from './axios'
import { getErrorMessage } from './apiUtils'

/**
 * @param {{ name: string; email: string; password: string }} data
 */
export async function registerUser(data) {
  try {
    const { data: res } = await api.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    })
    return res
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * @param {{ username: string; email: string; password: string; passkey: string }} data
 */
export async function registerAdmin(data) {
  try {
    const { data: res } = await api.post('/auth/register-admin', {
      username: data.username,
      email: data.email,
      password: data.password,
      passkey: data.passkey,
    })
    return res
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * @param {{ email: string; otp: string }} data
 */
export async function verifyOtp(data) {
  try {
    const { data: res } = await api.post('/auth/verify-otp', {
      email: data.email,
      otp: data.otp,
    })
    return res
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * @param {{ email: string }} data
 */
export async function resendOtp(data) {
  try {
    const { data: res } = await api.post('/auth/resend-otp', {
      email: data.email,
    })
    return res
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * @param {{ email?: string; identifier?: string; password: string }} data
 * @returns {Promise<{ message: string; token: string; user: object }>}
 */
export async function loginUser(data) {
  try {
    const { data: res } = await api.post('/auth/login', {
      email: data.email,
      identifier: data.identifier,
      password: data.password,
    })
    return res
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
