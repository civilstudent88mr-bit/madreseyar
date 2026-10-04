import { useState, type ChangeEvent } from 'react'
import { Image, RotateCcw, Save, Upload } from 'lucide-react'
import { defaultAppearance, useStore, type AppearanceSettings } from '../../lib/store'
import { useToast } from '../../lib/toast'

export default function AdminAppearance() {
  const { appearance, updateAppearance } = useStore()
  const { toast } = useToast()
  const [draft, setDraft] = useState<AppearanceSettings>(appearance)

  const set = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const save = () => {
    updateAppearance(draft)
    toast('success', 'ظاهر اپ ذخیره شد')
  }

  const reset = () => {
    setDraft(defaultAppearance)
    updateAppearance(defaultAppearance)
    toast('success', 'ظاهر اپ به حالت پیش‌فرض برگشت')
  }

  const handleLogoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast('error', 'فقط فایل‌های JPG، PNG، WEBP یا SVG قابل قبول هستند')
      event.target.value = ''
      return
    }
    if (file.size > 200 * 1024) {
      toast('error', 'حجم لوگو باید حداکثر ۲۰۰ کیلوبایت باشد')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') set('logo', result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800">ظاهر اپ</h1>
          <p className="text-sm text-gray-500 mt-1">رنگ‌ها و عناصر قابل مشاهده فروشگاه را تنظیم کنید.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-secondary py-2.5 px-3 text-sm"><RotateCcw className="w-4 h-4" /> پیش‌فرض</button>
          <button onClick={save} className="btn-primary py-2.5 px-4 text-sm"><Save className="w-4 h-4" /> ذخیره</button>
        </div>
      </div>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold text-gray-800">رنگ‌ها</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label="رنگ اصلی" value={draft.brandColor} onChange={(value) => set('brandColor', value)} />
          <ColorField label="پس‌زمینه هیرو" value={draft.heroBgColor} onChange={(value) => set('heroBgColor', value)} />
          <ColorField label="رنگ دکمه‌ها" value={draft.buttonColor} onChange={(value) => set('buttonColor', value)} />
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <div>
          <h2 className="font-bold text-gray-800">لوگو</h2>
          <p className="text-xs text-gray-500 mt-1">لوگو در هدر فروشگاه نمایش داده می‌شود. حداکثر حجم فایل ۲۰۰ کیلوبایت است.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={draft.logo ?? ''} onChange={(event) => set('logo', event.target.value || undefined)} placeholder="لینک لوگو" className="input" dir="ltr" />
          <label className="btn-secondary cursor-pointer py-3 px-4 whitespace-nowrap"><Upload className="w-4 h-4" /> آپلود لوگو<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoFile} className="hidden" /></label>
        </div>
        {draft.logo ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <img src={draft.logo} alt="پیش‌نمایش لوگو" className="h-12 w-12 rounded-lg object-contain bg-white" />
            <button onClick={() => set('logo', undefined)} className="btn-ghost text-error-600 text-sm">حذف لوگو</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400"><Image className="w-5 h-5" /> لوگوی پیش‌فرض نمایش داده می‌شود</div>
        )}
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-bold text-gray-800 mb-3">نمایش عناصر فروشگاه</h2>
        <VisibilityToggle label="جستجوی هدر" checked={draft.showHeaderSearch} onChange={(value) => set('showHeaderSearch', value)} />
        <VisibilityToggle label="دکمه پکیج‌ها" checked={draft.showBundles} onChange={(value) => set('showBundles', value)} />
        <VisibilityToggle label="قیمت بازار در کارت کالا" checked={draft.showMarketPrice} onChange={(value) => set('showMarketPrice', value)} />
      </section>

      <button onClick={save} className="btn-primary w-full py-3"><Save className="w-4 h-4" /> ذخیره تغییرات</button>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="label">{label}</label><div className="flex items-center gap-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1" /><input value={value} onChange={(event) => onChange(event.target.value)} className="input py-2.5" dir="ltr" /></div></div>
}

function VisibilityToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right hover:bg-gray-50"><span className="text-sm text-gray-700">{label}</span><span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-primary-600' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></span></button>
}
