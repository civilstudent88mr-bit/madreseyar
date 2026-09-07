import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Printer, Ban, Eye } from 'lucide-react'
import { useStore, type Invoice } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { formatToman, formatTomanShort, formatNumber } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminInvoices() {
  const { invoices, voidInvoice } = useStore()
  const { toast } = useToast()
  const [filter, setFilter] = useState('')

  const filtered = filter ? invoices.filter((i) => i.type === filter) : invoices

  const voidInv = (inv: Invoice) => {
    if (!confirm(`باطل کردن فاکتور ${inv.number}؟`)) return
    voidInvoice(inv.id)
    toast('success', 'فاکتور باطل شد')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-700" /> فاکتورها</h1>
        <Link to="/admin/invoices/new" className="btn-primary py-2.5 px-4 text-sm"><Plus className="w-4 h-4" /> فاکتور جدید</Link>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter('')} className={`chip ${!filter ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>همه</button>
        <button onClick={() => setFilter('purchase')} className={`chip ${filter === 'purchase' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>خرید</button>
        <button onClick={() => setFilter('sale')} className={`chip ${filter === 'sale' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>فروش</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="فاکتوری وجود ندارد" action={<Link to="/admin/invoices/new" className="btn-primary">ایجاد فاکتور</Link>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <div key={inv.id} className="card p-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${inv.type === 'purchase' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800" dir="ltr">{inv.number}</p>
                  <p className="text-xs text-gray-500">{inv.type === 'purchase' ? 'خرید' : 'فروش'} · {inv.party} · {formatJalaliDateShort(inv.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-primary-700">{formatTomanShort(inv.total)} ر</span>
                <span className={`chip text-[10px] ${inv.status === 'posted' ? 'bg-success-100 text-success-700' : inv.status === 'void' ? 'bg-error-100 text-error-700' : 'bg-gray-100 text-gray-600'}`}>
                  {inv.status === 'posted' ? 'ثبت‌شده' : inv.status === 'void' ? 'باطل' : 'پیش‌نویس'}
                </span>
                <div className="flex gap-1">
                  <Link to={`/invoice/${inv.id}`} className="btn-ghost p-1.5"><Eye className="w-4 h-4" /></Link>
                  <Link to={`/invoice/${inv.id}`} className="btn-ghost p-1.5"><Printer className="w-4 h-4" /></Link>
                  {inv.status === 'posted' && <button onClick={() => voidInv(inv)} className="btn-ghost p-1.5 text-error-600"><Ban className="w-4 h-4" /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
