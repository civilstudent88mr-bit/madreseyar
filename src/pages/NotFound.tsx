import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-primary-700 mb-2">۴۰۴</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">صفحه یافت نشد</h1>
        <p className="text-gray-500 mb-6">صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> بازگشت به خانه
        </Link>
      </div>
    </div>
  )
}
