import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Package } from 'lucide-react'
import type { Product } from '../lib/types'
import { formatToman, formatTomanShort, discountPercent, savedAmount } from '../lib/format'
import { useCart } from '../lib/cart'
import { useToast } from '../lib/toast'
import { cn } from '../lib/cn'

export default function ProductCard({ product }: { product: Product }) {
  const { addProduct } = useCart()
  const { toast } = useToast()
  const disc = discountPercent(product.market_price, product.our_price)
  const outOfStock = product.stock_qty <= 0
  const lowStock = product.stock_qty > 0 && product.stock_qty <= product.low_stock_threshold
  const imgUrl = `https://picsum.photos/seed/${product.slug}/400/400`

  return (
    <div className="card overflow-hidden flex flex-col group hover:shadow-card-hover transition-all duration-300">
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={imgUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Package className="w-12 h-12 text-gray-200" />
        </div>
        {disc > 0 && (
          <span className="absolute top-2 right-2 chip bg-accent-500 text-white font-bold shadow-md">
            {disc}٪ ارزان‌تر
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 left-2 chip bg-error-500 text-white">ناموجود</span>
        )}
        {lowStock && (
          <span className="absolute top-2 left-2 chip bg-warning-500 text-white">رو به اتمام</span>
        )}
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-bold text-sm sm:text-base text-gray-800 leading-snug line-clamp-2 hover:text-primary-700 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mt-1">
          {product.unit}
          {product.pack_size ? ` · ${product.pack_size}` : ''}
        </p>

        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-extrabold text-primary-700">{formatTomanShort(product.our_price)}</span>
          <span className="text-xs text-gray-400">تومان</span>
        </div>
        {disc > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 line-through">{formatTomanShort(product.market_price)}</span>
            <span className="text-[11px] text-success-600 font-medium">صرفه‌جویی {formatTomanShort(savedAmount(product.market_price, product.our_price))} تومان</span>
          </div>
        )}

        <div className="mt-auto pt-3">
          {outOfStock ? (
            <button
              onClick={() => toast('info', 'این محصول فعلاً ناموجود است. به علاقه‌مندی‌ها اضافه شد.')}
              className="btn-ghost w-full py-2 text-sm text-gray-500 border border-gray-200"
            >
              خبرم کن
            </button>
          ) : (
            <button
              onClick={() => { addProduct(product); toast('success', `${product.name} به سبد اضافه شد`) }}
              className="btn-primary w-full py-2.5 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              افزودن به سبد
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
