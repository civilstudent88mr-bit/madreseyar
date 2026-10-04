import { useState } from 'react'
import { Save, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { useStore, type SiteContent, type FeatureCard } from '../../lib/store'
import { useToast } from '../../lib/toast'

const iconOptions = [
  { value: 'TrendingDown', label: 'روند نزولی' },
  { value: 'ShieldCheck', label: 'تضمین کیفیت' },
  { value: 'Truck', label: 'ارسال' },
  { value: 'Clock', label: 'پشتیبانی' },
  { value: 'Package', label: 'بسته' },
  { value: 'Heart', label: 'قلب' },
  { value: 'Star', label: 'ستاره' },
  { value: 'Award', label: 'تقدیر' },
]

export default function AdminContent() {
  const { content, updateContent } = useStore()
  const { toast } = useToast()
  const [draft, setDraft] = useState<SiteContent>(content)

  const set = <K extends keyof SiteContent>(key: K, val: SiteContent[K]) => setDraft((d) => ({ ...d, [key]: val }))

  const updateFeature = (id: string, field: keyof FeatureCard, val: string | boolean) =>
    setDraft((d) => ({ ...d, features: d.features.map((f) => f.id === id ? { ...f, [field]: val } : f) }))

  const addFeature = () => setDraft((d) => ({ ...d, features: [...d.features, { id: `f${Date.now()}`, icon: 'Star', title: 'ویژگی جدید', desc: 'توضیخ', show: true }] }))

  const removeFeature = (id: string) => setDraft((d) => ({ ...d, features: d.features.filter((f) => f.id !== id) }))

  const save = () => {
    updateContent(draft)
    toast('success', 'محتوا ذخیره شد و سایت به‌روزرسانی شد')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-800">محتوا و تبلیغات</h1>
        <button onClick={save} className="btn-primary py-2.5 px-5"><Save className="w-4 h-4" /> ذخیره</button>
      </div>

      <ToggleSection title="بخش هیرو (بنر اصلی)" show={draft.heroShow} onToggle={(v) => set('heroShow', v)}>
        <Field label="عنوان هیرو" value={draft.heroTitle} onChange={(v) => set('heroTitle', v)} />
        <Field label="زیرعنوان هیرو" value={draft.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} />
        <Area label="متن هیرو" value={draft.heroText} onChange={(v) => set('heroText', v)} />
        <div className="flex items-center gap-2">
          <ToggleSwitch checked={draft.heroBadgeShow} onChange={(v) => set('heroBadgeShow', v)} label="نمایش برچسب تخفیف" />
        </div>
        {draft.heroBadgeShow && <Field label="متن برچسب تخفیف" value={draft.heroBadgeText} onChange={(v) => set('heroBadgeText', v)} />}
        <div className="grid grid-cols-2 gap-3">
          <Field label="متن دکمه اول" value={draft.heroButton1Text} onChange={(v) => set('heroButton1Text', v)} />
          <Field label="متن دکمه دوم" value={draft.heroButton2Text} onChange={(v) => set('heroButton2Text', v)} />
        </div>
      </ToggleSection>

      <ToggleSection title="کارت‌های ویژگی" show={draft.featuresShow} onToggle={(v) => set('featuresShow', v)}>
        <div className="space-y-3">
          {draft.features.map((f) => (
            <div key={f.id} className="rounded-xl border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <ToggleSwitch checked={f.show} onChange={(v) => updateFeature(f.id, 'show', v)} label={f.title || 'کارت'} />
                <button onClick={() => removeFeature(f.id)} className="btn-ghost p-1 text-error-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">آیکن</label>
                  <select value={f.icon} onChange={(e) => updateFeature(f.id, 'icon', e.target.value)} className="input py-2 text-sm">
                    {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">عنوان</label>
                  <input value={f.title} onChange={(e) => updateFeature(f.id, 'title', e.target.value)} className="input py-2 text-sm" />
                </div>
              </div>
              <div><label className="label">توضیح</label><input value={f.desc} onChange={(e) => updateFeature(f.id, 'desc', e.target.value)} className="input py-2 text-sm" /></div>
            </div>
          ))}
          <button onClick={addFeature} className="btn-secondary py-2 px-3 text-sm"><Plus className="w-4 h-4" /> افزودن کارت</button>
        </div>
      </ToggleSection>

      <ToggleSection title="متن سلب مسئولیت قیمت" show={draft.priceDisclaimerShow} onToggle={(v) => set('priceDisclaimerShow', v)}>
        <Area label="متن" value={draft.priceDisclaimer} onChange={(v) => set('priceDisclaimer', v)} />
      </ToggleSection>

      <ToggleSection title="فوتر" show={draft.footerShow} onToggle={(v) => set('footerShow', v)}>
        <Field label="نام فروشگاه" value={draft.storeName} onChange={(v) => set('storeName', v)} />
        <Field label="شعار کوتاه" value={draft.slogan} onChange={(v) => set('slogan', v)} />
        <Area label="متن فوتر" value={draft.footerText} onChange={(v) => set('footerText', v)} />
      </ToggleSection>

      <button onClick={save} className="btn-primary w-full py-3"><Save className="w-4 h-4" /> ذخیره تغییرات</button>
    </div>
  )
}

function ToggleSection({ title, show, onToggle, children }: { title: string; show: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <ToggleSwitch checked={show} onChange={onToggle} label={show ? 'نمایش' : 'مخفی'} />
      </div>
      {show && <div className="space-y-3">{children}</div>}
    </div>
  )
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-2 text-sm">
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-primary-600' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
      <span className="text-gray-600 flex items-center gap-1">{checked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}{label}</span>
    </button>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="label">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} className="input" /></div>
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="label">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} className="input min-h-[70px]" /></div>
}
