/*
# مدرسه یار - ساختار پایگاه داده

این مایگریشن ساختار کامل اپلیکیشن خرید عمده لوازم مدرسه را ایجاد می‌کند.

## جداول جدید
- `schools`: مدارس با وضعیت تأیید
- `profiles`: اطلاعات کاربران (نقش، مدرسه، موبایل)
- `categories`: دسته‌بندی محصولات
- `products`: محصولات با قیمت بازار و قیمت مدرسه یار
- `product_images`: تصاویر محصولات
- `bundles`: پکیج‌های پیشنهادی
- `bundle_items`: اقلام پکیج
- `cart_items`: سبد خرید
- `favorites`: علاقه‌مندی‌ها
- `orders`: سفارش‌ها
- `order_items`: اقلام سفارش
- `order_status_history`: تاریخچه وضعیت سفارش
- `payments`: پرداخت‌ها و فیش‌ها
- `coupons`: کدهای تخفیف
- `announcements`: اطلاعیه‌ها
- `tickets`: تیکت‌های پشتیبانی
- `ticket_messages`: پیام‌های تیکت
- `settings`: تنظیمات کلیدی-مقدار
- `stock_adjustments`: تنظیمات موجودی با دلیل

## امنیت (RLS)
- محصولات/دسته‌بندی/پکیج‌های فعال برای عموم قابل خواندن
- کاربران مدرسه فقط داده‌های مدرسه خود را می‌بینند
- cost_price فقط برای seller_admin قابل دسترس (در سطح کوئری کنترل می‌شود)
- نقش‌های seller فقط برای پنل ادمین
*/

-- ============ SCHOOLS ============
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('دولتی','غیردولتی','هیئت امنایی','هنرستان','متوسطه اول','متوسطه دوم','ابتدایی')),
  province text,
  city text,
  address text,
  postal_code text,
  school_code text,
  principal_name text,
  landline text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected')),
  notes text,
  credit_limit integer DEFAULT 0,
  payment_terms text DEFAULT 'cash' CHECK (payment_terms IN ('cash','15_days','30_days')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text,
  email text,
  role text NOT NULL DEFAULT 'school_user' CHECK (role IN ('school_user','school_admin','seller_admin','seller_staff')),
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_desc text,
  long_desc text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand text,
  unit text DEFAULT 'عدد',
  pack_size text,
  market_price integer NOT NULL DEFAULT 0,
  our_price integer NOT NULL DEFAULT 0,
  cost_price integer NOT NULL DEFAULT 0,
  min_order_qty integer DEFAULT 1,
  step_qty integer DEFAULT 1,
  max_order_qty integer DEFAULT 9999,
  stock_qty integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_hygiene boolean DEFAULT false,
  suitable_for text[] DEFAULT '{}',
  specs jsonb DEFAULT '{}'::jsonb,
  weight_grams integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT our_price_le_market CHECK (our_price <= market_price)
);

-- ============ PRODUCT IMAGES ============
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============ BUNDLES ============
CREATE TABLE IF NOT EXISTS bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  school_level text,
  season text,
  market_total integer NOT NULL DEFAULT 0,
  our_total integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  image text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES bundles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ============ CART ============
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  bundle_id uuid REFERENCES bundles(id) ON DELETE CASCADE,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT cart_one_target CHECK (product_id IS NOT NULL OR bundle_id IS NOT NULL)
);

-- ============ FAVORITES ============
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','confirmed','packing','shipped','delivered','canceled','returned')),
  subtotal integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  shipping_fee integer NOT NULL DEFAULT 0,
  grand_total integer NOT NULL DEFAULT 0,
  market_total_snapshot integer NOT NULL DEFAULT 0,
  saved_amount_snapshot integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','pending_receipt','paid','credit')),
  payment_method text CHECK (payment_method IN ('card_to_card','online','cash_on_delivery','school_credit')),
  delivery_date_requested date,
  delivery_address text,
  receiver_name text,
  receiver_mobile text,
  notes text,
  tracking_code text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  sku text,
  our_price integer NOT NULL,
  market_price integer NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  line_total integer NOT NULL DEFAULT 0,
  unit text,
  pack_size text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============ PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 0,
  method text,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending_receipt' CHECK (status IN ('pending_receipt','confirmed','rejected')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- ============ COUPONS ============
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  percent integer,
  amount integer,
  min_order integer DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============ ANNOUNCEMENTS ============
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============ TICKETS ============
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============ SETTINGS ============
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- ============ STOCK ADJUSTMENTS ============
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_school ON orders(school_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============ updated_at triggers ============
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_schools_updated ON schools;
CREATE TRIGGER trg_schools_updated BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_tickets_updated ON tickets;
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ RLS ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- Helper: is current user a seller role?
CREATE OR REPLACE FUNCTION is_seller()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('seller_admin','seller_staff') AND is_active
  );
