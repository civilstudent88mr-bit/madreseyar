import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
  const location = useLocation()
  const returnTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/app'
  const { toast } = useToast()
  const { loginWithPassword } = useAuth()

  // Password login fields
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Captcha
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }, [])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaInput.toUpperCase() !== captcha) {
      toast('error', 'کد امنیتی اشتباه است')
      refreshCaptcha()
      return
    }
    const norm = mobile.includes('@') ? mobile.trim().toLowerCase() : normalizeMobile(mobile)
    if (norm.includes('@') ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm) : !/^09\d{9}$/.test(norm)) {
      toast('error', 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')
      return
    }
    const ok = await loginWithPassword(norm, password)
    if (!ok) {
      toast('error', 'موبایل یا رمز عبور اشتباه است')
      refreshCaptcha()
      return
    }
    toast('success', 'خوش آمدید')
    navigate(norm.includes('@') || norm === '09120000000' ? '/admin' : returnTo, { replace: true })
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

        <form onSubmit={handlePasswordLogin} className="card p-6 space-y-4">
            <p className="text-xs text-gray-500">برای ورود ادمین می‌توانید ایمیل حساب را به‌جای شماره موبایل وارد کنید.</p>
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
              <Link to="/register" state={{ from: (location.state as { from?: unknown } | null)?.from }} className="text-primary-700 hover:text-primary-800">ثبت‌نام</Link>
            </div>
        </form>

      </div>
    </div>
  )
}
