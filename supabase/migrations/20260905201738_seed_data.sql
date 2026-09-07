/*
# داده‌های اولیه مدرسه یار

این مایگریشن داده‌های نمونه برای اپلیکیشن ایجاد می‌کند:
- ۸ دسته‌بندی محصول
- ۲۴+ محصول واقعی لوازم مدرسه با قیمت بازار و قیمت مدرسه یار
- ۳ پکیج آماده
- تنظیمات شرکت و حمل‌ونقل
- اطلاعیه‌های نمونه
- کد تخفیف نمونه

## نکات امنیتی
- داده‌ها عمومی (خواندنی) هستند
- cost_price فقط در سطح کوئری کنترل می‌شود
*/

-- ============ SETTINGS ============
INSERT INTO settings (key, value) VALUES
  ('company_name', 'مدرسه یار'),
  ('phone', '021-91000000'),
  ('whatsapp', '09120000000'),
  ('instagram', 'madrese_yar'),
  ('bank_card', '6037-9911-2345-6789'),
  ('sheba', 'IR120170000000001234567890'),
  ('account_holder', 'شرکت تامین لوازم مدرسه یار'),
  ('min_order_amount', '500000'),
  ('free_shipping_over', '5000000'),
  ('default_shipping_fee', '150000'),
  ('provinces_served', 'تهران، البرز، اصفهان، فارس، خراسان رضوی، آذربایجان شرقی، مازندران، گیلان')
ON CONFLICT (key) DO NOTHING;

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug, icon, sort_order, is_active) VALUES
  ('بهداشت و کمک‌های اولیه', 'health-first-aid', 'heart-pulse', 1, true),
  ('شوینده و بهداشتی', 'cleaning-hygiene', 'sparkles', 2, true),
  ('کاغذ و تحریرداری', 'paper-stationery', 'file-text', 3, true),
  ('نوشت‌افزار', 'writing-supplies', 'pen-tool', 4, true),
  ('لوازم دفترداری', 'office-supplies', 'briefcase', 5, true),
  ('لوازم آزمایشگاه و علوم', 'lab-science', 'flask-conical', 6, true),
  ('تجهیزات ورزشی سبک', 'sports-equipment', 'volleyball', 7, true),
  ('پکیج‌های آماده مدرسه', 'ready-bundles', 'package', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCTS ============
-- helper to get category id by slug
-- We'll insert with sub-selects

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-001', 'جعبه کمک‌های اولیه دیواری مدرسه ۲۰ نفره', 'first-aid-wall-20',
  'جعبه کمک‌های اولیه دیواری برای مدارس ۲۰ نفره با محتویات استاندارد',
  'جعبه کمک‌های اولیه دیواری فشاری با محتویات کامل شامل باند، گاز استریل، بتادین، چسب زخم، قیچی، دستکش یکبارمصرف و تب‌سنج. مناسب برای کلاس‌های ۲۰ نفره و مطابق با استاندارد وزارت بهداشت.',
  c.id, 'مدیکال پلاس', 'عدد', 'شامل ۱۵ قلم اقلام مصرفی', 850000, 450000, 280000, 1, 1, 50, 35, 8, true, true, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"ابعاد":"۳۰×۲۰×۸ سانتی‌متر","جنس":"پلاستیک فشرده","رنگ":"سفید/قرمز","استاندارد":"وزارت بهداشت","ساخت":"ایران"}', 1200
FROM categories c WHERE c.slug = 'health-first-aid'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-002', 'جعبه کمک‌های اولیه دیواری مدرسه ۵۰ نفره', 'first-aid-wall-50',
  'جعبه کمک‌های اولیه دیواری بزرگ برای مدارس ۵۰ نفره',
  'نسخه بزرگ‌تر جعبه کمک‌های اولیه با محتویات بیشتر برای کلاس‌های پرجمعیت و سالن‌های ورزشی. شامل تمام اقلام استاندارد به همراه مسکن و سرنگ.',
  c.id, 'مدیکال پلاس', 'عدد', 'شامل ۲۵ قلم اقلام مصرفی', 1450000, 780000, 510000, 1, 1, 30, 22, 5, true, true, true, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"ابعاد":"۴۰×۲۸×۱۰ سانتی‌متر","جنس":"پلاستیک فشرده","رنگ":"سفید/قرمز","استاندارد":"وزارت بهداشت","ساخت":"ایران"}', 1900
