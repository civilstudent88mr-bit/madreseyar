import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'

const schoolTypes = ['دولتی', 'غیردولتی', 'هیئت امنایی', 'هنرستان', 'متوسطه اول', 'متوسطه دوم', 'ابتدایی']
const buyerRoles = ['مدیر', 'معاون', 'معلم بهداشت', 'مسئول خرید']

function normalizeMobile(v: string): string {
  return v.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\s/g, '')
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'رمز باید حداقل ۸ کاراکتر باشد'
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(pw)
  const hasDigit = /\d/.test(pw)
  if (!hasLetter || !hasDigit) return 'رمز باید شامل حروف و اعداد باشد'
  return null
}

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', passwordRepeat: '', fullName: '', mobile: '',
    schoolName: '', schoolType: 'دولتی', province: '', city: '', address: '',
    postalCode: '', schoolCode: '', principalName: '', landline: '', buyerRole: 'مدیر',
  })

  const set = (k: string, v: string) => setForm({ ...form, [k]: v })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normMobile = normalizeMobile(form.mobile)
    if (!/^09\d{9}$/.test(normMobile)) { toast('error', 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'); return }

    const pwErr = validatePassword(form.password)
    if (pwErr) { toast('error', pwErr); return }

    if (form.password !== form.passwordRepeat) { toast('error', 'رمز عبور و تکرار آن یکسان نیستند'); return }

    setLoading(true)
    const { data: schoolData } = await supabase.from('schools').insert({
      name: form.schoolName, type: form.schoolType, province: form.province, city: form.city,
      address: form.address, postal_code: form.postalCode, school_code: form.schoolCode,
      principal_name: form.principalName, landline: form.landline, status: 'pending_review',
    }).select().single()

    const { data: authData, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, mobile: normMobile } },
    })

    if (error) { setLoading(false); toast('error', error.message); return }
    if (authData.user && schoolData) {
      await supabase.from('profiles').insert({
        id: authData.user.id, full_name: form.fullName, mobile: normMobile,
        email: form.email, role: 'school_admin', school_id: schoolData.id, is_active: true,
      })
    }
    setLoading(false)
    toast('success', 'ثبت‌نام انجام شد. منتظر تأیید فروشنده باشید.')
    navigate('/login')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">ثبت‌نام مدرسه</h1>
          <p className="text-gray-500 text-sm mt-1">برای سفارش لوازم مدرسه ثبت‌نام کنید</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          {step === 1 && (
            <>
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary-700" /> اطلاعات مدرسه</h2>
              <div>
                <label className="label">نام مدرسه</label>
                <input required value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} className="input" placeholder="مثلاً دبیرستان شهید بهشتی" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نوع مدرسه</label>
                  <select value={form.schoolType} onChange={(e) => set('schoolType', e.target.value)} className="input">
                    {schoolTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">کد مدرسه</label>
                  <input value={form.schoolCode} onChange={(e) => set('schoolCode', e.target.value)} className="input" placeholder="کد ۵ رقمی" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">استان</label>
                  <input required value={form.province} onChange={(e) => set('province', e.target.value)} className="input" placeholder="تهران" />
                </div>
                <div>
                  <label className="label">شهر</label>
                  <input required value={form.city} onChange={(e) => set('city', e.target.value)} className="input" placeholder="تهران" />
                </div>
              </div>
              <div>
                <label className="label">آدرس</label>
                <textarea required value={form.address} onChange={(e) => set('address', e.target.value)} className="input min-h-[60px]" placeholder="آدرس کامل مدرسه" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">کد پستی</label>
                  <input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} className="input" placeholder="کد پستی ۱۰ رقمی" dir="ltr" />
                </div>
                <div>
                  <label className="label">تلفن ثابت</label>
                  <input value={form.landline} onChange={(e) => set('landline', e.target.value)} className="input" placeholder="۰۲۱-۱۲۳۴۵۶۷۸" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="label">نام مدیر مدرسه</label>
                <input required value={form.principalName} onChange={(e) => set('principalName', e.target.value)} className="input" placeholder="نام و نام خانوادگی مدیر" />
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3.5">مرحله بعد</button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Package className="w-5 h-5 text-primary-700" /> اطلاعات حساب</h2>
              <div>
                <label className="label">نام و نام خانوادگی خریدار</label>
                <input required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input" placeholder="نام شما" />
              </div>
              <div>
                <label className="label">سمت خریدار</label>
                <select value={form.buyerRole} onChange={(e) => set('buyerRole', e.target.value)} className="input">
                  {buyerRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">شماره موبایل</label>
                <input required value={form.mobile} onChange={(e) => set('mobile', e.target.value)} className="input" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
              </div>
              <div>
                <label className="label">ایمیل</label>
                <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input" placeholder="email@example.com" dir="ltr" />
              </div>
              <div>
                <label className="label">رمز عبور</label>
                <div className="relative">
                  <input required type={show ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} className="input pl-10" placeholder="حداقل ۸ کاراکتر" dir="ltr" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">تکرار رمز عبور</label>
                <div className="relative">
                  <input required type={show2 ? 'text' : 'password'} value={form.passwordRepeat} onChange={(e) => set('passwordRepeat', e.target.value)} className="input pl-10" placeholder="تکرار رمز عبور" dir="ltr" />
                  <button type="button" onClick={() => setShow2(!show2)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 leading-relaxed">
                رمز عبور باید حداقل ۸ کاراکتر باشد و شامل حروف و اعداد باشد.
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-3.5">بازگشت</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5">
                  {loading ? 'در حال ثبت...' : 'ثبت‌نام'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          حساب دارید؟ <Link to="/login" className="text-primary-700 font-medium">ورود</Link>
        </p>
      </div>
    </div>
  )
}
