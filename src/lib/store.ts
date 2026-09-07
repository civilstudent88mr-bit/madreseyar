import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { formatJalaliDateShort, todayJalaliShort, toJalaliDate } from './jalali'

export interface AppSettings {
  storeName: string
  slogan: string
  supportPhone: string
  cities: string
  minOrderAmount: number
  showMarketPrice: boolean
  defaultDiscountPercent: number
  deliverySlots: string[]
  priceDisclaimer: string
  allowSchoolSubmissions: boolean
}

export interface StockMove {
  id: string
  productId: string
  productName: string
  delta: number
  reason: 'purchase' | 'waste' | 'adjust' | 'sale' | 'invoice_in' | 'invoice_out'
  date: string
  note: string
}

export interface InvoiceItem {
  productId: string
  name: string
  qty: number
  unitPrice: number
  marketPrice: number
}

export interface Invoice {
  id: string
  number: string
  type: 'purchase' | 'sale'
  status: 'draft' | 'posted' | 'void' | 'submitted' | 'confirmed' | 'packing' | 'shipped' | 'delivered'
  date: string
  party: string
  items: InvoiceItem[]
  total: number
  marketTotal: number
  savedAmount: number
  note: string
  orderId?: string | null
}

export interface Submission {
  id: string
  productName: string
  category: string
  qty: number
  note: string
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  schoolName: string
  date: string
  adminNote: string
}

export interface StoreProduct {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  packQty: string
  marketPrice: number
  ourPrice: number
  stock: number
  featured: boolean
  desc: string
  tags: string[]
}

interface StoreState {
  settings: AppSettings
  products: StoreProduct[]
  stockMoves: StockMove[]
  invoices: Invoice[]
  submissions: Submission[]

  updateSettings: (s: Partial<AppSettings>) => void
  upsertProduct: (p: StoreProduct) => void
  deleteProduct: (id: string) => void
  adjustStock: (productId: string, delta: number, reason: StockMove['reason'], note: string) => void
  createInvoice: (inv: Omit<Invoice, 'id' | 'number'>) => Invoice
  voidInvoice: (id: string) => void
  productSalesStats: (productId: string) => { todayCount: number; todayAmount: number; monthCount: number; monthAmount: number; totalCount: number; totalAmount: number }
  submitProduct: (s: Omit<Submission, 'id' | 'status' | 'date' | 'adminNote'>) => void
  reviewSubmission: (id: string, action: 'approved' | 'rejected', note: string, prices?: { market: number; our: number; stock: number }) => void
}

const defaultSettings: AppSettings = {
  storeName: 'مدرسه یار',
  slogan: 'تأمین لوازم مدرسه با قیمت زیر بازار',
  supportPhone: '۰۲۱-۹۱۰۰۰۰۰۰',
  cities: 'تهران، کرج، اصفهان، شیراز، مشهد، تبریز',
  minOrderAmount: 500000,
  showMarketPrice: true,
  defaultDiscountPercent: 40,
  deliverySlots: ['صبح (۸-۱۲)', 'ظهر (۱۲-۱۶)', 'عصر (۱۶-۲۰)'],
  priceDisclaimer: 'قیمت بازار تقریبی است و ممکن است کمی متفاوت باشد.',
  allowSchoolSubmissions: true,
}

const seedProducts: StoreProduct[] = [
  { id: 'p1', name: 'دستمال کاغذی جعبه‌ای', sku: 'TIS-001', category: 'بهداشتی', unit: 'جعبه', packQty: '۲۴ عددی', marketPrice: 120000, ourPrice: 65000, stock: 200, featured: true, desc: 'دستمال کاغذی جعبه‌ای ۲۰۰ برگ', tags: ['بهداشتی', 'پرمصرف'] },
  { id: 'p2', name: 'صابون توالت بسته‌ای', sku: 'SOAP-002', category: 'بهداشتی', unit: 'بسته', packQty: '۱۲ عددی', marketPrice: 90000, ourPrice: 48000, stock: 150, featured: false, desc: 'صابون توالت معطر', tags: ['بهداشتی'] },
  { id: 'p3', name: 'کاغذ A4 پک ۵۰۰ برگ', sku: 'PAP-003', category: 'کاغذی', unit: 'پک', packQty: '۵۰۰ برگ', marketPrice: 350000, ourPrice: 180000, stock: 80, featured: true, desc: 'کاغذ A4 ۸۰ گرم', tags: ['کاغذی', 'اداری'] },
  { id: 'p4', name: 'پاک‌کن کلاس', sku: 'ERS-004', category: 'نوشت‌افزار', unit: 'عدد', packQty: 'تکی', marketPrice: 15000, ourPrice: 8000, stock: 3, featured: false, desc: 'پاک‌کن سفید', tags: ['نوشت‌افزار'] },
  { id: 'p5', name: 'ماژیک سبید تخته', sku: 'MAR-005', category: 'نوشت‌افزار', unit: 'عدد', packQty: 'تکی', marketPrice: 25000, ourPrice: 13000, stock: 120, featured: false, desc: 'ماژیک سبید تخته', tags: ['نوشت‌افزار'] },
]

