import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Printer, RefreshCw, X, Upload, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../lib/toast'
import type { Order, OrderItem, OrderStatusHistory } from '../../lib/types'
import { formatToman, formatTomanShort } from '../../lib/format'
import { formatJalaliDateTime } from '../../lib/jalali'
import { StatusChip, statusLabels } from '../../lib/ui'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [{ data: o }, { data: its }, { data: hist }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', id),
        supabase.from('order_status_history').select('*').eq('order_id', id).order('created_at', { ascending: true }),
      ])
      setOrder(o as Order | null)
      setItems(its as OrderItem[] ?? [])
      setHistory(hist as OrderStatusHistory[] ?? [])
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>
  if (!order) return <div className="text-center py-16"><Package className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">سفارش یافت نشد</p></div>

  const reorder = async () => {
    if (!profile) return
    for (const it of items) {
      if (it.product_id) {
        const { data: p } = await supabase.from('products').select('*').eq('id', it.product_id).maybeSingle()
        if (p) {
          await supabase.from('cart_items').insert({ user_id: profile.id, product_id: it.product_id, qty: it.qty })
        }
      }
    }
    toast('success', 'اقلام به سبد اضافه شد')
    navigate('/app/cart')
  }

  const cancel = async () => {
    await supabase.from('orders').update({ status: 'canceled' }).eq('id', order.id)
    await supabase.from('order_status_history').insert({ order_id: order.id, status: 'canceled', note: 'لغو توسط مدرسه', created_by: profile?.id })
    toast('success', 'سفارش لغو شد')
    setOrder({ ...order, status: 'canceled' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link to="/app/orders" className="text-sm text-primary-700 mb-1 inline-block">← بازگشت</Link>
          <h1 className="text-xl font-extrabold text-gray-800" dir="ltr">{order.order_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={order.status} />
          <button onClick={() => window.print()} className="btn-ghost py-2 px-3 text-sm no-print"><Printer className="w-4 h-4" /> چاپ</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="card p-4 print-area">
            <h2 className="font-bold text-gray-800 mb-3">اقلام سفارش</h2>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{it.name}</p>
                    <p className="text-xs text-gray-500">{it.qty} × {formatTomanShort(it.our_price)} ت</p>
                  </div>
                  <p className="font-bold text-sm text-gray-800">{formatTomanShort(it.line_total)} ت</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">قیمت بازار</span><span className="text-gray-400 line-through">{formatTomanShort(order.market_total_snapshot)} ت</span></div>
              <div className="flex justify-between"><span className="text-gray-500">صرفه‌جویی</span><span className="text-success-600 font-bold">{formatTomanShort(order.saved_amount_snapshot)} ت</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ارسال</span><span>{order.shipping_fee === 0 ? 'رایگان' : `${formatTomanShort(order.shipping_fee)} ت`}</span></div>
              <div className="flex justify-between font-bold text-base pt-1"><span className="text-gray-800">مبلغ کل</span><span className="text-primary-700">{formatToman(order.grand_total)}</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-4 no-print">
            <h2 className="font-bold text-gray-800 mb-3">وضعیت سفارش</h2>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${i === history.length - 1 ? 'bg-primary-600' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{statusLabels[h.status] ?? h.status}</p>
                    <p className="text-xs text-gray-500">{formatJalaliDateTime(h.created_at)}</p>
                    {h.note && <p className="text-xs text-gray-400 mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="card p-4 space-y-2 text-sm no-print">
            <h3 className="font-bold text-gray-800">اطلاعات تحویل</h3>
            <div><p className="text-gray-500 text-xs">آدرس</p><p className="text-gray-800">{order.delivery_address}</p></div>
            <div><p className="text-gray-500 text-xs">گیرنده</p><p className="text-gray-800">{order.receiver_name}</p></div>
            <div><p className="text-gray-500 text-xs">موبایل</p><p className="text-gray-800" dir="ltr">{order.receiver_mobile}</p></div>
            {order.notes && <div><p className="text-gray-500 text-xs">یادداشت</p><p className="text-gray-800">{order.notes}</p></div>}
          </div>

          <div className="card p-4 space-y-2 no-print">
            <h3 className="font-bold text-gray-800">پرداخت</h3>
            <p className="text-sm text-gray-600">{order.payment_method === 'card_to_card' ? 'کارت به کارت' : order.payment_method === 'cash_on_delivery' ? 'پرداخت در محل' : order.payment_method === 'school_credit' ? 'اعتبار مدرسه' : '—'}</p>
            <p className="text-sm"><span className="text-gray-500">وضعیت: </span><span className={order.payment_status === 'paid' ? 'text-success-600 font-bold' : 'text-warning-600'}>{order.payment_status === 'paid' ? 'پرداخت شده' : order.payment_status === 'pending_receipt' ? 'در انتظار فیش' : 'پرداخت نشده'}</span></p>
          </div>

          {order.status === 'submitted' && (
            <button onClick={cancel} className="btn-danger w-full no-print"><X className="w-4 h-4" /> درخواست لغو</button>
          )}
          <button onClick={reorder} className="btn-secondary w-full no-print"><RefreshCw className="w-4 h-4" /> تکرار سفارش</button>
        </div>
      </div>
    </div>
  )
}
