import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Package, X, Save } from 'lucide-react'
import { useStore, type StoreProduct } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { formatTomanShort, formatNumber } from '../../lib/format'
import { EmptyState } from '../../lib/ui'

const categories = ['بهداشتی', 'کاغذی', 'نوشت‌افزار', 'اداری', 'پلاستیک', 'سایر']

export default function AdminProducts() {
  const { products, upsertProduct, deleteProduct, adjustStock } = useStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [editing, setEditing] = useState<StoreProduct | null>(null)
  const [showForm, setShowForm] = useState(false)

  const filtered = products.filter((p) => (!filterCat || p.category === filterCat) && (!search || p.name.includes(search) || p.sku.includes(search)))

  const openNew = () => {
    setEditing({ id: '', name: '', sku: '', category: 'بهداشتی', unit: 'عدد', packQty: '', marketPrice: 0, ourPrice: 0, stock: 0, featured: false, desc: '', tags: [] })
    setShowForm(true)
  }

  const openEdit = (p: StoreProduct) => {
    setEditing({ ...p })
    setShowForm(true)
  }

  const save = () => {
    if (!editing || !editing.name.trim()) return
    upsertProduct({ ...editing, id: editing.id || `p${Date.now()}` })
    toast('success', 'کالا ذخیره شد')
    setShowForm(false)
    setEditing(null)
  }

  const del = (p: StoreProduct) => {
    if (!confirm(`حذف "${p.name}"؟`)) return
    deleteProduct(p.id)
    toast('success', 'کالا حذف شد')
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
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
                <th className="px-4 py-3 text-right font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-400 line-through">{formatTomanShort(p.marketPrice)} ر</td>
                  <td className="px-4 py-3 font-bold text-primary-700">{formatTomanShort(p.ourPrice)} ر</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={p.stock < 5 ? 'text-error-600 font-bold' : 'text-gray-700'}>{formatNumber(p.stock)}</span>
                      <button onClick={() => quickStock(p, 1)} className="btn-ghost p-0.5 text-xs">+</button>
                      <button onClick={() => quickStock(p, -1)} className="btn-ghost p-0.5 text-xs">−</button>
                    </div>
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
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">واحد</label><input value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="input" /></div>
                <div><label className="label">بسته‌بندی</label><input value={editing.packQty} onChange={(e) => setEditing({ ...editing, packQty: e.target.value })} className="input" /></div>
                <div><label className="label">قیمت بازار (ریال)</label><input type="number" value={editing.marketPrice} onChange={(e) => setEditing({ ...editing, marketPrice: Number(e.target.value) })} className="input" dir="ltr" /></div>
                <div><label className="label">قیمت فروش (ریال)</label><input type="number" value={editing.ourPrice} onChange={(e) => setEditing({ ...editing, ourPrice: Number(e.target.value) })} className="input" dir="ltr" /></div>
                <div><label className="label">موجودی اولیه</label><input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="input" dir="ltr" /></div>
              </div>
              <div><label className="label">توضیحات</label><textarea value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} className="input min-h-[60px]" /></div>
              <div><label className="label">تگ‌ها (با کاما جدا کنید)</label><input value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} className="input" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="w-4 h-4 rounded text-primary-600" /><span className="text-sm">کالای ویژه</span></label>
              <button onClick={save} className="btn-primary w-full py-3"><Save className="w-4 h-4" /> ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
