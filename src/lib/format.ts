// Persian number formatting and currency utilities

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => persianDigits[parseInt(d, 10)])
}

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

export function formatToman(amount: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(Math.round(amount))
  return `${formatted} تومان`
}

export function formatTomanShort(amount: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(Math.round(amount))
  return formatted
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n)
}

export function discountPercent(market: number, our: number): number {
  if (market <= 0) return 0
  return Math.round(((market - our) / market) * 100)
}

export function savedAmount(market: number, our: number, qty = 1): number {
  return Math.max(0, (market - our) * qty)
}
