const compactNumberFormatter = new Intl.NumberFormat('pt-PT', {
  compactDisplay: 'long',
  maximumFractionDigits: 1,
  notation: 'compact',
})

const integerFormatter = new Intl.NumberFormat('pt-PT')

function formatCompactNumber(value) {
  return compactNumberFormatter.format(Number(value) || 0)
}

function formatInteger(value) {
  return integerFormatter.format(Number(value) || 0)
}

export { formatCompactNumber, formatInteger }