const seedInvoices: Invoice[] = [
  {
    id: 'inv1', number: 'INV-1405-0001', type: 'sale', status: 'posted',
    date: new Date().toISOString(), party: 'دبیرستان شهید بهشتی',
    items: [
      { productId: 'p1', name: 'دستمال کاغذی جعبه‌ای', qty: 10, unitPrice: 65000, marketPrice: 120000 },
      { productId: 'p3', name: 'کاغذ A4 پک ۵۰۰ برگ', qty: 5, unitPrice: 180000, marketPrice: 350000 },
    ],
    total: 1550000, marketTotal: 2950000, savedAmount: 1400000, note: 'فاکتور فروش نمونه', orderId: null,
  },
]

const seedSubmissions: Submission[] = [
  {
    id: 'sub1', productName: 'ژل ضدعفونت دست', category: 'بهداشتی', qty: 50,
    note: 'برای اتاق بهداشت مدرسه نیاز داریم', status: 'pending',
    submittedBy: 'school1', schoolName: 'دبیرستان شهید بهشتی',
    date: new Date().toISOString(), adminNote: '',
  },
]

function isSameDay(iso: string): boolean {
  const d = new Date(iso); const t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

function isSameJalaliMonth(iso: string): boolean {
  const d = toJalaliDate(new Date(iso)); const t = toJalaliDate(new Date())
  return d.year === t.year && d.month === t.month
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      products: seedProducts,
      stockMoves: [],
      invoices: seedInvoices,
      submissions: seedSubmissions,

      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

      upsertProduct: (p) => set((st) => {
        const idx = st.products.findIndex((x) => x.id === p.id)
        if (idx >= 0) {
          const products = [...st.products]; products[idx] = p
          return { products }
        }
        return { products: [{ ...p, id: p.id || `p${Date.now()}` }, ...st.products] }
      }),

      deleteProduct: (id) => set((st) => ({ products: st.products.filter((p) => p.id !== id) })),

      adjustStock: (productId, delta, reason, note) => {
        const st = get()
        const product = st.products.find((p) => p.id === productId)
        if (!product) return
        const newStock = Math.max(0, product.stock + delta)
        set((s) => ({
          products: s.products.map((p) => p.id === productId ? { ...p, stock: newStock } : p),
          stockMoves: [{ id: `sm${Date.now()}`, productId, productName: product.name, delta, reason, date: new Date().toISOString(), note }, ...s.stockMoves],
        }))
      },

      createInvoice: (inv) => {
        const number = `INV-${todayJalaliShort().replace(/\//g, '')}-${String(get().invoices.length + 1).padStart(4, '0')}`
        const invoice: Invoice = { ...inv, id: `inv${Date.now()}`, number }
        set((st) => ({ invoices: [invoice, ...st.invoices] }))
        if (invoice.type === 'purchase' && invoice.status === 'posted') {
          invoice.items.forEach((it) => {
            get().adjustStock(it.productId, it.qty, 'invoice_in', `فاکتور خرید ${number}`)
          })
        }
        if (invoice.type === 'sale' && invoice.status === 'posted') {
          invoice.items.forEach((it) => {
            get().adjustStock(it.productId, -it.qty, 'invoice_out', `فاکتور فروش ${number}`)
          })
        }
        return invoice
      },

      voidInvoice: (id) => set((st) => ({
        invoices: st.invoices.map((i) => i.id === id ? { ...i, status: 'void' } : i),
      })),

      productSalesStats: (productId) => {
        const st = get()
        let todayCount = 0, todayAmount = 0, monthCount = 0, monthAmount = 0, totalCount = 0, totalAmount = 0
        const validOrderStatuses = ['confirmed', 'packing', 'shipped', 'delivered']
        st.invoices.filter((i) => i.type === 'sale' && i.status === 'posted').forEach((inv) => {
          inv.items.filter((it) => it.productId === productId).forEach((it) => {
            const amt = it.qty * it.unitPrice
            if (isSameDay(inv.date)) { todayCount += it.qty; todayAmount += amt }
            if (isSameJalaliMonth(inv.date)) { monthCount += it.qty; monthAmount += amt }
            totalCount += it.qty; totalAmount += amt
          })
        })
        return { todayCount, todayAmount, monthCount, monthAmount, totalCount, totalAmount }
      },

      submitProduct: (s) => set((st) => ({
        submissions: [{ ...s, id: `sub${Date.now()}`, status: 'pending', date: new Date().toISOString(), adminNote: '' }, ...st.submissions],
      })),

      reviewSubmission: (id, action, note, prices) => set((st) => {
        const submissions = st.submissions.map((s) => s.id === id ? { ...s, status: action, adminNote: note } : s)
        let products = st.products
        if (action === 'approved' && prices) {
          const sub = st.submissions.find((s) => s.id === id)
          if (sub) {
            const newProd: StoreProduct = {
              id: `p${Date.now()}`, name: sub.productName, sku: `NEW-${Date.now().toString().slice(-4)}`,
              category: sub.category, unit: 'عدد', packQty: 'تکی',
              marketPrice: prices.market, ourPrice: prices.our, stock: prices.stock,
              featured: false, desc: sub.note, tags: [sub.category],
            }
            products = [newProd, ...products]
          }
        }
        return { submissions, products }
      }),
    }),
    { name: 'madrese-yar-v1' },
  ),
)
