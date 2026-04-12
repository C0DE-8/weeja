import api from './axios'

function getErrorMessage(error) {
  const body = error.response?.data
  const msg = body?.message
  if (typeof msg === 'string') return msg
  if (Array.isArray(msg)) return msg.join(', ')
  if (error.message) return error.message
  return 'Something went wrong'
}

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
 * @param {{ email: string; password: string }} data
 * @returns {Promise<{ message: string; token: string; user: object }>}
 */
export async function loginUser(data) {
  try {
    const { data: res } = await api.post('/auth/login', {
      email: data.email,
      password: data.password,
    })
    return res
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
