import { useEffect, useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { useToast } from '../../lib/toast'
import type { Announcement } from '../../lib/types'
import { formatJalaliDateShort } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminAnnouncements() {
  const { toast } = useToast()
  const [anns, setAnns] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [secret, setSecret] = useState(() => typeof window === 'undefined' ? '' : sessionStorage.getItem('healthcare-admin-secret') || '')
  const [form, setForm] = useState({ title: '', body: '' })

  const request = async (body?: Record<string, unknown>) => {
    const response = await fetch('/api/admin-manage-announcements', {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(response.status === 401 ? 'کلید مدیریت اشتباه است.' : response.status === 503 ? 'تنظیمات مدیریت در Vercel کامل نیست.' : result.error || 'ذخیره تغییرات انجام نشد.')
    return result
  }

  const load = async () => {
    setLoading(true)
    try {
      const result = await request()
      setAnns(result.announcements || [])
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'دریافت اطلاعیه‌ها انجام نشد.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (secret) void load(); else setLoading(false) }, [])

  const saveSecret = () => {
    sessionStorage.setItem('healthcare-admin-secret', secret)
    void load()
  }

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

  const del = async (announcement: Announcement) => {
    if (!confirm('این اطلاعیه برای همیشه حذف شود؟')) return
    try {
      await request({ action: 'delete', id: announcement.id })
      toast('success', 'اطلاعیه حذف شد.')
      await load()
    } catch (error) { toast('error', error instanceof Error ? error.message : 'حذف اطلاعیه انجام نشد.') }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">اطلاعیه‌ها</h1>
      <div className="card p-4 space-y-3">
        <label className="font-bold text-gray-700">کلید مدیریت</label>
        <div className="flex flex-wrap gap-2">
          <input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" placeholder="AI_ADMIN_SECRET تنظیم‌شده در Vercel" className="input flex-1 min-w-[240px]" autoComplete="off" />
          <button onClick={saveSecret} className="btn-primary" disabled={!secret}>اتصال و بارگذاری اطلاعیه‌ها</button>
        </div>
      </div>

      {secret && <>
        <div className="card p-4 space-y-3">
          <h3 className="font-bold text-gray-800">اطلاعیه جدید</h3>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="عنوان" className="input" />
          <textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="متن اطلاعیه" className="input min-h-[80px]" />
          <button onClick={create} disabled={saving} className="btn-primary py-2.5 text-sm"><Plus className="w-4 h-4" />{saving ? 'در حال ذخیره…' : 'ایجاد'}</button>
        </div>

        {loading ? <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div> : anns.length === 0 ? (
          <EmptyState icon={<Megaphone className="w-8 h-8" />} title="اطلاعیه‌ای وجود ندارد" />
        ) : <div className="space-y-2">{anns.map((announcement) => (
          <div key={announcement.id} className="card p-4 flex items-start justify-between gap-3">
            <div className="flex-1"><h3 className="font-bold text-sm text-gray-800">{announcement.title}</h3><p className="text-sm text-gray-600 mt-1">{announcement.body}</p><p className="text-xs text-gray-400 mt-1">{formatJalaliDateShort(announcement.created_at)}</p></div>
            <div className="flex gap-1 mr-2">
              <button onClick={() => void toggle(announcement)} className={`chip text-[10px] ${announcement.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{announcement.is_active ? 'فعال' : 'غیرفعال'}</button>
              <button onClick={() => void del(announcement)} className="btn-ghost p-1.5 text-error-600" aria-label="حذف اطلاعیه"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}</div>}
      </>}
    </div>
  )
}
