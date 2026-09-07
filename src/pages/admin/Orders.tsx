import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, ClipboardList } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Order } from '../../lib/types'
import { formatTomanShort } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'
import { StatusChip, EmptyState } from '../../lib/ui'

const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'submitted', label: 'ثبت شده' },
  { value: 'confirmed', label: 'تأیید شده' },
  { value: 'packing', label: 'بسته‌بندی' },
  { value: 'shipped', label: 'ارسال شده' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'canceled', label: 'لغو شده' },
]

export default function AdminOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data as Order[] ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = orders.filter((o) => (!filter || o.status === filter) && (!search || o.order_number.includes(search)))

  const exportCSV = () => {
    const headers = ['شماره سفارش', 'وضعیت', 'مبلغ کل', 'صرفه‌جویی', 'تاریخ']
    const rows = filtered.map((o) => [o.order_number, o.status, o.grand_total, o.saved_amount_snapshot, formatJalaliDateShort(o.created_at)])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click()
    toast('success', 'فایل CSV دانلود شد')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-extrabold text-gray-800">سفارش‌ها</h1>
        <button onClick={exportCSV} className="btn-secondary py-2.5 px-4 text-sm"><Download className="w-4 h-4" /> خروجی CSV</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)} className={`chip ${filter === s.value ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.label}</button>
        ))}
      </div>

      <div className="relative">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی شماره سفارش..." className="input pr-10 py-2.5" />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse h-40" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="سفارشی وجود ندارد" />
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <Link key={o.id} to={`/admin/orders/${o.id}`} className="card p-3 flex items-center justify-between hover:shadow-card-hover transition">
              <div><p className="font-bold text-sm text-gray-800" dir="ltr">{o.order_number}</p><p className="text-xs text-gray-500">{formatJalaliDateShort(o.created_at)}</p></div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-primary-700">{formatTomanShort(o.grand_total)} ت</span>
                <StatusChip status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
