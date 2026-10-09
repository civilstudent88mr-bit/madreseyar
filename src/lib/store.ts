import { create } from 'zustand'
import { supabase } from './supabase'

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
  active: boolean
  desc: string
  tags: string[]
  createdAt: string
  image?: string
  images?: string[]
  brand?: string
  longDesc?: string
  specs?: Record<string, unknown>
}

export interface StoreCategory {
  id: string
  name: string
  slug: string
  icon: string
  order: number
  active: boolean
  bannerUrl?: string
}

export interface StockMove {
  id: string
  delta: number
  productName: string
  reason: 'purchase' | 'waste' | 'adjust'
  note: string
  date: string
}

export interface InvoiceItem {
  productId: string
  name: string
  image?: string
  qty: number
  unitPrice: number
  marketPrice: number
}

export interface Invoice {
  id: string
  type: 'purchase' | 'sale'
  status: 'draft' | 'posted' | 'void' | 'submitted' | 'confirmed' | 'packing' | 'shipped' | 'delivered'
  number: string
  date: string
  party: string
  items: InvoiceItem[]
  total: number
  marketTotal: number
  savedAmount: number
  note: string
  orderId: string | null
}

export interface Submission {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  productName: string
  category: string
  qty: number
  schoolName: string
  submittedBy: string
  date: string
  note: string
  adminNote: string
}

export interface FeatureCard {
  id: string
  icon: string
  title: string
  desc: string
  show: boolean
}

export interface SiteContent {
  storeName: string
  slogan: string
  heroTitle: string
  heroSubtitle: string
  heroText: string
  heroBadgeShow: boolean
  heroBadgeText: string
  heroButton1Text: string
  heroButton2Text: string
  heroShow: boolean
  features: FeatureCard[]
  featuresShow: boolean
  footerText: string
  footerPhone: string
  footerHours: string
  footerShow: boolean
  priceDisclaimer: string
  priceDisclaimerShow: boolean
}

export interface AppearanceSettings {
  brandColor: string
  heroBgColor: string
  buttonColor: string
  logo?: string
  showHeaderSearch: boolean
  showBundles: boolean
  showMarketPrice: boolean
}

export interface AppSettings {
  storeName: string
  slogan: string
  supportPhone: string
  cities: string
  minOrderAmount: number
  defaultDiscountPercent: number
  showMarketPrice: boolean
  allowSchoolSubmissions: boolean
  deliverySlots: string[]
  priceDisclaimer: string
}

interface StoreState {
  products: StoreProduct[]
  categories: StoreCategory[]
  syncCatalog: () => Promise<void>
  stockMoves: StockMove[]
  invoices: Invoice[]
  submissions: Submission[]
  settings: AppSettings
  content: SiteContent
  appearance: AppearanceSettings
  adjustStock: (productId: string, delta: number, reason: StockMove['reason'], note: string) => void
  createInvoice: (payload: Omit<Invoice, 'id'>) => void
  voidInvoice: (id: string) => void
  upsertProduct: (product: StoreProduct) => void
  deleteProduct: (id: string) => void
  upsertCategory: (category: StoreCategory) => void
  deleteCategory: (id: string) => boolean
  productSalesStats: (productId: string) => {
    todayAmount: number
    todayCount: number
    monthAmount: number
    monthCount: number
    totalAmount: number
    totalCount: number
  }
  updateSettings: (settings: AppSettings) => void
  updateContent: (content: SiteContent) => void
  updateAppearance: (appearance: AppearanceSettings) => void
  reviewSubmission: (id: string, action: 'approved' | 'rejected', note: string, pricing?: { market: number; our: number; stock: number }) => void
  submitProduct: (payload: { productName: string; category: string; qty: number; note: string; submittedBy: string; schoolName: string }) => void
}

