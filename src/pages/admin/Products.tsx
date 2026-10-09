import { useState, type ChangeEvent } from 'react'
import { Plus, Search, Edit, Trash2, Package, X, Save, Eye, EyeOff } from 'lucide-react'
import { useStore, type StoreProduct } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { formatTomanShort, formatNumber, discountPercent, formatPriceInput, parsePriceInput } from '../../lib/format'
import { EmptyState } from '../../lib/ui'
import ProductImage from '../../components/ProductImage'
import ProductDetailsFields from '../../components/admin/ProductDetailsFields'

export default function AdminProducts() {
  const { products, categories, upsertProduct, deleteProduct, adjustStock } = useStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [editing, setEditing] = useState<StoreProduct | null>(null)
  const [showForm, setShowForm] = useState(false)

  const activeCategoryNames = categories.filter((c) => c.active).map((c) => c.name)
  const filtered = products.filter((p) => (!filterCat || p.category === filterCat) && (!search || p.name.includes(search) || p.sku.includes(search)))

  const openNew = () => {
    setEditing({ id: '', name: '', sku: '', category: activeCategoryNames[0] ?? '', unit: 'عدد', packQty: '', marketPrice: 0, ourPrice: 0, stock: 0, featured: false, active: true, desc: '', tags: [], createdAt: '', specs: {} })
    setShowForm(true)
  }

  const handleImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast('error', 'فقط عکس‌های JPG، PNG یا WEBP قابل قبول هستند')
      event.target.value = ''
      return
    }
    if (file.size > 400 * 1024) {
      toast('error', 'حجم عکس باید حداکثر ۴۰۰ کیلوبایت باشد')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') setEditing((current) => current ? { ...current, image: result } : current)
    }
    reader.readAsDataURL(file)
  }

  const openEdit = (p: StoreProduct) => { setEditing({ ...p }); setShowForm(true) }

  const save = async () => {
    if (!editing || !editing.name.trim()) return
    if (![editing.marketPrice, editing.ourPrice].every((price) => Number.isFinite(price) && price >= 0)) {
      toast('error', 'قیمت‌ها باید عدد نامنفی و به تومان باشند')
      return
    }
    const localProduct = { ...editing, id: editing.id || `p${Date.now()}` }
      const response = await fetch('/api/admin-save-product', {
        method: 'POST',
        credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: localProduct }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast('error', result.error || 'ذخیره محصول در دیتابیس انجام نشد')
        return
      }
      const saved = result.product
      upsertProduct({ ...localProduct, id: saved?.id || localProduct.id, image: result.image || localProduct.image })
      toast('success', 'محصول و تصویر در دیتابیس ذخیره شد')
    setShowForm(false); setEditing(null)
  }

  const del = async (p: StoreProduct) => {
    if (!confirm(`حذف "${p.name}"؟`)) return
      const response = await fetch('/api/admin-delete-product', {
        method: 'POST',
        credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: p.id }),
      })
      if (!response.ok && response.status !== 404) {
        const result = await response.json().catch(() => ({}))
        toast('error', result.error || 'حذف محصول از دیتابیس انجام نشد')
        return
      }
    deleteProduct(p.id)
    toast('success', 'کالا از دیتابیس و سایت حذف شد')
  }

  const toggleActive = (p: StoreProduct) => {
    upsertProduct({ ...p, active: !p.active })
    toast('success', p.active ? 'کالا غیرفعال شد' : 'کالا فعال شد')
  }

  const quickStock = (p: StoreProduct, delta: number) => {
    adjustStock(p.id, delta, 'adjust', 'تنظیم سریع موجودی')
    toast('success', 'موجودی به‌روز شد')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-extrabold text-gray-800">کالاها</h1>
        <button onClick={openNew} className="btn-primary py-2.5 px-4 text-sm"><Plus className="w-4 h-4" /> کالای جدید</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="input pr-10 py-2.5" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input py-2.5 text-sm w-auto">
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package className="w-8 h-8" />} title="کالایی وجود ندارد" action={<button onClick={openNew} className="btn-primary">افزودن کالا</button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-right font-medium">نام</th>
                <th className="px-4 py-3 text-right font-medium">SKU</th>
                <th className="px-4 py-3 text-right font-medium">دسته</th>
                <th className="px-4 py-3 text-right font-medium">قیمت بازار</th>
                <th className="px-4 py-3 text-right font-medium">قیمت فروش</th>
                <th className="px-4 py-3 text-right font-medium">موجودی</th>
                <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-400 line-through">{formatTomanShort(p.marketPrice)} تومان</td>
                  <td className="px-4 py-3 font-bold text-primary-700">{formatTomanShort(p.ourPrice)} تومان</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={p.stock < 5 ? 'text-error-600 font-bold' : 'text-gray-700'}>{formatNumber(p.stock)}</span>
                      <button onClick={() => quickStock(p, 1)} className="btn-ghost p-0.5 text-xs">+</button>
                      <button onClick={() => quickStock(p, -1)} className="btn-ghost p-0.5 text-xs">−</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className={p.active ? 'text-success-600' : 'text-gray-400'} title={p.active ? 'فعال' : 'غیرفعال'}>
                      {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="btn-ghost p-1.5"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => del(p)} className="btn-ghost p-1.5 text-error-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editing.id ? 'ویرایش کالا' : 'کالای جدید'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">نام کالا</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">SKU</label><input value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} className="input" dir="ltr" /></div>
                <div><label className="label">دسته</label>
                  <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input">
                    {activeCategoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">واحد</label><input value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="input" /></div>
                <div><label className="label">بسته‌بندی</label><input value={editing.packQty} onChange={(e) => setEditing({ ...editing, packQty: e.target.value })} className="input" /></div>
                <div><label className="label">قیمت بازار (تومان)</label><input type="text" inputMode="numeric" value={editing.marketPrice ? formatPriceInput(editing.marketPrice) : ''} onChange={(e) => setEditing({ ...editing, marketPrice: parsePriceInput(e.target.value) })} className="input" dir="ltr" /></div>
                <div><label className="label">قیمت فروش (تومان) — تخفیف {formatNumber(discountPercent(editing.marketPrice, editing.ourPrice))}٪</label><input type="text" inputMode="numeric" value={editing.ourPrice ? formatPriceInput(editing.ourPrice) : ''} onChange={(e) => setEditing({ ...editing, ourPrice: parsePriceInput(e.target.value) })} className="input" dir="ltr" /></div>
                <div><label className="label">موجودی اولیه</label><input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="input" dir="ltr" /></div>
              </div>
              <div className="space-y-2">
                <label className="label">عکس کالا</label>
                <input value={editing.image ?? ''} onChange={(e) => setEditing({ ...editing, image: e.target.value || undefined })} placeholder="لینک عکس (imageUrl)" className="input" dir="ltr" />
                <div className="flex items-center gap-3">
                  <label className="btn-secondary cursor-pointer py-2 px-3 text-sm">
                    آپلود عکس
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFile} className="hidden" />
                  </label>
                  <span className="text-xs text-gray-400">JPG، PNG یا WEBP تا ۴۰۰KB</span>
                </div>
                {editing.image && <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2"><ProductImage src={editing.image} name={editing.name} className="h-20 w-20 rounded-lg" /><button type="button" onClick={() => setEditing({ ...editing, image: undefined })} className="btn-ghost text-error-600 text-sm">حذف عکس</button></div>}
              </div>
              <div><label className="label">توضیحات</label><textarea value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} className="input min-h-[60px]" /></div>
              <div><label className="label">توضیحات کامل</label><textarea value={editing.longDesc ?? ''} onChange={(e) => setEditing({ ...editing, longDesc: e.target.value })} className="input min-h-28" /></div>
              <div><label className="label">تگ‌ها (با کاما جدا کنید)</label><input value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} className="input" /></div>
              <ProductDetailsFields specs={editing.specs ?? {}} onChange={(specs) => setEditing({ ...editing, specs })} />
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm">کالای ویژه</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm">فعال (در فروشگاه نمایش داده شود)</span></label>
              <button onClick={save} className="btn-primary w-full py-3"><Save className="w-4 h-4" /> ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
