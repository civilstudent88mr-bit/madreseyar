import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Category } from '../../lib/types'

export default function AdminProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', sku: '', short_desc: '', long_desc: '',
    category_id: '', brand: '', unit: 'عدد', pack_size: '',
    market_price: 0, our_price: 0, cost_price: 0,
    min_order_qty: 1, step_qty: 1, max_order_qty: 9999,
    stock_qty: 0, low_stock_threshold: 10,
    is_active: true, is_featured: false, is_hygiene: false,
    suitable_for: [] as string[],
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data as Category[] ?? []))
    if (id) {
      supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data }) => {
        if (data) setForm(data as any)
      })
    }
  }, [id])

  const set = (k: string, v: any) => setForm({ ...form, [k]: v })

  const save = async () => {
    setSaving(true)
    const slug = form.slug || form.name.replace(/\s+/g, '-')
    const payload = { ...form, slug, market_price: Number(form.market_price), our_price: Number(form.our_price), cost_price: Number(form.cost_price) }
    if (id) {
      const { error } = await supabase.from('products').update(payload).eq('id', id)
      if (error) { toast('error', 'خطا در ذخیره'); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast('error', 'خطا در ایجاد'); setSaving(false); return }
    }
    setSaving(false)
    toast('success', 'محصول ذخیره شد')
    navigate('/admin/products')
  }

  const levels = ['ابتدایی', 'متوسطه اول', 'متوسطه دوم', 'هنرستان']

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/admin/products')} className="btn-ghost py-2 px-3"><ArrowRight className="w-4 h-4" /></button>
        <h1 className="text-xl font-extrabold text-gray-800">{id ? 'ویرایش محصول' : 'محصول جدید'}</h1>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">نام محصول</label><input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" /></div>
          <div><label className="label">کد محصول (SKU)</label><input value={form.sku} onChange={(e) => set('sku', e.target.value)} className="input" dir="ltr" /></div>
          <div><label className="label">دسته‌بندی</label>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="input">
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">برند</label><input value={form.brand} onChange={(e) => set('brand', e.target.value)} className="input" /></div>
          <div><label className="label">واحد</label><input value={form.unit} onChange={(e) => set('unit', e.target.value)} className="input" /></div>
          <div><label className="label">اندازه بسته</label><input value={form.pack_size} onChange={(e) => set('pack_size', e.target.value)} className="input" /></div>
        </div>

        <div><label className="label">توضیح کوتاه</label><input value={form.short_desc} onChange={(e) => set('short_desc', e.target.value)} className="input" /></div>
        <div><label className="label">توضیح کامل</label><textarea value={form.long_desc} onChange={(e) => set('long_desc', e.target.value)} className="input min-h-[80px]" /></div>

        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">قیمت بازار (ت)</label><input type="number" value={form.market_price} onChange={(e) => set('market_price', e.target.value)} className="input" dir="ltr" /></div>
          <div><label className="label">قیمت ما (ت)</label><input type="number" value={form.our_price} onChange={(e) => set('our_price', e.target.value)} className="input" dir="ltr" /></div>
          <div><label className="label">قیمت هزینه (ت)</label><input type="number" value={form.cost_price} onChange={(e) => set('cost_price', e.target.value)} className="input" dir="ltr" /></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">حداقل سفارش</label><input type="number" value={form.min_order_qty} onChange={(e) => set('min_order_qty', e.target.value)} className="input" dir="ltr" /></div>
          <div><label className="label">گام سفارش</label><input type="number" value={form.step_qty} onChange={(e) => set('step_qty', e.target.value)} className="input" dir="ltr" /></div>
          <div><label className="label">موجودی</label><input type="number" value={form.stock_qty} onChange={(e) => set('stock_qty', e.target.value)} className="input" dir="ltr" /></div>
        </div>

        <div>
          <label className="label">مقاطع مناسب</label>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button key={l} onClick={() => set('suitable_for', form.suitable_for.includes(l) ? form.suitable_for.filter((x) => x !== l) : [...form.suitable_for, l])}
                className={`chip ${form.suitable_for.includes(l) ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm">فعال</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm">ویژه</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_hygiene} onChange={(e) => set('is_hygiene', e.target.checked)} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm">بهداشتی</span></label>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary py-3"><Save className="w-4 h-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
      </div>
    </div>
  )
}
