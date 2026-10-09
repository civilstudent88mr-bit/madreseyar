import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Heart, MessageCircle, Package, ShoppingBag, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Order, Announcement, Product } from '../../lib/types'
import { formatTomanShort } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'
import { StatusChip, EmptyState } from '../../lib/ui'

export default function CustomerDashboard() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return }
    let active = true
    void (async () => {
      const [{ data: recentOrders }, { data: activeAnnouncements }, { data: featuredProducts }] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(4),
        supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(2),
        supabase.from('products').select('*').eq('is_active', true).order('is_featured', { ascending: false }).limit(4),
      ])
      if (!active) return
      setOrders((recentOrders || []) as Order[])
      setAnnouncements((activeAnnouncements || []) as Announcement[])
      setProducts((featuredProducts || []) as Product[])
      setLoading(false)
    })()
    return () => { active = false }
  }, [profile?.id])

  return <div className="space-y-6" dir="rtl">
    <section className="rounded-3xl bg-gradient-to-l from-[#fce7df] via-[#fff3ed] to-[#e8f5f1] p-6 md:p-9 border border-[#f1ddd4]">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#b9524c]"><Sparkles className="w-4 h-4" />Healthcare، همراه مراقبت روزانهٔ شما</span>
      <h1 className="text-2xl md:text-3xl font-black text-[#3f2c29] mt-3">خوش آمدید{profile?.full_name ? `، ${profile.full_name}` : ''}</h1>
      <p className="text-gray-600 mt-2 max-w-xl">محصولات مراقبت پوست، مو و بهداشتی را ببینید، سفارش‌ها را پیگیری کنید و روتین مناسب خود را پیدا کنید.</p>
      <div className="flex flex-wrap gap-3 mt-5"><Link to="/app/catalog" className="btn-primary py-3"><ShoppingBag className="w-4 h-4" />مشاهده محصولات</Link><Link to="/ask-pharmacist" className="btn-secondary py-3"><MessageCircle className="w-4 h-4" />از داروسازت بپرس</Link></div>
    </section>

    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Link to="/app/orders" className="card p-4 flex gap-3 items-center hover:shadow-card-hover"><ClipboardList className="w-5 h-5 text-primary-700" /><div><p className="text-xs text-gray-500">سفارش‌های من</p><p className="font-bold text-gray-900">{orders.length} سفارش اخیر</p></div></Link>
      <Link to="/app/favorites" className="card p-4 flex gap-3 items-center hover:shadow-card-hover"><Heart className="w-5 h-5 text-[#d8665d]" /><div><p className="text-xs text-gray-500">محصولات دلخواه</p><p className="font-bold text-gray-900">مشاهده علاقه‌مندی‌ها</p></div></Link>
      <Link to="/app/profile" className="card p-4 flex gap-3 items-center hover:shadow-card-hover"><Package className="w-5 h-5 text-primary-700" /><div><p className="text-xs text-gray-500">آمادهٔ خرید؟</p><p className="font-bold text-gray-900">نشانی و اطلاعات حساب</p></div></Link>
    </section>

    <section>
      <div className="flex items-center justify-between mb-3"><h2 className="font-extrabold text-lg text-gray-900">سفارش‌های اخیر</h2><Link to="/app/orders" className="text-sm text-primary-700 flex items-center gap-1">همه سفارش‌ها <ArrowLeft className="w-4 h-4" /></Link></div>
      {loading ? <div className="card h-28 animate-pulse" /> : orders.length === 0 ? <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="هنوز سفارشی ثبت نکرده‌اید" subtitle="از محصولات مراقبت پوست و زیبایی دیدن کنید." action={<Link to="/app/catalog" className="btn-primary">شروع خرید</Link>} /> : <div className="space-y-2">{orders.map((order) => <Link key={order.id} to={`/app/orders/${order.id}`} className="card p-4 flex flex-wrap items-center justify-between gap-3 hover:shadow-card-hover"><div><p className="font-bold text-gray-800" dir="ltr">{order.order_number}</p><p className="text-xs text-gray-500 mt-1">{formatJalaliDateShort(order.created_at)}</p></div><div className="flex items-center gap-3"><span className="font-bold text-primary-700">{formatTomanShort(order.grand_total)} تومان</span><StatusChip status={order.status} /></div></Link>)}</div>}
    </section>

    <section>
      <div className="flex items-center justify-between mb-3"><h2 className="font-extrabold text-lg text-gray-900">پیشنهادهای Healthcare</h2><Link to="/app/catalog" className="text-sm text-primary-700">مشاهده همه</Link></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{products.map((product) => <Link key={product.id} to={`/product/${product.slug}`} className="card p-4 hover:shadow-card-hover"><p className="text-xs text-primary-700 mb-2">{product.brand || 'Healthcare'}</p><h3 className="font-bold text-gray-900 line-clamp-2 min-h-12">{product.name}</h3><p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.short_desc || product.long_desc || 'محصول مراقبتی و بهداشتی'}</p><p className="font-extrabold text-primary-700 mt-4">{formatTomanShort(product.our_price)} تومان</p></Link>)}</div>
    </section>

    {announcements.length > 0 && <section className="space-y-2"><h2 className="font-extrabold text-lg text-gray-900">تازه‌های فروشگاه</h2>{announcements.map((announcement) => <article key={announcement.id} className="card p-4"><h3 className="font-bold text-gray-900">{announcement.title}</h3><p className="text-sm text-gray-600 mt-1">{announcement.body}</p></article>)}</section>}
  </div>
}
