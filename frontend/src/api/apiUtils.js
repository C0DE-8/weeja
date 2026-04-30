export function getErrorMessage(error) {
  const body = error.response?.data
  const msg = body?.message
  if (typeof msg === 'string') return msg
  if (Array.isArray(msg)) return msg.join(', ')
  if (error.message) return error.message
  return 'Something went wrong'
}
