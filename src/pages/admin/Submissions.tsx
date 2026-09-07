import { useState } from 'react'
import { Inbox, Check, X, Save } from 'lucide-react'
import { useStore, type Submission } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { formatJalaliDateShort } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminSubmissions() {
  const { submissions, reviewSubmission } = useStore()
  const { toast } = useToast()
  const [reviewing, setReviewing] = useState<Submission | null>(null)
  const [action, setAction] = useState<'approved' | 'rejected'>('approved')
  const [note, setNote] = useState('')
  const [market, setMarket] = useState(0)
  const [our, setOur] = useState(0)
  const [stock, setStock] = useState(0)

  const openReview = (s: Submission, act: 'approved' | 'rejected') => {
    setReviewing(s); setAction(act); setNote(''); setMarket(0); setOur(0); setStock(0)
  }

  const confirm = () => {
    if (!reviewing) return
    if (action === 'approved' && (!market || !our)) { toast('error', 'قیمت‌ها را وارد کنید'); return }
    reviewSubmission(reviewing.id, action, note, action === 'approved' ? { market, our, stock } : undefined)
    toast('success', action === 'approved' ? 'کالا تأیید و به کاتالوگ اضافه شد' : 'درخواست رد شد')
    setReviewing(null)
  }

  const pending = submissions.filter((s) => s.status === 'pending')
  const reviewed = submissions.filter((s) => s.status !== 'pending')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Inbox className="w-5 h-5 text-primary-700" /> کالاهای ثبت‌شده کاربران</h1>

      <div>
        <h2 className="font-bold text-gray-800 mb-3">در انتظار تأیید ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState icon={<Inbox className="w-8 h-8" />} title="درخواستی در انتظار نیست" />
        ) : (
          <div className="space-y-2">
            {pending.map((s) => (
              <div key={s.id} className="card p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-sm text-gray-800">{s.productName}</p>
                  <p className="text-xs text-gray-500">دسته: {s.category} · تعداد: {s.qty} · {s.schoolName} · {formatJalaliDateShort(s.date)}</p>
                  {s.note && <p className="text-xs text-gray-400 mt-1">{s.note}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openReview(s, 'approved')} className="btn-primary py-2 px-3 text-xs"><Check className="w-4 h-4" /> تأیید</button>
                  <button onClick={() => openReview(s, 'rejected')} className="btn-danger py-2 px-3 text-xs"><X className="w-4 h-4" /> رد</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-800 mb-3">بررسی‌شده‌ها</h2>
          <div className="space-y-2">
            {reviewed.map((s) => (
              <div key={s.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-800">{s.productName}</p>
                  <p className="text-xs text-gray-500">{s.schoolName} · {formatJalaliDateShort(s.date)}</p>
                  {s.adminNote && <p className="text-xs text-gray-400 mt-1">یادداشت: {s.adminNote}</p>}
                </div>
                <span className={`chip text-[10px] ${s.status === 'approved' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                  {s.status === 'approved' ? 'تأیید شده' : 'رد شده'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setReviewing(null)}>
          <div className="card p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-gray-800 mb-1">{action === 'approved' ? 'تأیید کالا' : 'رد درخواست'}</h2>
            <p className="text-sm text-gray-500 mb-4">{reviewing.productName} - {reviewing.schoolName}</p>

            {action === 'approved' && (
              <div className="space-y-3 mb-3">
                <div><label className="label">قیمت بازار (ریال)</label><input type="number" value={market || ''} onChange={(e) => setMarket(Number(e.target.value))} className="input" dir="ltr" /></div>
                <div><label className="label">قیمت فروشگاه (ریال)</label><input type="number" value={our || ''} onChange={(e) => setOur(Number(e.target.value))} className="input" dir="ltr" /></div>
                <div><label className="label">موجودی اولیه</label><input type="number" value={stock || ''} onChange={(e) => setStock(Number(e.target.value))} className="input" dir="ltr" /></div>
              </div>
            )}
            <div><label className="label">یادداشت</label><textarea value={note} onChange={(e) => setNote(e.target.value)} className="input min-h-[60px]" /></div>
            <div className="flex gap-2 mt-4">
              <button onClick={confirm} className="btn-primary flex-1 py-3"><Save className="w-4 h-4" /> تأیید</button>
              <button onClick={() => setReviewing(null)} className="btn-ghost flex-1 py-3">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
