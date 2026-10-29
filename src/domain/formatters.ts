const ruble = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

export const formatMoney = (value: number) => ruble.format(Number.isFinite(value) ? value : 0)
export const formatNumber = (value: number) => number.format(Number.isFinite(value) ? value : 0)
export const formatCompactMoney = (value: number) => {
  const absolute = Math.abs(value)
  if (absolute >= 1_000_000) return `${number.format(value / 1_000_000)} млн ₽`
  if (absolute >= 1_000) return `${number.format(value / 1_000)} тыс. ₽`
  return formatMoney(value)
}

export const formatPayback = (years: number | null) => {
  if (years === null || !Number.isFinite(years)) return 'Не окупается'
  const wholeYears = Math.floor(years)
  const months = Math.round((years - wholeYears) * 12)
  if (wholeYears === 0) return `${Math.max(1, months)} мес.`
  if (months === 12) return `${wholeYears + 1} лет`
  return months > 0 ? `${wholeYears} г. ${months} мес.` : `${wholeYears} г.`
}
