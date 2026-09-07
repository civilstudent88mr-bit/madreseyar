import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, TrendingDown, ArrowLeft } from 'lucide-react'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import { formatToman, formatTomanShort, savedAmount } from '../../lib/format'
import { EmptyState } from '../../lib/ui'

export default function Cart() {
  const { lines, updateQty, remove, clear } = useCart()
  const { school } = useAuth()
  const navigate = useNavigate()

  const subtotal = lines.reduce((s, l) => {
    if (l.product) return s + l.product.our_price * l.qty
    if (l.bundle) return s + l.bundle.our_total * l.qty
    return s
  }, 0)

  const marketTotal = lines.reduce((s, l) => {
    if (l.product) return s + l.product.market_price * l.qty
    if (l.bundle) return s + l.bundle.market_total * l.qty
    return s
  }, 0)

  const totalSaved = marketTotal - subtotal

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="w-8 h-8" />}
        title="سبد خرید خالی است"
        subtitle="محصولات را از کاتالوگ انتخاب کنید"
        action={<Link to="/app/catalog" className="btn-primary">مشاهده کاتالوگ</Link>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-800">سبد خرید</h1>
        <button onClick={clear} className="text-sm text-error-600 hover:text-error-700">پاک کردن سبد</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {lines.map((l) => {
            const name = l.product?.name ?? l.bundle?.name ?? ''
            const slug = l.product?.slug
            const ourPrice = l.product?.our_price ?? l.bundle?.our_total ?? 0
            const marketPrice = l.product?.market_price ?? l.bundle?.market_total ?? 0
            const img = l.product ? `https://picsum.photos/seed/${l.product.slug}/200/200` : `https://picsum.photos/seed/${l.bundle?.slug}/200/200`
            return (
              <div key={l.id} className="card p-3 flex items-center gap-3">
                <Link to={slug ? `/product/${slug}` : '#'} className="flex-shrink-0">
                  <img src={img} alt={name} className="w-16 h-16 rounded-lg object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={slug ? `/product/${slug}` : '#'} className="font-bold text-sm text-gray-800 hover:text-primary-700 truncate block">{name}</Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold text-primary-700 text-sm">{formatTomanShort(ourPrice)} ت</span>
                    {marketPrice > ourPrice && <span className="text-xs text-gray-400 line-through">{formatTomanShort(marketPrice)}</span>}
                  </div>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => updateQty(l.id, l.qty - 1)} className="px-2 py-2 hover:bg-gray-50 rounded-r-lg"><Minus className="w-4 h-4" /></button>
                  <span className="px-3 font-bold text-sm w-8 text-center">{l.qty}</span>
                  <button onClick={() => updateQty(l.id, l.qty + 1)} className="px-2 py-2 hover:bg-gray-50 rounded-l-lg"><Plus className="w-4 h-4" /></button>
                </div>
                <p className="font-bold text-sm text-gray-800 w-20 text-left hidden sm:block">{formatTomanShort(ourPrice * l.qty)}</p>
                <button onClick={() => remove(l.id)} className="text-error-500 hover:text-error-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <div className="card p-5 space-y-3 sticky top-20">
            <h3 className="font-bold text-gray-800">خلاصه سفارش</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">قیمت بازار</span>
              <span className="text-gray-400 line-through">{formatTomanShort(marketTotal)} ت</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">قیمت مدرسه یار</span>
              <span className="font-bold text-primary-700">{formatTomanShort(subtotal)} ت</span>
            </div>
            <div className="flex justify-between bg-success-50 rounded-xl px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-success-700 font-bold text-sm"><TrendingDown className="w-4 h-4" /> صرفه‌جویی شما</span>
              <span className="font-bold text-success-700">{formatTomanShort(totalSaved)} ت</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold text-gray-800">مبلغ قابل پرداخت</span>
              <span className="font-extrabold text-lg text-primary-700">{formatTomanShort(subtotal)} ت</span>
            </div>
            {school?.status !== 'approved' ? (
              <div className="bg-accent-50 border border-accent-200 rounded-xl px-3 py-2.5 text-center text-sm text-accent-800">
                حساب شما در انتظار تأیید است
              </div>
            ) : (
              <button onClick={() => navigate('/app/checkout')} className="btn-primary w-full py-3.5">
                ادامه و ثبت سفارش <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Link to="/app/catalog" className="btn-ghost w-full text-sm">ادامه خرید</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
