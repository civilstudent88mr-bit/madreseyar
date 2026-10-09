import { useState, type ChangeEvent } from 'react'
import { Plus, Tags, Trash2, Edit, X, Save, Eye, EyeOff, ArrowUp, ArrowDown, Image, Upload } from 'lucide-react'
import { useStore, type StoreCategory } from '../../lib/store'
import { useToast } from '../../lib/toast'

async function toCompressedBanner(file: File) {
  if (file.size > 12 * 1024 * 1024) throw new Error('حجم تصویر باید کمتر از ۱۲ مگابایت باشد.')
  const bitmap = await createImageBitmap(file)
  try {
    const maxBytes = 850 * 1024
    for (const scale of [1, 0.85, 0.72, 0.61, 0.52]) {
      const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height)) * scale
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('فشرده‌سازی تصویر انجام نشد.')
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      for (const quality of [0.84, 0.72, 0.6]) {
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('فشرده‌سازی تصویر انجام نشد.')), 'image/webp', quality))
        if (blob.size <= maxBytes) {
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('خواندن تصویر انجام نشد.'))
            reader.onerror = () => reject(new Error('خواندن تصویر انجام نشد.'))
            reader.readAsDataURL(blob)
          })
        }
      }
    }
  } finally {
    bitmap.close()
  }
  throw new Error('فشرده‌سازی تصویر به اندازهٔ مجاز نرسید؛ تصویر دیگری انتخاب کنید.')
}

