import { useEffect, useState } from 'react'
import { Megaphone, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useToast } from '../../lib/toast'
import type { Announcement } from '../../lib/types'
import { formatJalaliDateShort } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminAnnouncements() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })

  const request = async (body?: Record<string, unknown>) => {
    const response = await fetch('/api/admin-manage-announcements', {
      method: body ? 'POST' : 'GET', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || 'درخواست اطلاعیه انجام نشد.')
    return result
  }

  const load = async () => {
    setLoading(true)
    try {
      const result = await request()
      setAnnouncements(result.announcements || [])
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'دریافت اطلاعیه‌ها انجام نشد.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await request({ action: 'create', title: form.title, body: form.body })
      toast('success', 'اطلاعیه ایجاد شد.')
      setForm({ title: '', body: '' })
      await load()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'ایجاد اطلاعیه انجام نشد.')
    } finally { setSaving(false) }
  }

  const toggle = async (announcement: Announcement) => {
    try {
      await request({ action: 'toggle', id: announcement.id, is_active: !announcement.is_active })
      await load()
    } catch (error) { toast('error', error instanceof Error ? error.message : 'تغییر وضعیت انجام نشد.') }
  }

  const remove = async (announcement: Announcement) => {
    if (!confirm('این اطلاعیه برای همیشه حذف شود؟')) return
    try {
      await request({ action: 'delete', id: announcement.id })
      toast('success', 'اطلاعیه حذف شد.')
      await load()
    } catch (error) { toast('error', error instanceof Error ? error.message : 'حذف اطلاعیه انجام نشد.') }
  }

  return <div className="space-y-4" dir="rtl">
    <div className="flex items-center justify-between"><h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2"><Megaphone className="w-5 h-5" />اطلاعیه‌ها</h1><button onClick={() => void load()} className="btn-ghost"><RefreshCw className="w-4 h-4" />به‌روزرسانی</button></div>
    <section className="card p-4 space-y-3"><h2 className="font-bold text-gray-800">اطلاعیه جدید</h2><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="عنوان اطلاعیه" className="input" /><textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="متن اطلاعیه" className="input min-h-24" /><button onClick={() => void create()} disabled={saving || !form.title.trim()} className="btn-primary py-2.5"><Plus className="w-4 h-4" />{saving ? 'در حال ذخیره…' : 'ایجاد اطلاعیه'}</button></section>
    {loading ? <div className="card p-8 text-center text-gray-500">در حال بارگذاری…</div> : announcements.length === 0 ? <EmptyState icon={<Megaphone className="w-8 h-8" />} title="اطلاعیه‌ای وجود ندارد" /> : <div className="space-y-2">{announcements.map((announcement) => <article key={announcement.id} className="card p-4 flex items-start justify-between gap-3"><div className="flex-1"><h3 className="font-bold text-gray-900">{announcement.title}</h3><p className="text-sm text-gray-600 mt-1">{announcement.body}</p><p className="text-xs text-gray-400 mt-1">{formatJalaliDateShort(announcement.created_at)}</p></div><div className="flex items-center gap-2"><button onClick={() => void toggle(announcement)} className={`chip text-xs ${announcement.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{announcement.is_active ? 'فعال' : 'غیرفعال'}</button><button onClick={() => void remove(announcement)} className="btn-ghost p-1.5 text-error-600" aria-label="حذف اطلاعیه"><Trash2 className="w-4 h-4" /></button></div></article>)}</div>}
  </div>
}
