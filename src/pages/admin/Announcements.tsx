import { useEffect, useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Announcement } from '../../lib/types'
import { formatJalaliDateShort } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminAnnouncements() {
  const { toast } = useToast()
  const [anns, setAnns] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', body: '' })

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnns(data as Announcement[] ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.title.trim()) return
    await supabase.from('announcements').insert({ title: form.title, body: form.body, is_active: true })
    toast('success', 'اطلاعیه ایجاد شد')
    setForm({ title: '', body: '' })
    load()
  }

  const toggle = async (a: Announcement) => {
    await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id)
    load()
  }

  const del = async (a: Announcement) => {
    if (!confirm('حذف اطلاعیه؟')) return
    await supabase.from('announcements').delete().eq('id', a.id)
    toast('success', 'حذف شد')
    load()
  }

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">اطلاعیه‌ها</h1>

      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-gray-800">اطلاعیه جدید</h3>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="input" />
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="متن اطلاعیه" className="input min-h-[80px]" />
        <button onClick={create} className="btn-primary py-2.5 text-sm"><Plus className="w-4 h-4" /> ایجاد</button>
      </div>

      {anns.length === 0 ? (
        <EmptyState icon={<Megaphone className="w-8 h-8" />} title="اطلاعیه‌ای وجود ندارد" />
      ) : (
        <div className="space-y-2">
          {anns.map((a) => (
            <div key={a.id} className="card p-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.body}</p>
                <p className="text-xs text-gray-400 mt-1">{formatJalaliDateShort(a.created_at)}</p>
              </div>
              <div className="flex gap-1 mr-2">
                <button onClick={() => toggle(a)} className={`chip text-[10px] ${a.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{a.is_active ? 'فعال' : 'غیرفعال'}</button>
                <button onClick={() => del(a)} className="btn-ghost p-1.5 text-error-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