FROM categories c WHERE c.slug = 'health-first-aid'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-003', 'صابون مایع آنتی‌باکتریال ۵ لیتری', 'liquid-soap-5l',
  'صابون مایع ضد باکتری ۵ لیتری برای دستشویی مدارس',
  'صابون مایع آنتی‌باکتریال با حجم ۵ لیتر، مناسب برای پمپ دستشویی‌های مدرسه. فرمولاسیون ملایم برای پوست کودکان با خاصیت ضد میکروبی.',
  c.id, 'کلینکس', 'گالن', '۵ لیتر', 180000, 95000, 55000, 1, 1, 100, 60, 15, true, true, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"حجم":"۵ لیتر","نوع":"آنتی‌باکتریال","رنگ":"سبز روشن","ساخت":"ایران"}', 5200
FROM categories c WHERE c.slug = 'cleaning-hygiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-004', 'دستمال کاغذی سطلی ۲۰۰ برگ', 'paper-towel-200',
  'دستمال کاغذی سطلی دو لایه بسته ۲۴ عددی',
  'دستمال کاغذی سطلی دو لایه نرم برای دستشویی و آشپزخانه مدرسه. هر بسته ۲۰۰ برگ. فروش به صورت جعبه ۲۴ عددی.',
  c.id, 'کلینکس', 'جعبه', '۲۴ عدد در جعبه', 720000, 395000, 240000, 1, 1, 40, 18, 6, true, true, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۲۴ عدد","برگ در هر بسته":"۲۰۰","لایه":"دو لایه","ساخت":"ایران"}', 8500
FROM categories c WHERE c.slug = 'cleaning-hygiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-005', 'حوله رولی صنعتی ۸ رولی', 'paper-roll-8',
  'حوله رولی صنعتی برای خشک کردن دست و سطوح',
  'حوله رولی کاغذی صنعتی با مقاومت بالا، مناسب برای دستشویی و آشپزخانه. هر رول ۱۰۰ متر. فروش به صورت بسته ۸ رولی.',
  c.id, 'کلینکس', 'بسته', '۸ رول در بسته', 320000, 165000, 98000, 1, 1, 80, 45, 10, true, false, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد رول":"۸","طول هر رول":"۱۰۰ متر","جنس":"کاغذ بازیافتی","ساخت":"ایران"}', 4200
FROM categories c WHERE c.slug = 'cleaning-hygiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-006', 'کاغذ A4 ۸۰ گرم بسته ۵۰۰ برگی', 'paper-a4-500',
  'کاغذ A4 ۸۰ گرم باکیفیت برای چاپ و کپی',
  'کاغذ A4 با وزن ۸۰ گرم، سفید براق، مناسب برای چاپگر و کپی مدرسه. بسته ۵۰۰ برگی. فروش به صورت پک ۵ عددی.',
  c.id, 'چوب کاغذ', 'بسته', '۵ پک ۵۰۰ برگی', 1250000, 690000, 450000, 1, 1, 30, 12, 4, true, true, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"سایز":"A4","وزن":"۸۰ گرم","تعداد":"۵×۵۰۰ برگ","رنگ":"سفید براق","ساخت":"ایران"}', 12500
FROM categories c WHERE c.slug = 'paper-stationery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-007', 'دفتر مشق ۱۲ عددی', 'notebook-12',
  'دفتر مشق خط‌دار ۱۲ عددی برای ابتدایی',
  'دفتر مشق خط‌دار با جلد مقوایی و صفحات سفید، مناسب برای دانش‌آموزان ابتدایی. بسته ۱۲ عددی.',
  c.id, 'دفترسازی', 'بسته', '۱۲ عدد در بسته', 360000, 185000, 110000, 1, 1, 60, 40, 8, true, false, false, ARRAY['ابتدایی'], '{"تعداد":"۱۲ عدد","صفحات":"۶۰ برگ","خط":"خط‌دار","ساخت":"ایران"}', 2400
