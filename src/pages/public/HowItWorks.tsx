import { Link } from 'react-router-dom'
import { Search, ShoppingCart, Truck, CheckCircle2 } from 'lucide-react'
import { Breadcrumbs } from '../../lib/ui'

export default function HowItWorks() {
  const steps = [
    { icon: Search, title: '۱. جستجو و مقایسه', desc: 'محصولات را مرور کنید، قیمت بازار را با قیمت ما مقایسه کنید و صرفه‌جویی هر محصول را ببینید.' },
    { icon: ShoppingCart, title: '۲. ثبت سفارش', desc: 'محصولات را به سبد اضافه کنید، آدرس تحویل و روش پرداخت را انتخاب کنید و سفارش ثبت کنید.' },
    { icon: CheckCircle2, title: '۳. تأیید و بسته‌بندی', desc: 'فروشنده سفارش را تأیید می‌کند و وضعیت را از پیش‌نویس تا تحویل به‌روز می‌کند.' },
    { icon: Truck, title: '۴. تحویل', desc: 'سفارش در محل مدرسه تحویل داده می‌شود. فاکتور قابل چاپ دریافت می‌کنید.' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'چگونه کار می‌کند' }]} />
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">چگونه کار می‌کند؟</h1>
      <p className="text-gray-500 mb-8">مدرسه یار راه ساده و شفافی برای تأمین لوازم مدرسه دارد</p>

      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="card p-5 flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <s.icon className="w-7 h-7 text-primary-700" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6 bg-primary-700 text-white text-center">
        <h3 className="text-xl font-bold mb-2">آماده شروع هستید؟</h3>
        <p className="text-primary-100 mb-4">همین حالا ثبت‌نام کنید و از قیمت‌های زیر بازار بهره‌مند شوید</p>
        <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 px-6 py-3">ثبت‌نام مدرسه</Link>
      </div>
    </div>
  )
}
