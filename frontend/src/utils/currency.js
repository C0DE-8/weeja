export function getCurrencyDecimalPlaces(currencyCode, decimalPlaces) {
  if (Number.isInteger(decimalPlaces) && decimalPlaces >= 0) {
    return decimalPlaces
  }

  if (currencyCode === 'CRYPTO') {
    return 8
  }

  return 2
}

export function formatCurrencyAmount(value, currencyCode, decimalPlaces) {
  const amount = Number(value || 0)
  const digits = getCurrencyDecimalPlaces(currencyCode, decimalPlaces)

  return `${amount.toFixed(digits)} ${currencyCode || ''}`.trim()
}
