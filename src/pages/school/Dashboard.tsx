import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, TrendingDown, Package, Bell, ArrowLeft, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Order, Announcement, Product } from '../../lib/types'
import { formatToman, formatTomanShort } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'
import { StatusChip, EmptyState } from '../../lib/ui'

export default function SchoolDashboard() {
  const { profile, school } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.school_id) { setLoading(false); return }
    ;(async () => {
      const [{ data: ords }, { data: anns }, { data: prods }] = await Promise.all([
        supabase.from('orders').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }).limit(5),
        supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('products').select('*').eq('is_active', true).eq('is_hygiene', true).lt('stock_qty', 20).limit(4),
      ])
      setOrders(ords as Order[] ?? [])
      setAnnouncements(anns as Announcement[] ?? [])
      setLowStockProducts(prods as Product[] ?? [])
      setLoading(false)
    })()
  }, [profile])

  const totalSaved = orders.reduce((s, o) => s + o.saved_amount_snapshot, 0)
  const lastOrder = orders[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">سلام {profile?.full_name}</h1>
        <p className="text-gray-500 text-sm">{school?.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1"><ClipboardList className="w-4 h-4" /><span className="text-xs">تعداد سفارش‌ها</span></div>
          <p className="text-2xl font-extrabold text-gray-800">{orders.length}</p>
        </div>
        <div className="card p-4 bg-success-50 border-success-100">
          <div className="flex items-center gap-2 text-success-700 mb-1"><TrendingDown className="w-4 h-4" /><span className="text-xs">صرفه‌جویی امسال</span></div>
          <p className="text-xl font-extrabold text-success-700">{formatTomanShort(totalSaved)}</p>
          <p className="text-[10px] text-success-600">تومان</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1"><Package className="w-4 h-4" /><span className="text-xs">آخرین سفارش</span></div>
          <p className="text-sm font-bold text-gray-800">{lastOrder ? formatJalaliDateShort(lastOrder.created_at) : '—'}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1"><RefreshCw className="w-4 h-4" /><span className="text-xs">وضعیت حساب</span></div>
          <p className="text-sm font-bold text-gray-800">{school?.status === 'approved' ? 'تأیید شده' : school?.status === 'pending_review' ? 'در انتظار' : 'رد شده'}</p>
        </div>
      </div>

      {/* Seasonal banner */}
      <div className="card p-5 bg-gradient-to-l from-accent-50 to-primary-50 border-accent-100">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-accent-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-800">قبل از مهر این‌ها را سفارش دهید</h3>
            <p className="text-sm text-gray-600">محصولات بهداشتی و کاغذی پرمصرف را زودتر سفارش دهید تا در زمان تحویل با تخفیف بهره‌مند شوید.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">سفارش‌های اخیر</h2>
            <Link to="/app/orders" className="text-sm text-primary-700 flex items-center gap-1">همه <ArrowLeft className="w-4 h-4" /></Link>
          </div>
          {loading ? (
            <div className="card p-4 animate-pulse h-32" />
          ) : orders.length === 0 ? (
            <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="سفارشی ثبت نشده" subtitle="از کاتالوگ محصول انتخاب کنید" action={<Link to="/app/catalog" className="btn-primary">مشاهده کاتالوگ</Link>} />
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <Link key={o.id} to={`/app/orders/${o.id}`} className="card p-3 flex items-center justify-between hover:shadow-card-hover transition">
                  <div>
                    <p className="font-bold text-sm text-gray-800" dir="ltr">{o.order_number}</p>
                    <p className="text-xs text-gray-500">{formatJalaliDateShort(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary-700">{formatTomanShort(o.grand_total)} ت</span>
                    <StatusChip status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low stock hygiene suggestions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">پیشنهاد خرید فوری</h2>
            <Link to="/app/catalog" className="text-sm text-primary-700 flex items-center gap-1">کاتالوگ <ArrowLeft className="w-4 h-4" /></Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="card p-4 text-center text-gray-500 text-sm">پیشنهادی موجود نیست</div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="card p-3 flex items-center gap-3 hover:shadow-card-hover transition">
                  <img src={`https://picsum.photos/seed/${p.slug}/100/100`} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{formatToman(p.our_price)}</p>
                  </div>
                  <span className="chip bg-warning-100 text-warning-600 text-[10px]">رو به اتمام</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-800 mb-3">اطلاعیه‌ها</h2>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="card p-4">
                <h3 className="font-bold text-sm text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
