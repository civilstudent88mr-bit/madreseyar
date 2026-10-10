import { useCallback, useEffect, useState } from 'react'
import { Check, ExternalLink, Landmark, RefreshCw, Save, Wallet, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import { formatToman, formatTomanShort } from '../../lib/format'
import { formatJalaliDateTime } from '../../lib/jalali'

type FinancialSettings = {
  bank_name: string
  bank_card: string
  sheba: string
  account_holder: string
  payment_instructions: string
}

type FinancePayment = {
  id: string
  order_id: string
  amount: number
  method: string | null
  receipt_url: string | null
  reference_code: string | null
  note: string | null
  status: 'pending_receipt' | 'confirmed' | 'rejected'
  created_at: string
  order_number?: string
  customer_name?: string
  customer_mobile?: string
  signed_url?: string
}

const keys = ['bank_name', 'bank_card', 'sheba', 'account_holder', 'payment_instructions'] as const
const blankSettings: FinancialSettings = { bank_name: '', bank_card: '', sheba: '', account_holder: '', payment_instructions: '' }
const statusText = { pending_receipt: 'در انتظار بررسی', confirmed: 'تأییدشده', rejected: 'ردشده' }

function asciiDigits(value: string) {
  return Array.from(value, (char) => {
    const code = char.codePointAt(0)!
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
    return char
  }).join('')
}

export default function AdminFinance() {
  const { toast } = useToast()
  const [settings, setSettings] = useState(blankSettings)
  const [payments, setPayments] = useState<FinancePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState('')
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState('all')
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [{ data: settingRows, error: settingsError }, { data: paymentRows, error: paymentsError }] = await Promise.all([
      supabase.from('settings').select('key,value').in('key', [...keys]),
      supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    if (settingsError || paymentsError) {
      setLoadError('دریافت اطلاعات مالی انجام نشد. اجرای migration مالی در Supabase را بررسی کنید.')
      setLoading(false)
      return
    }
    const nextSettings = { ...blankSettings }
    for (const row of settingRows ?? []) {
      if (row.key in nextSettings) nextSettings[row.key as keyof FinancialSettings] = row.value ?? ''
    }
    setSettings(nextSettings)

    const rows = paymentRows ?? []
    const orderIds = [...new Set(rows.map((payment: any) => payment.order_id))]
    const userIds: string[] = []
    let orders: any[] = []
    if (orderIds.length) {
      const { data } = await supabase.from('orders').select('id,order_number,user_id,receiver_name,receiver_mobile').in('id', orderIds)
      orders = data ?? []
      userIds.push(...orders.map((order) => order.user_id).filter(Boolean))
    }
    const profilesById = new Map<string, any>()
    if (userIds.length) {
      const { data } = await supabase.from('profiles').select('id,full_name,mobile').in('id', [...new Set(userIds)])
      for (const row of data ?? []) profilesById.set(row.id, row)
    }
    const ordersById = new Map(orders.map((order) => [order.id, order]))
    const enriched = await Promise.all(rows.map(async (payment: any) => {
      const order = ordersById.get(payment.order_id)
      const customer = order ? profilesById.get(order.user_id) : null
      let signed_url = ''
      if (payment.receipt_url) {
        const { data } = await supabase.storage.from('payment-receipts').createSignedUrl(payment.receipt_url, 3600)
        signed_url = data?.signedUrl ?? ''
      }
      return {
        ...payment,
        order_number: order?.order_number ?? payment.order_id.slice(0, 8),
        customer_name: customer?.full_name || order?.receiver_name || '—',
        customer_mobile: customer?.mobile || order?.receiver_mobile || '',
        signed_url,
      } as FinancePayment
    }))
    setPayments(enriched)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault()
    const cardDigits = asciiDigits(settings.bank_card).replace(/\D/g, '')
    if (cardDigits && cardDigits.length !== 16) {
      toast('error', 'شماره کارت باید ۱۶ رقم باشد.')
      return
    }
    setSaving(true)
    const rows = keys.map((key) => ({ key, value: key === 'bank_card' ? cardDigits : settings[key].trim() }))
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    if (error) { toast('error', 'ذخیره اطلاعات حساب انجام نشد. دسترسی مدیر و migration را بررسی کنید.'); return }
    setSettings({ ...settings, bank_card: cardDigits })
    toast('success', 'اطلاعات پرداخت ذخیره شد و برای مشتریان نمایش داده می‌شود.')
  }

  const reviewPayment = async (payment: FinancePayment, nextStatus: 'confirmed' | 'rejected') => {
    setWorkingId(payment.id)
    const { error } = await supabase.rpc('review_payment', {
      payment_id: payment.id,
      new_status: nextStatus,
      review_note: reviewNotes[payment.id]?.trim() || null,
    })
    if (error) {
      setWorkingId('')
      toast('error', 'به‌روزرسانی وضعیت رسید انجام نشد.')
      return
    }
    setPayments((current) => current.map((item) => item.id === payment.id ? { ...item, status: nextStatus, note: reviewNotes[payment.id]?.trim() || null } : item))
    setWorkingId('')
    toast('success', nextStatus === 'confirmed' ? 'رسید تأیید و سفارش پرداخت‌شده ثبت شد.' : 'رسید رد شد؛ مشتری می‌تواند رسید تازه بفرستد.')
  }

  const filtered = filter === 'all' ? payments : payments.filter((payment) => payment.status === filter)
  const confirmedTotal = payments.filter((payment) => payment.status === 'confirmed').reduce((total, payment) => total + Number(payment.amount), 0)
  const pendingTotal = payments.filter((payment) => payment.status === 'pending_receipt').reduce((total, payment) => total + Number(payment.amount), 0)
  const pendingCount = payments.filter((payment) => payment.status === 'pending_receipt').length

  return <div className="space-y-5" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-extrabold text-gray-900">امور مالی</h1><p className="mt-1 text-sm text-gray-500">مدیریت کارت مقصد و بررسی رسیدهای مشتریان</p></div>
      <button onClick={() => void load()} className="btn-ghost py-2"><RefreshCw className="w-4 h-4" />به‌روزرسانی</button>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="card p-4"><p className="text-xs text-gray-500">مبالغ تأییدشده (۱۰۰ پرداخت اخیر)</p><p className="mt-2 text-xl font-extrabold text-green-700">{formatTomanShort(confirmedTotal)} تومان</p></div>
      <div className="card p-4"><p className="text-xs text-gray-500">در انتظار بررسی</p><p className="mt-2 text-xl font-extrabold text-amber-700">{pendingCount} رسید · {formatTomanShort(pendingTotal)} تومان</p></div>
      <div className="card p-4"><p className="text-xs text-gray-500">کل سوابق بارگذاری‌شده</p><p className="mt-2 text-xl font-extrabold text-gray-900">{payments.length}</p></div>
    </div>

    <form onSubmit={saveSettings} className="card p-5 space-y-4">
      <h2 className="flex items-center gap-2 font-bold text-gray-900"><Landmark className="h-5 w-5 text-primary-700" />حساب دریافت وجه مشتریان</h2>
      <p className="text-sm leading-6 text-gray-500">این اطلاعات هنگام پرداخت کارت‌به‌کارت در checkout و جزئیات سفارش مشتری نمایش داده می‌شود. فقط اطلاعات حساب متعلق به فروشگاه را وارد کنید.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label" htmlFor="finance-bank">نام بانک</label><input id="finance-bank" value={settings.bank_name} onChange={(event) => setSettings({ ...settings, bank_name: event.target.value })} className="input" /></div>
        <div><label className="label" htmlFor="finance-card">شماره کارت مقصد (۱۶ رقم)</label><input id="finance-card" inputMode="numeric" dir="ltr" value={settings.bank_card} onChange={(event) => setSettings({ ...settings, bank_card: event.target.value })} className="input" placeholder="شماره کارت ۱۶ رقمی" /></div>
        <div><label className="label" htmlFor="finance-sheba">شماره شبا</label><input id="finance-sheba" dir="ltr" value={settings.sheba} onChange={(event) => setSettings({ ...settings, sheba: event.target.value })} className="input" placeholder="IR..." /></div>
        <div><label className="label" htmlFor="finance-holder">نام صاحب حساب</label><input id="finance-holder" value={settings.account_holder} onChange={(event) => setSettings({ ...settings, account_holder: event.target.value })} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="finance-instructions">راهنمای پرداخت</label><textarea id="finance-instructions" value={settings.payment_instructions} onChange={(event) => setSettings({ ...settings, payment_instructions: event.target.value })} className="input min-h-20" placeholder="مثلاً پس از واریز، تصویر رسید را در همین سفارش بارگذاری کنید." /></div>
      <button disabled={saving} className="btn-primary py-3 disabled:opacity-60" type="submit"><Save className="w-4 h-4" />{saving ? 'در حال ذخیره…' : 'ذخیره و نمایش برای مشتری'}</button>
    </form>

    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <h2 className="flex items-center gap-2 font-bold text-gray-900"><Wallet className="h-5 w-5 text-primary-700" />رسیدها و تراکنش‌ها</h2>
        <select aria-label="فیلتر وضعیت رسید" value={filter} onChange={(event) => setFilter(event.target.value)} className="input w-auto py-2">
          <option value="all">همه وضعیت‌ها</option><option value="pending_receipt">در انتظار بررسی</option><option value="confirmed">تأییدشده</option><option value="rejected">ردشده</option>
        </select>
      </div>
      {loadError && <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>}
      {loading ? <div className="p-10 text-center text-sm text-gray-500">در حال بارگذاری اطلاعات مالی…</div> : filtered.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">برای این فیلتر رسیدی ثبت نشده است.</div> : <div className="divide-y divide-gray-100">
        {filtered.map((payment) => <article key={payment.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-1 text-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><b dir="ltr">{payment.order_number}</b><span className="text-gray-500">{payment.customer_name}</span><span dir="ltr" className="text-gray-500">{payment.customer_mobile}</span></div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"><span>{formatJalaliDateTime(payment.created_at)}</span><span>کارت‌به‌کارت</span>{payment.reference_code && <span>پیگیری: {payment.reference_code}</span>}</div>
            <p className="font-bold text-primary-800">{formatToman(payment.amount)}</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === 'confirmed' ? 'bg-green-50 text-green-700' : payment.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{statusText[payment.status]}</span>
            {payment.status === 'rejected' && payment.note && <p className="text-xs text-red-700">دلیل رد: {payment.note}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {payment.signed_url && <a href={payment.signed_url} target="_blank" rel="noreferrer" className="btn-ghost py-2 text-sm"><ExternalLink className="h-4 w-4" />مشاهده رسید</a>}
            {payment.status === 'pending_receipt' && <>
              <input value={reviewNotes[payment.id] ?? ''} onChange={(event) => setReviewNotes({ ...reviewNotes, [payment.id]: event.target.value })} className="input w-full py-2 text-sm lg:w-64" aria-label="یادداشت بررسی یا دلیل رد" placeholder="یادداشت یا دلیل رد رسید" />
              <button disabled={workingId === payment.id} onClick={() => void reviewPayment(payment, 'confirmed')} className="btn-primary py-2 text-sm disabled:opacity-50"><Check className="h-4 w-4" />تأیید</button>
              <button disabled={workingId === payment.id} onClick={() => void reviewPayment(payment, 'rejected')} className="btn-ghost py-2 text-sm text-red-700 disabled:opacity-50"><X className="h-4 w-4" />رد رسید</button>
            </>}
          </div>
        </article>)}
      </div>}
      <p className="border-t border-gray-100 p-3 text-xs text-gray-400">سوابق این صفحه حداکثر ۱۰۰ پرداخت اخیر را نمایش می‌دهد.</p>
    </section>
  </div>
}
