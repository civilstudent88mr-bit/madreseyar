import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useToast } from '../../lib/toast'
import { useAuth, normalizeMobile } from '../../lib/auth'

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'رمز باید حداقل ۸ کاراکتر باشد'
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  if (!hasLetter || !hasDigit) return 'رمز باید حداقل ۸ کاراکتر و ترکیبی از حرف انگلیسی و عدد باشد'
  return null
}

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { registerSchool } = useAuth()
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agree, setAgree] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [form, setForm] = useState({
    schoolName: '', name: '', mobile: '', password: '', passwordRepeat: '',
  })

  const set = (k: string, v: string) => setForm({ ...form, [k]: v })

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!agree) { toast('error', 'باید قوانین را تأیید کنید'); return }
    if (captchaInput.toUpperCase() !== captcha) { toast('error', 'کد امنیتی اشتباه است'); refreshCaptcha(); return }

    const normMobile = normalizeMobile(form.mobile)
    if (!/^09\d{9}$/.test(normMobile)) { toast('error', 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'); return }

    const pwErr = validatePassword(form.password)
    if (pwErr) { toast('error', pwErr); return }

    if (form.password !== form.passwordRepeat) { toast('error', 'رمز عبور و تکرار آن یکسان نیستند'); return }

    setLoading(true)
    const ok = registerSchool({
      schoolName: form.schoolName,
      name: form.name,
      mobile: normMobile,
      password: form.password,
    })
    setLoading(false)

    if (!ok) { toast('error', 'این شماره موبایل قبلاً ثبت شده است'); return }

    toast('success', 'ثبت‌نام انجام شد. منتظر تأیید فروشنده باشید.')
    navigate('/app')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">ثبت‌نام</h1>
          <p className="text-gray-500 text-sm mt-1">برای سفارش محصولات ثبت‌نام کنید</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="label">نام مرکز</label>
            <input required value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} className="input" placeholder="مثلاً داروخانه شهر" />
          </div>
          <div>
            <label className="label">نام مدیر</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="نام و نام خانوادگی شما" />
          </div>
          <div>
            <label className="label">شماره موبایل</label>
            <input required value={form.mobile} onChange={(e) => set('mobile', e.target.value)} className="input" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
          </div>
          <div>
            <label className="label">رمز عبور</label>
            <div className="relative">
              <input required type={show ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} className="input pl-10" placeholder="حداقل ۸ کاراکتر شامل حرف و عدد" dir="ltr" />
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
            رمز عبور باید حداقل ۸ کاراکتر باشد و شامل حروف انگلیسی و اعداد باشد.
          </p>
          <div>
            <label className="label">کد امنیتی</label>
            <div className="flex gap-2 items-center">
              <input required value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="input flex-1" placeholder="کد ۴ رقمی" dir="ltr" maxLength={4} />
              <div className="flex items-center gap-1">
                <div className="px-3 py-2.5 bg-primary-50 rounded-xl font-extrabold text-lg text-primary-700 tracking-widest select-none" style={{ fontFamily: 'monospace' }}>
                  {captcha}
                </div>
                <button type="button" onClick={refreshCaptcha} className="btn-ghost p-2">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
            <span className="text-sm text-gray-700">قوانین و مقررات را می‌پذیرم</span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? 'در حال ثبت...' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          حساب دارید؟ <Link to="/login" className="text-primary-700 font-medium">ورود</Link>
        </p>
      </div>
    </div>
  )
}
