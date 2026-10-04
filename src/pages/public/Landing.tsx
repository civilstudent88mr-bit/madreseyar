import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, Clock, Heart, Instagram, Megaphone, Package, Search, ShieldCheck, Sparkles, Star, Truck, TrendingDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Announcement } from '../../lib/types'
import { useStore, type StoreProduct } from '../../lib/store'
import ProductCard from '../../components/ProductCard'

const featureIcons = { TrendingDown, ShieldCheck, Truck, Clock, Package, Heart, Star }

const heroImage = 'https://images.pexels.com/photos/8015898/pexels-photo-8015898.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800'
const skincareImage = 'https://images.pexels.com/photos/6690234/pexels-photo-6690234.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200'
const makeupImage = 'https://images.pexels.com/photos/7256118/pexels-photo-7256118.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200'
const wellnessImage = 'https://images.pexels.com/photos/8102021/pexels-photo-8102021.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200'

export default function Landing() {
  const { products, categories, content } = useStore()
  const featured: StoreProduct[] = products.filter((p) => p.active && p.featured).slice(0, 8)
  const activeCategories = categories.filter((c) => c.active).sort((a, b) => a.order - b.order)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3).then(({ data }) => setAnnouncements(data as Announcement[] ?? []))
  }, [])

  return (
    <div className="bg-[#fffdfb]">
      {announcements.length > 0 && (
        <div className="bg-[#f6c7b7] text-[#623a32] border-b border-[#edb09f]">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
            <Megaphone className="w-4 h-4" />
            <span className="font-bold">{announcements[0].title}:</span><span>{announcements[0].body}</span>
          </div>
        </div>
      )}

      {content.heroShow && (
        <section className="relative overflow-hidden bg-[#f3e6dc]">
          <div className="absolute inset-0 bg-gradient-to-l from-[#f3e6dc]/95 via-[#f3e6dc]/45 to-transparent z-10" />
          <img src={heroImage} alt="محصولات مراقبت از پوست" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 sm:py-20 md:py-28 min-h-[430px] flex items-center">
            <div className="max-w-xl mr-auto text-right">
              {content.heroBadgeShow && <span className="inline-flex items-center gap-2 rounded-full bg-white/85 text-[#b85b50] px-4 py-2 text-xs font-bold shadow-sm mb-5"><Sparkles className="w-4 h-4" /> {content.heroBadgeText}</span>}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-[#3f2c29] leading-[1.25] mb-5">زیبایی تو،<br /><span className="text-[#d76d62]">انتخاب درمابازار</span></h1>
              <p className="text-[#644b45] text-sm sm:text-base md:text-lg leading-8 max-w-lg mb-7">محصولات اصل مراقبت از پوست، آرایشی و بهداشتی را با خیال راحت انتخاب کن و با بهترین قیمت تحویل بگیر.</p>
              <div className="flex flex-wrap gap-3 justify-start">
                <Link to="/catalog" className="btn bg-[#d8665d] hover:bg-[#be554d] text-white px-7 py-3.5 shadow-lg shadow-[#d8665d]/20">مشاهده محصولات <ArrowLeft className="w-5 h-5" /></Link>
                <Link to="/bundles" className="btn bg-white/90 text-[#6d4942] border border-white px-7 py-3.5">پکیج‌های ویژه</Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-1.5"><span className="w-7 h-2 rounded-full bg-[#d8665d]" /><span className="w-2 h-2 rounded-full bg-white/80" /><span className="w-2 h-2 rounded-full bg-white/80" /></div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 -mt-7 relative z-30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl bg-white p-3 sm:p-4 shadow-xl shadow-[#7a5548]/10 border border-[#f1e7e1]">
          {[{ icon: ShieldCheck, title: 'تضمین اصالت', desc: 'خرید مطمئن' }, { icon: Truck, title: 'ارسال سریع', desc: 'به سراسر کشور' }, { icon: TrendingDown, title: 'قیمت اقتصادی', desc: 'تخفیف همیشگی' }, { icon: Heart, title: 'پشتیبانی همراه', desc: 'در کنار شما' }].map(({ icon: Icon, title, desc }) => <div key={title} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-l last:border-l-0 border-[#eee2dc]"><div className="w-10 h-10 rounded-full bg-[#fce8e4] text-[#d8665d] flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5" /></div><div><p className="text-xs sm:text-sm font-bold text-[#493633]">{title}</p><p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{desc}</p></div></div>)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-14 pb-10">
        <div className="flex items-end justify-between mb-5"><div><span className="text-xs font-bold text-[#d8665d]">انتخابی برای هر سلیقه</span><h2 className="text-2xl md:text-3xl font-black text-[#3f2c29] mt-1">دسته‌بندی محصولات</h2></div><Link to="/catalog" className="text-sm font-bold text-[#b65b51] flex items-center gap-1">همه محصولات <ArrowLeft className="w-4 h-4" /></Link></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {activeCategories.slice(0, 4).map((cat, index) => { const images = [skincareImage, makeupImage, wellnessImage, heroImage]; return <Link key={cat.id} to={`/catalog?category=${cat.slug}`} className="group relative h-36 sm:h-48 rounded-2xl overflow-hidden shadow-sm"><img src={images[index % images.length]} alt={cat.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" /><div className="absolute bottom-0 right-0 p-4 text-white"><span className="text-2xl">{cat.icon}</span><h3 className="font-black mt-1">{cat.name}</h3></div></Link> })}
        </div>
      </section>

      <section className="bg-[#edf3ec] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6"><div><span className="text-xs font-bold text-[#718f6e]">منتخب این هفته</span><h2 className="text-2xl md:text-3xl font-black text-[#344435] mt-1">پرفروش‌ترین‌ها</h2></div><Link to="/catalog" className="text-sm font-bold text-[#5d7d5b] flex items-center gap-1">مشاهده همه <ArrowLeft className="w-4 h-4" /></Link></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14"><div className="rounded-3xl overflow-hidden min-h-[230px] relative bg-[#e7c2a4]"><img src={makeupImage} alt="پیشنهاد ویژه آرایشی" className="absolute inset-0 w-full h-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-l from-[#f4dcc9] via-[#f4dcc9]/75 to-transparent" /><div className="relative p-8 sm:p-12 max-w-lg"><span className="text-xs font-bold text-[#bd6758]">پیشنهاد ویژه درمابازار</span><h2 className="text-2xl sm:text-3xl font-black text-[#4b3129] mt-2 mb-3">برای روتین زیبایی‌ات<br />یک انتخاب تازه بساز</h2><Link to="/catalog" className="btn bg-[#4b3129] text-white px-5 py-2.5">خرید کنید <ArrowLeft className="w-4 h-4" /></Link></div></div></section>

      {content.featuresShow && content.features.some((feature) => feature.show) && <section className="max-w-7xl mx-auto px-4 pb-14"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{content.features.filter((feature) => feature.show).map((feature) => { const Icon = featureIcons[feature.icon as keyof typeof featureIcons] ?? Package; return <div key={feature.id} className="bg-white rounded-2xl p-4 text-center border border-[#f0e5df]"><div className="w-11 h-11 rounded-full bg-[#fce8e4] text-[#d8665d] flex items-center justify-center mx-auto mb-3"><Icon className="w-5 h-5" /></div><h3 className="font-bold text-sm text-[#493633]">{feature.title}</h3><p className="text-xs text-gray-500 mt-1">{feature.desc}</p></div> })}</div></section>}

      <section className="bg-[#3f2c29] text-white"><div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6"><div><p className="text-[#f5b6a9] text-sm font-bold mb-2">همراه همیشگی روتین زیبایی تو</p><h2 className="text-2xl font-black">با درمابازار زیباتر انتخاب کن</h2></div><Link to="/register" className="btn bg-[#d8665d] hover:bg-[#be554d] text-white px-7 py-3">عضویت در درمابازار <ArrowLeft className="w-5 h-5" /></Link></div></section>
    </div>
  )
}