FROM categories c WHERE c.slug = 'paper-stationery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-008', 'دفتر نقاشی ۴۰ برگ بسته ۱۰ عددی', 'sketch-pad-10',
  'دفتر نقاشی سفید ۴۰ برگ برای هنر و تصویرسازی',
  'دفتر نقاشی با کاغذ ضخیم ۱۲۰ گرمی مناسب برای آبرنگ و مداد رنگی. بسته ۱۰ عددی.',
  c.id, 'دفترسازی', 'بسته', '۱۰ عدد در بسته', 480000, 255000, 160000, 1, 1, 40, 25, 6, true, false, false, ARRAY['ابتدایی','متوسطه اول'], '{"تعداد":"۱۰ عدد","صفحات":"۴۰ برگ","گراژ":"۱۲۰ گرم","ساخت":"ایران"}', 3200
FROM categories c WHERE c.slug = 'paper-stationery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-009', 'ماژیک وایت‌برد رنگ جور بسته ۱۲ تایی', 'whiteboard-marker-12',
  'ماژیک وایت‌برد رنگ جور برای تخته سفید',
  'ست ماژیک وایت‌برد رنگ جور شامل ۱۲ رنگ، قابل پاک‌کردن با خشک، مناسب برای کلاس درس. نوک فلت.',
  c.id, 'پنتل', 'بسته', '۱۲ رنگ در بسته', 280000, 145000, 85000, 1, 1, 50, 30, 5, true, true, false, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۱۲ رنگ","نوع":"وایت‌برد","نوک":"فلت","قابل پاک‌شدن":"بله","ساخت":"چین"}', 600
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-010', 'ماژیک پایدار مشکی بسته ۱۰ تایی', 'permanent-marker-10',
  'ماژیک پایدار مشکی برای نوشته روی سطوح مختلف',
  'ماژیک پایدار مشکی با نوک متوسط، مناسب برای برچسب‌گذاری و نوشته روی مقوا، پلاستیک و فلز. بسته ۱۰ تایی.',
  c.id, 'پنتل', 'بسته', '۱۰ عدد در بسته', 190000, 98000, 58000, 1, 1, 60, 35, 6, true, false, false, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۱۰ عدد","رنگ":"مشکی","نوک":"متوسط","نوع":"پایدار","ساخت":"چین"}', 450
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-011', 'تخته پاک‌کن وایت‌برد بسته ۵ تایی', 'whiteboard-eraser-5',
  'پاک‌کن وایت‌برد با مغناطیس برای تخته سفید',
  'پاک‌کن وایت‌برد با بدنه پلاستیکی و مغناطیس، قابل شست‌وشو و تعویض نمد. بسته ۵ تایی.',
  c.id, 'پنتل', 'بسته', '۵ عدد در بسته', 120000, 62000, 35000, 1, 1, 80, 50, 8, true, false, false, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۵ عدد","مغناطیس":"دارد","قابل شست‌وشو":"بله","ساخت":"چین"}', 380
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-012', 'اسپری وایت‌برد ۴۰۰ میلی‌لیتری', 'whiteboard-spray-400',
  'مایع پاک‌کننده وایت‌برد برای پاک کردن لکه‌های قدیمی',
  'اسپری پاک‌کننده وایت‌برد با حجم ۴۰۰ میلی‌لیتر، مناسب برای پاک کردن لکه‌های قدیمی و نگهداری تخته.',
  c.id, 'پنتل', 'عدد', '۴۰۰ میلی‌لیتر', 95000, 48000, 28000, 1, 1, 100, 40, 8, true, false, false, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"حجم":"۴۰۰ میلی‌لیتر","نوع":"اسپری","ساخت":"چین"}', 450
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-013', 'چسب ماتیکی بسته ۲۰ تایی', 'glue-stick-20',
  'چسب ماتیکی بدون اسید برای پروژه و کار هنر',
  'چسب ماتیکی با کیفیت بالا، بدون اسید و غیرسمی، مناسب برای کار دانش‌آموزی. بسته ۲۰ تایی هر کدام ۲۱ گرم.',
  c.id, 'پیدوفت', 'بسته', '۲۰ عدد در بسته', 240000, 125000, 72000, 1, 1, 70, 45, 8, true, false, false, ARRAY['ابتدایی','متوسطه اول'], '{"تعداد":"۲۰ عدد","وزن هر عدد":"۲۱ گرم","بدون اسید":"بله","ساخت":"چین"}', 520
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-014', 'چسب نواری پهن ۵ سانتی بسته ۶ تایی', 'tape-wide-6',
  'چسب نواری شفاف پهن برای بسته‌بندی و کار اداری',
  'چسب نواری شفاف با عرض ۵ سانتی‌متر و طول ۵۰ متر، مناسب برای بسته‌بندی و کارهای اداری. بسته ۶ تایی.',
  c.id, 'پیدوفت', 'بسته', '۶ عدد در بسته', 160000, 82000, 48000, 1, 1, 90, 30, 6, true, false, false, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۶ عدد","عرض":"۵ سانتی‌متر","طول":"۵۰ متر","ساخت":"چین"}', 900
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-015', 'منگنه بزرگ بسته ۱۰ تایی', 'stapler-box-10',
  'منگنه بزرگ اداری با جنس فلزی مقاوم',
  'منگنه بزرگ فلزی برای بستنbundle‌های کاغذی ضخیم، شامل ۱۰۰۰ عدد سوزن. بسته ۱۰ تایی.',
  c.id, 'آفیس‌لند', 'بسته', '۱۰ عدد در بسته', 680000, 355000, 220000, 1, 1, 25, 15, 4, true, false, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۱۰ عدد","نوع":"بزرگ فلزی","سوزن":"۱۰۰۰ عدد","ساخت":"چین"}', 3500
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-016', 'پانچ فلزی بسته ۵ تایی', 'hole-punch-5',
  'پانچ فلزی برای سوراخ‌کردن کاغذ و بایگانی',
  'پانچ فلزی مقاوم با ظرفیت ۲۰ برگ، مناسب برای بایگانی و آرشیو. بسته ۵ تایی.',
  c.id, 'آفیس‌لند', 'بسته', '۵ عدد در بسته', 420000, 215000, 130000, 1, 1, 30, 18, 5, true, false, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۵ عدد","ظرفیت":"۲۰ برگ","جنس":"فلز","ساخت":"چین"}', 2800
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-017', 'پوشه پلاستیکی A4 بسته ۵۰ تایی', 'folder-a4-50',
  'پوشه پلاستیکی شفاف A4 برای بایگانی',
  'پوشه پلاستیکی شفاف A4 با جیب، مناسب برای بایگانی مدارک و امتحانات. بسته ۵۰ تایی.',
  c.id, 'آفیس‌لند', 'بسته', '۵۰ عدد در بسته', 350000, 180000, 105000, 1, 1, 40, 25, 6, true, false, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۵۰ عدد","سایز":"A4","جنس":"پلاستیک شفاف","ساخت":"ایران"}', 4200
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-018', 'کلاسور ۵ سانتی بسته ۱۰ تایی', 'binder-10',
  'کلاسور ۵ سانتی‌متری برای بایگانی حجمی',
  'کلاسور ۵ سانتی‌متری با جلد مقوایی و حلقه فلزی، مناسب برای آرشیو حجمی. بسته ۱۰ تایی.',
  c.id, 'آفیس‌لند', 'بسته', '۱۰ عدد در بسته', 580000, 295000, 185000, 1, 1, 30, 20, 5, true, false, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۱۰ عدد","سایز":"۵ سانتی‌متر","حلقه":"فلزی","ساخت":"ایران"}', 5500
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-019', 'خودکار آبی بسته ۵۰ تایی', 'pen-blue-50',
  'خودکار آبی نقطه‌ای برای نوشته اداری',
  'خودکار آبی با نوک نقطه‌ای ۰٫۷ میلی‌متر، مناسب برای نوشته اداری و امتحانی. بسته ۵۰ تایی.',
  c.id, 'پنتل', 'بسته', '۵۰ عدد در بسته', 250000, 128000, 75000, 1, 1, 60, 40, 8, true, true, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۵۰ عدد","رنگ":"آبی","نوک":"۰٫۷ میلی‌متر","ساخت":"چین"}', 1100
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-020', 'مجموعه مداد، پاک‌کن، تراش، خط‌کش', 'pencil-set',
  'ست نوشت‌افزار ابتدایی شامل مداد، پاک‌کن، تراش و خط‌کش',
  'ست کامل نوشت‌افزار برای دانش‌آموز ابتدایی شامل ۲۴ مداد HB، ۱۲ پاک‌کن، ۱۲ تراش و ۱۲ خط‌کش ۲۰ سانتی.',
  c.id, 'فابر', 'بسته', 'ست ۶۰ تکه', 380000, 195000, 115000, 1, 1, 50, 30, 6, true, true, false, ARRAY['ابتدایی'], '{"محتوا":"۲۴ مداد + ۱۲ پاک‌کن + ۱۲ تراش + ۱۲ خط‌کش","ساخت":"چین"}', 1800
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-021', 'گچ تخته سیاه بسته ۵۰ تایی', 'chalk-50',
  'گچ سفید تخته سیاه بدون گرد و غبار',
  'گچ سفید بدون گرد و غبار برای تخته سیاه، باکیفیت و مقاوم در برابر شکستگی. بسته ۵۰ تایی.',
  c.id, 'فابر', 'بسته', '۵۰ عدد در بسته', 140000, 72000, 42000, 1, 1, 80, 55, 10, true, false, false, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم'], '{"تعداد":"۵۰ عدد","رنگ":"سفید","بدون گرد و غبار":"بله","ساخت":"ایران"}', 1500
