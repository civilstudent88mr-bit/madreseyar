import { useState } from 'react'
import { KanbanSquare, ArrowLeft, ArrowRight } from 'lucide-react'
import { useStore, type Invoice } from '../../lib/store'
import { formatTomanShort, toPersianDigits } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'

const columns = [
  { key: 'draft', label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-700' },
  { key: 'submitted', label: 'ثبت شده', color: 'bg-accent-100 text-accent-700' },
  { key: 'confirmed', label: 'تأیید شده', color: 'bg-primary-100 text-primary-700' },
  { key: 'packing', label: 'بسته‌بندی', color: 'bg-warning-100 text-warning-600' },
  { key: 'shipped', label: 'ارسال شده', color: 'bg-blue-100 text-blue-700' },
  { key: 'delivered', label: 'تحویل شده', color: 'bg-success-100 text-success-700' },
] as const

type ColKey = typeof columns[number]['key']

function setInvoiceStatus(id: string, status: Invoice['status']) {
  useStore.setState((st) => ({
    invoices: st.invoices.map((i) => i.id === id ? { ...i, status } : i),
  }))
}

export default function AdminKanban() {
  const { invoices } = useStore()
  const [dragId, setDragId] = useState<string | null>(null)

  const saleInvoices = invoices.filter((i) => i.type === 'sale' && i.status !== 'void' && i.status !== 'posted')

  const move = (id: string, dir: -1 | 1) => {
    const inv = invoices.find((i) => i.id === id)
    if (!inv) return
    const colKeys = columns.map((c) => c.key)
    const idx = colKeys.indexOf(inv.status as ColKey)
    const nextIdx = Math.max(0, Math.min(colKeys.length - 1, idx + dir))
    setInvoiceStatus(id, colKeys[nextIdx])
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><KanbanSquare className="w-5 h-5 text-primary-700" /> کانبان سفارش</h1>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {columns.map((col) => {
            const items = saleInvoices.filter((i) => i.status === col.key)
            return (
              <div key={col.key} className="w-64 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`chip text-xs ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-gray-400">{toPersianDigits(items.length)}</span>
                </div>
                <div
                  className="space-y-2 min-h-[200px] bg-gray-50 rounded-2xl p-2"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) {
                      setInvoiceStatus(dragId, col.key)
                      setDragId(null)
                    }
                  }}
                >
                  {items.map((inv) => (
                    <div
                      key={inv.id}
                      draggable
                      onDragStart={() => setDragId(inv.id)}
                      onDragEnd={() => setDragId(null)}
                      className="card p-3 cursor-move hover:shadow-card-hover transition"
                    >
                      <p className="font-bold text-xs text-gray-800" dir="ltr">{inv.number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{inv.party}</p>
                      <p className="text-sm font-bold text-primary-700 mt-1">{formatTomanShort(inv.total)} ر</p>
                      <p className="text-[10px] text-gray-400">{formatJalaliDateShort(inv.date)}</p>
                      <div className="flex gap-1 mt-2">
                        <button onClick={() => move(inv.id, -1)} className="btn-ghost p-1 text-xs"><ArrowRight className="w-3 h-3" /></button>
                        <button onClick={() => move(inv.id, 1)} className="btn-ghost p-1 text-xs"><ArrowLeft className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-center text-xs text-gray-300 py-8">خالی</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