export default function AdminCategories() {
  const { categories, products, upsertCategory, deleteCategory } = useStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState<StoreCategory | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const sorted = [...categories].sort((a, b) => a.order - b.order)

  const saveBanner = async (category: StoreCategory, file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast('error', 'فرمت‌های JPG، PNG یا WEBP مجاز هستند.'); return }
    if (file.size > 12 * 1024 * 1024) { toast('error', 'حجم تصویر باید کمتر از ۱۲ مگابایت باشد.'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast('error', 'ÙÙ‚Ø· ÙØ§ÛŒÙ„ JPGØŒ PNG ÛŒØ§ WEBP Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯'); return }
    if (file.size > 12 * 1024 * 1024) { toast('error', 'Ø­Ø¬Ù… ØªØµÙˆÛŒØ± Ø¨Ø§ÛŒØ¯ Ú©Ù…ØªØ± Ø§Ø² Û±Û² Ù…Ú¯Ø§Ø¨Ø§ÛŒØª Ø¨Ø§Ø´Ø¯'); return }

    setUploadingId(category.id)
    try {
      const image = await toCompressedBanner(file)
      const response = await fetch('/api/admin-save-category-banner', {
        method: 'POST',
        credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id, category: { name: category.name, slug: category.slug, icon: category.icon, order: category.order, active: category.active }, image }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(response.status === 401 ? 'کلید مدیریت اشتباه است؛ مقدار AI_ADMIN_SECRET را بررسی کنید.' : response.status === 503 ? 'تنظیم کلیدهای سرویس در Vercel ناقص است.' : result.error || 'آپلود در Supabase ناموفق بود؛ مخزن تصاویر را بررسی کنید.')
      upsertCategory({ ...category, id: result.categoryId, bannerUrl: result.bannerUrl })
      toast('success', 'Ø¨Ù†Ø± Ø¯Ø³ØªÙ‡ Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Ù…Ø´Ú©Ù„ Ø¯Ø± Ø°Ø®ÛŒØ±Ù‡ Ø¨Ù†Ø±')
    } finally {
      setUploadingId(null)
    }
  }

  const removeBanner = async (category: StoreCategory) => {
    if (!category.bannerUrl) return
    setUploadingId(category.id)
    try {
      const response = await fetch('/api/admin-save-category-banner', {
        method: 'POST',
        credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id, category: { name: category.name, slug: category.slug, icon: category.icon, order: category.order, active: category.active }, remove: true }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Ù†Ø´Ø¯ Ø¨Ù†Ø± Ø±Ø§ Ø­Ø°Ù Ú©Ø±Ø¯')
      upsertCategory({ ...category, id: result.categoryId, bannerUrl: undefined })
      toast('success', 'Ø¨Ù†Ø± Ø¯Ø³ØªÙ‡ Ø­Ø°Ù Ø´Ø¯')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Ù…Ø´Ú©Ù„ Ø¯Ø± Ø­Ø°Ù Ø¨Ù†Ø±')
    } finally {
      setUploadingId(null)
    }
  }

  const reset = () => { setEditing(null); setName(''); setSlug(''); setIcon('') }

  const save = () => {
    if (!name.trim()) { toast('error', 'نام دسته را وارد کنید'); return }
    const cat: StoreCategory = {
      id: editing?.id || `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || name.trim().replace(/\s+/g, '-'),
      icon: icon.trim(),
      order: editing?.order ?? categories.length,
      active: editing?.active ?? true,
      bannerUrl: editing?.bannerUrl,
    }
    upsertCategory(cat)
    toast('success', editing ? 'دسته ویرایش شد' : 'دسته اضافه شد')
    reset()
  }

  const startEdit = (c: StoreCategory) => {
    setEditing(c); setName(c.name); setSlug(c.slug); setIcon(c.icon)
  }

  const toggleActive = (c: StoreCategory) => {
    upsertCategory({ ...c, active: !c.active })
    toast('success', c.active ? 'دسته غیرفعال شد' : 'دسته فعال شد')
  }

  const move = (c: StoreCategory, dir: -1 | 1) => {
    const idx = sorted.findIndex((x) => x.id === c.id)
    const swapWith = sorted[idx + dir]
    if (!swapWith) return
    upsertCategory({ ...c, order: swapWith.order })
    upsertCategory({ ...swapWith, order: c.order })
  }

  const del = (c: StoreCategory) => {
    const count = products.filter((p) => p.category === c.name).length
    if (count > 0) {
      toast('error', `ابتدا کالاهای این دسته را جابه‌جا یا حذف کنید (${count} کالا)`)
      return
    }
    if (!confirm(`حذف "${c.name}"؟`)) return
    const ok = deleteCategory(c.id)
    if (ok) toast('success', 'دسته حذف شد')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800">دسته‌بندی‌ها</h1>

      <div className="card p-4 space-y-2">
        <label className="label">کلید مدیریت برای بارگذاری بنرها</label>
        <p className="text-xs text-gray-500">همان کلیدی را وارد کنید که در بخش کالاها برای ذخیرهٔ مرکزی استفاده می‌کنید.</p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{editing ? 'ویرایش دسته' : 'افزودن دسته'}</h3>
          {editing && <button onClick={reset} className="btn-ghost p-1"><X className="w-4 h-4" /></button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="label">نام دسته (فارسی)</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً نوشت‌افزار" className="input" /></div>
          <div><label className="label">نام انگلیسی (slug)</label><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="stationery" className="input" dir="ltr" /></div>
          <div><label className="label">آیکن (اموجی)</label><input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="✏️" className="input" dir="ltr" /></div>
        </div>
        <button onClick={save} className="btn-primary py-2.5 px-4 text-sm"><Save className="w-4 h-4" /> {editing ? 'ذخیره تغییرات' : 'افزودن دسته'}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((c, i) => {
          const count = products.filter((p) => p.category === c.name).length
          return (
            <div key={c.id} className={`card p-4 ${!c.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-xl">{c.icon || <Tags className="w-5 h-5 text-primary-700" />}</div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400" dir="ltr">{c.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => move(c, -1)} disabled={i === 0} className="btn-ghost p-1 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(c, 1)} disabled={i === sorted.length - 1} className="btn-ghost p-1 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{count} کالا</span>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(c)} className="btn-ghost p-1.5" title={c.active ? 'فعال' : 'غیرفعال'}>
                    {c.active ? <Eye className="w-4 h-4 text-success-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => startEdit(c)} className="btn-ghost p-1.5"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => del(c)} className="btn-ghost p-1.5 text-error-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-gray-100">
                  {c.bannerUrl ? <img src={c.bannerUrl} alt={`بنر ${c.name}`} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-gray-400"><Image className="h-6 w-6" />هنوز بنری انتخاب نشده</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="btn-secondary cursor-pointer py-2 px-3 text-xs">
                    <Upload className="h-4 w-4" /> {uploadingId === c.id ? 'در حال بارگذاری…' : c.bannerUrl ? 'تعویض بنر' : 'انتخاب بنر'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingId === c.id} onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void saveBanner(c, file); event.target.value = '' }} className="hidden" />
                  </label>
                  {c.bannerUrl && <button onClick={() => void removeBanner(c)} disabled={uploadingId === c.id} className="btn-ghost py-2 px-3 text-xs text-error-600">حذف بنر</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
