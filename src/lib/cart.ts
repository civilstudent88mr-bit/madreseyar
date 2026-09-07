import { create } from 'zustand'
import type { Product, Bundle } from './types'

export interface CartLine {
  id: string
  product?: Product
  bundle?: Bundle
  qty: number
}

interface CartState {
  lines: CartLine[]
  hydrated: boolean
  setLines: (lines: CartLine[]) => void
  addProduct: (product: Product, qty?: number) => void
  addBundle: (bundle: Bundle, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  setHydrated: (h: boolean) => void
}

export const useCart = create<CartState>((set) => ({
  lines: [],
  hydrated: false,
  setLines: (lines) => set({ lines }),
  addProduct: (product, qty = 1) =>
    set((s) => {
      const existing = s.lines.find((l) => l.product?.id === product.id)
      if (existing) {
        return {
          lines: s.lines.map((l) =>
            l.id === existing.id ? { ...l, qty: Math.min(l.qty + qty, product.max_order_qty) } : l,
          ),
        }
      }
      return { lines: [...s.lines, { id: crypto.randomUUID(), product, qty }] }
    }),
  addBundle: (bundle, qty = 1) =>
    set((s) => {
      const existing = s.lines.find((l) => l.bundle?.id === bundle.id)
      if (existing) {
        return { lines: s.lines.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + qty } : l)) }
      }
      return { lines: [...s.lines, { id: crypto.randomUUID(), bundle, qty }] }
    }),
  updateQty: (id, qty) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(l.product?.min_order_qty ?? 1, qty) } : l)),
    })),
  remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
  clear: () => set({ lines: [] }),
  setHydrated: (h) => set({ hydrated: h }),
}))