$$;

CREATE OR REPLACE FUNCTION is_school_member(sid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND school_id = sid AND role IN ('school_user','school_admin') AND is_active
  );
$$;

-- ---- PROFILES policies ----
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_seller());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_seller())
  WITH CHECK (id = auth.uid() OR is_seller());

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR is_seller());

-- ---- SCHOOLS policies ----
DROP POLICY IF EXISTS schools_select ON schools;
CREATE POLICY schools_select ON schools FOR SELECT TO authenticated
  USING (is_seller() OR is_school_member(schools.id));

DROP POLICY IF EXISTS schools_insert ON schools;
CREATE POLICY schools_insert ON schools FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS schools_update ON schools;
CREATE POLICY schools_update ON schools FOR UPDATE TO authenticated
  USING (is_seller() OR is_school_member(schools.id))
  WITH CHECK (is_seller() OR is_school_member(schools.id));

-- ---- CATEGORIES: public read ----
DROP POLICY IF EXISTS categories_select ON categories;
CREATE POLICY categories_select ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS categories_modify ON categories;
CREATE POLICY categories_modify ON categories FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- PRODUCTS: public read active only; seller full ----
DROP POLICY IF EXISTS products_select ON products;
CREATE POLICY products_select ON products FOR SELECT TO anon, authenticated
  USING (is_active = true OR is_seller());

DROP POLICY IF EXISTS products_insert ON products;
CREATE POLICY products_insert ON products FOR INSERT TO authenticated WITH CHECK (is_seller());

DROP POLICY IF EXISTS products_update ON products;
CREATE POLICY products_update ON products FOR UPDATE TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

DROP POLICY IF EXISTS products_delete ON products;
CREATE POLICY products_delete ON products FOR DELETE TO authenticated USING (is_seller());

-- ---- PRODUCT_IMAGES: public read ----
DROP POLICY IF EXISTS product_images_select ON product_images;
CREATE POLICY product_images_select ON product_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS product_images_modify ON product_images;
CREATE POLICY product_images_modify ON product_images FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- BUNDLES: public read active ----
DROP POLICY IF EXISTS bundles_select ON bundles;
CREATE POLICY bundles_select ON bundles FOR SELECT TO anon, authenticated
  USING (is_active = true OR is_seller());

DROP POLICY IF EXISTS bundles_modify ON bundles;
CREATE POLICY bundles_modify ON bundles FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- BUNDLE_ITEMS: public read ----
DROP POLICY IF EXISTS bundle_items_select ON bundle_items;
CREATE POLICY bundle_items_select ON bundle_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS bundle_items_modify ON bundle_items;
CREATE POLICY bundle_items_modify ON bundle_items FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- CART_ITEMS: owner only ----
DROP POLICY IF EXISTS cart_select ON cart_items;
CREATE POLICY cart_select ON cart_items FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS cart_insert ON cart_items;
CREATE POLICY cart_insert ON cart_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cart_update ON cart_items;
CREATE POLICY cart_update ON cart_items FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cart_delete ON cart_items;
CREATE POLICY cart_delete ON cart_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---- FAVORITES: owner only ----
DROP POLICY IF EXISTS fav_select ON favorites;
CREATE POLICY fav_select ON favorites FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS fav_insert ON favorites;
CREATE POLICY fav_insert ON favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS fav_delete ON favorites;
CREATE POLICY fav_delete ON favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---- ORDERS: school member or seller ----
DROP POLICY IF EXISTS orders_select ON orders;
CREATE POLICY orders_select ON orders FOR SELECT TO authenticated
  USING (is_seller() OR is_school_member(school_id));

DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT TO authenticated
  WITH CHECK (is_seller() OR user_id = auth.uid());

DROP POLICY IF EXISTS orders_update ON orders;
CREATE POLICY orders_update ON orders FOR UPDATE TO authenticated
  USING (is_seller() OR is_school_member(school_id))
  WITH CHECK (is_seller() OR is_school_member(school_id));

-- ---- ORDER_ITEMS: via parent order ----
DROP POLICY IF EXISTS order_items_select ON order_items;
CREATE POLICY order_items_select ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (is_seller() OR is_school_member(o.school_id))));

DROP POLICY IF EXISTS order_items_insert ON order_items;
CREATE POLICY order_items_insert ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (is_seller() OR o.user_id = auth.uid())));

-- ---- ORDER_STATUS_HISTORY ----
DROP POLICY IF EXISTS osh_select ON order_status_history;
CREATE POLICY osh_select ON order_status_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_status_history.order_id AND (is_seller() OR is_school_member(o.school_id))));

DROP POLICY IF EXISTS osh_insert ON order_status_history;
CREATE POLICY osh_insert ON order_status_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_status_history.order_id AND (is_seller() OR o.user_id = auth.uid())));

-- ---- PAYMENTS ----
DROP POLICY IF EXISTS payments_select ON payments;
CREATE POLICY payments_select ON payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = payments.order_id AND (is_seller() OR is_school_member(o.school_id))));

DROP POLICY IF EXISTS payments_insert ON payments;
CREATE POLICY payments_insert ON payments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = payments.order_id AND (is_seller() OR o.user_id = auth.uid())));

DROP POLICY IF EXISTS payments_update ON payments;
CREATE POLICY payments_update ON payments FOR UPDATE TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- COUPONS: seller manage; school read active ----
DROP POLICY IF EXISTS coupons_select ON coupons;
CREATE POLICY coupons_select ON coupons FOR SELECT TO authenticated
  USING (is_seller() OR is_active = true);

DROP POLICY IF EXISTS coupons_modify ON coupons;
CREATE POLICY coupons_modify ON coupons FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- ANNOUNCEMENTS: public read active ----
DROP POLICY IF EXISTS ann_select ON announcements;
CREATE POLICY ann_select ON announcements FOR SELECT TO anon, authenticated
  USING (is_active = true OR is_seller());

DROP POLICY IF EXISTS ann_modify ON announcements;
CREATE POLICY ann_modify ON announcements FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- TICKETS: owner or seller ----
DROP POLICY IF EXISTS tickets_select ON tickets;
CREATE POLICY tickets_select ON tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_seller());

DROP POLICY IF EXISTS tickets_insert ON tickets;
CREATE POLICY tickets_insert ON tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS tickets_update ON tickets;
CREATE POLICY tickets_update ON tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_seller()) WITH CHECK (user_id = auth.uid() OR is_seller());

-- ---- TICKET_MESSAGES ----
DROP POLICY IF EXISTS tm_select ON ticket_messages;
CREATE POLICY tm_select ON ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_messages.ticket_id AND (t.user_id = auth.uid() OR is_seller())));

DROP POLICY IF EXISTS tm_insert ON ticket_messages;
CREATE POLICY tm_insert ON ticket_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_messages.ticket_id AND (t.user_id = auth.uid() OR is_seller())));

-- ---- SETTINGS: public read; seller write ----
DROP POLICY IF EXISTS settings_select ON settings;
CREATE POLICY settings_select ON settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS settings_modify ON settings;
CREATE POLICY settings_modify ON settings FOR ALL TO authenticated
  USING (is_seller()) WITH CHECK (is_seller());

-- ---- STOCK_ADJUSTMENTS: seller only ----
DROP POLICY IF EXISTS sa_select ON stock_adjustments;
CREATE POLICY sa_select ON stock_adjustments FOR SELECT TO authenticated USING (is_seller());

DROP POLICY IF EXISTS sa_insert ON stock_adjustments;
CREATE POLICY sa_insert ON stock_adjustments FOR INSERT TO authenticated WITH CHECK (is_seller());
