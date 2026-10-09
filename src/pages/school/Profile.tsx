import { useEffect, useState } from 'react'
import { MapPin, Save, UserRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth, normalizeMobile } from '../../lib/auth'
import { useToast } from '../../lib/toast'

export default function CustomerProfile() {
  const { user, school, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', province: '', city: '', address: '', postalCode: '' })

  useEffect(() => {
    setForm({
      name: profile?.full_name || '', mobile: profile?.mobile || '', province: school?.province || '',
      city: school?.city || '', address: school?.address || '', postalCode: school?.postal_code || '',
    })
  }, [profile, school])

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    if (!user || !school || !form.name.trim() || !/^09\d{9}$/.test(normalizeMobile(form.mobile)) || form.address.trim().length < 5) {
      toast('error', 'نام، شماره موبایل و نشانی کامل را بررسی کنید')
      return
    }
    setSaving(true)
    const [profileResult, schoolResult] = await Promise.all([
      supabase.from('profiles').update({ full_name: form.name.trim(), mobile: normalizeMobile(form.mobile) }).eq('id', user.id),
      supabase.from('schools').update({ principal_name: form.name.trim(), name: form.name.trim(), province: form.province.trim(), city: form.city.trim(), address: form.address.trim(), postal_code: form.postalCode.trim() }).eq('id', school.id),
    ])
    setSaving(false)
    if (profileResult.error || schoolResult.error) {
      toast('error', 'ذخیره اطلاعات انجام نشد؛ دوباره وارد حساب شوید و تلاش کنید')
      return
    }
    await refreshProfile()
    toast('success', 'اطلاعات تماس و نشانی ذخیره شد')
  }

  return <div className="max-w-3xl mx-auto space-y-5" dir="rtl">
    <div><h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><UserRound className="w-6 h-6 text-primary-700" />حساب کاربری</h1><p className="text-sm text-gray-500 mt-1">اطلاعات تماس و نشانی تحویل سفارش‌ها را مدیریت کنید.</p></div>
    <section className="card p-5 md:p-7 space-y-5">
      <h2 className="font-bold text-gray-800 flex items-center gap-2"><UserRound className="w-5 h-5" />اطلاعات تماس</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="label">نام و نام خانوادگی</label><input className="input" value={form.name} onChange={(event) => update('name', event.target.value)} /></div>
        <div><label className="label">شماره موبایل</label><input className="input" dir="ltr" inputMode="tel" value={form.mobile} onChange={(event) => update('mobile', event.target.value)} /></div>
      </div>
      <h2 className="font-bold text-gray-800 flex items-center gap-2 pt-3"><MapPin className="w-5 h-5" />نشانی ارسال</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="label">استان</label><input className="input" value={form.province} onChange={(event) => update('province', event.target.value)} /></div>
        <div><label className="label">شهر</label><input className="input" value={form.city} onChange={(event) => update('city', event.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">نشانی کامل</label><textarea className="input min-h-24" value={form.address} onChange={(event) => update('address', event.target.value)} /></div>
        <div><label className="label">کد پستی</label><input className="input" dir="ltr" maxLength={20} value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} /></div>
      </div>
      <button onClick={() => void save()} disabled={saving} className="btn-primary py-3"><Save className="w-4 h-4" />{saving ? 'در حال ذخیره…' : 'ذخیره اطلاعات'}</button>
    </section>
  </div>
}