FROM categories c WHERE c.slug = 'writing-supplies'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-022', 'الکل ۷۰٪ صنعتی ۵ لیتری', 'alcohol-70-5l',
  'الکل صنعتی ۷۰ درصد برای ضدعفونی سطوح',
  'الکل صنعتی ۷۰ درصد با حجم ۵ لیتر، مناسب برای ضدعفونی سطوح و تجهیزات مدرسه.',
  c.id, 'کلینکس', 'گالن', '۵ لیتر', 220000, 115000, 68000, 1, 1, 100, 60, 12, true, true, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"حجم":"۵ لیتر","غلظت":"۷۰٪","نوع":"صنعتی","ساخت":"ایران"}', 4900
FROM categories c WHERE c.slug = 'cleaning-hygiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-023', 'دستکش یکبارمصرف بسته ۱۰۰ تایی', 'gloves-100',
  'دستکش نیتریل یکبارمصرف برای بهداشت و کمک‌های اولیه',
  'دستکش نیتریل یکبارمصرف بدون پودر، مناسب برای کمک‌های اولیه و نظافت. بسته ۱۰۰ تایی.',
  c.id, 'مدیکال پلاس', 'بسته', '۱۰۰ عدد در بسته', 280000, 145000, 88000, 1, 1, 80, 45, 10, true, false, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۱۰۰ عدد","جنس":"نیتریل","بدون پودر":"بله","ساخت":"چین"}', 1200
