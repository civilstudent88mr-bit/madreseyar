import { useEffect, useState } from 'react'
import { Plus, Tags, Trash2, Edit } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Category } from '../../lib/types'

export default function AdminCategories() {
  const { toast } = useToast()
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCats(data as Category[] ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!name.trim()) return
    if (editing) {
      await supabase.from('categories').update({ name, slug: slug || name, icon }).eq('id', editing.id)
      toast('success', 'ذخیره شد')
    } else {
      await supabase.from('categories').insert({ name, slug: slug || name.replace(/\s+/g, '-'), icon, sort_order: cats.length })
      toast('success', 'دسته اضافه شد')
    }
    setEditing(null); setName(''); setSlug(''); setIcon('')
    load()
  }

  const del = async (c: Category) => {
    if (!confirm(`حذف "${c.name}"؟`)) return
    await supabase.from('categories').delete().eq('id', c.id)
    toast('success', 'حذف شد')
    load()
  }

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">دسته‌بندی‌ها</h1>

      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-gray-800">{editing ? 'ویرایش' : 'افزودن'} دسته</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام دسته" className="input" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="نام انگلیسی (slug)" className="input" dir="ltr" />
          <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="آیکن (اختیاری)" className="input" dir="ltr" />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary py-2.5 text-sm"><Plus className="w-4 h-4" /> {editing ? 'ذخیره' : 'افزودن'}</button>
          {editing && <button onClick={() => { setEditing(null); setName(''); setSlug('') }} className="btn-ghost py-2.5 text-sm">انصراف</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cats.map((c) => (
          <div key={c.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center"><Tags className="w-5 h-5 text-primary-700" /></div>
              <div><p className="font-bold text-sm text-gray-800">{c.name}</p><p className="text-xs text-gray-400" dir="ltr">{c.slug}</p></div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(c); setName(c.name); setSlug(c.slug); setIcon(c.icon ?? '') }} className="btn-ghost p-1.5"><Edit className="w-4 h-4" /></button>
              <button onClick={() => del(c)} className="btn-ghost p-1.5 text-error-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
