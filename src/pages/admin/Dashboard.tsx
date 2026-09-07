import { useStore } from '../../lib/store'
import { formatTomanShort, formatNumber } from '../../lib/format'
import { formatJalaliDateShort, toJalaliDate } from '../../lib/jalali'
import { TrendingUp, ShoppingCart, AlertTriangle, Inbox, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { products, invoices, submissions } = useStore()

  const today = new Date().toDateString()
  const todayInvoices = invoices.filter((i) => i.type === 'sale' && i.status === 'posted' && new Date(i.date).toDateString() === today)
  const todaySales = todayInvoices.reduce((s, i) => s + i.total, 0)

  const now = toJalaliDate(new Date())
  const monthInvoices = invoices.filter((i) => {
    if (i.type !== 'sale' || i.status !== 'posted') return false
    const d = toJalaliDate(new Date(i.date))
    return d.year === now.year && d.month === now.month
  })
  const monthSales = monthInvoices.reduce((s, i) => s + i.total, 0)

  const totalSales = invoices.filter((i) => i.type === 'sale' && i.status === 'posted').reduce((s, i) => s + i.total, 0)

  const criticalStock = products.filter((p) => p.stock < 5)
  const pendingSubs = submissions.filter((s) => s.status === 'pending')

  const kpis = [
    { icon: ShoppingCart, label: 'فروش امروز', value: `${formatTomanShort(todaySales)} ر`, sub: `${formatNumber(todayInvoices.length)} سفارش`, color: 'primary' },
    { icon: TrendingUp, label: 'فروش این ماه شمسی', value: `${formatTomanShort(monthSales)} ر`, sub: `${formatNumber(monthInvoices.length)} فاکتور`, color: 'success' },
    { icon: Package, label: 'فروش کل', value: `${formatTomanShort(totalSales)} ر`, sub: `${formatNumber(invoices.filter((i) => i.type === 'sale' && i.status === 'posted').length)} فاکتور`, color: 'accent' },
    { icon: AlertTriangle, label: 'موجودی بحرانی', value: formatNumber(criticalStock.length), sub: 'کمتر از ۵ عدد', color: 'error' },
    { icon: Inbox, label: 'کالاهای در انتظار تأیید', value: formatNumber(pendingSubs.length), sub: 'ثبت‌شده توسط مدارس', color: 'warning' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">داشبورد مدیریت</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className={`card p-4 ${k.color === 'success' ? 'bg-success-50 border-success-100' : k.color === 'error' ? 'bg-error-50 border-error-100' : k.color === 'warning' ? 'bg-accent-50 border-accent-100' : k.color === 'accent' ? 'bg-accent-50 border-accent-100' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <k.icon className={`w-4 h-4 ${k.color === 'success' ? 'text-success-600' : k.color === 'error' ? 'text-error-600' : k.color === 'warning' ? 'text-accent-600' : k.color === 'accent' ? 'text-accent-600' : 'text-primary-600'}`} />
              <span className="text-xs text-gray-500">{k.label}</span>
            </div>
            <p className="text-lg font-extrabold text-gray-800">{k.value}</p>
            <p className="text-[10px] text-gray-400">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 mb-3">موجودی بحرانی</h2>
          <div className="space-y-2">
            {criticalStock.length === 0 ? (
              <div className="card p-4 text-center text-gray-500 text-sm">موجودی همه کالاها کافی است</div>
            ) : (
              criticalStock.map((p) => (
                <Link key={p.id} to="/admin/inventory" className="card p-3 flex items-center justify-between hover:shadow-card-hover transition">
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  <span className="chip bg-error-100 text-error-700 text-[10px]">موجودی: {formatNumber(p.stock)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-3">کالاهای در انتظار تأیید</h2>
          <div className="space-y-2">
            {pendingSubs.length === 0 ? (
              <div className="card p-4 text-center text-gray-500 text-sm">درخواستی وجود ندارد</div>
            ) : (
              pendingSubs.map((s) => (
                <Link key={s.id} to="/admin/submissions" className="card p-3 flex items-center justify-between hover:shadow-card-hover transition">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.productName}</p>
                    <p className="text-xs text-gray-500">{s.schoolName} · {formatJalaliDateShort(s.date)}</p>
                  </div>
                  <span className="chip bg-accent-100 text-accent-700 text-[10px]">در انتظار</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
