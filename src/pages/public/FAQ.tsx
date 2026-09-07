import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Breadcrumbs } from '../../lib/ui'

const faqs = [
  { q: 'چگونه می‌توانم ثبت‌نام کنم؟', a: 'از صفحه ثبت‌نام، اطلاعات مدرسه شامل نام، نوع، استان، شهر و مشخصات مدیر را وارد کنید. پس از تأیید فروشنده، می‌توانید سفارش ثبت کنید.' },
  { q: 'قیمت‌ها چگونه محاسبه می‌شود؟', a: 'قیمت بازار تقریبی قیمت فروشگاه‌های معتبر است. قیمت مدرسه یار بین ۴۰ تا ۵۰ درصد ارزان‌تر از بازار است. صرفه‌جویی روی هر محصول و کل سفارش نمایش داده می‌شود.' },
  { q: 'حداقل سفارش چقدر است؟', a: 'حداقل مبلغ سفارش ۵۰۰٬۰۰۰ تومان است. برای سفارش‌های بالای ۵٬۰۰۰٬۰۰۰ تومان ارسال رایگان است.' },
  { q: 'روش‌های پرداخت چیست؟', a: 'کارت به کارت (با بارگذاری فیش)، پرداخت در محل هنگام تحویل، و اعتبار مدرسه (در صورت تأیید مدیر فروش).' },
  { q: 'زمان تحویل چقدر است؟', a: 'در تهران معمولاً ۱ تا ۲ روز کاری و در سایر استان‌ها ۳ تا ۵ روز کاری پس از تأیید سفارش.' },
  { q: 'اگر حسابم هنوز تأیید نشده باشد چه؟', a: 'می‌توانید محصولات را مرور کنید اما تا تأیید فروشنده امکان ثبت سفارش ندارید. معمولاً ظرف ۲۴ ساعت تأیید می‌شود.' },
  { q: 'آیا می‌توانم سفارش قبلی را تکرار کنم؟', a: 'بله، در صفحه سفارش‌های من دکمه «تکرار سفارش» وجود دارد که اقلام را به سبد اضافه می‌کند.' },
  { q: 'فاکتور رسمی دریافت می‌کنم؟', a: 'بله، برای هر سفارش فاکتور قابل چاپ با مشخصات کامل مدرسه و اقلام تولید می‌شود.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'سوالات متداول' }]} />
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">سوالات متداول</h1>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-right"
            >
              <span className="font-bold text-gray-800">{f.q}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed animate-fade-in">{f.a}</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 card p-5 bg-primary-50 border-primary-100 text-center">
        <p className="text-gray-700 mb-3">سوال دیگری دارید؟</p>
        <Link to="/contact" className="btn-primary">تماس با ما</Link>
      </div>
    </div>
  )
}
