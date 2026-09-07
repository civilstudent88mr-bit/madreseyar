import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, Package, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Order, OrderItem, School } from '../../lib/types'
import { formatToman, formatTomanShort } from '../../lib/format'
import { formatJalaliDateTime } from '../../lib/jalali'
import { StatusChip, statusLabels } from '../../lib/ui'

const statuses = ['submitted', 'confirmed', 'packing', 'shipped', 'delivered', 'canceled', 'returned']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [{ data: o }, { data: its }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', id),
      ])
      setOrder(o as Order | null)
      setItems(its as OrderItem[] ?? [])
      if (o?.school_id) {
        const { data: s } = await supabase.from('schools').select('*').eq('id', o.school_id).maybeSingle()
        setSchool(s as School | null)
      }
      setLoading(false)
    })()
  }, [id])

  const updateStatus = async (status: string) => {
    if (!order) return
    await supabase.from('orders').update({ status }).eq('id', order.id)
    await supabase.from('order_status_history').insert({ order_id: order.id, status, note: `تغییر وضعیت به ${statusLabels[status]}` })
    setOrder({ ...order, status: status as any })
    toast('success', `وضعیت به ${statusLabels[status]} تغییر کرد`)
  }

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>
  if (!order) return <div className="text-center py-16"><Package className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">سفارش یافت نشد</p></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link to="/admin/orders" className="text-sm text-primary-700 mb-1 inline-block">← بازگشت</Link>
          <h1 className="text-xl font-extrabold text-gray-800" dir="ltr">{order.order_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={order.status} />
          <button onClick={() => window.print()} className="btn-ghost py-2 px-3 text-sm no-print"><Printer className="w-4 h-4" /> چاپ</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4 print-area">
            <h2 className="font-bold text-gray-800 mb-3">اقلام سفارش</h2>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1"><p className="text-sm font-medium text-gray-800">{it.name}</p><p className="text-xs text-gray-500">{it.qty} × {formatTomanShort(it.our_price)} ت</p></div>
                  <p className="font-bold text-sm">{formatTomanShort(it.line_total)} ت</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">صرفه‌جویی مدرسه</span><span className="text-success-600 font-bold">{formatTomanShort(order.saved_amount_snapshot)} ت</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ارسال</span><span>{order.shipping_fee === 0 ? 'رایگان' : `${formatTomanShort(order.shipping_fee)} ت`}</span></div>
              <div className="flex justify-between font-bold text-base pt-1"><span>مبلغ کل</span><span className="text-primary-700">{formatToman(order.grand_total)}</span></div>
            </div>
          </div>

          {/* Status changer */}
          <div className="card p-4 no-print">
            <h3 className="font-bold text-gray-800 mb-3">تغییر وضعیت</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button key={s} onClick={() => updateStatus(s)} className={`chip ${order.status === s ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 no-print">
          {school && (
            <div className="card p-4 space-y-2 text-sm">
              <h3 className="font-bold text-gray-800">اطلاعات مدرسه</h3>
              <p className="font-medium text-gray-800">{school.name}</p>
              <p className="text-gray-600">{school.province} · {school.city}</p>
              <p className="text-gray-600">{school.address}</p>
              <Link to={`/admin/schools/${school.id}`} className="text-primary-700 text-xs">مشاهده پروفایل مدرسه</Link>
            </div>
          )}
          <div className="card p-4 space-y-2 text-sm">
            <h3 className="font-bold text-gray-800">اطلاعات تحویل</h3>
            <p className="text-gray-600">{order.delivery_address}</p>
            <p className="text-gray-600">گیرنده: {order.receiver_name}</p>
            <p className="text-gray-600" dir="ltr">{order.receiver_mobile}</p>
            {order.notes && <p className="text-gray-500 text-xs">یادداشت: {order.notes}</p>}
          </div>
          <div className="card p-4 space-y-2 text-sm">
            <h3 className="font-bold text-gray-800">پرداخت</h3>
            <p>{order.payment_method === 'card_to_card' ? 'کارت به کارت' : order.payment_method === 'cash_on_delivery' ? 'پرداخت در محل' : order.payment_method === 'school_credit' ? 'اعتبار مدرسه' : '—'}</p>
            <p><span className="text-gray-500">وضعیت: </span>{order.payment_status === 'paid' ? 'پرداخت شده' : order.payment_status === 'pending_receipt' ? 'در انتظار فیش' : 'پرداخت نشده'}</p>
            {order.payment_status === 'pending_receipt' && (
              <div className="flex gap-2 pt-2">
                <button onClick={async () => { await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', order.id); setOrder({ ...order, payment_status: 'paid' }); toast('success', 'پرداخت تأیید شد') }} className="btn-primary py-2 px-3 text-xs"><Check className="w-3 h-3" /> تأیید</button>
                <button onClick={async () => { await supabase.from('orders').update({ payment_status: 'unpaid' }).eq('id', order.id); setOrder({ ...order, payment_status: 'unpaid' }); toast('info', 'رد شد') }} className="btn-ghost py-2 px-3 text-xs text-error-600"><X className="w-3 h-3" /> رد</button>
              </div>
            )}
          </div>
          <div className="card p-4 space-y-2 text-sm">
            <h3 className="font-bold text-gray-800">یادداشت مدیر</h3>
            <textarea value={adminNote || order.admin_notes || ''} onChange={(e) => setAdminNote(e.target.value)} className="input min-h-[60px]" placeholder="یادداشت داخلی..." />
            <button onClick={async () => { await supabase.from('orders').update({ admin_notes: adminNote }).eq('id', order.id); toast('success', 'ذخیره شد') }} className="btn-secondary py-2 px-3 text-xs">ذخیره یادداشت</button>
          </div>
        </div>
      </div>
    </div>
  )
}
