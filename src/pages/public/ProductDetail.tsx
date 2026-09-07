import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Share2, Check, Minus, Plus, Package, TrendingDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, ProductImage, Category } from '../../lib/types'
import { formatToman, formatTomanShort, discountPercent, savedAmount } from '../../lib/format'
import { useCart } from '../../lib/cart'
import { useToast } from '../../lib/toast'
import { useAuth } from '../../lib/auth'
import { Breadcrumbs, SkeletonCard } from '../../lib/ui'
import ProductCard from '../../components/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addProduct } = useCart()
  const { toast } = useToast()
  const { session } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    ;(async () => {
      const { data: prod } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (!prod) { setLoading(false); return }
      setProduct(prod as Product)
      setQty((prod as Product).min_order_qty)
      const [{ data: imgs }, { data: cat }, { data: rel }] = await Promise.all([
        supabase.from('product_images').select('*').eq('product_id', (prod as Product).id).order('sort_order'),
        supabase.from('categories').select('*').eq('id', (prod as Product).category_id).maybeSingle(),
        supabase.from('products').select('*').eq('category_id', (prod as Product).category_id).eq('is_active', true).neq('id', (prod as Product).id).limit(4),
      ])
      setImages(imgs as ProductImage[] ?? [])
      setCategory(cat as Category | null)
      setRelated(rel as Product[] ?? [])
      setLoading(false)

      if (session?.user?.id) {
        const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', session.user.id).eq('product_id', (prod as Product).id).maybeSingle()
        setIsFav(!!fav)
      }
    })()
  }, [slug, session])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><SkeletonCard /><SkeletonCard /></div></div>
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><Package className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-700">محصول یافت نشد</h2><Link to="/catalog" className="btn-primary mt-4">بازگشت به محصولات</Link></div>
  }

  const disc = discountPercent(product.market_price, product.our_price)
  const outOfStock = product.stock_qty <= 0
  const imgUrl = images[0]?.url ?? `https://picsum.photos/seed/${product.slug}/600/600`

  const incQty = () => setQty((q) => Math.min(q + product.step_qty, product.max_order_qty, product.stock_qty))
  const decQty = () => setQty((q) => Math.max(q - product.step_qty, product.min_order_qty))

  const toggleFav = async () => {
    if (!session?.user?.id) { toast('info', 'برای افزودن به علاقه‌مندی‌ها وارد شوید'); return }
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('product_id', product.id)
      setIsFav(false)
      toast('success', 'از علاقه‌مندی‌ها حذف شد')
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, product_id: product.id })
      setIsFav(true)
      toast('success', 'به علاقه‌مندی‌ها اضافه شد')
    }
  }

  const shareLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast('success', 'لینک کپی شد') } catch { toast('error', 'کپی لینک ناموفق بود') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'محصولات', to: '/catalog' }, { label: category?.name ?? '', to: category ? `/catalog/${category.slug}` : undefined }, { label: product.name }]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Gallery */}
        <div>
          <div className="card overflow-hidden aspect-square bg-gray-50">
            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }} />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img) => (
                <img key={img.id} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <span className="text-sm text-gray-500">{product.brand}</span>}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1 mb-2">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed mb-4">{product.short_desc}</p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="chip bg-gray-100 text-gray-700">{product.unit}</span>
            {product.pack_size && <span className="chip bg-gray-100 text-gray-700">{product.pack_size}</span>}
            {product.is_hygiene && <span className="chip bg-success-100 text-success-700">بهداشتی</span>}
            {product.suitable_for?.map((l) => <span key={l} className="chip bg-primary-50 text-primary-700">{l}</span>)}
          </div>

          {/* Price comparison */}
          <div className="card p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">قیمت بازار</span>
              <span className="text-sm text-gray-400 line-through">{formatToman(product.market_price)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700 font-medium">قیمت مدرسه یار</span>
              <span className="text-2xl font-extrabold text-primary-700">{formatToman(product.our_price)}</span>
            </div>
            {disc > 0 && (
              <div className="flex items-center justify-between bg-accent-50 rounded-xl px-4 py-3">
                <span className="flex items-center gap-1.5 text-accent-700 font-bold text-sm">
                  <TrendingDown className="w-4 h-4" /> {disc}٪ ارزان‌تر از بازار
                </span>
                <span className="text-accent-700 font-bold text-sm">صرفه‌جویی {formatToman(savedAmount(product.market_price, product.our_price))}</span>
              </div>
            )}
            {/* Compare bar */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>مقایسه قیمت</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                <div className="bg-accent-400" style={{ width: `${100 - disc}%` }} />
                <div className="bg-success-500" style={{ width: `${disc}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>قیمت ما</span>
                <span>قیمت بازار</span>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-4">
            {outOfStock ? (
              <span className="chip bg-error-100 text-error-700">ناموجود</span>
            ) : product.stock_qty <= product.low_stock_threshold ? (
              <span className="chip bg-warning-100 text-warning-600">رو به اتمام (موجودی: {product.stock_qty})</span>
            ) : (
              <span className="chip bg-success-100 text-success-700">موجود</span>
            )}
          </div>

          {/* Qty + Add to cart */}
          {!outOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-300 rounded-xl">
                <button onClick={decQty} className="px-3 py-3 hover:bg-gray-50 rounded-r-xl"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-bold text-lg w-12 text-center">{qty}</span>
                <button onClick={incQty} className="px-3 py-3 hover:bg-gray-50 rounded-l-xl"><Plus className="w-4 h-4" /></button>
              </div>
              <button
                onClick={() => { addProduct(product, qty); toast('success', `${product.name} به سبد اضافه شد`) }}
                className="btn-primary flex-1 py-3.5"
              >
                <ShoppingCart className="w-5 h-5" /> افزودن به سبد
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={toggleFav} className="btn-secondary py-3 px-4">
              <Heart className={`w-5 h-5 ${isFav ? 'fill-error-500 text-error-500' : ''}`} /> علاقه‌مندی
            </button>
            <button onClick={shareLink} className="btn-secondary py-3 px-4">
              <Share2 className="w-5 h-5" /> اشتراک‌گذاری
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            قیمت بازار تقریبی فروشگاه‌های معتبر است و ممکن است کمی متفاوت باشد.
          </p>
        </div>
      </div>

      {/* Specs */}
      {Object.keys(product.specs).length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">مشخصات محصول</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <tbody>
                {Object.entries(product.specs).map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-3 text-sm text-gray-500 w-1/3">{k}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Long desc */}
      {product.long_desc && (
        <div className="mt-8">
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">توضیحات</h2>
          <div className="card p-5">
            <p className="text-gray-600 leading-relaxed">{product.long_desc}</p>
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">محصولات مرتبط</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
