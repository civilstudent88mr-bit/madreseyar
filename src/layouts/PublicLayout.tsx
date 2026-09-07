import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X, User, Heart, LogOut, Package, Phone, Home } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { cn } from '../lib/cn'

export default function PublicLayout() {
  const { profile, signOut } = useAuth()
  const { lines } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cartCount = lines.reduce((s, l) => s + l.qty, 0)

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/catalog?q=${encodeURIComponent(search.trim())}`)
  }

  const dashboardLink = profile?.role === 'seller_admin' || profile?.role === 'seller_staff' ? '/admin' : '/app'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className={cn('sticky top-0 z-50 transition-all', scrolled ? 'bg-white/95 backdrop-blur shadow-card' : 'bg-white')}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-extrabold text-primary-800">مدرسه یار</span>
                <p className="text-[10px] text-gray-500 -mt-1">تأمین لوازم مدرسه</p>
              </div>
            </Link>

            <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجوی محصول..."
                  className="input pr-10 py-2.5"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/catalog" className="hidden sm:flex btn-ghost py-2">
                محصولات
              </Link>
              <Link to="/bundles" className="hidden sm:flex btn-ghost py-2">
                پکیج‌ها
              </Link>
              {profile ? (
                <>
                  <Link to={dashboardLink} className="btn-ghost py-2 relative">
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline mr-1 text-sm">پنل کاربری</span>
                  </Link>
                  {profile.role !== 'seller_admin' && profile.role !== 'seller_staff' && (
                    <Link to="/app/cart" className="btn-ghost py-2 relative">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -left-1 bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button onClick={signOut} className="btn-ghost py-2" title="خروج">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                    ورود
                  </Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm hidden sm:inline-flex">
                    ثبت‌نام مدرسه
                  </Link>
                </>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2 md:hidden">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              <form onSubmit={onSearch} className="mb-2">
                <div className="relative">
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی محصول..." className="input pr-10 py-2.5" />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </form>
              <Link to="/catalog" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"><Search className="w-4 h-4" /> همه محصولات</Link>
              <Link to="/bundles" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"><Package className="w-4 h-4" /> پکیج‌های پیشنهادی</Link>
              <Link to="/how-it-works" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"><Home className="w-4 h-4" /> چگونه کار می‌کند</Link>
              <Link to="/faq" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100">سوالات متداول</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"><Phone className="w-4 h-4" /> تماس با ما</Link>
              {!profile && (
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full mt-2">ثبت‌نام مدرسه</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-900 text-primary-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-extrabold text-white">مدرسه یار</span>
              </div>
              <p className="text-sm text-primary-200 leading-relaxed">تأمین عمده لوازم مدرسه با قیمت ۴۰ تا ۵۰ درصد ارزان‌تر از بازار برای مدیران و مسئولان خرید مدارس.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">دسترسی سریع</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/catalog" className="hover:text-white transition">محصولات</Link></li>
                <li><Link to="/bundles" className="hover:text-white transition">پکیج‌های پیشنهادی</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">چگونه کار می‌کند</Link></li>
                <li><Link to="/register" className="hover:text-white transition">ثبت‌نام مدرسه</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">پشتیبانی</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-white transition">سوالات متداول</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">تماس با ما</Link></li>
                <li><Link to="/app/support" className="hover:text-white transition">تیکت پشتیبانی</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">تماس</h4>
              <ul className="space-y-2 text-sm text-primary-200">
                <li>تلفن: ۰۲۱-۹۱۰۰۰۰۰۰</li>
                <li>واتساپ: ۰۹۱۲۰۰۰۰۰۰۰</li>
                <li>اینستاگرام: madrese_yar</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-700 mt-8 pt-6 text-center text-sm text-primary-300">
            <p>© ۱۴۰۵ مدرسه یار - تمامی حقوق محفوظ است</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