FROM categories c WHERE c.slug = 'health-first-aid'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-024', 'تب‌سنج دیجیتال بدون تماس', 'thermometer-digital',
  'تب‌سنج دیجیتال بدون تماس برای اندازه‌گیری دمای بدن',
  'تب‌سنج دیجیتال بدون تماس با نمایشگر LCD، اندازه‌گیری سریع در یک ثانیه، مناسب برای بهداری مدرسه.',
  c.id, 'مدیکال پلاس', 'عدد', 'با باتری', 680000, 355000, 215000, 1, 1, 30, 15, 4, true, true, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"نوع":"بدون تماس","نمایشگر":"LCD","زمان اندازه‌گیری":"۱ ثانیه","باتری":"داخل بسته","ساخت":"چین"}', 320
FROM categories c WHERE c.slug = 'health-first-aid'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-025', 'گاز استریل بسته ۵۰ تایی', 'sterile-gauze-50',
  'گاز استریل برای پانسمان و کمک‌های اولیه',
  'گاز استریل بسته‌بندی شده، مناسب برای پانسمان زخم و کمک‌های اولیه. بسته ۵۰ تایی هر کدام ۱۰×۱۰ سانتی.',
  c.id, 'مدیکال پلاس', 'بسته', '۵۰ عدد در بسته', 180000, 92000, 55000, 1, 1, 100, 60, 12, true, false, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۵۰ عدد","سایز":"۱۰×۱۰ سانتی‌متر","نوع":"استریل","ساخت":"ایران"}', 900
