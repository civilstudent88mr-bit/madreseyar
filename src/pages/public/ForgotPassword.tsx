import { Link } from 'react-router-dom'
import { KeyRound, MessageCircle } from 'lucide-react'

export default function ForgotPassword() {
  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8" dir="rtl">
    <section className="card w-full max-w-md p-7 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto"><KeyRound className="w-7 h-7" /></div>
      <h1 className="text-xl font-extrabold text-gray-900">بازیابی گذرواژه</h1>
      <p className="text-sm leading-7 text-gray-600">برای حفاظت از حساب شما، بازیابی با پیامک فقط پس از فعال‌سازی سرویس تأیید شماره ممکن است. در حال حاضر کد آزمایشی ارسال نمی‌کنیم. برای بازیابی امن حساب با پشتیبانی تماس بگیرید.</p>
      <div className="flex flex-wrap justify-center gap-3"><Link to="/contact" className="btn-primary py-3"><MessageCircle className="w-4 h-4" />تماس با پشتیبانی</Link><Link to="/login" className="btn-ghost py-3">بازگشت به ورود</Link></div>
    </section>
  </div>
}
