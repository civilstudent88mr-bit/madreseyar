import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, LayoutGrid, List, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, Category } from '../../lib/types'
import ProductCard from '../../components/ProductCard'
import { SkeletonCard, EmptyState, Breadcrumbs } from '../../lib/ui'
import { cn } from '../../lib/cn'
import { formatTomanShort, discountPercent } from '../../lib/format'

const sortOptions = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'cheapest', label: 'ارزان‌ترین' },
  { value: 'discount', label: 'بیشترین تخفیف' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const categorySlug = params.get('category') || ''
  const q = params.get('q') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(q)
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterInStock, setFilterInStock] = useState(false)
  const [filterDiscount, setFilterDiscount] = useState(0)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  useEffect(() => {
    (async () => {
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
    if (search.trim()) {
      const s = search.trim()
      list = list.filter((p) => p.name.includes(s) || p.short_desc?.includes(s) || p.brand?.includes(s))
    }
    if (filterLevel) list = list.filter((p) => p.suitable_for?.includes(filterLevel))
    if (filterInStock) list = list.filter((p) => p.stock_qty > 0)
    if (filterDiscount > 0) list = list.filter((p) => discountPercent(p.market_price, p.our_price) >= filterDiscount)
    if (priceMin) list = list.filter((p) => p.our_price >= parseInt(priceMin))
    if (priceMax) list = list.filter((p) => p.our_price <= parseInt(priceMax))
    if (sortBy === 'cheapest') list.sort((a, b) => a.our_price - b.our_price)
    else if (sortBy === 'discount') list.sort((a, b) => discountPercent(b.market_price, b.our_price) - discountPercent(a.market_price, a.our_price))
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [products, activeCategory, search, filterLevel, filterInStock, filterDiscount, priceMin, priceMax, sortBy])

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params)
    if (slug) next.set('category', slug); else next.delete('category')
    setParams(next)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: activeCategory ? activeCategory.name : 'محصولات' }]} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className={cn('md:w-64 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}>
          <div className="card p-4 space-y-5 sticky top-20">
            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-3">دسته‌بندی‌ها</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory('')}
                  className={cn('w-full text-right px-3 py-2 rounded-lg text-sm transition', !categorySlug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                >
                  همه محصولات
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.slug)}
                    className={cn('w-full text-right px-3 py-2 rounded-lg text-sm transition', categorySlug === c.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-3">مقاطع تحصیلی</h3>
              <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="input py-2 text-sm">
                <option value="">همه مقاطع</option>
                <option value="ابتدایی">ابتدایی</option>
                <option value="متوسطه اول">متوسطه اول</option>
                <option value="متوسطه دوم">متوسطه دوم</option>
                <option value="هنرستان">هنرستان</option>
              </select>
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-3">حداقل تخفیف</h3>
              <div className="flex gap-2">
                {[0, 30, 40, 50].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDiscount(d)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition', filterDiscount === d ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                  >
                    {d === 0 ? 'همه' : `${d}٪+`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-3">محدوده قیمت (تومان)</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="از" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="input py-2 text-sm" />
                <input type="number" placeholder="تا" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="input py-2 text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filterInStock} onChange={(e) => setFilterInStock(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm text-gray-700">فقط موجودها</span>
            </label>
          </div>
        </aside>

        {/* Main grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">
              {activeCategory ? activeCategory.name : 'همه محصولات'}
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost py-2 px-3 text-sm md:hidden">
                <SlidersHorizontal className="w-4 h-4" /> فیلترها
              </button>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input py-2 text-sm w-auto">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="hidden md:flex gap-1">
                <button onClick={() => setView('grid')} className={cn('btn-ghost p-2', view === 'grid' && 'bg-primary-50 text-primary-700')}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')} className={cn('btn-ghost p-2', view === 'list' && 'bg-primary-50 text-primary-700')}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی محصول..."
              className="input pr-10 py-2.5"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <p className="text-sm text-gray-500 mb-4">{filtered.length} محصول یافت شد</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Package className="w-8 h-8" />} title="محصولی یافت نشد" subtitle="فیلترها را تغییر دهید یا جستجوی دیگری امتحان کنید." />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <Link to={`/product/${p.slug}`} key={p.id} className="card p-3 flex gap-4 hover:shadow-card-hover transition">
                  <img src={`https://picsum.photos/seed/${p.slug}/200/200`} alt={p.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{p.unit} · {p.pack_size}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-extrabold text-primary-700">{formatTomanShort(p.our_price)} <span className="text-xs text-gray-400">تومان</span></span>
                      {p.market_price > p.our_price && <span className="text-xs text-gray-400 line-through">{formatTomanShort(p.market_price)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
