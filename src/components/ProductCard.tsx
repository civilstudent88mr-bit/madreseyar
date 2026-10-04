import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import type { Product } from '../lib/types'
import { type StoreProduct, toProduct, useStore } from '../lib/store'
import { formatTomanShort, discountPercent, savedAmount } from '../lib/format'
import { useCart } from '../lib/cart'
import { useToast } from '../lib/toast'
import ProductImage from './ProductImage'

export default function ProductCard({ product: source }: { product: Product | StoreProduct }) {
  const product = 'our_price' in source ? source : toProduct(source)
  const { addProduct } = useCart()
  const { toast } = useToast()
  const showMarketPrice = useStore((state) => state.appearance.showMarketPrice)
  const disc = discountPercent(product.market_price, product.our_price)
  const outOfStock = product.stock_qty <= 0
  const lowStock = product.stock_qty > 0 && product.stock_qty <= product.low_stock_threshold
  const image = 'image' in source ? source.image : product.image

  return (
    <div className="card overflow-hidden flex flex-col group hover:shadow-card-hover transition-all duration-300">
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <ProductImage src={image} name={product.name} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        {showMarketPrice && disc > 0 && <span className="absolute top-2 right-2 chip bg-accent-500 text-white font-bold shadow-md">{disc}٪ ارزان‌تر</span>}
        {outOfStock && <span className="absolute top-2 left-2 chip bg-error-500 text-white">ناموجود</span>}
        {lowStock && <span className="absolute top-2 left-2 chip bg-warning-500 text-white">رو به اتمام</span>}
      </Link>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="block"><h3 className="font-bold text-sm sm:text-base text-gray-800 leading-snug line-clamp-2 hover:text-primary-700 transition">{product.name}</h3></Link>
        <p className="text-xs text-gray-500 mt-1">{product.unit}{product.pack_size ? ` · ${product.pack_size}` : ''}</p>
        <div className="mt-3 flex items-baseline gap-2 flex-wrap"><span className="text-lg font-extrabold text-primary-700">{formatTomanShort(product.our_price)}</span><span className="text-xs text-gray-400">تومان</span></div>
        {showMarketPrice && disc > 0 && <div className="flex items-center gap-2 mt-1"><span className="text-xs text-gray-400 line-through">{formatTomanShort(product.market_price)}</span><span className="text-[11px] text-success-600 font-medium">صرفه‌جویی {formatTomanShort(savedAmount(product.market_price, product.our_price))} تومان</span></div>}
        <div className="mt-auto pt-3">
          {outOfStock ? <button onClick={() => toast('info', 'این محصول فعلاً ناموجود است.')} className="btn-ghost w-full py-2 text-sm text-gray-500 border border-gray-200"><Heart className="w-4 h-4" /> خبرم کن</button> : <button onClick={() => { addProduct(product); toast('success', `${product.name} به سبد اضافه شد`) }} className="btn-primary w-full py-2.5 text-sm"><ShoppingCart className="w-4 h-4" /> افزودن به سبد</button>}
        </div>
      </div>
    </div>
  )
}
