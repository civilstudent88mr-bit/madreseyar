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

export function formatPriceInput(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0)
}

export function parsePriceInput(value: string): number {
  const digits = toEnglishDigits(value).replace(/[٬،,\s]/g, '')
  const amount = Number(digits)
  return Number.isFinite(amount) && amount >= 0 ? amount : 0
}

export function discountPercent(market: number, our: number): number {
  const marketPrice = Number(market)
  const salePrice = Number(our)
  if (!Number.isFinite(marketPrice) || !Number.isFinite(salePrice) || marketPrice <= 0 || salePrice < 0 || salePrice >= marketPrice) return 0
  const percentage = ((marketPrice - salePrice) / marketPrice) * 100
  return Math.min(100, Math.max(0, Math.round(percentage)))
}

export function savedAmount(market: number, our: number, qty = 1): number {
  const marketPrice = Number(market)
  const salePrice = Number(our)
  const quantity = Math.max(0, Number(qty) || 0)
  if (!Number.isFinite(marketPrice) || !Number.isFinite(salePrice) || !Number.isFinite(quantity) || marketPrice < 0 || salePrice < 0) return 0
  return Math.max(0, marketPrice - salePrice) * quantity
}
