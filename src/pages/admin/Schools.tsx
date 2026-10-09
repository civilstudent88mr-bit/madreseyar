import { useEffect, useMemo, useState } from 'react'
import { MapPin, Phone, Search, Users, RefreshCw } from 'lucide-react'
import { formatJalaliDateShort } from '../../lib/jalali'

interface Customer {
  id: string
  full_name: string
  mobile: string | null
  email: string | null
  created_at: string
  schools: null | { id: string; name: string; province: string | null; city: string | null; address: string | null; postal_code: string | null }
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin-customers', { credentials: 'same-origin', cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'دریافت فهرست مشتریان ممکن نشد')
      setCustomers(result.customers || [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'خطا در دریافت مشتریان')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return customers.filter((customer) => [customer.full_name, customer.mobile, customer.email, customer.schools?.city, customer.schools?.address].some((value) => value?.toLocaleLowerCase().includes(term)))
  }, [customers, search])

  return <div className="space-y-5" dir="rtl">
    <div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-gray-900 flex gap-2 items-center"><Users className="w-6 h-6 text-primary-700" />مشتریان</h1><p className="text-sm text-gray-500 mt-1">اطلاعات تماس و نشانی ثبت‌شده برای پردازش و ارسال سفارش‌ها.</p></div><button onClick={() => void load()} className="btn-ghost" aria-label="به‌روزرسانی"><RefreshCw className="w-4 h-4" />به‌روزرسانی</button></div>
    <div className="relative"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی نام، موبایل یا نشانی…" className="input pr-10" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></div>
    {loading ? <div className="card p-8 text-center text-gray-500">در حال دریافت مشتریان…</div> : error ? <div className="card p-6 text-center text-red-600">{error}</div> : filtered.length === 0 ? <div className="card p-8 text-center text-gray-500">مشتری‌ای برای نمایش وجود ندارد.</div> : <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {filtered.map((customer) => <article key={customer.id} className="card p-5 space-y-3">
        <div className="flex items-start justify-between gap-2"><div><h2 className="font-bold text-gray-900">{customer.full_name}</h2><p className="text-xs text-gray-500 mt-1">عضویت: {formatJalaliDateShort(customer.created_at)}</p></div><span className="chip bg-primary-50 text-primary-700">مشتری</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm"><p className="flex gap-2 items-center"><Phone className="w-4 h-4 text-primary-700" /><a dir="ltr" href={`tel:${customer.mobile || ''}`}>{customer.mobile || '—'}</a></p><p className="text-gray-600">{customer.email || ''}</p></div>
        <div className="border-t pt-3 text-sm text-gray-700"><p className="font-semibold mb-1 flex gap-2 items-center"><MapPin className="w-4 h-4 text-primary-700" />نشانی تحویل</p><p>{[customer.schools?.province, customer.schools?.city, customer.schools?.address].filter(Boolean).join('، ') || 'نشانی ثبت نشده'}</p>{customer.schools?.postal_code && <p className="text-xs text-gray-500 mt-1">کد پستی: {customer.schools.postal_code}</p>}</div>
      </article>)}
    </div>}
  </div>
}