const defaultCategories: StoreCategory[] = [
  { id: 'cat-skincare', name: 'مراقبت از پوست', slug: 'skincare', icon: '🧴', order: 0, active: true },
  { id: 'cat-makeup', name: 'آرایشی', slug: 'makeup', icon: '💄', order: 1, active: true },
  { id: 'cat-hygiene', name: 'بهداشتی', slug: 'hygiene', icon: '🧼', order: 2, active: true },
  { id: 'cat-supplement', name: 'دارو و مکمل', slug: 'supplement', icon: '💊', order: 3, active: true },
  { id: 'cat-haircare', name: 'مراقبت از مو', slug: 'haircare', icon: '💇', order: 4, active: true },
]

const defaultProducts: StoreProduct[] = [
  { id: 'p1', name: 'کرم مرطوب‌کننده لورال ۵۰ میلی', sku: 'LRL-50ML', category: 'مراقبت از پوست', unit: 'عدد', packQty: '۵۰ میلی', marketPrice: 320000, ourPrice: 195000, stock: 340, featured: true, active: true, desc: 'کرم مرطوب‌کننده مناسب پوست خشک و حساس', tags: ['مراقبت پوست', 'پرمصرف'], createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p2', name: 'سرم ویتامین C اوردینری ۳۰ میلی', sku: 'ODN-VC30', category: 'مراقبت از پوست', unit: 'عدد', packQty: '۳۰ میلی', marketPrice: 450000, ourPrice: 280000, stock: 180, featured: false, active: true, desc: 'سرم روشن‌کننده و ضدلک با ویتامین C', tags: ['سرم', 'ضدلک'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'p3', name: 'روغن آرگان مراکشی ۱۰۰ میلی', sku: 'ARG-100', category: 'مراقبت از مو', unit: 'عدد', packQty: '۱۰۰ میلی', marketPrice: 380000, ourPrice: 210000, stock: 75, featured: true, active: true, desc: 'روغن آرگان خالص برای تقویت مو و پوست', tags: ['مو', 'طبیعی'], createdAt: '2026-01-03T00:00:00.000Z' },
  { id: 'p4', name: 'مکمل omega-3 کپسول ۶۰ عددی', sku: 'OMG-60', category: 'دارو و مکمل', unit: 'قوطی', packQty: '۶۰ کپسول', marketPrice: 280000, ourPrice: 150000, stock: 120, featured: false, active: true, desc: 'مکمل امگا ۳ خالص برای سلامت قلب و مغز', tags: ['مکمل', 'خوراکی'], createdAt: '2026-01-04T00:00:00.000Z' },
  { id: 'p5', name: 'رژلب مک گلر شماره ۱۲', sku: 'MAC-LP12', category: 'آرایشی', unit: 'عدد', packQty: 'تکی', marketPrice: 250000, ourPrice: 140000, stock: 60, featured: false, active: true, desc: 'رژلب مات با دوام بالا و رنگ ثابت', tags: ['آرایشی', 'رژلب'], createdAt: '2026-01-05T00:00:00.000Z' },
  { id: 'p6', name: 'شامپو ضدشوره هد اند شولدر ۵۰۰ میلی', sku: 'HNS-500', category: 'بهداشتی', unit: 'عدد', packQty: '۵۰۰ میلی', marketPrice: 180000, ourPrice: 95000, stock: 200, featured: true, active: true, desc: 'شامپو ضدشوره مناسب همه انواع مو', tags: ['بهداشتی', 'شامپو'], createdAt: '2026-01-06T00:00:00.000Z' },
  { id: 'p7', name: 'ضدآفتاب اسپفا ۵۰ سون فلایر ۵۰ میلی', sku: 'SNF-SPF50', category: 'مراقبت از پوست', unit: 'عدد', packQty: '۵۰ میلی', marketPrice: 350000, ourPrice: 220000, stock: 150, featured: true, active: true, desc: 'ضدآفتاب سبک با SPF 50 مناسب پوست چرب', tags: ['ضدآفتاب', 'پرمصرف'], createdAt: '2026-01-07T00:00:00.000Z' },
  { id: 'p8', name: 'ماسک صورت هیدروژل آلوئه‌ورا', sku: 'Msk-Alo', category: 'مراقبت از پوست', unit: 'بسته', packQty: '۵ عدد', marketPrice: 200000, ourPrice: 110000, stock: 80, featured: false, active: true, desc: 'ماسک هیدروژل آبرسان با عصاره آلوئه‌ورا', tags: ['ماسک', 'آبرسان'], createdAt: '2026-01-08T00:00:00.000Z' },
]

const hansalCategory: StoreCategory = { id: 'cat-supplements', name: 'مکمل‌های غذایی', slug: 'supplements', icon: '💊', order: 5, active: true }
const hansalProduct: StoreProduct = {
  id: 'p-hansal-vitamin-c',
  name: 'قرص جوشان ویتامین C هانسال',
  sku: 'HC-HANSAL-VC',
  category: 'مکمل‌های غذایی',
  unit: 'عدد',
  packQty: 'قرص جوشان',
  marketPrice: 175000,
  ourPrice: 175000,
  stock: 0,
  featured: false,
  active: true,
  desc: 'مکمل خوراکی حاوی ویتامین C برای کمک به تأمین نیاز روزانه این ویتامین. قرص را طبق دستور بسته‌بندی در آب حل کنید و بنوشید.',
  tags: ['ویتامین C', 'مکمل غذایی'],
  createdAt: '2026-10-04T00:00:00.000Z',
  image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
}
const drKidsProduct: StoreProduct = {
  id: 'p-dr-kids-zinc-300',
  name: 'شربت زینک دکتر کیدز ۳۰۰ میلی‌لیتر | Dr. Kids Zinc Liquid Supplement',
  sku: 'DK-Zn300',
  category: 'دارو و مکمل',
  unit: 'عدد',
  packQty: 'بطری ۳۰۰ میلی‌لیتری',
  marketPrice: 185000,
  ourPrice: 138750,
  stock: 50,
  featured: false,
  active: true,
  desc: 'مکمل مایع تقویتی حاوی روی ویژه کودکان با طعم پرتقال، برای تقویت ایمنی بدن و رشد. مطابق دستور پزشک یا داروساز مصرف شود.',
  tags: ['زینک', 'کودکان', 'مکمل غذایی', 'تقویت ایمنی'],
  createdAt: '2026-10-04T00:00:00.000Z',
  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
}
const umbrellaProduct: StoreProduct = {
  id: 'p-umbrella-energy-fresh',
  name: 'مام استیکی اومبرلا انرژی فرش | Umbrella Energy + Fresh Magnesium Hydroxide Deodorant',
  sku: 'UM-ENF-STK',
  category: 'بهداشتی',
  unit: 'عدد',
  packQty: 'استیک ۵۰ گرمی',
  marketPrice: 120000,
  ourPrice: 84000,
  stock: 100,
  featured: false,
  active: true,
  desc: 'دیودورانت استیکی با فرمول منیزیم هیدروکساید، کره شیا و ویتامین E برای تازگی و انرژی تمام روز.',
  tags: ['دیودورانت', 'منیزیم هیدروکساید', 'بدون آلومینیوم', 'پوست حساس'],
  createdAt: '2026-10-04T00:00:00.000Z',
  image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
}
const defaultContent: SiteContent = {
  storeName: 'Healthcare',
  slogan: 'فروشگاه آنلاین محصولات مراقبت از پوست، آرایشی و مکمل',
  heroTitle: 'خرید آنلاین محصولات مراقبت از پوست',
  heroSubtitle: 'و آرایشی و مکمل با قیمت مناسب',
  heroText: 'Healthcare منبع مطمئن تأمین محصولات مراقبت از پوست، آرایشی، بهداشتی و مکمل است. محصولات اصل را با قیمت مناسب کشف کنید و سفارش خود را مستقیم ثبت کنید.',
  heroBadgeShow: true,
  heroBadgeText: '۲۰ تا ۴۰٪ ارزان‌تر از بازار',
  heroButton1Text: 'مشاهده محصولات',
  heroButton2Text: 'ثبت‌نام',
  heroShow: true,
  features: [
    { id: 'f1', icon: 'TrendingDown', title: '۲۰-۴۰٪ ارزان‌تر', desc: 'از قیمت بازار', show: true },
    { id: 'f2', icon: 'ShieldCheck', title: 'اصالت کالا', desc: 'تضمین محصول اصل', show: true },
    { id: 'f3', icon: 'Truck', title: 'ارسال سریع', desc: 'به سراسر کشور', show: true },
    { id: 'f4', icon: 'Clock', title: 'پشتیبانی', desc: 'پاسخگویی سریع', show: true },
  ],
  featuresShow: true,
  footerText: 'فروشگاه آنلاین محصولات مراقبت از پوست، آرایشی، بهداشتی و مکمل با قیمت مناسب و تضمین اصالت کالا.',
  footerPhone: '021-91000000',
  footerHours: 'شنبه تا پنجشنبه، ۹ تا ۱۸',
  footerShow: true,
  priceDisclaimer: 'قیمت‌ها تقریبی است و ممکن است تغییر کند. ما تلاش می‌کنیم همیشه شفاف و صادق باشیم.',
  priceDisclaimerShow: true,
}

export const defaultAppearance: AppearanceSettings = {
  brandColor: '#0f766e',
  heroBgColor: '#0f766e',
  buttonColor: '#0f766e',
  logo: undefined,
  showHeaderSearch: true,
  showBundles: true,
  showMarketPrice: true,
}

const defaultSettings: AppSettings = {
  storeName: 'Healthcare', slogan: 'فروشگاه آنلاین محصولات مراقبت از پوست، آرایشی و مکمل', supportPhone: '021-91000000', cities: 'تهران، کرج، اصفهان، شیراز، مشهد، تبریز، اهواز، رشت', minOrderAmount: 200000, defaultDiscountPercent: 30, showMarketPrice: true, allowSchoolSubmissions: true, deliverySlots: ['صبح (۸-۱۲)', 'ظهر (۱۲-۱۶)'], priceDisclaimer: 'قیمت‌ها تقریبی است و ممکن است تغییر کند.',
}

interface StoredStoreData {
  products?: StoreProduct[]
  categories?: StoreCategory[]
  stockMoves?: StockMove[]
  invoices?: Invoice[]
  submissions?: Submission[]
  settings?: AppSettings
  content?: SiteContent
  appearance?: AppearanceSettings
}

function readStored(): StoredStoreData {
  try {
    const raw = localStorage.getItem('healthcare-v1')
    return raw ? JSON.parse(raw) as StoredStoreData : {}
  } catch {
    return {}
  }
}

function persistStore(partial: StoredStoreData) {
  try {
    const current = readStored()
    localStorage.setItem('healthcare-v1', JSON.stringify({ ...current, ...partial }))
    window.dispatchEvent(new Event('healthcare-products-changed'))
  } catch { /* storage is optional in non-browser environments */ }
}

const stored = readStored()
const initialProducts = (stored.products?.length ? stored.products : defaultProducts).map((p) => ({ ...p, active: p.active ?? true, createdAt: p.createdAt || new Date().toISOString() }))
if (!initialProducts.some((p) => p.id === hansalProduct.id)) initialProducts.push(hansalProduct)
if (!initialProducts.some((p) => p.id === drKidsProduct.id)) initialProducts.push(drKidsProduct)
if (!initialProducts.some((p) => p.id === umbrellaProduct.id)) initialProducts.push(umbrellaProduct)
const initialCategories = (stored.categories?.length ? stored.categories : defaultCategories).map((c) => ({ ...c, active: c.active ?? true }))
if (!initialCategories.some((c) => c.slug === hansalCategory.slug)) initialCategories.push(hansalCategory)
if (typeof window !== 'undefined') persistStore({ products: initialProducts, categories: initialCategories })

export const useStore = create<StoreState>((set, get) => ({
  products: initialProducts,
  categories: initialCategories,
  syncCatalog: async () => {
    const [{ data: remoteProducts, error: productsError }, { data: remoteCategories, error: categoriesError }] = await Promise.all([
      supabase.from('products').select('*, categories(name, slug), product_images(url, sort_order)').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug, icon, sort_order, is_active, banner_url').eq('is_active', true).order('sort_order'),
    ])
    if (productsError || categoriesError || !remoteProducts?.length) return
    const products = remoteProducts.map((remote: any): StoreProduct => ({
      id: remote.id,
      name: remote.name,
      sku: remote.sku || '',
      category: remote.categories?.name || 'سایر',
      unit: remote.unit || 'عدد',
      packQty: remote.pack_size || '',
      marketPrice: Number(remote.market_price) || 0,
      ourPrice: Number(remote.our_price) || 0,
      stock: Number(remote.stock_qty) || 0,
      featured: Boolean(remote.is_featured),
      active: Boolean(remote.is_active),
      desc: remote.short_desc || remote.long_desc || '',
      tags: Array.isArray(remote.specs?.features) ? remote.specs.features.map(String) : (Array.isArray(remote.suitable_for) ? remote.suitable_for.map(String) : []),
      createdAt: remote.created_at || new Date().toISOString(),
      images: [...(remote.product_images || [])].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((image: any) => image.url).filter(Boolean),
      image: [...(remote.product_images || [])].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.url,
      brand: remote.brand || undefined,
      longDesc: remote.long_desc || undefined,
      specs: remote.specs && typeof remote.specs === 'object' ? remote.specs : {},
    }))
    const categories = (remoteCategories || []).map((remote: any): StoreCategory => ({
      id: remote.id,
      name: remote.name,
      slug: remote.slug,
      icon: remote.icon || 'package',
      order: Number(remote.sort_order) || 0,
      active: Boolean(remote.is_active),
      bannerUrl: remote.banner_url || undefined,
    }))
    set({ products, categories })
    persistStore({ products, categories })
  },
  stockMoves: stored.stockMoves ?? [],
  invoices: stored.invoices ?? [],
  submissions: stored.submissions ?? [],
  settings: stored.settings ?? defaultSettings,
  content: { ...defaultContent, ...stored.content, features: stored.content?.features?.length ? stored.content.features : defaultContent.features },
  appearance: { ...defaultAppearance, ...stored.appearance },

  adjustStock: (productId, delta, reason, note) => set((s) => {
    const product = s.products.find((p) => p.id === productId)
    if (!product) return s
    const products = s.products.map((p) => p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    const stockMoves = [...s.stockMoves, { id: crypto.randomUUID(), delta, productName: product.name, reason, note, date: new Date().toISOString() }]
    persistStore({ products, stockMoves })
    return { products, stockMoves }
  }),

  createInvoice: (payload) => set((s) => {
    const invoices = [...s.invoices, { ...payload, id: crypto.randomUUID() }]
    persistStore({ invoices })
    return { invoices }
  }),

  voidInvoice: (id) => set((s) => {
    const invoices = s.invoices.map((i) => i.id === id ? { ...i, status: 'void' as const } : i)
    persistStore({ invoices })
    return { invoices }
  }),

  upsertProduct: (product) => set((s) => {
    const normalized = { ...product, active: product.active ?? true, createdAt: product.createdAt || new Date().toISOString() }
    const products = s.products.some((p) => p.id === normalized.id) ? s.products.map((p) => p.id === normalized.id ? normalized : p) : [...s.products, normalized]
    persistStore({ products })
    return { products }
  }),

  deleteProduct: (id) => set((s) => {
    const products = s.products.filter((p) => p.id !== id)
    persistStore({ products })
    return { products }
  }),

  upsertCategory: (category) => set((s) => {
    const existing = s.categories.find((c) => c.id === category.id || c.slug === category.slug)
    const categories = existing ? s.categories.map((c) => c.id === existing.id ? category : c) : [...s.categories, category].sort((a, b) => a.order - b.order)
    persistStore({ categories })
    return { categories }
  }),

  deleteCategory: (id) => {
    const cat = get().categories.find((c) => c.id === id)
    if (!cat) return false
    const hasProducts = get().products.some((p) => p.category === cat.name)
    if (hasProducts) return false
    set((s) => {
      const categories = s.categories.filter((c) => c.id !== id)
      persistStore({ categories })
      return { categories }
    })
    return true
  },

  productSalesStats: (productId) => {
    const { invoices } = get()
    const today = new Date().toDateString(); const now = new Date()
    let todayAmount = 0, todayCount = 0, monthAmount = 0, monthCount = 0, totalAmount = 0, totalCount = 0
    for (const inv of invoices) {
      if (inv.type !== 'sale' || inv.status !== 'posted') continue
      const invDate = new Date(inv.date)
      for (const it of inv.items) if (it.productId === productId) {
        const lineTotal = it.qty * it.unitPrice; totalAmount += lineTotal; totalCount += it.qty
        if (invDate.toDateString() === today) { todayAmount += lineTotal; todayCount += it.qty }
        if (invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()) { monthAmount += lineTotal; monthCount += it.qty }
      }
    }
    return { todayAmount, todayCount, monthAmount, monthCount, totalAmount, totalCount }
  },

  updateSettings: (settings) => { persistStore({ settings }); set({ settings }) },

  updateContent: (content) => { persistStore({ content }); set({ content }) },

  updateAppearance: (appearance) => { persistStore({ appearance }); set({ appearance }) },

  reviewSubmission: (id, action, note, pricing) => set((s) => {
    const submissions = s.submissions.map((sub) => sub.id === id ? { ...sub, status: action, adminNote: note } : sub)
    let products = s.products
    if (action === 'approved' && pricing) {
      const sub = s.submissions.find((x) => x.id === id)
      if (sub) products = [...products, { id: `p${Date.now()}`, name: sub.productName, sku: '', category: sub.category, unit: 'عدد', packQty: '', marketPrice: pricing.market, ourPrice: pricing.our, stock: pricing.stock, featured: false, active: true, desc: sub.note || '', tags: [], createdAt: new Date().toISOString() }]
    }
    persistStore({ submissions, products }); return { submissions, products }
  }),

  submitProduct: (payload) => set((s) => {
    const submissions = [...s.submissions, { id: crypto.randomUUID(), status: 'pending' as const, productName: payload.productName, category: payload.category, qty: payload.qty, schoolName: payload.schoolName, submittedBy: payload.submittedBy, date: new Date().toISOString(), note: payload.note, adminNote: '' }]
    persistStore({ submissions }); return { submissions }
  }),
}))

export function productSlug(product: StoreProduct): string {
  return `${product.id}-${product.name.replace(/\s+/g, '-')}`
}

export function toProduct(product: StoreProduct) {
  return {
    id: product.id, sku: product.sku || null, name: product.name, slug: productSlug(product), image: product.image, short_desc: product.desc, long_desc: product.desc, category_id: product.category, brand: null, unit: product.unit, pack_size: product.packQty, market_price: product.marketPrice, our_price: product.ourPrice, min_order_qty: 1, step_qty: 1, max_order_qty: Math.max(product.stock, 1), stock_qty: product.stock, low_stock_threshold: 5, is_active: product.active, is_featured: product.featured, is_hygiene: product.category === 'بهداشتی', suitable_for: [], specs: {}, weight_grams: 0, created_at: product.createdAt, updated_at: product.createdAt,
  }
}
