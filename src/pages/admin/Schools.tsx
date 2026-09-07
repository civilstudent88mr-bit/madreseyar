import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { School } from '../../lib/types'
import { formatJalaliDateShort } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminSchools() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    supabase.from('schools').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setSchools(data as School[] ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = schools.filter((s) => (!filter || s.status === filter) && (!search || s.name.includes(search)))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">مدارس</h1>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`chip ${!filter ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>همه</button>
        <button onClick={() => setFilter('approved')} className={`chip ${filter === 'approved' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>تأیید شده</button>
        <button onClick={() => setFilter('pending_review')} className={`chip ${filter === 'pending_review' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>در انتظار</button>
        <button onClick={() => setFilter('rejected')} className={`chip ${filter === 'rejected' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>رد شده</button>
      </div>

      <div className="relative">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی مدرسه..." className="input pr-10 py-2.5" />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse h-40" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Building2 className="w-8 h-8" />} title="مدرسه‌ای یافت نشد" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((s) => (
            <Link key={s.id} to={`/admin/schools/${s.id}`} className="card p-4 hover:shadow-card-hover transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">{s.name}</h3>
                <span className={`chip text-[10px] ${s.status === 'approved' ? 'bg-success-100 text-success-700' : s.status === 'pending_review' ? 'bg-accent-100 text-accent-700' : 'bg-error-100 text-error-700'}`}>
                  {s.status === 'approved' ? 'تأیید شده' : s.status === 'pending_review' ? 'در انتظار' : 'رد شده'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{s.type} · {s.province} · {s.city}</p>
              <p className="text-xs text-gray-400 mt-1">ثبت: {formatJalaliDateShort(s.created_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
