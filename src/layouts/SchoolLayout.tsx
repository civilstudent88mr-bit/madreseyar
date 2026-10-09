import { Outlet, NavLink, Link, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Heart, User, LifeBuoy, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { cn } from '../lib/cn'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'حساب من', end: true },
  { to: '/app/catalog', icon: Package, label: 'فروشگاه' },
  { to: '/app/cart', icon: ShoppingCart, label: 'سبد خرید' },
  { to: '/app/orders', icon: ClipboardList, label: 'سفارش‌های من' },
  { to: '/app/favorites', icon: Heart, label: 'علاقه‌مندی‌ها' },
  { to: '/app/profile', icon: User, label: 'اطلاعات تماس و نشانی' },
  { to: '/app/support', icon: LifeBuoy, label: 'پشتیبانی' },
]

export default function CustomerLayout() {
  const location = useLocation()
  const { user, signOut, loading } = useAuth()
  const { lines } = useCart()
  const [open, setOpen] = useState(false)

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (user.role === 'admin') return <Navigate to="/admin" replace />

  const cartCount = lines.reduce((sum, line) => sum + line.qty, 0)
  const sidebar = <>
    <div className="flex items-center justify-between p-4 border-b border-gray-100"><Link to="/" className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-primary-700 flex items-center justify-center"><Package className="w-5 h-5 text-white" /></div><span className="font-extrabold text-primary-800">Healthcare</span></Link><button onClick={() => setOpen(false)} className="md:hidden btn-ghost p-1"><X className="w-5 h-5" /></button></div>
    <div className="px-4 py-3 border-b border-gray-100"><p className="text-xs text-gray-500">حساب مشتری</p><p className="text-sm font-bold text-gray-800 truncate">{user.name}</p><p className="text-xs text-gray-400 mt-1" dir="ltr">{user.mobile}</p></div>
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition', isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50')}><item.icon className="w-5 h-5 flex-shrink-0" /><span className="flex-1">{item.label}</span>{item.to === '/app/cart' && cartCount > 0 && <span className="bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}</NavLink>)}</nav>
    <div className="p-3 border-t border-gray-100"><button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 w-full"><LogOut className="w-5 h-5" />خروج از حساب</button></div>
  </>

  return <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row" dir="rtl">
    <aside className={cn('md:w-64 md:flex-shrink-0 bg-white border-l border-gray-200 md:h-screen md:sticky md:top-0 flex flex-col z-40', open ? 'fixed inset-0' : 'hidden md:flex')}>{sidebar}</aside>
    {open && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />}
    <div className="flex-1 min-w-0 flex flex-col">
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-20"><div className="flex items-center justify-between px-4 h-14"><button onClick={() => setOpen(true)} className="btn-ghost p-2" aria-label="باز کردن منو"><Menu className="w-5 h-5" /></button><Link to="/" className="font-bold text-primary-800">Healthcare</Link><Link to="/app/cart" className="btn-ghost p-2 relative" aria-label="سبد خرید"><ShoppingCart className="w-5 h-5" />{cartCount > 0 && <span className="absolute -top-0 -left-0 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}</Link></div></header>
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full"><Outlet /></main>
    </div>
  </div>
}
