import { useEffect, useState } from 'react'
import { BarChart3, TrendingDown, Package, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { supabase } from '../../lib/supabase'
import type { Order, Product, School } from '../../lib/types'
import { formatToman, formatTomanShort } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [{ data: o }, { data: p }, { data: s }] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*'),
        supabase.from('schools').select('*'),
      ])
      setOrders(o as Order[] ?? [])
      setProducts(p as Product[] ?? [])
      setSchools(s as School[] ?? [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  const totalRevenue = orders.reduce((s, o) => s + o.grand_total, 0)
  const totalSavings = orders.reduce((s, o) => s + o.saved_amount_snapshot, 0)
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0

  // Monthly data
  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const monthOrders = orders.filter((o) => new Date(o.created_at).getMonth() === d.getMonth())
    return { name: months[d.getMonth()], درآمد: monthOrders.reduce((s, o) => s + o.grand_total, 0), سفارش: monthOrders.length }
  })

  // Top products by stock movement (simplified)
  const topProducts = products.slice(0, 5).map((p) => ({ name: p.name.slice(0, 12), موجودی: p.stock_qty }))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-700" /> گزارش‌ها</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4"><div className="text-xs text-gray-500 mb-1">درآمد کل</div><p className="text-lg font-extrabold text-primary-700">{formatTomanShort(totalRevenue)} <span className="text-xs">ت</span></p></div>
        <div className="card p-4 bg-success-50 border-success-100"><div className="text-xs text-success-700 mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> صرفه‌جویی کل</div><p className="text-lg font-extrabold text-success-700">{formatTomanShort(totalSavings)} <span className="text-xs">ت</span></p></div>
        <div className="card p-4"><div className="text-xs text-gray-500 mb-1">تعداد سفارش</div><p className="text-lg font-extrabold text-gray-800">{orders.length}</p></div>
        <div className="card p-4"><div className="text-xs text-gray-500 mb-1">میانگین سفارش</div><p className="text-lg font-extrabold text-gray-800">{formatTomanShort(avgOrder)} <span className="text-xs">ت</span></p></div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">درآمد ۶ ماه اخیر</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Vazirmatn' }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}م`} />
            <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '12px' }} formatter={(v: any) => formatToman(v)} />
            <Line type="monotone" dataKey="درآمد" stroke="#0F766E" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">تعداد سفارش ماهانه</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Vazirmatn' }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '12px' }} />
              <Bar dataKey="سفارش" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">موجودی محصولات</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Vazirmatn' }} width={80} />
              <Tooltip contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '12px' }} />
              <Bar dataKey="موجودی" fill="#14B8A6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-3">آمار کلی</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2"><Package className="w-4 h-4 text-primary-600" /><span>محصولات: {products.length}</span></div>
          <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-600" /><span>مدارس: {schools.length}</span></div>
          <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-success-600" /><span>تأیید شده: {schools.filter((s) => s.status === 'approved').length}</span></div>
          <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary-600" /><span>تحویل شده: {orders.filter((o) => o.status === 'delivered').length}</span></div>
        </div>
      </div>
    </div>
  )
}
