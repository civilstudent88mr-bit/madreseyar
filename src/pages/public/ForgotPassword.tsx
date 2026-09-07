import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Phone, KeyRound, Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react'
import { useToast } from '../../lib/toast'

const DEMO_MOBILE = '09123456789'
const DEMO_CODE = '600060'

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

export default function ForgotPassword() {
  const { toast } = useToast()
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<'mobile' | 'code' | 'done'>('mobile')
  const [sending, setSending] = useState(false)

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault()
    const norm = normalizeMobile(mobile)
    if (!/^09\d{9}$/.test(norm)) { toast('error', 'شماره موبایل معتبر نیست'); return }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setStep('code')
      if (norm === DEMO_MOBILE) {
        toast('success', `کد ارسال شد (دمو: ${DEMO_CODE})`)
      } else {
        toast('success', 'کد ۶ رقمی ارسال شد')
      }
    }, 600)
  }

  const resetPw = (e: React.FormEvent) => {
    e.preventDefault()
    const normCode = normalizeMobile(code)
    const normMobile = normalizeMobile(mobile)
    if (normMobile === DEMO_MOBILE && normCode !== DEMO_CODE) { toast('error', 'کد اشتباه است'); return }
    const err = validatePassword(newPw)
    if (err) { toast('error', err); return }
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
              <p className="text-xs text-gray-400 mt-1">رمز باید حداقل ۸ کاراکتر باشد و شامل حروف و اعداد باشد.</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5"><Lock className="w-4 h-4" /> ثبت رمز جدید</button>
            <button type="button" onClick={() => setStep('mobile')} className="btn-ghost w-full py-2.5 text-sm">تغییر شماره</button>
          </form>
        )}

        {step === 'done' && (
          <div className="card p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-success-600 mx-auto mb-3" />
            <p className="text-gray-700 mb-4">رمز جدید شما ثبت شد. لطفاً وارد شوید.</p>
            <Link to="/login" className="btn-primary">بازگشت به ورود</Link>
          </div>
        )}
      </div>
    </div>
  )
}
