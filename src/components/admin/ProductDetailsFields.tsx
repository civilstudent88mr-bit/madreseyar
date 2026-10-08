import { Plus, Trash2 } from 'lucide-react'

type Ingredient = {
  name: string
  amount_per_serving: string
  daily_value_percent: string
}

type ProductSpecs = Record<string, unknown>

const textFields = [
  { key: 'english_name', label: 'نام انگلیسی محصول' },
  { key: 'product_id', label: 'شناسه محصول / کد مرجع' },
  { key: 'product_type', label: 'نوع محصول' },
  { key: 'manufacturer_country', label: 'کشور سازنده' },
  { key: 'expiry', label: 'تاریخ انقضا (در صورت مشخص بودن)' },
  { key: 'licensing_info', label: 'مجوز و پروانه بهداشتی' },
  { key: 'quality_review', label: 'تأیید یا بررسی کیفیت' },
  { key: 'authenticity_info', label: 'اطلاعات اصالت کالا' },
  { key: 'shipping_info', label: 'اطلاعات ارسال کالا' },
  { key: 'payment_options', label: 'شرایط پرداخت / اقساط' },
]

const longTextFields = [
  { key: 'usage', label: 'نحوه مصرف' },
  { key: 'warnings', label: 'هشدار مصرف' },
  { key: 'side_effects', label: 'عوارض جانبی' },
  { key: 'interactions', label: 'تداخلات' },
  { key: 'storage', label: 'شرایط نگهداری' },
]

function getText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function getList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function getIngredients(value: unknown): Ingredient[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object')).map((item) => ({
    name: getText(item.name),
    amount_per_serving: getText(item.amount_per_serving),
    daily_value_percent: getText(item.daily_value_percent),
  }))
}

export default function ProductDetailsFields({ specs, onChange }: { specs: ProductSpecs; onChange: (specs: ProductSpecs) => void }) {
  const update = (key: string, value: unknown) => onChange({ ...specs, [key]: value })
  const ingredients = getIngredients(specs.ingredients)

  return (
    <section className="space-y-4 border-t border-gray-200 pt-4">
      <div>
        <h3 className="font-bold text-gray-800">اطلاعات تکمیلی صفحهٔ کالا</h3>
        <p className="text-xs text-gray-500 mt-1">این موارد در تب‌های مشخصات، مصرف، هشدارها، نگهداری و ترکیبات نمایش داده می‌شوند. موارد نامعلوم را خالی بگذارید.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {textFields.map(({ key, label }) => <div key={key}>
          <label className="label">{label}</label>
          <input value={getText(specs[key])} onChange={(event) => update(key, event.target.value)} className="input" />
        </div>)}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">ویژگی‌های محصول (هر مورد در یک خط)</label>
          <textarea value={getList(specs.features).join('\n')} onChange={(event) => update('features', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} className="input min-h-24" />
        </div>
        <div>
          <label className="label">برچسب‌ها (هر مورد در یک خط)</label>
          <textarea value={getList(specs.tags).join('\n')} onChange={(event) => update('tags', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} className="input min-h-24" />
        </div>
      </div>

      {longTextFields.map(({ key, label }) => <div key={key}>
        <label className="label">{label}</label>
        <textarea value={getText(specs[key])} onChange={(event) => update(key, event.target.value)} className="input min-h-20" />
      </div>)}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div><h4 className="font-bold text-gray-700">ترکیبات و مقدار مصرف</h4><p className="text-xs text-gray-500">درصد نیاز روزانه را فقط در صورت درج روی برچسب وارد کنید.</p></div>
          <button type="button" onClick={() => update('ingredients', [...ingredients, { name: '', amount_per_serving: '', daily_value_percent: '' }])} className="btn-secondary py-2 px-3 text-sm"><Plus className="w-4 h-4" /> افزودن ترکیب</button>
        </div>
        {ingredients.map((ingredient, index) => <div key={index} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end rounded-xl bg-gray-50 p-3">
          <div><label className="label">نام ترکیب</label><input value={ingredient.name} onChange={(event) => update('ingredients', ingredients.map((item, row) => row === index ? { ...item, name: event.target.value } : item))} className="input" /></div>
          <div><label className="label">مقدار در هر وعده</label><input value={ingredient.amount_per_serving} onChange={(event) => update('ingredients', ingredients.map((item, row) => row === index ? { ...item, amount_per_serving: event.target.value } : item))} className="input" /></div>
          <div><label className="label">درصد نیاز روزانه</label><input value={ingredient.daily_value_percent} onChange={(event) => update('ingredients', ingredients.map((item, row) => row === index ? { ...item, daily_value_percent: event.target.value } : item))} className="input" /></div>
          <button type="button" onClick={() => update('ingredients', ingredients.filter((_, row) => row !== index))} className="btn-ghost text-error-600 p-2" aria-label="حذف ترکیب"><Trash2 className="w-4 h-4" /></button>
        </div>)}
        {ingredients.length === 0 && <p className="text-xs text-gray-400">ترکیبی ثبت نشده است.</p>}
      </div>
    </section>
  )
}
