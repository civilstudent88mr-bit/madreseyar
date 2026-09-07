import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, Wallet, Building, Upload, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../lib/toast'
import { supabase } from '../../lib/supabase'
import { formatToman, formatTomanShort } from '../../lib/format'
import { todayJalaliShort } from '../../lib/jalali'

export default function Checkout() {
  const { lines, clear } = useCart()
  const { profile, school } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [form, setForm] = useState({
    deliveryAddress: school?.address ?? '',
    receiverName: profile?.full_name ?? '',
    receiverMobile: profile?.mobile ?? '',
    deliveryDate: '',
    notes: '',
    paymentMethod: 'card_to_card' as const,
  })

  const subtotal = lines.reduce((s, l) => s + (l.product?.our_price ?? l.bundle?.our_total ?? 0) * l.qty, 0)
  const marketTotal = lines.reduce((s, l) => s + (l.product?.market_price ?? l.bundle?.market_total ?? 0) * l.qty, 0)
  const saved = marketTotal - subtotal
  const shippingFee = subtotal >= 5000000 ? 0 : 150000
  const grandTotal = subtotal + shippingFee

  const submit = async () => {
    if (!profile?.school_id) { toast('error', 'مدرسه شما مشخص نیست'); return }
    setSubmitting(true)
    const orderNumber = `MY-${todayJalaliShort().replace(/\//g, '')}-${Math.floor(Math.random() * 900000 + 100000)}`
    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      school_id: profile.school_id,
      user_id: profile.id,
      status: 'submitted',
      subtotal,
      discount: 0,
      shipping_fee: shippingFee,
      grand_total: grandTotal,
      market_total_snapshot: marketTotal,
      saved_amount_snapshot: saved,
      payment_status: 'unpaid',
      payment_method: form.paymentMethod,
      delivery_date_requested: form.deliveryDate || null,
      delivery_address: form.deliveryAddress,
      receiver_name: form.receiverName,
      receiver_mobile: form.receiverMobile,
      notes: form.notes,
    }).select().single()

    if (error || !order) { setSubmitting(false); toast('error', 'خطا در ثبت سفارش'); return }

    const orderItems = lines.map((l) => ({
      order_id: order.id,
      product_id: l.product?.id ?? null,
      name: l.product?.name ?? l.bundle?.name ?? '',
      sku: l.product?.sku ?? null,
      our_price: l.product?.our_price ?? l.bundle?.our_total ?? 0,
      market_price: l.product?.market_price ?? l.bundle?.market_total ?? 0,
      qty: l.qty,
      line_total: (l.product?.our_price ?? l.bundle?.our_total ?? 0) * l.qty,
      unit: l.product?.unit ?? null,
      pack_size: l.product?.pack_size ?? null,
    }))
    await supabase.from('order_items').insert(orderItems)
    await supabase.from('order_status_history').insert({ order_id: order.id, status: 'submitted', note: 'سفارش ثبت شد', created_by: profile.id })

    setOrderId(order.id)
    clear()
    setSubmitting(false)
    setStep(4)
  }

  if (step === 4 && orderId) {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-12 h-12 text-success-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">سفارش ثبت شد!</h1>
        <p className="text-gray-600 mb-4">سفارش شما با موفقیت ثبت شد. به‌زودی فروشنده آن را تأیید می‌کند.</p>
        <div className="card p-4 mb-6">
          <p className="text-sm text-gray-500">شماره سفارش</p>
          <p className="text-xl font-extrabold text-primary-700" dir="ltr">{orderId.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => navigate('/app/orders')} className="btn-primary">مشاهده سفارش‌ها</button>
          <button onClick={() => navigate('/app/catalog')} className="btn-ghost">ادامه خرید</button>
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return <div className="text-center py-16"><p className="text-gray-500 mb-4">سبد خرید خالی است</p><button onClick={() => navigate('/app/catalog')} className="btn-primary">مشاهده کاتالوگ</button></div>
  }

  const paymentMethods = [
    { id: 'card_to_card', label: 'کارت به کارت', icon: CreditCard, desc: 'بارگذاری فیش واریزی' },
    { id: 'cash_on_delivery', label: 'پرداخت در محل', icon: Truck, desc: 'هنگام تحویل سفارش' },
    { id: 'school_credit', label: 'اعتبار مدرسه', icon: Building, desc: 'در صورت تأیید مدیر فروش' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">تکمیل سفارش</h1>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-bold text-gray-800">بررسی اقلام</h2>
              <div className="space-y-2">
                {lines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{l.product?.name ?? l.bundle?.name}</p>
                      <p className="text-xs text-gray-500">{l.qty} × {formatTomanShort(l.product?.our_price ?? l.bundle?.our_total ?? 0)} ت</p>
                    </div>
                    <p className="font-bold text-sm text-gray-800">{formatTomanShort((l.product?.our_price ?? l.bundle?.our_total ?? 0) * l.qty)} ت</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-3">ادامه <ArrowLeft className="w-4 h-4" /></button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-bold text-gray-800">اطلاعات تحویل</h2>
              <div>
                <label className="label">آدرس تحویل</label>
                <textarea required value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className="input min-h-[80px]" placeholder="آدرس کامل مدرسه" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نام گیرنده</label>
                  <input required value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">موبایل گیرنده</label>
                  <input required value={form.receiverMobile} onChange={(e) => setForm({ ...form, receiverMobile: e.target.value })} className="input" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="label">تاریخ درخواست تحویل</label>
                <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">یادداشت</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-[60px]" placeholder="مثلاً تحویل به سرایدار" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3">بازگشت</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">ادامه</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-bold text-gray-800">روش پرداخت</h2>
              <div className="space-y-2">
                {paymentMethods.map((m) => (
                  <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${form.paymentMethod === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" checked={form.paymentMethod === m.id} onChange={() => setForm({ ...form, paymentMethod: m.id as any })} className="w-4 h-4 text-primary-600" />
                    <m.icon className="w-5 h-5 text-primary-700" />
                    <div>
                      <p className="font-bold text-sm text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {form.paymentMethod === 'card_to_card' && (
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-accent-800 mb-1">اطلاعات کارت</p>
                  <p className="text-accent-700">شماره کارت: ۶۰۳۷-۹۹۱۱-۲۳۴۵-۶۷۸۹</p>
                  <p className="text-accent-700">شماره شبا: IR120170000000001234567890</p>
                  <p className="text-accent-700">به نام: شرکت تأمین لوازم مدرسه یار</p>
                  <p className="text-xs text-accent-600 mt-2">پس از واریز، فیش را در صفحه سفارش بارگذاری کنید.</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1 py-3">بازگشت</button>
                <button onClick={submit} disabled={submitting} className="btn-primary flex-1 py-3">
                  {submitting ? 'در حال ثبت...' : 'ثبت سفارش'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-20 space-y-3">
          <h3 className="font-bold text-gray-800">خلاصه سفارش</h3>
          <div className="flex justify-between text-sm"><span className="text-gray-500">قیمت بازار</span><span className="text-gray-400 line-through">{formatTomanShort(marketTotal)} ت</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-700 font-medium">قیمت مدرسه یار</span><span className="font-bold text-primary-700">{formatTomanShort(subtotal)} ت</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">هزینه ارسال</span><span className={shippingFee === 0 ? 'text-success-600 font-bold' : 'text-gray-700'}>{shippingFee === 0 ? 'رایگان' : `${formatTomanShort(shippingFee)} ت`}</span></div>
          <div className="border-t border-gray-100 pt-3 flex justify-between"><span className="font-bold text-gray-800">مبلغ کل</span><span className="font-extrabold text-lg text-primary-700">{formatToman(grandTotal)}</span></div>
          <div className="bg-success-50 rounded-xl px-3 py-2 text-center"><p className="text-xs text-success-700">صرفه‌جویی شما: {formatToman(saved)}</p></div>
        </div>
      </div>
    </div>
  )
}
