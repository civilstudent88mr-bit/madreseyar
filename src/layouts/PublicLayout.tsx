import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X, User, LogOut, Package, Phone, Instagram, Heart, ChevronDown } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { cn } from '../lib/cn'
import { useStore } from '../lib/store'

export default function PublicLayout() {
  const { user, signOut } = useAuth()
  const { lines } = useCart()
  const { content, appearance, categories } = useStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 10); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll) }, [])
  const cartCount = lines.reduce((s, l) => s + l.qty, 0)
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); if (search.trim()) navigate(`/catalog?q=${encodeURIComponent(search.trim())}`) }
  const dashboardLink = user?.role === 'admin' ? '/admin' : '/app'
  const handleSignOut = () => { signOut(); navigate('/') }
  return <div className="min-h-screen flex flex-col bg-[#fffdfb]">
    <div className="bg-[#3f2c29] text-white text-center text-xs py-2">ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان <span className="text-[#f5b6a9] mx-2">|</span> تضمین اصالت محصولات</div>
    <header className={cn('sticky top-0 z-50 bg-white transition-all', scrolled && 'shadow-md')}>
      <div className="max-w-7xl mx-auto px-4"><div className="flex items-center gap-4 h-[74px]">
        <Link to="/" className="flex items-center gap-2 shrink-0"><div className="w-11 h-11 rounded-full bg-[#fce8e4] text-[#d8665d] flex items-center justify-center"><SparkleLogo /></div><div><span className="text-xl font-black text-[#3f2c29]">{content.storeName}</span><p className="text-[10px] text-gray-500 -mt-1 hidden sm:block">{content.slogan}</p></div></Link>
        {appearance.showHeaderSearch && <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl mx-auto"><div className="relative w-full"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو در درمابازار..." className="w-full rounded-full border border-[#eadfd9] bg-[#faf8f6] py-3 pr-12 pl-5 text-sm outline-none focus:border-[#d8665d]" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d8665d]" /></div></form>}
        <div className="flex items-center gap-1 sm:gap-2 mr-auto"><Link to="/catalog" className="hidden lg:flex btn-ghost text-sm">محصولات</Link>{user ? <><Link to={dashboardLink} className="btn-ghost p-2" title="حساب کاربری"><User className="w-5 h-5" /></Link>{user.role !== 'admin' && <Link to="/app/cart" className="btn-ghost p-2 relative"><ShoppingCart className="w-5 h-5" />{cartCount > 0 && <span className="absolute -top-1 -left-1 bg-[#d8665d] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}</Link>}<button onClick={handleSignOut} className="btn-ghost p-2"><LogOut className="w-5 h-5" /></button></> : <><Link to="/login" className="hidden sm:flex btn-secondary text-sm py-2.5">ورود</Link><Link to="/register" className="btn-primary text-sm py-2.5 px-4">ثبت‌نام</Link></>}<button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2 md:hidden">{menuOpen ? <X /> : <Menu />}</button></div>
      </div></div>
      <nav className="hidden md:block border-t border-[#f2e8e3]"><div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 h-11 text-sm font-bold text-[#59443d]"><Link to="/catalog" className="hover:text-[#d8665d]">همه محصولات</Link>{categories.filter((c) => c.active).slice(0, 5).map((cat) => <Link key={cat.id} to={`/catalog?category=${cat.slug}`} className="hover:text-[#d8665d]">{cat.name}</Link>)}<Link to="/bundles" className="text-[#d8665d]">پیشنهادهای ویژه</Link></div></nav>
      {menuOpen && <div className="md:hidden border-t border-[#f2e8e3] bg-white p-4 space-y-2"><form onSubmit={onSearch} className="relative mb-3"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو در محصولات..." className="input pr-10" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></form><Link to="/catalog" onClick={() => setMenuOpen(false)} className="block p-2">همه محصولات</Link>{categories.filter((c) => c.active).map((cat) => <Link key={cat.id} to={`/catalog?category=${cat.slug}`} onClick={() => setMenuOpen(false)} className="block p-2">{cat.name}</Link>)}</div>}
    </header>
    <main className="flex-1"><Outlet /></main>
    <footer className="bg-[#3f2c29] text-[#ead8d1] mt-0"><div className="max-w-7xl mx-auto px-4 py-12"><div className="grid grid-cols-2 md:grid-cols-4 gap-8"><div className="col-span-2 md:col-span-1"><div className="flex items-center gap-2 mb-4"><div className="w-10 h-10 rounded-full bg-[#fce8e4] text-[#d8665d] flex items-center justify-center"><SparkleLogo /></div><span className="text-xl font-black text-white">{content.storeName}</span></div><p className="text-sm leading-7">{content.footerText}</p></div><div><h4 className="font-bold text-white mb-4">دسترسی سریع</h4><ul className="space-y-3 text-sm"><li><Link to="/catalog">محصولات</Link></li><li><Link to="/bundles">پکیج‌های ویژه</Link></li><li><Link to="/faq">سوالات متداول</Link></li></ul></div><div><h4 className="font-bold text-white mb-4">راهنما</h4><ul className="space-y-3 text-sm"><li><Link to="/how-it-works">چگونه کار می‌کند</Link></li><li><Link to="/register">ثبت‌نام</Link></li><li><Link to="/contact">تماس با ما</Link></li></ul></div><div><h4 className="font-bold text-white mb-4">با ما در ارتباط باشید</h4><p className="text-sm leading-7">تلفن: ۰۲۱-۹۱۰۰۰۰۰۰<br />شنبه تا پنجشنبه، ۹ تا ۱۸</p><div className="flex gap-2 mt-4"><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Instagram className="w-4 h-4" /></span><span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Heart className="w-4 h-4" /></span></div></div></div><div className="border-t border-white/10 mt-10 pt-5 text-center text-xs text-[#bca39b]">© ۱۴۰۵ {content.storeName} - تمامی حقوق محفوظ است</div></div></footer>
  </div>
}

function SparkleLogo() { return <span className="text-lg font-black">د</span> }