FROM categories c WHERE c.slug = 'health-first-aid'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-026', 'بتادین محلول ۱۵ میلی‌لیتری بسته ۱۰ تایی', 'betadine-10',
  'بتادین محلول برای ضدعفونی زخم',
  'بتادین محلول ۱۰ درصد با حجم ۱۵ میلی‌لیتر، مناسب برای ضدعفونی زخم و خراش. بسته ۱۰ تایی.',
  c.id, 'مدیکال پلاس', 'بسته', '۱۰ عدد در بسته', 240000, 125000, 75000, 1, 1, 80, 50, 10, true, false, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"تعداد":"۱۰ عدد","حجم":"۱۵ میلی‌لیتر","غلظت":"۱۰٪","ساخت":"ایران"}', 600
FROM categories c WHERE c.slug = 'health-first-aid'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-027', 'سطل پدال‌دار ۲۰ لیتری', 'pedal-bin-20l',
  'سطل زباله پدال‌دار ۲۰ لیتری برای دستشویی و کلاس',
  'سطل زباله پدال‌دار با حجم ۲۰ لیتر، بدنه پلاستیکی مقاوم، مناسب برای دستشویی و کلاس. رنگ مشکی.',
  c.id, 'کلینکس', 'عدد', '۲۰ لیتر', 320000, 165000, 98000, 1, 1, 40, 25, 5, true, false, true, ARRAY['ابتدایی','متوسطه اول','متوسطه دوم','هنرستان'], '{"حجم":"۲۰ لیتر","رنگ":"مشکی","جنس":"پلاستیک","پدال":"دارد","ساخت":"ایران"}', 1800
FROM categories c WHERE c.slug = 'cleaning-hygiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT
  'MY-028', 'جامایع دیواری استیل', 'wall-flask-steel',
  'فلاسک گرمایشی دیواری برای نوشیدنی داغ',
  'جامایع دیواری استیل با ظرفیت ۵ لیتر، مناسب برای چای و نوشیدنی گرم در دفتر مدرسه.',
  c.id, 'کلینکس', 'عدد', '۵ لیتر', 580000, 295000, 185000, 1, 1, 20, 12, 3, true, false, false, ARRAY['متوسطه اول','متوسطه دوم','هنرستان'], '{"ظرفیت":"۵ لیتر","جنس":"استیل","نوع":"دیواری","ساخت":"ایران"}', 2200
FROM categories c WHERE c.slug = 'office-supplies'
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCT IMAGES ============
-- We'll use picsum placeholder URLs with product slugs
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://picsum.photos/seed/' || slug || '/600/600', 0 FROM products
ON CONFLICT DO NOTHING;

