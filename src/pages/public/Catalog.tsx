import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, LayoutGrid, List, Package } from 'lucide-react'
import { useStore, productSlug, type StoreProduct } from '../../lib/store'
import ProductCard from '../../components/ProductCard'
import { EmptyState, Breadcrumbs } from '../../lib/ui'
import { cn } from '../../lib/cn'
import { discountPercent, formatTomanShort } from '../../lib/format'

const sortOptions = [{ value: 'newest', label: 'جدیدترین' }, { value: 'cheapest', label: 'ارزان‌ترین' }, { value: 'discount', label: 'بیشترین تخفیف' }]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const { products, categories } = useStore()
  const categorySlug = params.get('category') || ''
  const [search, setSearch] = useState(params.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [filterInStock, setFilterInStock] = useState(false)
  const [filterDiscount, setFilterDiscount] = useState(0)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const activeCategories = categories.filter((c) => c.active).sort((a, b) => a.order - b.order)
  const activeCategory = activeCategories.find((c) => c.slug === categorySlug)

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.active)
    if (activeCategory) list = list.filter((p) => p.category === activeCategory.name)
    if (search.trim()) list = list.filter((p) => `${p.name} ${p.desc} ${p.sku}`.includes(search.trim()))
    if (filterInStock) list = list.filter((p) => p.stock > 0)
    if (filterDiscount) list = list.filter((p) => discountPercent(p.marketPrice, p.ourPrice) >= filterDiscount)
    if (priceMin) list = list.filter((p) => p.ourPrice >= Number(priceMin))
    if (priceMax) list = list.filter((p) => p.ourPrice <= Number(priceMax))
    return list.sort((a, b) => sortBy === 'cheapest' ? a.ourPrice - b.ourPrice : sortBy === 'discount' ? discountPercent(b.marketPrice, b.ourPrice) - discountPercent(a.marketPrice, a.ourPrice) : b.createdAt.localeCompare(a.createdAt))
  }, [products, activeCategory, search, filterInStock, filterDiscount, priceMin, priceMax, sortBy])

  const setCategory = (slug: string) => { const next = new URLSearchParams(params); if (slug) next.set('category', slug); else next.delete('category'); setParams(next) }

  return <div className="max-w-7xl mx-auto px-4 py-6">
    <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: activeCategory?.name ?? 'محصولات' }]} />
    <div className="flex flex-col md:flex-row gap-6">
      <aside className={cn('md:w-64 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}><div className="card p-4 space-y-5 sticky top-20">
        <div><h3 className="font-bold text-sm text-gray-800 mb-3">دسته‌بندی‌ها</h3><div className="space-y-1"><button onClick={() => setCategory('')} className={cn('w-full text-right px-3 py-2 rounded-lg text-sm', !categorySlug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>همه محصولات</button>{activeCategories.map((c) => <button key={c.id} onClick={() => setCategory(c.slug)} className={cn('w-full text-right px-3 py-2 rounded-lg text-sm flex items-center gap-2', categorySlug === c.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}><span>{c.icon}</span>{c.name}</button>)}</div></div>
        <div><h3 className="font-bold text-sm text-gray-800 mb-3">حداقل تخفیف</h3><div className="flex gap-2">{[0, 30, 40, 50].map((d) => <button key={d} onClick={() => setFilterDiscount(d)} className={cn('px-3 py-1.5 rounded-lg text-xs', filterDiscount === d ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600')}>{d === 0 ? 'همه' : `${d}٪+`}</button>)}</div></div>
        <div><h3 className="font-bold text-sm text-gray-800 mb-3">محدوده قیمت</h3><div className="flex gap-2"><input type="number" placeholder="از" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="input py-2 text-sm" /><input type="number" placeholder="تا" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="input py-2 text-sm" /></div></div>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filterInStock} onChange={(e) => setFilterInStock(e.target.checked)} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm text-gray-700">فقط موجودها</span></label>
      </div></aside>
      <div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-3 mb-4 flex-wrap"><h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{activeCategory?.name ?? 'همه محصولات'}</h1><div className="flex items-center gap-2"><button onClick={() => setShowFilters(!showFilters)} className="btn-ghost py-2 px-3 text-sm md:hidden"><SlidersHorizontal className="w-4 h-4" /> فیلترها</button><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input py-2 text-sm w-auto">{sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select><div className="hidden md:flex gap-1"><button onClick={() => setView('grid')} className={cn('btn-ghost p-2', view === 'grid' && 'bg-primary-50 text-primary-700')}><LayoutGrid className="w-4 h-4" /></button><button onClick={() => setView('list')} className={cn('btn-ghost p-2', view === 'list' && 'bg-primary-50 text-primary-700')}><List className="w-4 h-4" /></button></div></div></div>
        <div className="relative mb-4"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی محصول..." className="input pr-10 py-2.5" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></div><p className="text-sm text-gray-500 mb-4">{filtered.length} محصول یافت شد</p>
        {filtered.length === 0 ? <EmptyState icon={<Package className="w-8 h-8" />} title="محصولی یافت نشد" subtitle="فیلترها را تغییر دهید یا جستجوی دیگری امتحان کنید." /> : view === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="space-y-3">{filtered.map((p: StoreProduct) => <Link to={`/product/${productSlug(p)}`} key={p.id} className="card p-3 flex gap-4 hover:shadow-card-hover transition"><div className="flex-1"><h3 className="font-bold text-gray-800">{p.name}</h3><p className="text-xs text-gray-500 mt-1">{p.unit} · {p.packQty}</p><span className="text-lg font-extrabold text-primary-700">{formatTomanShort(p.ourPrice)} تومان</span></div></Link>)}</div>}
      </div>
    </div>
  </div>
}
