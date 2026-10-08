import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Heart, Info, Minus, Package, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Truck, TrendingDown } from 'lucide-react'
import { useStore, productSlug, toProduct } from '../../lib/store'
import { useCart } from '../../lib/cart'
import { useToast } from '../../lib/toast'
import { formatTomanShort, savedAmount, discountPercent } from '../../lib/format'
import ProductCard from '../../components/ProductCard'
import ProductImage from '../../components/ProductImage'

export default function ProductDetail() {
  const { slug } = useParams()
  const { products } = useStore()
  const { addProduct } = useCart()
  const { toast } = useToast()
  const product = useMemo(() => products.find((p) => p.active && productSlug(p) === slug), [products, slug])
  const [qty, setQty] = useState(1)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><Package className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-700">محصول یافت نشد</h2><Link to="/catalog" className="btn-primary mt-4">بازگشت به محصولات</Link></div>

  const converted = toProduct(product)
  const disc = discountPercent(product.marketPrice, product.ourPrice)
  const out = product.stock <= 0
  const related = products.filter((p) => p.active && p.category === product.category && p.id !== product.id).slice(0, 4)
  const share = async () => { try { await navigator.clipboard.writeText(window.location.href); toast('success', 'لینک کپی شد') } catch { toast('error', 'کپی لینک ناموفق بود') } }
  const addToCart = () => { addProduct(converted, qty); toast('success', `${product.name} به سبد اضافه شد`) }

  return <div className="bg-[#fffdfb] min-h-screen">
    <div className="max-w-7xl mx-auto px-4 pt-5 pb-12">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 overflow-hidden whitespace-nowrap"><Link to="/" className="hover:text-[#d8665d]">خانه</Link><ChevronLeft className="w-4 h-4" /><Link to="/catalog" className="hover:text-[#d8665d]">محصولات</Link><ChevronLeft className="w-4 h-4" /><span className="text-gray-700 truncate">{product.name}</span></div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-7 lg:gap-10 items-start">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_72px] gap-4 md:order-2">
          <div className="relative rounded-3xl border border-[#eee3dd] bg-white overflow-hidden aspect-square max-h-[580px] flex items-center justify-center"><ProductImage src={product.image} name={product.name} className="w-full h-full bg-[#fbf7f4]" /><div className="absolute top-4 right-4 flex flex-col gap-2"><button onClick={() => setLiked(!liked)} className={`w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center transition ${liked ? 'text-[#d8665d]' : 'text-gray-500'}`} aria-label="افزودن به علاقه‌مندی"><Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} /></button><button onClick={share} className="w-11 h-11 rounded-full bg-white shadow-md text-gray-500 flex items-center justify-center" aria-label="اشتراک‌گذاری"><Share2 className="w-5 h-5" /></button></div>{disc > 0 && <span className="absolute top-4 left-4 rounded-full bg-[#d8665d] text-white px-3 py-1.5 text-xs font-bold">{disc}٪ تخفیف</span>}</div>
          <div className="hidden md:flex flex-col gap-3">{[0, 1, 2].map((item) => <button key={item} className={`aspect-square rounded-xl border overflow-hidden ${item === 0 ? 'border-[#d8665d]' : 'border-[#eee3dd]'} bg-white`}><ProductImage src={product.image} name={product.name} className="w-full h-full bg-[#fbf7f4]" iconClassName="w-5 h-5" /></button>)}</div>
        </div>

        <div className="md:order-1 lg:pt-2">
          <div className="flex items-center gap-2 mb-3"><span className="rounded-full bg-[#fce8e4] text-[#b85b50] px-3 py-1 text-xs font-bold">{product.category}</span><span className="text-xs text-gray-500">کد کالا: {product.sku || 'بدون کد'}</span></div>
          <h1 className="text-2xl md:text-3xl font-black text-[#3f2c29] leading-relaxed mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm leading-7 mb-6">{product.desc}</p>
          <div className="border-t border-[#eee3dd] pt-5 mb-6"><h2 className="font-black text-[#493633] mb-3">ویژگی‌های محصول</h2><ul className="space-y-2.5 text-sm text-gray-600"><li className="flex gap-2"><Check className="w-4 h-4 text-[#d8665d] shrink-0 mt-0.5" /> مناسب برای استفاده روزانه و روتین مراقبتی</li><li className="flex gap-2"><Check className="w-4 h-4 text-[#d8665d] shrink-0 mt-0.5" /> انتخابی کاربردی با کیفیت و قیمت مناسب</li><li className="flex gap-2"><Check className="w-4 h-4 text-[#d8665d] shrink-0 mt-0.5" /> بسته‌بندی سالم و ارسال مطمئن</li></ul></div>
          <div className="flex flex-wrap gap-2 mb-7"><span className="rounded-lg bg-[#f7f2ef] px-3 py-2 text-xs text-gray-600">واحد: {product.unit}</span><span className="rounded-lg bg-[#f7f2ef] px-3 py-2 text-xs text-gray-600">بسته: {product.packQty}</span><span className={`rounded-lg px-3 py-2 text-xs font-bold ${out ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{out ? 'ناموجود' : `موجودی: ${product.stock}`}</span></div>
          <div className="hidden lg:grid grid-cols-2 gap-3 border-t border-[#eee3dd] pt-5"><Service icon={ShieldCheck} title="تضمین اصالت کالا" /><Service icon={Truck} title="ارسال سریع" /><Service icon={RotateCcw} title="ضمانت بازگشت" /><Service icon={Info} title="مشاوره خرید" /></div>
        </div>

        <aside className="md:order-3 lg:sticky lg:top-28 rounded-2xl border border-[#eaded8] bg-white p-5 shadow-lg shadow-[#7a5548]/5"><div className="flex items-center justify-between text-sm mb-4"><span className="text-gray-500">قیمت مصرف‌کننده</span>{disc > 0 && <span className="rounded-md bg-[#fce8e4] text-[#c45c52] px-2 py-1 text-xs font-bold">{disc}٪ تخفیف</span>}</div><div className="flex items-end gap-2 mb-1"><strong className="text-2xl font-black text-[#3f2c29]">{formatTomanShort(product.ourPrice)}</strong><span className="text-xs text-gray-500 mb-1">تومان</span></div>{disc > 0 && <><div className="text-xs text-gray-400 line-through mb-2">{formatTomanShort(product.marketPrice)} تومان</div><div className="text-xs text-[#5d7d5b] mb-5">{formatTomanShort(savedAmount(product.marketPrice, product.ourPrice))} تومان صرفه‌جویی شما</div></>}<div className="border-t border-[#eee3dd] pt-4">{!out && <div className="flex items-center gap-3 mb-4"><span className="text-sm text-gray-600">تعداد:</span><div className="flex items-center justify-between border border-[#dfd3cd] rounded-xl flex-1 h-11"><button onClick={() => setQty((v) => Math.max(1, v - 1))} className="px-3 h-full text-gray-500 hover:text-[#d8665d]"><Minus className="w-4 h-4" /></button><span className="font-bold">{qty}</span><button onClick={() => setQty((v) => Math.min(product.stock, v + 1))} className="px-3 h-full text-gray-500 hover:text-[#d8665d]"><Plus className="w-4 h-4" /></button></div></div>}{out ? <div className="rounded-xl bg-red-50 text-red-600 text-center py-3 text-sm font-bold">این محصول فعلاً ناموجود است</div> : <button onClick={addToCart} className="btn w-full bg-[#d8665d] hover:bg-[#be554d] text-white py-3.5 shadow-lg shadow-[#d8665d]/20"><ShoppingCart className="w-5 h-5" /> افزودن به سبد خرید</button>}</div><p className="text-[11px] text-gray-400 text-center mt-4">قیمت نهایی در سبد خرید نمایش داده می‌شود</p></aside>
      </div>

      <div className="mt-12 rounded-2xl border border-[#eee3dd] bg-white overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-6 border-b border-[#eee3dd] px-3 sm:px-8 overflow-x-auto" role="tablist" aria-label="اطلاعات محصول">
        {[
          { id: 'description', label: 'توضیحات محصول' },
          { id: 'specs', label: 'مشخصات فنی' },
          { id: 'reviews', label: 'نظرات کاربران' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as 'description' | 'specs' | 'reviews')}
            className={`py-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition ${activeTab === tab.id ? 'border-[#d8665d] text-[#d8665d]' : 'border-transparent text-gray-500 hover:text-[#d8665d]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="px-5 sm:px-8 py-6 text-sm text-gray-600 leading-8" role="tabpanel">
        {activeTab === 'description' && <p>{product.desc}. این محصول با هدف استفاده آسان در روتین روزانه انتخاب شده است. برای دریافت نتیجه بهتر، دستور مصرف درج‌شده روی بسته‌بندی را رعایت کنید و محصول را در شرایط مناسب نگهداری کنید.</p>}
        {activeTab === 'specs' && <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2"><dt className="text-gray-500">دسته‌بندی</dt><dd className="font-bold text-gray-700">{product.category}</dd></div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2"><dt className="text-gray-500">برند</dt><dd className="font-bold text-gray-700">Hansal</dd></div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2"><dt className="text-gray-500">نوع محصول</dt><dd className="font-bold text-gray-700">مکمل خوراکی</dd></div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2"><dt className="text-gray-500">بسته‌بندی</dt><dd className="font-bold text-gray-700">{product.packQty || 'طبق بسته‌بندی'}</dd></div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2"><dt className="text-gray-500">ترکیب مؤثر</dt><dd className="font-bold text-gray-700">ویتامین C</dd></div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2"><dt className="text-gray-500">کد کالا</dt><dd className="font-bold text-gray-700">{product.sku || 'بدون کد'}</dd></div>
        </dl>}
        {activeTab === 'reviews' && <div className="text-center py-4"><p className="font-bold text-gray-700">هنوز نظری برای این محصول ثبت نشده است.</p><p className="text-gray-500 mt-2">پس از خرید می‌توانید تجربه خود را با کاربران دیگر به اشتراک بگذارید.</p></div>}
      </div>
    </div>
      {related.length > 0 && <section className="mt-12"><div className="flex items-center justify-between mb-5"><h2 className="text-xl font-black text-[#3f2c29]">محصولات مرتبط</h2><Link to="/catalog" className="text-sm text-[#b85b50] font-bold flex items-center gap-1">مشاهده همه <ChevronLeft className="w-4 h-4" /></Link></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>}
    </div>
  </div>
}

function Service({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) { return <div className="flex items-center gap-2 text-xs text-gray-600"><Icon className="w-5 h-5 text-[#d8665d]" />{title}</div> }
