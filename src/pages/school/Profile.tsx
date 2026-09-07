import { useEffect, useState } from 'react'
import { Building2, Save, Inbox, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../lib/toast'
import { useStore } from '../../lib/store'
import type { School } from '../../lib/types'

export default function SchoolProfile() {
  const { school, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const { settings, submitProduct, submissions } = useStore()
  const [form, setForm] = useState<Partial<School>>({})
  const [saving, setSaving] = useState(false)
  const [subForm, setSubForm] = useState({ productName: '', category: 'بهداشتی', qty: 1, note: '' })

  useEffect(() => {
    if (school) setForm(school)
  }, [school])

  const save = async () => {
    if (!school) return
    setSaving(true)
    const { error } = await supabase.from('schools').update({
      name: form.name, address: form.address, postal_code: form.postal_code,
      principal_name: form.principal_name, landline: form.landline, city: form.city, province: form.province,
    }).eq('id', school.id)
    setSaving(false)
    if (error) { toast('error', 'خطا در ذخیره'); return }
    await refreshProfile()
    toast('success', 'اطلاعات ذخیره شد')
  }

  if (!school) return <div className="text-center py-16 text-gray-500">اطلاعات مدرسه موجود نیست</div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary-700" /> پروفایل مدرسه</h1>

      <div className="card p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary-700" /></div>
        <div>
          <p className="font-bold text-gray-800">{school.name}</p>
          <p className="text-sm text-gray-500">{school.type} · {school.province} · {school.city}</p>
        </div>
        <div className="mr-auto">
          {school.status === 'approved' ? <span className="chip bg-success-100 text-success-700">تأیید شده</span> : school.status === 'pending_review' ? <span className="chip bg-accent-100 text-accent-700">در انتظار</span> : <span className="chip bg-error-100 text-error-700">رد شده</span>}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">نام مدرسه</label><input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div><label className="label">کد مدرسه</label><input value={form.school_code ?? ''} readOnly className="input bg-gray-50" /></div>
          <div><label className="label">استان</label><input value={form.province ?? ''} onChange={(e) => setForm({ ...form, province: e.target.value })} className="input" /></div>
          <div><label className="label">شهر</label><input value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></div>
          <div className="md:col-span-2"><label className="label">آدرس</label><textarea value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input min-h-[60px]" /></div>
          <div><label className="label">کد پستی</label><input value={form.postal_code ?? ''} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="input" dir="ltr" /></div>
          <div><label className="label">تلفن ثابت</label><input value={form.landline ?? ''} onChange={(e) => setForm({ ...form, landline: e.target.value })} className="input" dir="ltr" /></div>
          <div><label className="label">نام مدیر</label><input value={form.principal_name ?? ''} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} className="input" /></div>
          <div><label className="label">شرایط پرداخت</label><input value={school.payment_terms === 'cash' ? 'نقدی' : school.payment_terms === '15_days' ? '۱۵ روزه' : '۳۰ روزه'} readOnly className="input bg-gray-50" /></div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary py-3"><Save className="w-4 h-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-3">اطلاعات کاربر</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500 text-xs">نام</p><p className="text-gray-800">{profile?.full_name}</p></div>
          <div><p className="text-gray-500 text-xs">ایمیل</p><p className="text-gray-800" dir="ltr">{profile?.email}</p></div>
          <div><p className="text-gray-500 text-xs">موبایل</p><p className="text-gray-800" dir="ltr">{profile?.mobile}</p></div>
          <div><p className="text-gray-500 text-xs">نقش</p><p className="text-gray-800">{profile?.role === 'school_admin' ? 'مدیر مدرسه' : 'کاربر مدرسه'}</p></div>
        </div>
      </div>

      {settings.allowSchoolSubmissions && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Inbox className="w-5 h-5 text-primary-700" /> ثبت کالای موردنیاز</h3>
          <p className="text-sm text-gray-500">اگر کالایی نیاز دارید که در کاتالوگ نیست، اینجا ثبت کنید تا مدیر بررسی کند.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="label">نام کالا</label><input value={subForm.productName} onChange={(e) => setSubForm({ ...subForm, productName: e.target.value })} className="input" /></div>
            <div><label className="label">دسته پیشنهادی</label>
              <select value={subForm.category} onChange={(e) => setSubForm({ ...subForm, category: e.target.value })} className="input">
                {['بهداشتی', 'کاغذی', 'نوشت‌افزار', 'اداری', 'پلاستیک', 'سایر'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">تعداد تقریبی</label><input type="number" value={subForm.qty} onChange={(e) => setSubForm({ ...subForm, qty: Number(e.target.value) })} className="input" dir="ltr" /></div>
            <div><label className="label">توضیح</label><input value={subForm.note} onChange={(e) => setSubForm({ ...subForm, note: e.target.value })} className="input" /></div>
          </div>
          <button onClick={() => {
            if (!subForm.productName.trim()) { toast('error', 'نام کالا را وارد کنید'); return }
            submitProduct({ productName: subForm.productName, category: subForm.category, qty: subForm.qty, note: subForm.note, submittedBy: profile?.full_name ?? 'نامشخص', schoolName: school?.name ?? 'نامشخص' })
            setSubForm({ productName: '', category: 'بهداشتی', qty: 1, note: '' })
            toast('success', 'درخواست شما ثبت شد')
          }} className="btn-primary py-3"><Send className="w-4 h-4" /> ثبت درخواست</button>

          {submissions.filter((s) => s.submittedBy === (profile?.full_name ?? '') || s.schoolName === school?.name).length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium text-gray-700">درخواست‌های شما:</p>
              {submissions.filter((s) => s.submittedBy === (profile?.full_name ?? '') || s.schoolName === school?.name).map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
                  <span className="text-gray-800">{s.productName}</span>
                  <span className={`chip text-[10px] ${s.status === 'pending' ? 'bg-accent-100 text-accent-700' : s.status === 'approved' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                    {s.status === 'pending' ? 'در انتظار' : s.status === 'approved' ? 'تأیید شده' : 'رد شده'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
