import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Product } from '../../lib/types'
import ProductCard from '../../components/ProductCard'
import { EmptyState } from '../../lib/ui'

export default function Favorites() {
  const { session } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return }
    ;(async () => {
      const { data } = await supabase.from('favorites').select('product:products(*)').eq('user_id', session.user.id)
      const prods = (data ?? []).map((d: any) => d.product as Product)
      setProducts(prods)
      setLoading(false)
    })()
  }, [session])

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">علاقه‌مندی‌ها</h1>
      {products.length === 0 ? (
        <EmptyState icon={<Heart className="w-8 h-8" />} title="لیست علاقه‌مندی خالی است" subtitle="محصولات مورد نظر را علامت بزنید" action={<Link to="/app/catalog" className="btn-primary">مشاهده کاتالوگ</Link>} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
