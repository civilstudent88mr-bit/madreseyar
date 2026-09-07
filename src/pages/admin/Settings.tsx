import { useState } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { useStore } from '../../lib/store'
import { useToast } from '../../lib/toast'

export default function AdminSettings() {
  const { settings, updateSettings } = useStore()
  const { toast } = useToast()
  const [form, setForm] = useState(settings)

  const set = (k: string, v: any) => setForm({ ...form, [k]: v })

  const save = () => {
    updateSettings(form)
    toast('success', 'تنظیمات ذخیره شد')
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-primary-700" /> تنظیمات اپ</h1>

      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-800">اطلاعات فروشگاه</h3>
        <div><label className="label">نام فروشگاه</label><input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} className="input" /></div>
        <div><label className="label">شعار</label><input value={form.slogan} onChange={(e) => set('slogan', e.target.value)} className="input" /></div>
        <div><label className="label">تلفن پشتیبانی</label><input value={form.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} className="input" dir="ltr" /></div>
        <div><label className="label">شهرهای خدمت</label><textarea value={form.cities} onChange={(e) => set('cities', e.target.value)} className="input min-h-[60px]" /></div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-800">تنظیمات سفارش و قیمت</h3>
        <div><label className="label">حداقل مبلغ سفارش (ریال)</label><input type="number" value={form.minOrderAmount} onChange={(e) => set('minOrderAmount', Number(e.target.value))} className="input" dir="ltr" /></div>
        <div><label className="label">درصد تخفیف پیش‌فرض</label><input type="number" value={form.defaultDiscountPercent} onChange={(e) => set('defaultDiscountPercent', Number(e.target.value))} className="input" dir="ltr" /></div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.showMarketPrice} onChange={(e) => set('showMarketPrice', e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
          <span className="text-sm text-gray-700">نمایش قیمت بازار</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.allowSchoolSubmissions} onChange={(e) => set('allowSchoolSubmissions', e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
          <span className="text-sm text-gray-700">فعال بودن ثبت کالای پیشنهادی توسط مدیر مدرسه</span>
        </label>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-800">ارسال و متن‌ها</h3>
        <div>
          <label className="label">بازه‌های ارسال</label>
          <div className="flex flex-wrap gap-2">
            {['صبح (۸-۱۲)', 'ظهر (۱۲-۱۶)', 'عصر (۱۶-۲۰)'].map((slot) => (
              <button key={slot} onClick={() => set('deliverySlots', form.deliverySlots.includes(slot) ? form.deliverySlots.filter((s) => s !== slot) : [...form.deliverySlots, slot])}
                className={`chip ${form.deliverySlots.includes(slot) ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>{slot}</button>
            ))}
          </div>
        </div>
        <div><label className="label">متن سلب مسئولیت قیمت</label><textarea value={form.priceDisclaimer} onChange={(e) => set('priceDisclaimer', e.target.value)} className="input min-h-[60px]" /></div>
      </div>

      <button onClick={save} className="btn-primary py-3"><Save className="w-4 h-4" /> ذخیره تنظیمات</button>
    </div>
  )
}