-- ============ BUNDLES ============
INSERT INTO bundles (name, slug, description, school_level, season, market_total, our_total, is_active, image)
VALUES
  ('پکیج شروع سال تحصیلی ۴۰ نفره', 'bundle-start-40', 'پکیج کامل برای شروع سال تحصیلی کلاس ۴۰ نفره شامل نوشت‌افزار، کاغذ و لوازم بهداشتی', 'متوسطه اول', 'ابتدای سال', 4850000, 2650000, true, 'https://picsum.photos/seed/bundle-start/600/400'),
  ('پکیج بهداشت و کمک‌های اولیه مدرسه', 'bundle-health', 'پکیج بهداشتی کامل برای مدرسه شامل جعبه کمک‌های اولیه، صابون، الکل و دستمال', 'ابتدایی', 'بهداشت', 3250000, 1780000, true, 'https://picsum.photos/seed/bundle-health/600/400'),
  ('پکیج اتاق مدیران / دفتر مدرسه', 'bundle-office', 'پکیج لوازم دفتری برای اتاق مدیر و دفتر مدرسه شامل کلاسور، پوشه، خودکار و لوازم اداری', 'متوسطه دوم', 'اداری', 3950000, 2150000, true, 'https://picsum.photos/seed/bundle-office/600/400')
ON CONFLICT (slug) DO NOTHING;

-- Bundle items
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 2 FROM bundles b, products p WHERE b.slug='bundle-start-40' AND p.slug='paper-a4-500'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 4 FROM bundles b, products p WHERE b.slug='bundle-start-40' AND p.slug='whiteboard-marker-12'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 3 FROM bundles b, products p WHERE b.slug='bundle-start-40' AND p.slug='pen-blue-50'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 2 FROM bundles b, products p WHERE b.slug='bundle-start-40' AND p.slug='notebook-12'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 5 FROM bundles b, products p WHERE b.slug='bundle-start-40' AND p.slug='pencil-set'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 1 FROM bundles b, products p WHERE b.slug='bundle-health' AND p.slug='first-aid-wall-50'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 4 FROM bundles b, products p WHERE b.slug='bundle-health' AND p.slug='liquid-soap-5l'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 2 FROM bundles b, products p WHERE b.slug='bundle-health' AND p.slug='alcohol-70-5l'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 3 FROM bundles b, products p WHERE b.slug='bundle-health' AND p.slug='paper-towel-200'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 2 FROM bundles b, products p WHERE b.slug='bundle-health' AND p.slug='gloves-100'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 5 FROM bundles b, products p WHERE b.slug='bundle-office' AND p.slug='binder-10'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 4 FROM bundles b, products p WHERE b.slug='bundle-office' AND p.slug='folder-a4-50'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 3 FROM bundles b, products p WHERE b.slug='bundle-office' AND p.slug='pen-blue-50'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 2 FROM bundles b, products p WHERE b.slug='bundle-office' AND p.slug='stapler-box-10'
ON CONFLICT DO NOTHING;
INSERT INTO bundle_items (bundle_id, product_id, qty)
SELECT b.id, p.id, 1 FROM bundles b, products p WHERE b.slug='bundle-office' AND p.slug='wall-flask-steel'
ON CONFLICT DO NOTHING;

-- ============ ANNOUNCEMENTS ============
INSERT INTO announcements (title, body, is_active, starts_at)
VALUES
  ('شروع سفارش‌های قبل از مهر', 'همکاران گرامی، سفارش‌های لوازم قبل از شروع سال تحصیلی را از همین امروز ثبت کنید تا در زمان تحویل با تخفیف ویژه بهره‌مند شوید.', true, now()),
  ('تخفیف پاییزه روی پکیج بهداشت', 'پکیج بهداشت و کمک‌های اولیه مدرسه با ۱۰٪ تخفیف اضافه تا پایان مهرماه.', true, now())
ON CONFLICT DO NOTHING;

-- ============ COUPONS ============
INSERT INTO coupons (code, percent, min_order, max_uses, is_active, expires_at)
VALUES ('MEHR1405', 10, 1000000, 100, true, now() + interval '60 days')
ON CONFLICT (code) DO NOTHING;
