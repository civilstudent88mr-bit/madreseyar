import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError('')
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSending(false)
    if (requestError) {
      setError('ارسال ایمیل انجام نشد. کمی بعد دوباره تلاش کنید یا تنظیمات ایمیل Supabase را بررسی کنید.')
      return
    }
    setSent(true)
  }

  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8" dir="rtl">
    <section className="card w-full max-w-md p-7 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto"><KeyRound className="w-7 h-7" /></div>
      <h1 className="text-xl font-extrabold text-gray-900">بازیابی گذرواژه</h1>
      {sent ? <p className="text-sm leading-7 text-gray-600">اگر این ایمیل در حساب کاربری ثبت شده باشد، لینک بازیابی ارسال می‌شود. ایمیل را باز کنید و روی لینک بزنید تا به صفحه تعیین رمز جدید هدایت شوید.</p> : <>
        <p className="text-sm leading-7 text-gray-600">ایمیل حساب ادمین را وارد کنید تا لینک امن تعیین رمز جدید برایتان ارسال شود.</p>
        <form onSubmit={submit} className="space-y-4 text-right">
          <div>
            <label className="label" htmlFor="recovery-email">ایمیل حساب</label>
            <input id="recovery-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" dir="ltr" />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={sending} type="submit" className="btn-primary py-3 w-full disabled:opacity-60">{sending ? 'در حال ارسال…' : 'ارسال لینک بازیابی'}</button>
        </form>
      </>}
      <div className="flex flex-wrap justify-center gap-3"><Link to="/contact" className="btn-ghost py-3"><MessageCircle className="w-4 h-4" />تماس با پشتیبانی</Link><Link to="/login" className="btn-ghost py-3">بازگشت به ورود</Link></div>
    </section>
  </div>
}
