import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useStore, type InvoiceItem } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { formatToman, formatTomanShort, formatNumber } from '../../lib/format'
import { todayJalaliShort } from '../../lib/jalali'

export default function AdminInvoiceNew() {
  const navigate = useNavigate()
  const { products, createInvoice } = useStore()
  const { toast } = useToast()
  const [type, setType] = useState<'purchase' | 'sale'>('purchase')
  const [party, setParty] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [selProduct, setSelProduct] = useState('')

  const addItem = () => {
    if (!selProduct) return
    const p = products.find((x) => x.id === selProduct)
    if (!p) return
    if (items.find((it) => it.productId === p.id)) { toast('error', 'این کالا قبلاً اضافه شده'); return }
    setItems([...items, { productId: p.id, name: p.name, qty: 1, unitPrice: type === 'purchase' ? p.ourPrice : p.ourPrice, marketPrice: p.marketPrice }])
    setSelProduct('')
  }

  const updateItem = (idx: number, field: string, val: any) => {
    const next = [...items]; next[idx] = { ...next[idx], [field]: val }
    setItems(next)
  }

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  const marketTotal = items.reduce((s, it) => s + it.qty * it.marketPrice, 0)
  const saved = marketTotal - total

  const save = (status: 'draft' | 'posted') => {
    if (!party.trim()) { toast('error', 'نام طرف را وارد کنید'); return }
    if (items.length === 0) { toast('error', 'حداقل یک قلم اضافه کنید'); return }
    createInvoice({ type, status, date: new Date().toISOString(), party, items, total, marketTotal, savedAmount: saved, note, orderId: null })
    toast('success', status === 'posted' ? 'فاکتور ثبت شد' : 'پیش‌نویس ذخیره شد')
    navigate('/admin/invoices')
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/admin/invoices')} className="btn-ghost py-2 px-3"><ArrowRight className="w-4 h-4" /></button>
        <h1 className="text-xl font-extrabold text-gray-800">فاکتور جدید</h1>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">نوع فاکتور</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="input">
              <option value="purchase">خرید (از تأمین‌کننده)</option>
              <option value="sale">فروش</option>
            </select>
          </div>
          <div><label className="label">{type === 'purchase' ? 'تأمین‌کننده' : 'مشتری'}</label><input value={party} onChange={(e) => setParty(e.target.value)} className="input" placeholder={type === 'purchase' ? 'نام تأمین‌کننده' : 'نام مشتری/مدرسه'} /></div>
        </div>

        <div>
          <label className="label">افزودن قلم</label>
          <div className="flex gap-2">
            <select value={selProduct} onChange={(e) => setSelProduct(e.target.value)} className="input flex-1">
              <option value="">انتخاب کالا</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} (موجودی: {p.stock})</option>)}
            </select>
            <button onClick={addItem} className="btn-primary py-2.5 px-4"><Plus className="w-4 h-4" /> افزودن</button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-right font-medium">کالا</th>
                  <th className="px-3 py-2 text-right font-medium">تعداد</th>
                  <th className="px-3 py-2 text-right font-medium">قیمت واحد (ریال)</th>
                  <th className="px-3 py-2 text-right font-medium">جمع</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-800">{it.name}</td>
                    <td className="px-3 py-2"><input type="number" value={it.qty} onChange={(e) => updateItem(i, 'qty', Number(e.target.value))} className="input py-1 text-sm w-20" dir="ltr" /></td>
                    <td className="px-3 py-2"><input type="number" value={it.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="input py-1 text-sm w-32" dir="ltr" /></td>
                    <td className="px-3 py-2 font-bold text-primary-700">{formatTomanShort(it.qty * it.unitPrice)} ر</td>
                    <td className="px-3 py-2"><button onClick={() => removeItem(i)} className="btn-ghost p-1 text-error-600"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">جمع قیمت بازار</span><span className="text-gray-400 line-through">{formatToman(marketTotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-700 font-medium">جمع فروشگاه</span><span className="font-bold text-primary-700">{formatToman(total)}</span></div>
            <div className="flex justify-between bg-success-50 rounded-xl px-3 py-2"><span className="text-success-700 font-bold">صرفه‌جویی</span><span className="font-bold text-success-700">{formatToman(saved)}</span></div>
          </div>
        )}

        <div><label className="label">یادداشت</label><input value={note} onChange={(e) => setNote(e.target.value)} className="input" /></div>

        <div className="flex gap-2">
          <button onClick={() => save('posted')} className="btn-primary flex-1 py-3"><Save className="w-4 h-4" /> ثبت فاکتور</button>
          <button onClick={() => save('draft')} className="btn-ghost flex-1 py-3">ذخیره پیش‌نویس</button>
        </div>
      </div>
    </div>
  )
}
