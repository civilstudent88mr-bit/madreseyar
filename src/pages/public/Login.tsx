import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff, Phone, KeyRound, ShieldCheck } from 'lucide-react'
import { useToast } from '../../lib/toast'
import { useAuth } from '../../lib/auth'

const DEMO_MOBILE = '09123456789'
const DEMO_CODE = '600060'

function normalizeMobile(v: string): string {
  return v.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\s/g, '')
}

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { adminLogin } = useAuth()
  const [mobile, setMobile] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault()
    const norm = normalizeMobile(mobile)
    if (!/^09\d{9}$/.test(norm)) { toast('error', 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'); return }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setCodeSent(true)
      if (norm === DEMO_MOBILE) {
        toast('success', `کد ارسال شد (دمو: ${DEMO_CODE})`)
      } else {
        toast('success', 'کد ۶ رقمی ارسال شد')
      }
    }, 600)
  }

  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    const norm = normalizeMobile(mobile)
    const normCode = normalizeMobile(code)
    if (norm === DEMO_MOBILE && normCode === DEMO_CODE) {
      toast('success', 'خوش آمدید')
      navigate('/app')
      return
    }
    toast('error', 'کد یا شماره اشتباه است')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">ورود به حساب</h1>
          <p className="text-gray-500 text-sm mt-1">مدرسه یار - تأمین لوازم مدرسه</p>
        </div>

        {!codeSent ? (
          <form onSubmit={sendCode} className="card p-6 space-y-4">
            <div>
              <label className="label">شماره موبایل</label>
              <div className="relative">
                <input required value={mobile} onChange={(e) => setMobile(e.target.value)} className="input pr-10" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full py-3.5">
              {sending ? 'در حال ارسال کد...' : 'ارسال کد'}
            </button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary-700 hover:text-primary-800">فراموشی رمز؟</Link>
              <Link to="/register" className="text-primary-700 hover:text-primary-800">ثبت‌نام مدرسه</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={verify} className="card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-accent-50 rounded-xl p-3">
              <ShieldCheck className="w-5 h-5 text-accent-600 flex-shrink-0" />
              <span>کد ۶ رقمی به شماره {mobile} ارسال شد</span>
            </div>
            <div>
              <label className="label">کد تأیید</label>
              <div className="relative">
                <input required value={code} onChange={(e) => setCode(e.target.value)} className="input pr-10 text-center text-2xl tracking-widest" placeholder="••••••" dir="ltr" maxLength={6} inputMode="numeric" />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5">تأیید و ورود</button>
            <button type="button" onClick={() => { setCodeSent(false); setCode('') }} className="btn-ghost w-full py-2.5 text-sm">تغییر شماره</button>
          </form>
        )}

        <div className="card p-4 mt-4 bg-accent-50 border-accent-100">
          <p className="text-xs text-accent-800 text-center leading-relaxed">
            ورود دمو: شماره <span className="font-bold" dir="ltr">۰۹۱۲۳۴۵۶۷۸۹</span> و کد <span className="font-bold" dir="ltr">۶۰۰۰۶۰</span>
          </p>
        </div>
      </div>
    </div>
  )
}
