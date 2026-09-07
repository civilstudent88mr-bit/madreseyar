import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingDown, ShieldCheck, Truck, Clock, Package, Search, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, Category, Announcement } from '../../lib/types'
import ProductCard from '../../components/ProductCard'
import { formatToman } from '../../lib/format'

export default function Landing() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: cats }, { data: anns }] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).limit(8),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
      ])
      setFeatured(prods as Product[] ?? [])
      setCategories(cats as Category[] ?? [])
      setAnnouncements(anns as Announcement[] ?? [])
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-bl from-primary-700 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="chip bg-accent-400/20 text-accent-200 border border-accent-300/30 mb-4">
              <TrendingDown className="w-3.5 h-3.5" /> ۴۰ تا ۵۰٪ ارزان‌تر از بازار
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              خرید عمده لوازم مدرسه<br />
              <span className="text-accent-300">با قیمت زیر بازار</span>
            </h1>
            <p className="text-base md:text-lg text-primary-100 leading-relaxed mb-8">
              مدرسه یار منبع مطمئن تأمین لوازم بهداشتی، نوشت‌افزار و اداری برای مدارس است.
              قیمت بازار را با هم مقایسه کنید و سفارش خود را مستقیم ثبت کنید.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog" className="btn bg-white text-primary-700 hover:bg-primary-50 px-6 py-3.5 text-base">
                مشاهده محصولات <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn border-2 border-white/30 text-white hover:bg-white/10 px-6 py-3.5 text-base">
                ثبت‌نام مدرسه
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="bg-accent-50 border-b border-accent-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-start gap-3">
              <Megaphone className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {announcements.map((a) => (
                  <div key={a.id}>
                    <span className="font-bold text-accent-800 text-sm">{a.title}:</span>{' '}
                    <span className="text-accent-700 text-sm">{a.body}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingDown, title: '۴۰-۵۰٪ ارزان‌تر', desc: 'از قیمت بازار' },
            { icon: ShieldCheck, title: 'کیفیت تضمینی', desc: 'محصولات استاندارد' },
            { icon: Truck, title: 'ارسال سریع', desc: 'به سراسر کشور' },
            { icon: Clock, title: 'پشتیبانی', desc: 'پاسخگویی سریع' },
          ].map((b, i) => (
            <div key={i} className="card p-5 text-center hover:shadow-card-hover transition">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                <b.icon className="w-6 h-6 text-primary-700" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">{b.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">دسته‌بندی محصولات</h2>
          <Link to="/catalog" className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1">
            همه محصولات <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog/${cat.slug}`}
              className="card p-4 md:p-5 hover:shadow-card-hover transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-3 group-hover:bg-primary-200 transition">
                <Package className="w-6 h-6 text-primary-700" />
              </div>
              <h3 className="font-bold text-sm md:text-base text-gray-800 leading-snug">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">پیشنهادهای ویژه</h2>
          <Link to="/catalog" className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1">
            مشاهده همه <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="skeleton w-full aspect-square" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 mb-8 text-center">چگونه کار می‌کند؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '۱', title: 'ثبت‌نام مدرسه', desc: 'اطلاعات مدرسه را وارد کنید و منتظر تأیید فروشنده بمانید.' },
              { n: '۲', title: 'انتخاب محصولات', desc: 'محصولات را با قیمت بازار مقایسه کنید و به سبد اضافه کنید.' },
              { n: '۳', title: 'ثبت سفارش', desc: 'سفارش را ثبت کنید و در محل تحویل بگیرید یا کارت به کارت پرداخت کنید.' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 font-extrabold text-xl flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honesty note */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="card p-5 bg-primary-50 border-primary-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-800 leading-relaxed">
            قیمت بازار تقریبی فروشگاه‌های معتبر است و ممکن است کمی متفاوت باشد. ما تلاش می‌کنیم همیشه شفاف و صادق باشیم.
          </p>
        </div>
      </section>
    </div>
  )
}

import { Megaphone } from 'lucide-react'
