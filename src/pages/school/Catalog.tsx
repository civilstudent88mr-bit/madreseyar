import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../lib/store'
import ProductCard from '../../components/ProductCard'
import { EmptyState } from '../../lib/ui'
import { cn } from '../../lib/cn'

export default function SchoolCatalog() {
  const [params, setParams] = useSearchParams()
  const { products, categories } = useStore()
  const categorySlug = params.get('category') || ''
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [inStock, setInStock] = useState(false)
  const activeCategories = categories.filter((c) => c.active).sort((a, b) => a.order - b.order)
  const activeCategory = activeCategories.find((c) => c.slug === categorySlug)
  const visible = useMemo(() => products.filter((p) => p.active && (!activeCategory || p.category === activeCategory.name) && (!search || `${p.name} ${p.desc} ${p.sku}`.includes(search)) && (!inStock || p.stock > 0)), [products, activeCategory, search, inStock])
  const setCategory = (slug: string) => { const next = new URLSearchParams(params); if (slug) next.set('category', slug); else next.delete('category'); setParams(next) }
  return <div><h1 className="text-xl font-extrabold text-gray-800 mb-4">کاتالوگ محصولات</h1><div className="flex flex-col md:flex-row gap-4"><aside className={cn('md:w-56 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}><div className="card p-3 space-y-3 sticky top-20"><div className="space-y-1"><button onClick={() => setCategory('')} className={cn('w-full text-right px-3 py-2 rounded-lg text-sm', !categorySlug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600')}>همه</button>{activeCategories.map((c) => <button key={c.id} onClick={() => setCategory(c.slug)} className={cn('w-full text-right px-3 py-2 rounded-lg text-sm flex items-center gap-2', categorySlug === c.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600')}><span>{c.icon}</span>{c.name}</button>)}</div><label className="flex items-center gap-2 cursor-pointer px-3"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm text-gray-700">فقط موجودها</span></label></div></aside><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-4"><button onClick={() => setShowFilters(!showFilters)} className="btn-ghost py-2 px-3 text-sm md:hidden"><SlidersHorizontal className="w-4 h-4" /></button><div className="relative flex-1"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="input pr-10 py-2.5" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></div></div>{visible.length === 0 ? <EmptyState icon={<Search className="w-8 h-8" />} title="محصولی یافت نشد" /> : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{visible.map((p) => <ProductCard key={p.id} product={p} />)}</div>}</div></div></div>
}
