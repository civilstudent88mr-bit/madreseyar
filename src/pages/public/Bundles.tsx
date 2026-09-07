import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, TrendingDown, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Bundle } from '../../lib/types'
import { formatToman, formatTomanShort, discountPercent } from '../../lib/format'
import { Breadcrumbs, EmptyState } from '../../lib/ui'

export default function Bundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bundles').select('*').eq('is_active', true).then(({ data }) => {
      setBundles(data as Bundle[] ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'پکیج‌های پیشنهادی' }]} />
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">پکیج‌های پیشنهادی مدارس</h1>
      <p className="text-gray-500 mb-6">مجموعه‌های آماده برای نیازهای رایج مدارس با تخفیف اضافی</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4 space-y-3"><div className="skeleton w-full h-40" /><div className="skeleton h-4 w-3/4" /><div className="skeleton h-8 w-full" /></div>)}
        </div>
      ) : bundles.length === 0 ? (
        <EmptyState icon={<Boxes className="w-8 h-8" />} title="پکیجی موجود نیست" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bundles.map((b) => {
            const disc = discountPercent(b.market_total, b.our_total)
            return (
              <Link key={b.id} to={`/bundles/${b.id}`} className="card overflow-hidden hover:shadow-card-hover transition group">
                <div className="aspect-[3/2] bg-gray-50 overflow-hidden">
                  <img src={b.image ?? `https://picsum.photos/seed/${b.slug}/400/300`} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{b.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{b.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-extrabold text-primary-700">{formatTomanShort(b.our_total)}</span>
                    <span className="text-xs text-gray-400">تومان</span>
                    <span className="text-xs text-gray-400 line-through">{formatTomanShort(b.market_total)}</span>
                  </div>
                  {disc > 0 && (
                    <span className="chip bg-accent-100 text-accent-700"><TrendingDown className="w-3 h-3" /> {disc}٪ ارزان‌تر</span>
                  )}
                  <div className="mt-3 text-primary-700 text-sm font-medium flex items-center gap-1">
                    مشاهده پکیج <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
