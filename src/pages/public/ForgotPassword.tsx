import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Phone, KeyRound, Eye, EyeOff, ShieldCheck, Lock, RefreshCw } from 'lucide-react'
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

export default function ForgotPassword() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { requestOtp, verifyOtp, resetPassword } = useAuth()
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<'mobile' | 'code' | 'done'>('mobile')
  const [sending, setSending] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
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

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaInput.toUpperCase() !== captcha) { toast('error', 'کد امنیتی اشتباه است'); refreshCaptcha(); return }
    const norm = normalizeMobile(mobile)
    if (!/^09\d{9}$/.test(norm)) { toast('error', 'شماره موبایل معتبر نیست'); return }
    setSending(true)
    setTimeout(() => {
      const otp = requestOtp(norm)
      setSending(false)
      if (!otp) { toast('error', 'این شماره ثبت نشده است'); return }
      setGeneratedOtp(otp)
      setStep('code')
      setResendTimer(120)
      toast('success', `کد بازیابی شما: ${otp}`)
    }, 500)
  }

  const resetPw = (e: React.FormEvent) => {
    e.preventDefault()
    const normCode = normalizeMobile(code)
    const normMobile = normalizeMobile(mobile)
    const ok = verifyOtp(normMobile, normCode)
    if (!ok) { toast('error', 'کد اشتباه یا منقضی است'); return }
    const err = validatePassword(newPw)
    if (err) { toast('error', err); return }
    const pwOk = resetPassword(normMobile, newPw)
    if (!pwOk) { toast('error', 'خطا در ذخیره رمز'); return }
    setStep('done')
    toast('success', 'رمز جدید ثبت شد')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">بازیابی رمز عبور</h1>
        </div>

        {step === 'mobile' && (
          <form onSubmit={sendCode} className="card p-6 space-y-4">
            <p className="text-sm text-gray-500">شماره موبایل خود را وارد کنید تا کد تأیید ارسال شود.</p>
            <div>
              <label className="label">شماره موبایل</label>
              <div className="relative">
                <input required value={mobile} onChange={(e) => setMobile(e.target.value)} className="input pr-10" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
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
              {sending ? 'در حال ارسال...' : 'ارسال کد تأیید'}
            </button>
            <Link to="/login" className="block text-center text-sm text-primary-700">بازگشت به ورود</Link>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={resetPw} className="card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-accent-50 rounded-xl p-3">
              <ShieldCheck className="w-5 h-5 text-accent-600 flex-shrink-0" />
              <span>کد ۶ رقمی به شماره {mobile} ارسال شد</span>
            </div>
            {generatedOtp && (
              <div className="bg-accent-100 border border-accent-200 rounded-xl px-4 py-2.5 text-center text-accent-800 text-sm font-bold">
                کد بازیابی شما: <span dir="ltr" className="text-lg">{generatedOtp}</span>
              </div>
            )}
            <div>
              <label className="label">کد تأیید</label>
              <div className="relative">
                <input required value={code} onChange={(e) => setCode(e.target.value)} className="input pr-10 text-center text-xl tracking-widest" placeholder="••••••" dir="ltr" maxLength={6} inputMode="numeric" />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="label">رمز جدید</label>
              <div className="relative">
                <input required type={show ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input pl-10" placeholder="حداقل ۸ کاراکتر شامل حروف و اعداد" dir="ltr" />
                <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">رمز باید حداقل ۸ کاراکتر باشد و شامل حروف انگلیسی و اعداد باشد.</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5"><Lock className="w-4 h-4" /> ثبت رمز جدید</button>
            <div className="flex gap-2">
              <button type="button" disabled={resendTimer > 0} onClick={sendCode} className="btn-ghost flex-1 py-2.5 text-sm disabled:opacity-40">
                {resendTimer > 0 ? `ارسال مجدد (${resendTimer}s)` : 'ارسال مجدد'}
              </button>
              <button type="button" onClick={() => setStep('mobile')} className="btn-ghost flex-1 py-2.5 text-sm">تغییر شماره</button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="card p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-success-600 mx-auto mb-3" />
            <p className="text-gray-700 mb-4">رمز جدید شما ثبت شد. لطفاً وارد شوید.</p>
            <button onClick={() => navigate('/login')} className="btn-primary">بازگشت به ورود</button>
          </div>
        )}
      </div>
    </div>
  )
}
