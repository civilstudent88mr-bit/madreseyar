import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Order } from '../../lib/types'
import { formatTomanShort } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'
import { StatusChip, EmptyState } from '../../lib/ui'

export default function Orders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!profile?.school_id) { setLoading(false); return }
    supabase.from('orders').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data as Order[] ?? [])
      setLoading(false)
    })
  }, [profile])

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">سفارش‌های من</h1>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`chip ${!filter ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>همه</button>
        {['submitted', 'confirmed', 'packing', 'shipped', 'delivered', 'canceled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`chip ${filter === s ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s === 'submitted' ? 'ثبت شده' : s === 'confirmed' ? 'تأیید شده' : s === 'packing' ? 'بسته‌بندی' : s === 'shipped' ? 'ارسال شده' : s === 'delivered' ? 'تحویل شده' : 'لغو شده'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse h-32" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="سفارشی وجود ندارد" subtitle="اولین سفارش خود را ثبت کنید" action={<Link to="/app/catalog" className="btn-primary">مشاهده کاتالوگ</Link>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <Link key={o.id} to={`/app/orders/${o.id}`} className="card p-4 flex items-center justify-between hover:shadow-card-hover transition">
              <div>
                <p className="font-bold text-sm text-gray-800" dir="ltr">{o.order_number}</p>
                <p className="text-xs text-gray-500">{formatJalaliDateShort(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-primary-700">{formatTomanShort(o.grand_total)} ت</p>
                  <p className="text-[10px] text-success-600">صرفه‌جویی {formatTomanShort(o.saved_amount_snapshot)} ت</p>
                </div>
                <StatusChip status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
