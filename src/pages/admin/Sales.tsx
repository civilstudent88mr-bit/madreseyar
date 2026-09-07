import { useState } from 'react'
import { BarChart3, Search } from 'lucide-react'
import { useStore } from '../../lib/store'
import { formatTomanShort, formatNumber, toPersianDigits } from '../../lib/format'
import { EmptyState } from '../../lib/ui'

const categories = ['بهداشتی', 'کاغذی', 'نوشت‌افزار', 'اداری', 'پلاستیک', 'سایر']

export default function AdminSales() {
  const { products, productSalesStats } = useStore()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const rows = products
    .filter((p) => (!filterCat || p.category === filterCat) && (!search || p.name.includes(search)))
    .map((p) => {
      const stats = productSalesStats(p.id)
      return { ...p, ...stats }
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)

  const todayTotal = rows.reduce((s, r) => s + r.todayAmount, 0)
  const monthTotal = rows.reduce((s, r) => s + r.monthAmount, 0)
  const allTotal = rows.reduce((s, r) => s + r.totalAmount, 0)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-700" /> گزارش فروش کالا</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-4 bg-primary-50 border-primary-100">
          <p className="text-xs text-primary-600 mb-1">فروش امروز</p>
          <p className="text-lg font-extrabold text-primary-700">{formatTomanShort(todayTotal)} ر</p>
        </div>
        <div className="card p-4 bg-success-50 border-success-100">
          <p className="text-xs text-success-600 mb-1">فروش این ماه شمسی</p>
          <p className="text-lg font-extrabold text-success-700">{formatTomanShort(monthTotal)} ر</p>
        </div>
        <div className="card p-4 bg-accent-50 border-accent-100">
          <p className="text-xs text-accent-600 mb-1">فروش کل</p>
          <p className="text-lg font-extrabold text-accent-700">{formatTomanShort(allTotal)} ر</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی کالا..." className="input pr-10 py-2.5" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input py-2.5 text-sm w-auto">
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<BarChart3 className="w-8 h-8" />} title="کالایی یافت نشد" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-right font-medium">نام کالا</th>
                <th className="px-4 py-3 text-right font-medium">فروش امروز</th>
                <th className="px-4 py-3 text-right font-medium">فروش این ماه</th>
                <th className="px-4 py-3 text-right font-medium">فروش کل</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-800">{formatTomanShort(r.todayAmount)} ر</span>
                    <span className="text-xs text-gray-400 block">{toPersianDigits(r.todayCount)} عدد</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-800">{formatTomanShort(r.monthAmount)} ر</span>
                    <span className="text-xs text-gray-400 block">{toPersianDigits(r.monthCount)} عدد</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-primary-700">{formatTomanShort(r.totalAmount)} ر</span>
                    <span className="text-xs text-gray-400 block">{toPersianDigits(r.totalCount)} عدد</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
