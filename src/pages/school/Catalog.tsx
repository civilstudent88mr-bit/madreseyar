import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, Category } from '../../lib/types'
import ProductCard from '../../components/ProductCard'
import { SkeletonCard, EmptyState } from '../../lib/ui'
import { cn } from '../../lib/cn'
import { discountPercent } from '../../lib/format'

const sortOptions = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'cheapest', label: 'ارزان‌ترین' },
  { value: 'discount', label: 'بیشترین تخفیف' },
]

export default function SchoolCatalog() {
  const [params, setParams] = useSearchParams()
  const categorySlug = params.get('category') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [filterInStock, setFilterInStock] = useState(false)

  useEffect(() => {
    ;(async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ])
      setProducts(prods as Product[] ?? [])
      setCategories(cats as Category[] ?? [])
      setLoading(false)
    })()
  }, [])

  const activeCategory = categories.find((c) => c.slug === categorySlug)

  const filtered = useMemo(() => {
    let list = [...products]
    if (activeCategory) list = list.filter((p) => p.category_id === activeCategory.id)
    if (search.trim()) list = list.filter((p) => p.name.includes(search.trim()))
    if (filterInStock) list = list.filter((p) => p.stock_qty > 0)
    if (sortBy === 'cheapest') list.sort((a, b) => a.our_price - b.our_price)
    else if (sortBy === 'discount') list.sort((a, b) => discountPercent(b.market_price, b.our_price) - discountPercent(a.market_price, a.our_price))
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [products, activeCategory, search, filterInStock, sortBy])

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params)
    if (slug) next.set('category', slug); else next.delete('category')
    setParams(next)
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-800 mb-4">کاتالوگ محصولات</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <aside className={cn('md:w-56 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}>
          <div className="card p-3 space-y-3 sticky top-20">
            <div className="space-y-1">
              <button onClick={() => setCategory('')} className={cn('w-full text-right px-3 py-2 rounded-lg text-sm transition', !categorySlug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>همه</button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.slug)} className={cn('w-full text-right px-3 py-2 rounded-lg text-sm transition', categorySlug === c.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>{c.name}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer px-3">
              <input type="checkbox" checked={filterInStock} onChange={(e) => setFilterInStock(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm text-gray-700">فقط موجودها</span>
            </label>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost py-2 px-3 text-sm md:hidden"><SlidersHorizontal className="w-4 h-4" /></button>
            <div className="relative flex-1">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="input pr-10 py-2.5" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input py-2.5 text-sm w-auto">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Search className="w-8 h-8" />} title="محصولی یافت نشد" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
