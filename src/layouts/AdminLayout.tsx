import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Settings, Package, Warehouse, FileText, BarChart3,
  Inbox, ClipboardList, Building2, KanbanSquare, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/cn'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'داشبورد', end: true },
  { to: '/admin/settings', icon: Settings, label: 'تنظیمات اپ' },
  { to: '/admin/products', icon: Package, label: 'کالاها' },
  { to: '/admin/inventory', icon: Warehouse, label: 'موجودی و انبار' },
  { to: '/admin/invoices', icon: FileText, label: 'فاکتورها' },
  { to: '/admin/sales', icon: BarChart3, label: 'گزارش فروش کالا' },
  { to: '/admin/submissions', icon: Inbox, label: 'کالاهای ثبت‌شده کاربران' },
  { to: '/admin/orders', icon: ClipboardList, label: 'سفارش‌ها' },
  { to: '/admin/schools', icon: Building2, label: 'مدارس' },
  { to: '/admin/kanban', icon: KanbanSquare, label: 'کانبان سفارش' },
]

export default function AdminLayout() {
  const { admin, adminSignOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (!admin) {
    navigate('/login')
    return null
  }

  const handleSignOut = () => {
    adminSignOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className={cn(
        'md:w-64 md:flex-shrink-0 bg-primary-900 text-primary-100 md:h-screen md:sticky md:top-0 flex flex-col z-40',
        open ? 'fixed inset-0' : 'hidden md:flex',
      )}>
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-white">پنل مدیریت</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden text-primary-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                isActive ? 'bg-primary-600 text-white' : 'text-primary-200 hover:bg-primary-800',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-700">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white">مدیر سیستم</p>
            <p className="text-xs text-primary-300">admin</p>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-200 hover:bg-primary-800 w-full transition">
            <LogOut className="w-5 h-5" />
            خروج
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => setOpen(true)} className="btn-ghost p-2">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-primary-800">پنل مدیریت مدرسه یار</span>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
