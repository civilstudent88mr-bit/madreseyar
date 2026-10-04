import type { AppearanceSettings } from './store'

const rampStops: Record<string, number> = {
  50: 0.94,
  100: 0.8,
  200: 0.6,
  300: 0.4,
  400: 0.2,
  500: 0,
  600: -0.12,
  700: -0.25,
  800: -0.38,
  900: -0.5,
  950: -0.65,
}

function parseHex(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}

function mixColor(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex)
  const target = amount >= 0 ? 255 : 0
  const ratio = Math.abs(amount)
  return `${Math.round(r + (target - r) * ratio)} ${Math.round(g + (target - g) * ratio)} ${Math.round(b + (target - b) * ratio)}`
}

export function applyAppearance(appearance: AppearanceSettings) {
  const root = document.documentElement
  root.style.setProperty('--brand', appearance.brandColor)
  Object.entries(rampStops).forEach(([shade, amount]) => root.style.setProperty(`--brand-${shade}`, mixColor(appearance.brandColor, amount)))
  root.style.setProperty('--hero-bg', appearance.heroBgColor)
  root.style.setProperty('--button-bg', appearance.buttonColor)
}
