export type Role = 'school_user' | 'school_admin' | 'seller_admin' | 'seller_staff'
export type SchoolStatus = 'pending_review' | 'approved' | 'rejected'
export type OrderStatus = 'draft' | 'submitted' | 'confirmed' | 'packing' | 'shipped' | 'delivered' | 'canceled' | 'returned'
export type PaymentStatus = 'unpaid' | 'pending_receipt' | 'paid' | 'credit'
export type PaymentMethod = 'card_to_card' | 'online' | 'cash_on_delivery' | 'school_credit'

export interface Profile {
  id: string
  full_name: string
  mobile: string | null
  email: string | null
  role: Role
  school_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  name: string
  type: string | null
  province: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  school_code: string | null
  principal_name: string | null
  landline: string | null
  status: SchoolStatus
  notes: string | null
  credit_limit: number
  payment_terms: 'cash' | '15_days' | '30_days'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
}

export interface Product {
  id: string
  sku: string | null
  name: string
  slug: string
  short_desc: string | null
  long_desc: string | null
  category_id: string | null
  brand: string | null
  unit: string
  pack_size: string | null
  market_price: number
  our_price: number
  cost_price?: number
  min_order_qty: number
  step_qty: number
  max_order_qty: number
  stock_qty: number
  low_stock_threshold: number
  is_active: boolean
  is_featured: boolean
  is_hygiene: boolean
  suitable_for: string[]
  specs: Record<string, string>
  weight_grams: number
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
}

export interface Bundle {
  id: string
  name: string
  slug: string
  description: string | null
  school_level: string | null
  season: string | null
  market_total: number
  our_total: number
  is_active: boolean
  image: string | null
}

export interface BundleItem {
  id: string
  bundle_id: string
  product_id: string
  qty: number
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string | null
  bundle_id: string | null
  qty: number
  product?: Product
  bundle?: Bundle
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  product?: Product
}

export interface Order {
  id: string
  order_number: string
  school_id: string | null
  user_id: string
  status: OrderStatus
  subtotal: number
  discount: number
  shipping_fee: number
  grand_total: number
  market_total_snapshot: number
  saved_amount_snapshot: number
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  delivery_date_requested: string | null
  delivery_address: string | null
  receiver_name: string | null
  receiver_mobile: string | null
  notes: string | null
  tracking_code: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  name: string
  sku: string | null
  our_price: number
  market_price: number
  qty: number
  line_total: number
  unit: string | null
  pack_size: string | null
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  created_by: string | null
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  method: string | null
  receipt_url: string | null
  status: 'pending_receipt' | 'confirmed' | 'rejected'
  note: string | null
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  percent: number | null
  amount: number | null
  min_order: number
  max_uses: number | null
  used_count: number
  school_id: string | null
  expires_at: string | null
  is_active: boolean
}

export interface Announcement {
  id: string
  title: string
  body: string | null
  is_active: boolean
  starts_at: string
  ends_at: string | null
  created_at: string
}

export interface Ticket {
  id: string
  user_id: string
  school_id: string | null
  subject: string
  status: 'open' | 'answered' | 'closed'
  priority: 'low' | 'normal' | 'high'
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_admin: boolean
  created_at: string
}

export interface Settings {
  company_name: string
  phone: string
  whatsapp: string
  instagram: string
  bank_card: string
  sheba: string
  account_holder: string
  min_order_amount: number
  free_shipping_over: number
  default_shipping_fee: number
  provinces_served: string
}
