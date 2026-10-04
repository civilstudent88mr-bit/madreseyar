import { useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff, Phone, KeyRound, ShieldCheck, Lock, RefreshCw } from 'lucide-react'
import { useToast } from '../../lib/toast'
import { useAuth, normalizeMobile } from '../../lib/auth'

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { loginWithPassword, requestOtp, verifyOtp } = useAuth()
  const [tab, setTab] = useState<'password' | 'otp'>('password')

  // Password login fields
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // OTP fields
  const [otpMobile, setOtpMobile] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [generatedOtp, setGeneratedOtp] = useState('')

  // Captcha
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaInput.toUpperCase() !== captcha) {
      toast('error', 'کد امنیتی اشتباه است')
      refreshCaptcha()
      return
    }
    const norm = normalizeMobile(mobile)
    if (!/^09\d{7,9}$/.test(norm)) {
      toast('error', 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')
      return
    }
    const ok = loginWithPassword(norm, password)
    if (!ok) {
      toast('error', 'موبایل یا رمز عبور اشتباه است')
      refreshCaptcha()
      return
    }
    toast('success', 'خوش آمدید')
    const data = JSON.parse(localStorage.getItem('healthcare-v1') || '{}')
    const role = data.session?.role
    navigate(role === 'admin' ? '/admin' : '/app')
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaInput.toUpperCase() !== captcha) {
      toast('error', 'کد امنیتی اشتباه است')
      refreshCaptcha()
      return
    }
    const norm = normalizeMobile(otpMobile)
    if (!/^09\d{7,9}$/.test(norm)) {
      toast('error', 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')
      return
    }
    setSending(true)
    setTimeout(() => {
      const code = requestOtp(norm)
      setSending(false)
      if (!code) {
        toast('error', 'این شماره ثبت نشده است')
        return
      }
      setGeneratedOtp(code)
      setOtpSent(true)
      setResendTimer(120)
      toast('success', `کد ورود شما: ${code}`)
    }, 500)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    const norm = normalizeMobile(otpMobile)
    const normCode = normalizeMobile(otpCode)
    const ok = verifyOtp(norm, normCode)
    if (!ok) {
      toast('error', 'کد اشتباه یا منقضی است')
      return
    }
    toast('success', 'خوش آمدید')
    const data = JSON.parse(localStorage.getItem('healthcare-v1') || '{}')
    const role = data.session?.role
    navigate(role === 'admin' ? '/admin' : '/app')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">ورود به حساب</h1>
          <p className="text-gray-500 text-sm mt-1">Healthcare - مراقبت از پوست و آرایشی</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setTab('password'); refreshCaptcha() }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'password' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            ورود با رمز عبور
          </button>
          <button
            onClick={() => { setTab('otp'); refreshCaptcha(); setOtpSent(false) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'otp' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            ورود با کد یک‌بارمصرف
          </button>
        </div>

        {/* Password tab */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="card p-6 space-y-4">
            <div>
              <label className="label">شماره موبایل</label>
              <div className="relative">
                <input required value={mobile} onChange={(e) => setMobile(e.target.value)} className="input pr-10" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="label">رمز عبور</label>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="رمز عبور" dir="ltr" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
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
            <button type="submit" className="btn-primary w-full py-3.5">
              <Lock className="w-4 h-4" /> ورود
            </button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary-700 hover:text-primary-800">فراموشی رمز؟</Link>
              <Link to="/register" className="text-primary-700 hover:text-primary-800">ثبت‌نام</Link>
            </div>
          </form>
        )}

        {/* OTP tab */}
        {tab === 'otp' && !otpSent && (
          <form onSubmit={handleSendOtp} className="card p-6 space-y-4">
            <div>
              <label className="label">شماره موبایل</label>
              <div className="relative">
                <input required value={otpMobile} onChange={(e) => setOtpMobile(e.target.value)} className="input pr-10" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
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
            <button type="submit" disabled={sending} className="btn-primary w-full py-3.5">
              {sending ? 'در حال ارسال...' : 'ارسال کد'}
            </button>
            <Link to="/register" className="block text-center text-sm text-primary-700">ثبت‌نام</Link>
          </form>
        )}

        {tab === 'otp' && otpSent && (
          <form onSubmit={handleVerifyOtp} className="card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-accent-50 rounded-xl p-3">
              <ShieldCheck className="w-5 h-5 text-accent-600 flex-shrink-0" />
              <span>کد ۶ رقمی به شماره {otpMobile} ارسال شد</span>
            </div>
            {generatedOtp && (
              <div className="bg-accent-100 border border-accent-200 rounded-xl px-4 py-2.5 text-center text-accent-800 text-sm font-bold">
                کد ورود شما: <span dir="ltr" className="text-lg">{generatedOtp}</span>
              </div>
            )}
            <div>
              <label className="label">کد تأیید</label>
              <div className="relative">
                <input required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="input pr-10 text-center text-2xl tracking-widest" placeholder="••••••" dir="ltr" maxLength={6} inputMode="numeric" />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5">تأیید و ورود</button>
            <div className="flex gap-2">
              <button type="button" disabled={resendTimer > 0} onClick={handleSendOtp} className="btn-ghost flex-1 py-2.5 text-sm disabled:opacity-40">
                {resendTimer > 0 ? `ارسال مجدد (${resendTimer}s)` : 'ارسال مجدد'}
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtpCode('') }} className="btn-ghost flex-1 py-2.5 text-sm">تغییر شماره</button>
            </div>
          </form>
        )}

        <div className="card p-4 mt-4 bg-accent-50 border-accent-100">
          <p className="text-xs text-accent-800 text-center leading-relaxed">
            ورود دمو — ادمین: <span className="font-bold" dir="ltr">۰۹۱۲۰۰۰۰۰</span> / <span className="font-bold" dir="ltr">Admin1234</span>
            <br />
            حساب: <span className="font-bold" dir="ltr">۰۹۱۲۱۱۱۱۱۱۱</span> / <span className="font-bold" dir="ltr">School123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
