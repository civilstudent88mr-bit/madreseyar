import { useState } from 'react'
import { Warehouse, Plus, Save, X } from 'lucide-react'
import { useStore, type StockMove } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { formatNumber } from '../../lib/format'
import { formatJalaliDateShort, todayJalaliShort } from '../../lib/jalali'

const reasons: { value: StockMove['reason']; label: string; sign: number }[] = [
  { value: 'purchase', label: 'ورود کالا (خرید/تأمین)', sign: 1 },
  { value: 'waste', label: 'ضایعات', sign: -1 },
  { value: 'adjust', label: 'تعدیل', sign: 0 },
]

export default function AdminInventory() {
  const { products, stockMoves, adjustStock } = useStore()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ productId: '', delta: 0, reason: 'purchase' as StockMove['reason'], note: '', date: todayJalaliShort() })

  const stockStatus = (p: typeof products[0]) => {
    if (p.stock === 0) return { label: 'ناموجود', class: 'bg-error-100 text-error-700' }
    if (p.stock < 5) return { label: 'کم', class: 'bg-warning-100 text-warning-600' }
    return { label: 'کافی', class: 'bg-success-100 text-success-700' }
  }

  const submit = () => {
    if (!form.productId || !form.delta) { toast('error', 'کالا و تعداد را وارد کنید'); return }
    const reason = reasons.find((r) => r.value === form.reason)!
    const delta = reason.sign !== 0 ? form.delta * reason.sign : form.delta
    adjustStock(form.productId, delta, form.reason, form.note)
    toast('success', 'حرکت انبار ثبت شد')
    setShowForm(false)
    setForm({ productId: '', delta: 0, reason: 'purchase', note: '', date: todayJalaliShort() })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Warehouse className="w-5 h-5 text-primary-700" /> موجودی و انبار</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm"><Plus className="w-4 h-4" /> ثبت حرکت انبار</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-right font-medium">نام کالا</th>
              <th className="px-4 py-3 text-right font-medium">SKU</th>
              <th className="px-4 py-3 text-right font-medium">موجودی</th>
              <th className="px-4 py-3 text-right font-medium">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const st = stockStatus(p)
              return (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{p.sku}</td>
                  <td className="px-4 py-3 font-bold">{formatNumber(p.stock)}</td>
                  <td className="px-4 py-3"><span className={`chip text-[10px] ${st.class}`}>{st.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="font-bold text-gray-800 mb-3">تاریخچه حرکت‌ها</h2>
        {stockMoves.length === 0 ? (
          <div className="card p-4 text-center text-gray-500 text-sm">حرکتی ثبت نشده است</div>
        ) : (
          <div className="space-y-2">
            {stockMoves.map((m) => (
              <div key={m.id} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${m.delta > 0 ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                    {m.delta > 0 ? '+' : '−'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.productName}</p>
                    <p className="text-xs text-gray-500">{reasons.find((r) => r.value === m.reason)?.label ?? m.reason} · {m.note}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">{m.delta > 0 ? '+' : ''}{formatNumber(m.delta)}</p>
                  <p className="text-[10px] text-gray-400">{formatJalaliDateShort(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">ثبت حرکت انبار</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">کالا</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="input">
                  <option value="">انتخاب کالا</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (موجودی: {p.stock})</option>)}
                </select>
              </div>
              <div><label className="label">علت</label>
                <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value as StockMove['reason'] })} className="input">
                  {reasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div><label className="label">تعداد</label><input type="number" value={form.delta || ''} onChange={(e) => setForm({ ...form, delta: Number(e.target.value) })} className="input" dir="ltr" /></div>
              <div><label className="label">تاریخ شمسی</label><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" dir="ltr" /></div>
              <div><label className="label">توضیح</label><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input" /></div>
              <button onClick={submit} className="btn-primary w-full py-3"><Save className="w-4 h-4" /> ثبت</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
