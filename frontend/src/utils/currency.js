const TWO_DECIMAL_CURRENCIES = new Set(['USD', 'NGN'])

export function shouldUseTwoDecimalCurrency(currencyCode) {
  return TWO_DECIMAL_CURRENCIES.has(String(currencyCode || '').toUpperCase())
}

export function getCurrencyDecimalPlaces(currencyCode, decimalPlaces) {
  if (shouldUseTwoDecimalCurrency(currencyCode)) {
    return 2
  }

  if (Number.isInteger(decimalPlaces) && decimalPlaces >= 0) {
    return decimalPlaces
  }

  if (currencyCode === 'CRYPTO') {
    return 8
  }

  return 2
}

export function formatCurrencyNumber(value, currencyCode, decimalPlaces) {
  const amount = Number(value || 0)
  const digits = getCurrencyDecimalPlaces(currencyCode, decimalPlaces)

  return amount.toFixed(digits)
}

export function formatCurrencyAmount(value, currencyCode, decimalPlaces) {
  const amount = formatCurrencyNumber(value, currencyCode, decimalPlaces)

  return `${amount} ${currencyCode || ''}`.trim()
}

export function normalizeCurrencyInputValue(value, currencyCode, decimalPlaces) {
  if (value === '' || value === null || value === undefined) {
    return ''
  }

  if (!shouldUseTwoDecimalCurrency(currencyCode)) {
    return String(value)
  }

  return formatCurrencyNumber(value, currencyCode, decimalPlaces)
}
