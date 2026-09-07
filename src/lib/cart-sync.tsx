import { useEffect } from 'react'
import { useAuth } from './auth'
import { useCart } from './cart'
import { supabase } from './supabase'

export function CartSync() {
  const { session, profile } = useAuth()
  const { setLines, setHydrated, hydrated } = useCart()

  useEffect(() => {
    if (!session?.user?.id || !profile) return
    if (hydrated) return
    (async () => {
      const { data: items } = await supabase
        .from('cart_items')
        .select(`
          id, qty, product_id, bundle_id,
          product:products(*),
          bundle:bundles(*)
        `)
        .eq('user_id', session.user.id)
      if (items) {
        const lines = items.map((it: any) => ({
          id: it.id,
          product: it.product ?? undefined,
          bundle: it.bundle ?? undefined,
          qty: it.qty,
        }))
        setLines(lines)
      }
      setHydrated(true)
    })()
  }, [session, profile, hydrated, setLines, setHydrated])

  return null
}
