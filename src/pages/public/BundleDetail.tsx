import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, TrendingDown, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Bundle, BundleItem } from '../../lib/types'
import { formatToman, formatTomanShort, discountPercent } from '../../lib/format'
import { useCart } from '../../lib/cart'
import { useToast } from '../../lib/toast'
import { useAuth } from '../../lib/auth'
import { Breadcrumbs } from '../../lib/ui'

export default function BundleDetail() {
  const { id } = useParams()
  const { addBundle } = useCart()
  const { toast } = useToast()
  const { session } = useAuth()
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [items, setItems] = useState<BundleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data: b } = await supabase.from('bundles').select('*').eq('id', id).maybeSingle()
      setBundle(b as Bundle | null)
      const { data: its } = await supabase
        .from('bundle_items')
        .select('*, product:products(*)')
        .eq('bundle_id', id)
      setItems(its as BundleItem[] ?? [])
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>
  if (!bundle) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><h2 className="text-xl font-bold">پکیج یافت نشد</h2><Link to="/bundles" className="btn-primary mt-4">بازگشت</Link></div>

  const disc = discountPercent(bundle.market_total, bundle.our_total)

  const handleAdd = () => {
    if (!session?.user?.id) { toast('info', 'برای سفارش وارد شوید'); return }
    addBundle(bundle)
    toast('success', 'پکیج به سبد اضافه شد')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'پکیج‌ها', to: '/bundles' }, { label: bundle.name }]} />

      <div className="card overflow-hidden mb-6">
        <div className="aspect-[2/1] bg-gray-50">
          <img src={bundle.image ?? `https://picsum.photos/seed/${bundle.slug}/800/400`} alt={bundle.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{bundle.name}</h1>
          <p className="text-gray-600 mb-4">{bundle.description}</p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {bundle.school_level && <span className="chip bg-primary-50 text-primary-700">{bundle.school_level}</span>}
            {bundle.season && <span className="chip bg-accent-100 text-accent-700">{bundle.season}</span>}
          </div>
          <div className="flex items-center justify-between bg-primary-50 rounded-xl px-5 py-4">
            <div>
              <p className="text-sm text-gray-500">قیمت پکیج</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-primary-700">{formatTomanShort(bundle.our_total)}</span>
                <span className="text-xs text-gray-400">تومان</span>
                <span className="text-sm text-gray-400 line-through">{formatTomanShort(bundle.market_total)}</span>
              </div>
            </div>
            {disc > 0 && (
              <span className="chip bg-accent-500 text-white font-bold text-sm"><TrendingDown className="w-4 h-4" /> {disc}٪ ارزان‌تر</span>
            )}
          </div>
          <button onClick={handleAdd} className="btn-primary w-full mt-4 py-3.5">
            <ShoppingCart className="w-5 h-5" /> افزودن پکیج به سبد
          </button>
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-gray-800 mb-4">اقلام پکیج</h2>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="card p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-success-600" />
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${it.product?.slug}`} className="font-medium text-gray-800 hover:text-primary-700 truncate block">
                {it.product?.name ?? 'محصول'}
              </Link>
              <p className="text-xs text-gray-500">{it.qty} عدد · {formatToman(it.product?.our_price ?? 0)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
