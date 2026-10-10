import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setAuthorized(true)
      if (event === 'SIGNED_OUT') setAuthorized(false)
      setChecking(false)
    })
    void supabase.auth.getSession().then(({ data }) => {
      const hash = new URLSearchParams(window.location.hash.slice(1))
      if (data.session && (hash.get('type') === 'recovery' || sessionStorage.getItem('healthcare-password-recovery') === '1')) setAuthorized(true)
      setChecking(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ نویسه باشد.')
      return
    }
    if (password !== confirmPassword) {
      setError('تکرار رمز عبور با رمز جدید یکسان نیست.')
      return
    }
    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (updateError) {
      setError('تغییر رمز انجام نشد. لینک ممکن است منقضی یا قبلاً استفاده شده باشد؛ دوباره درخواست بازیابی بدهید.')
      return
    }
    setSuccess(true)
    sessionStorage.removeItem('healthcare-password-recovery')
    await supabase.auth.signOut()
  }

  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8" dir="rtl">
    <section className="card w-full max-w-md p-7 space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto"><KeyRound className="w-7 h-7" /></div>
      <h1 className="text-xl font-extrabold text-gray-900 text-center">تعیین رمز عبور جدید</h1>
      {success ? <div className="text-center space-y-4">
        <p className="text-sm leading-7 text-green-700">رمز عبور با موفقیت تغییر کرد. اکنون با ایمیل و رمز جدید وارد شوید.</p>
        <Link to="/login" className="btn-primary py-3 w-full">رفتن به صفحه ورود</Link>
      </div> : checking ? <p className="text-sm text-gray-600 text-center">در حال بررسی لینک بازیابی…</p> : !authorized ? <div className="text-center space-y-4">
        <p className="text-sm leading-7 text-red-700">لینک بازیابی معتبر نیست یا منقضی شده است. از صفحه فراموشی رمز، یک لینک تازه درخواست کنید.</p>
        <Link to="/forgot-password" className="btn-primary py-3 w-full">درخواست لینک جدید</Link>
      </div> : <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">رمز عبور جدید</label>
          <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label">تکرار رمز عبور جدید</label>
          <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input" dir="ltr" />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={saving} type="submit" className="btn-primary py-3 w-full disabled:opacity-60"><Lock className="w-4 h-4" />{saving ? 'در حال ذخیره…' : 'ذخیره رمز جدید'}</button>
      </form>}
    </section>
  </div>
}
