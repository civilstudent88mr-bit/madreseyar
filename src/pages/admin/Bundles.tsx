import { useEffect, useState } from 'react'
import { Boxes, TrendingDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Bundle } from '../../lib/types'
import { formatTomanShort, discountPercent } from '../../lib/format'
import { EmptyState } from '../../lib/ui'

export default function AdminBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bundles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setBundles(data as Bundle[] ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">پکیج‌ها</h1>
      {bundles.length === 0 ? (
        <EmptyState icon={<Boxes className="w-8 h-8" />} title="پکیجی وجود ندارد" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bundles.map((b) => (
            <div key={b.id} className="card p-4">
              <h3 className="font-bold text-gray-800 mb-1">{b.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{b.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-primary-700">{formatTomanShort(b.our_total)} ت</span>
                <span className="text-xs text-gray-400 line-through">{formatTomanShort(b.market_total)}</span>
              </div>
              <span className="chip bg-accent-100 text-accent-700 mt-2 text-[10px]"><TrendingDown className="w-3 h-3" /> {discountPercent(b.market_total, b.our_total)}٪</span>
              <div className="mt-2"><span className={`chip text-[10px] ${b.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{b.is_active ? 'فعال' : 'غیرفعال'}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
