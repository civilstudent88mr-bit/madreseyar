import { useEffect, useState } from 'react'
import { Ticket, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Coupon } from '../../lib/types'
import { EmptyState } from '../../lib/ui'

export default function AdminCoupons() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', percent: 10, min_order: 0, max_uses: 100 })

  const load = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCoupons(data as Coupon[] ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.code.trim()) return
    await supabase.from('coupons').insert({ code: form.code.toUpperCase(), percent: Number(form.percent), min_order: Number(form.min_order), max_uses: Number(form.max_uses), is_active: true })
    toast('success', 'کد تخفیف ایجاد شد')
    setForm({ code: '', percent: 10, min_order: 0, max_uses: 100 })
    load()
  }

  const del = async (c: Coupon) => {
    if (!confirm(`حذف کد "${c.code}"؟`)) return
    await supabase.from('coupons').delete().eq('id', c.id)
    toast('success', 'حذف شد')
    load()
  }

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">کدهای تخفیف</h1>

      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-gray-800">کد تخفیف جدید</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="کد (مثلاً MEHR1405)" className="input" dir="ltr" />
          <input type="number" value={form.percent} onChange={(e) => setForm({ ...form, percent: Number(e.target.value) })} placeholder="درصد" className="input" dir="ltr" />
          <input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} placeholder="حداقل سفارش" className="input" dir="ltr" />
          <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} placeholder="حداکثر استفاده" className="input" dir="ltr" />
        </div>
        <button onClick={create} className="btn-primary py-2.5 text-sm"><Plus className="w-4 h-4" /> ایجاد</button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={<Ticket className="w-8 h-8" />} title="کد تخفیفی وجود ندارد" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map((c) => (
            <div key={c.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800" dir="ltr">{c.code}</p>
                <p className="text-xs text-gray-500">{c.percent}٪ تخفیف · {c.used_count}/{c.max_uses ?? '∞'} استفاده</p>
                <span className={`chip text-[10px] mt-1 ${c.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'فعال' : 'غیرفعال'}</span>
              </div>
              <button onClick={() => del(c)} className="btn-ghost p-1.5 text-error-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
