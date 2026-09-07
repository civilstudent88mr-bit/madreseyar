import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Building2, Check, X, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { School, Order } from '../../lib/types'
import { formatTomanShort } from '../../lib/format'
import { formatJalaliDateShort } from '../../lib/jalali'
import { StatusChip } from '../../lib/ui'

export default function AdminSchoolDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const [school, setSchool] = useState<School | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [terms, setTerms] = useState('cash')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [{ data: s }, { data: o }] = await Promise.all([
        supabase.from('schools').select('*').eq('id', id).maybeSingle(),
        supabase.from('orders').select('*').eq('school_id', id).order('created_at', { ascending: false }),
      ])
      setSchool(s as School | null)
      setOrders(o as Order[] ?? [])
      setNote(s?.notes ?? '')
      setTerms(s?.payment_terms ?? 'cash')
      setLoading(false)
    })()
  }, [id])

  const setStatus = async (status: string) => {
    if (!school) return
    await supabase.from('schools').update({ status }).eq('id', school.id)
    setSchool({ ...school, status: status as any })
    toast('success', `وضعیت به ${status === 'approved' ? 'تأیید شده' : status === 'rejected' ? 'رد شده' : 'در انتظار'} تغییر کرد`)
  }

  const saveNote = async () => {
    if (!school) return
    await supabase.from('schools').update({ notes: note, payment_terms: terms }).eq('id', school.id)
    toast('success', 'ذخیره شد')
  }

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>
  if (!school) return <div className="text-center py-16"><p className="text-gray-500">مدرسه یافت نشد</p></div>

  return (
    <div className="space-y-4">
      <div>
        <Link to="/admin/schools" className="text-sm text-primary-700 mb-1 inline-block">← بازگشت</Link>
        <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary-700" /> {school.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3 text-sm">
          <h3 className="font-bold text-gray-800">اطلاعات مدرسه</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-gray-500 text-xs">نوع</p><p className="text-gray-800">{school.type}</p></div>
            <div><p className="text-gray-500 text-xs">کد مدرسه</p><p className="text-gray-800" dir="ltr">{school.school_code}</p></div>
            <div><p className="text-gray-500 text-xs">استان</p><p className="text-gray-800">{school.province}</p></div>
            <div><p className="text-gray-500 text-xs">شهر</p><p className="text-gray-800">{school.city}</p></div>
            <div><p className="text-gray-500 text-xs">کد پستی</p><p className="text-gray-800" dir="ltr">{school.postal_code}</p></div>
            <div><p className="text-gray-500 text-xs">تلفن</p><p className="text-gray-800" dir="ltr">{school.landline}</p></div>
            <div className="col-span-2"><p className="text-gray-500 text-xs">آدرس</p><p className="text-gray-800">{school.address}</p></div>
            <div><p className="text-gray-500 text-xs">مدیر</p><p className="text-gray-800">{school.principal_name}</p></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <h3 className="font-bold text-gray-800 mb-3">وضعیت تأیید</h3>
            <div className="flex gap-2">
              <button onClick={() => setStatus('approved')} className="btn-primary py-2.5 text-sm flex-1"><Check className="w-4 h-4" /> تأیید</button>
              <button onClick={() => setStatus('rejected')} className="btn-danger py-2.5 text-sm flex-1"><X className="w-4 h-4" /> رد</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">وضعیت فعلی: {school.status === 'approved' ? 'تأیید شده' : school.status === 'pending_review' ? 'در انتظار' : 'رد شده'}</p>
          </div>
          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-gray-800">یادداشت خصوصی و شرایط پرداخت</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input min-h-[60px]" placeholder="یادداشت خصوصی..." />
            <select value={terms} onChange={(e) => setTerms(e.target.value)} className="input">
              <option value="cash">نقدی</option>
              <option value="15_days">۱۵ روزه</option>
              <option value="30_days">۳۰ روزه</option>
            </select>
            <button onClick={saveNote} className="btn-secondary py-2.5 text-sm w-full"><Save className="w-4 h-4" /> ذخیره</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3">تاریخچه سفارش‌ها</h3>
        {orders.length === 0 ? (
          <div className="card p-4 text-center text-gray-500 text-sm">سفارشی وجود ندارد</div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="card p-3 flex items-center justify-between hover:shadow-card-hover transition">
                <div><p className="text-sm font-bold text-gray-800" dir="ltr">{o.order_number}</p><p className="text-xs text-gray-500">{formatJalaliDateShort(o.created_at)}</p></div>
                <div className="flex items-center gap-3"><span className="text-sm font-bold text-primary-700">{formatTomanShort(o.grand_total)} ت</span><StatusChip status={o.status} /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
