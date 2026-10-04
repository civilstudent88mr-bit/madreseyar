import { useState } from 'react'
import { Plus, Tags, Trash2, Edit, X, Save, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import { useStore, type StoreCategory } from '../../lib/store'
import { useToast } from '../../lib/toast'

export default function AdminCategories() {
  const { categories, products, upsertCategory, deleteCategory } = useStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState<StoreCategory | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')

  const sorted = [...categories].sort((a, b) => a.order - b.order)

  const reset = () => { setEditing(null); setName(''); setSlug(''); setIcon('') }

  const save = () => {
    if (!name.trim()) { toast('error', 'نام دسته را وارد کنید'); return }
    const cat: StoreCategory = {
      id: editing?.id || `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || name.trim().replace(/\s+/g, '-'),
      icon: icon.trim(),
      order: editing?.order ?? categories.length,
      active: editing?.active ?? true,
    }
    upsertCategory(cat)
    toast('success', editing ? 'دسته ویرایش شد' : 'دسته اضافه شد')
    reset()
  }

  const startEdit = (c: StoreCategory) => {
    setEditing(c); setName(c.name); setSlug(c.slug); setIcon(c.icon)
  }

  const toggleActive = (c: StoreCategory) => {
    upsertCategory({ ...c, active: !c.active })
    toast('success', c.active ? 'دسته غیرفعال شد' : 'دسته فعال شد')
  }

  const move = (c: StoreCategory, dir: -1 | 1) => {
    const idx = sorted.findIndex((x) => x.id === c.id)
    const swapWith = sorted[idx + dir]
    if (!swapWith) return
    upsertCategory({ ...c, order: swapWith.order })
    upsertCategory({ ...swapWith, order: c.order })
  }

  const del = (c: StoreCategory) => {
    const count = products.filter((p) => p.category === c.name).length
    if (count > 0) {
      toast('error', `ابتدا کالاهای این دسته را جابه‌جا یا حذف کنید (${count} کالا)`)
      return
    }
    if (!confirm(`حذف "${c.name}"؟`)) return
    const ok = deleteCategory(c.id)
    if (ok) toast('success', 'دسته حذف شد')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">دسته‌بندی‌ها</h1>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{editing ? 'ویرایش دسته' : 'افزودن دسته'}</h3>
          {editing && <button onClick={reset} className="btn-ghost p-1"><X className="w-4 h-4" /></button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="label">نام دسته (فارسی)</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً نوشت‌افزار" className="input" /></div>
          <div><label className="label">نام انگلیسی (slug)</label><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="stationery" className="input" dir="ltr" /></div>
          <div><label className="label">آیکن (اموجی)</label><input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="✏️" className="input" dir="ltr" /></div>
        </div>
        <button onClick={save} className="btn-primary py-2.5 px-4 text-sm"><Save className="w-4 h-4" /> {editing ? 'ذخیره تغییرات' : 'افزودن دسته'}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((c, i) => {
          const count = products.filter((p) => p.category === c.name).length
          return (
            <div key={c.id} className={`card p-4 ${!c.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-xl">{c.icon || <Tags className="w-5 h-5 text-primary-700" />}</div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400" dir="ltr">{c.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => move(c, -1)} disabled={i === 0} className="btn-ghost p-1 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(c, 1)} disabled={i === sorted.length - 1} className="btn-ghost p-1 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{count} کالا</span>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(c)} className="btn-ghost p-1.5" title={c.active ? 'فعال' : 'غیرفعال'}>
                    {c.active ? <Eye className="w-4 h-4 text-success-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => startEdit(c)} className="btn-ghost p-1.5"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => del(c)} className="btn-ghost p-1.5 text-error-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
