import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ToastProvider } from './lib/toast'
import { CartSync } from './lib/cart-sync'
import PublicLayout from './layouts/PublicLayout'
import SchoolLayout from './layouts/SchoolLayout'
import AdminLayout from './layouts/AdminLayout'
import Landing from './pages/public/Landing'
import Catalog from './pages/public/Catalog'
import ProductDetail from './pages/public/ProductDetail'
import Bundles from './pages/public/Bundles'
import BundleDetail from './pages/public/BundleDetail'
import FAQ from './pages/public/FAQ'
import Contact from './pages/public/Contact'
import HowItWorks from './pages/public/HowItWorks'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import ForgotPassword from './pages/public/ForgotPassword'
import SchoolDashboard from './pages/school/Dashboard'
import SchoolCatalog from './pages/school/Catalog'
import Cart from './pages/school/Cart'
import Checkout from './pages/school/Checkout'
import Orders from './pages/school/Orders'
import OrderDetail from './pages/school/OrderDetail'
import Favorites from './pages/school/Favorites'
import SchoolProfile from './pages/school/Profile'
import Support from './pages/school/Support'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminProductEdit from './pages/admin/ProductEdit'
import AdminCategories from './pages/admin/Categories'
import AdminBundles from './pages/admin/Bundles'
import AdminInventory from './pages/admin/Inventory'
import AdminInvoices from './pages/admin/Invoices'
import AdminInvoiceNew from './pages/admin/InvoiceNew'
import AdminInvoicePrint from './pages/admin/InvoicePrint'
import AdminSales from './pages/admin/Sales'
import AdminSubmissions from './pages/admin/Submissions'
import AdminKanban from './pages/admin/Kanban'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminSchools from './pages/admin/Schools'
import AdminSchoolDetail from './pages/admin/SchoolDetail'
import AdminCoupons from './pages/admin/Coupons'
import AdminAnnouncements from './pages/admin/Announcements'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import AdminTickets from './pages/admin/Tickets'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartSync />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:category" element={<Catalog />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/bundles/:id" element={<BundleDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="/app" element={<SchoolLayout />}>
            <Route index element={<SchoolDashboard />} />
            <Route path="catalog" element={<SchoolCatalog />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<SchoolProfile />} />
            <Route path="support" element={<Support />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductEdit />} />
            <Route path="products/:id" element={<AdminProductEdit />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="bundles" element={<AdminBundles />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="invoices/new" element={<AdminInvoiceNew />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="schools" element={<AdminSchools />} />
            <Route path="schools/:id" element={<AdminSchoolDetail />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="kanban" element={<AdminKanban />} />
            <Route path="tickets" element={<AdminTickets />} />
          </Route>
          <Route path="/invoice/:id" element={<AdminInvoicePrint />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
