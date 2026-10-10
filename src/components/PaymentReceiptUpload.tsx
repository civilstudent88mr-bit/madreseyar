import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Clock3, Copy, CreditCard, ExternalLink, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { formatCardNumber, formatToman } from '../lib/format'

type PaymentRow = {
  id: string
  status: 'pending_receipt' | 'confirmed' | 'rejected'
  receipt_url: string | null
  reference_code: string | null
  note: string | null
  created_at: string
}

type PaymentDetails = {
  bank_card: string
  bank_name: string
  sheba: string
  account_holder: string
  payment_instructions: string
}

const emptyDetails: PaymentDetails = {
  bank_card: '', bank_name: '', sheba: '', account_holder: '', payment_instructions: '',
}

export default function PaymentReceiptUpload({ orderId, amount }: { orderId: string; amount: number }) {
  const { profile } = useAuth()
  const [details, setDetails] = useState(emptyDetails)
  const [payment, setPayment] = useState<PaymentRow | null>(null)
  const [receiptLink, setReceiptLink] = useState('')
  const [referenceCode, setReferenceCode] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void (async () => {
      const [{ data: settings, error: settingsError }, { data: payments, error: paymentsError }] = await Promise.all([
        supabase.from('settings').select('key,value').in('key', Object.keys(emptyDetails)),
        supabase.from('payments').select('id,status,receipt_url,reference_code,note,created_at').eq('order_id', orderId).order('created_at', { ascending: false }).limit(1),
      ])
      if (!active) return
      if (settingsError || paymentsError) setLoadError('دریافت اطلاعات پرداخت با مشکل روبه‌رو شد. صفحه را تازه کنید؛ اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.')
      const nextDetails = { ...emptyDetails }
      for (const row of settings ?? []) {
        if (row.key in nextDetails) nextDetails[row.key as keyof PaymentDetails] = row.value ?? ''
      }
      setDetails(nextDetails)
      const latest = (payments?.[0] as PaymentRow | undefined) ?? null
      setPayment(latest)
      if (latest?.reference_code) setReferenceCode(latest.reference_code)
      if (latest?.receipt_url) {
        const { data } = await supabase.storage.from('payment-receipts').createSignedUrl(latest.receipt_url, 300)
        if (active && data?.signedUrl) setReceiptLink(data.signedUrl)
      }
      if (active) setLoading(false)
    })()
    return () => { active = false }
  }, [orderId])

  const submitReceipt = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!profile?.id) { setError('برای ثبت رسید، ابتدا وارد حساب خود شوید.'); return }
    if (!file) { setError('تصویر یا فایل رسید را انتخاب کنید.'); return }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) { setError('فقط تصویر JPG، PNG، WebP یا فایل PDF مجاز است.'); return }
    if (file.size > 6 * 1024 * 1024) { setError('حجم فایل باید کمتر از ۶ مگابایت باشد.'); return }

    setUploading(true)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'file'
    const path = `${profile.id}/${orderId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('payment-receipts').upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) {
      setError('بارگذاری رسید انجام نشد. بعد از اجرای تنظیمات پایگاه داده دوباره تلاش کنید.')
      setUploading(false)
      return
    }
    const { data: inserted, error: paymentError } = await supabase.from('payments').insert({
      order_id: orderId,
      amount,
      method: 'card_to_card',
      receipt_url: path,
      reference_code: referenceCode.trim() || null,
      status: 'pending_receipt',
    }).select('id,status,receipt_url,reference_code,note,created_at').single()
    if (paymentError || !inserted) {
      setError('فایل بارگذاری شد اما ثبت رسید در پایگاه داده انجام نشد. پشتیبانی را مطلع کنید.')
      setUploading(false)
      return
    }
    setPayment(inserted as PaymentRow)
    setReceiptLink('')
    setFile(null)
    setUploading(false)
  }

  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(details.bank_card.replace(/\D/g, ''))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('کپی خودکار انجام نشد؛ شماره کارت را دستی انتخاب کنید.')
    }
  }

  if (loading) return <div className="card p-4 text-sm text-gray-500">در حال دریافت اطلاعات پرداخت…</div>

  const canUpload = !payment || payment.status === 'rejected'

  return <section className="card p-5 space-y-4" dir="rtl">
    <div className="flex items-center gap-2">
      <CreditCard className="w-5 h-5 text-primary-700" />
      <h2 className="font-bold text-gray-900">پرداخت کارت‌به‌کارت</h2>
    </div>
    <div className="rounded-xl bg-primary-50 p-4 space-y-2 text-sm">
      {details.bank_name && <p><span className="text-gray-500">بانک: </span><b>{details.bank_name}</b></p>}
      <div className="flex flex-wrap items-center gap-2"><span className="text-gray-500">شماره کارت:</span><b className="font-mono tracking-wider" dir="ltr">{details.bank_card ? formatCardNumber(details.bank_card) : 'هنوز توسط فروشگاه ثبت نشده است'}</b>{details.bank_card && <button type="button" onClick={() => void copyCardNumber()} className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs text-primary-700">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'کپی شد' : 'کپی شماره کارت'}</button>}</div>
      {details.sheba && <p><span className="text-gray-500">شماره شبا: </span><b dir="ltr">{details.sheba}</b></p>}
      {details.account_holder && <p><span className="text-gray-500">به نام: </span><b>{details.account_holder}</b></p>}
      <p><span className="text-gray-500">مبلغ سفارش: </span><b className="text-primary-800">{formatToman(amount)}</b></p>
      {details.payment_instructions && <p className="pt-2 border-t border-primary-100 leading-6">{details.payment_instructions}</p>}
    </div>
    {loadError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{loadError}</p>}

    {payment?.status === 'confirmed' ? <p className="flex items-center gap-2 text-sm font-semibold text-green-700"><CheckCircle2 className="w-5 h-5" />رسید پرداخت شما تأیید شده است.</p> : payment?.status === 'pending_receipt' ? <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-700"><Clock3 className="w-5 h-5" />رسید برای بررسی مدیر ارسال شده است.</p>
      {payment.reference_code && <p className="text-xs text-gray-600">کد پیگیری: {payment.reference_code}</p>}
      {receiptLink && <a href={receiptLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-700">مشاهده رسید <ExternalLink className="w-4 h-4" /></a>}
    </div> : null}

    {canUpload && <form onSubmit={submitReceipt} className="space-y-3">
      {payment?.status === 'rejected' && <p className="text-sm text-red-700">رسید قبلی تأیید نشد؛ {payment.note || 'اطلاعات را بررسی و رسید تازه را بارگذاری کنید.'}</p>}
      <div>
        <label className="label" htmlFor={`receipt-${orderId}`}>تصویر یا PDF رسید (حداکثر ۶ مگابایت)</label>
        <input id={`receipt-${orderId}`} required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="input file:ml-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2" />
      </div>
      <div>
        <label className="label" htmlFor={`reference-${orderId}`}>شماره پیگیری (اختیاری)</label>
        <input id={`reference-${orderId}`} value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} className="input" />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={uploading || !details.bank_card} type="submit" className="btn-primary py-3 disabled:opacity-50"><Upload className="w-4 h-4" />{uploading ? 'در حال ارسال رسید…' : 'ثبت و ارسال رسید'}</button>
      {!details.bank_card && <p className="text-xs text-amber-700">اطلاعات کارت هنوز توسط فروشگاه ثبت نشده است؛ برای پرداخت با فروشگاه تماس بگیرید.</p>}
    </form>}
  </section>
}
