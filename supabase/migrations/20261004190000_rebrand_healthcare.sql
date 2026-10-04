-- Healthcare rebrand and cosmetic catalog
UPDATE settings SET value = 'Healthcare' WHERE key = 'company_name';
UPDATE settings SET value = 'healthcare_store' WHERE key = 'instagram';
UPDATE settings SET value = 'Healthcare' WHERE key = 'account_holder';

UPDATE categories SET is_active = false
WHERE slug IN ('health-first-aid','cleaning-hygiene','paper-stationery','writing-supplies','office-supplies','lab-science','sports-equipment','ready-bundles');
UPDATE products SET is_active = false WHERE sku LIKE 'MY-%';
UPDATE bundles SET is_active = false WHERE slug LIKE 'bundle-%';

INSERT INTO categories (name, slug, icon, sort_order, is_active) VALUES
  ('مراقبت از پوست', 'skincare', 'sparkles', 1, true),
  ('آرایش صورت', 'face-makeup', 'palette', 2, true),
  ('آرایش چشم و لب', 'eye-lip-makeup', 'eye', 3, true),
  ('مراقبت از مو', 'haircare', 'waves', 4, true),
  ('مراقبت بدن', 'bodycare', 'heart', 5, true),
  ('بهداشت شخصی', 'personal-hygiene', 'shield-check', 6, true),
  ('ضدآفتاب', 'sunscreen', 'sun', 7, true),
  ('عطر و خوشبوکننده', 'fragrance', 'wind', 8, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order, is_active = true;

INSERT INTO products (sku, name, slug, short_desc, long_desc, category_id, brand, unit, pack_size, market_price, our_price, cost_price, min_order_qty, step_qty, max_order_qty, stock_qty, low_stock_threshold, is_active, is_featured, is_hygiene, suitable_for, specs, weight_grams)
SELECT v.sku, v.name, v.slug, v.short_desc, v.long_desc, c.id, v.brand, 'عدد', v.pack_size, v.market_price, v.our_price, v.cost_price, 1, 1, 100, v.stock_qty, 5, true, v.is_featured, v.is_hygiene, ARRAY['عمومی'], v.specs::jsonb, v.weight_grams
FROM (VALUES
  ('HC-001','ژل شست‌وشوی صورت پوست چرب','face-cleanser-oily','پاک‌کننده ملایم و بدون ایجاد خشکی','مناسب استفاده روزانه برای پوست‌های چرب و مختلط','skincare','CeraCare','200 میلی‌لیتر',420000,349000,260000,42,true,true,'{"نوع پوست":"چرب و مختلط","حجم":"200 ml"}',230),
  ('HC-002','کرم آبرسان هیالورونیک','hyaluronic-moisturizer','آبرسان سبک برای مصرف روزانه','آبرسان عمیق با بافت سبک و جذب سریع','skincare','HydraLab','50 میلی‌لیتر',580000,469000,350000,35,true,false,'{"ترکیب کلیدی":"هیالورونیک اسید","بافت":"ژل کرم"}',90),
  ('HC-003','سرم ویتامین C روشن‌کننده','vitamin-c-serum','سرم روشن‌کننده و ضدلک','حاوی ویتامین C پایدار برای شفافیت و یکنواختی پوست','skincare','GlowLab','30 میلی‌لیتر',790000,649000,480000,28,true,false,'{"ترکیب کلیدی":"ویتامین C","درصد":"10%"}',60),
  ('HC-004','ضدآفتاب بی‌رنگ SPF50','spf50-sunscreen','محافظت روزانه در برابر UVA و UVB','ضدآفتاب سبک با جذب سریع و بدون سفیدی روی پوست','sunscreen','SunShield','50 میلی‌لیتر',690000,559000,410000,31,true,true,'{"SPF":"50","رنگ":"بی‌رنگ"}',70),
  ('HC-005','کرم‌پودر مات با پوشش متوسط','matte-foundation','پوشش طبیعی و ماندگار','کرم‌پودر مات مناسب آرایش روزانه با پوشش قابل ساخت','face-makeup','VelvetTone','30 میلی‌لیتر',820000,679000,510000,24,true,false,'{"پوشش":"متوسط","فینیش":"مات"}',80),
  ('HC-006','ریمل حجم‌دهنده مشکی','volume-mascara','حجم‌دهنده و ضدریزش','برس فیبری برای تفکیک و افزایش حجم مژه‌ها','eye-lip-makeup','LashPro','12 میلی‌لیتر',460000,379000,275000,38,true,false,'{"رنگ":"مشکی","ویژگی":"حجم‌دهنده"}',55),
  ('HC-007','رژلب جامد مات','matte-lipstick','رنگ‌دهی بالا با فینیش مات','رژلب نرم و بادوام با رنگدانه قوی','eye-lip-makeup','ColorMuse','4 گرم',390000,319000,230000,45,false,false,'{"فینیش":"مات","ماندگاری":"8 ساعت"}',25),
  ('HC-008','شامپو بدون سولفات','sulfate-free-shampoo','پاک‌کنندگی ملایم برای موهای آسیب‌دیده','شامپوی روزانه مناسب موهای رنگ‌شده و خشک','haircare','PureHair','400 میلی‌لیتر',520000,429000,315000,33,false,true,'{"فاقد":"سولفات و پارابن","مناسب":"موهای رنگ‌شده"}',450),
  ('HC-009','ماسک مو ترمیم‌کننده','repair-hair-mask','نرم‌کننده و ترمیم‌کننده ساقه مو','ماسک مغذی برای کاهش خشکی و وز مو','haircare','PureHair','250 میلی‌لیتر',480000,389000,285000,27,false,true,'{"مناسب":"موهای خشک","اثر":"ترمیم و نرمی"}',280),
  ('HC-010','لوسیون بدن آبرسان','body-hydrating-lotion','رطوبت‌رسان با رایحه ملایم','لوسیون سبک برای استفاده روزانه و پوست خشک','bodycare','SoftSkin','300 میلی‌لیتر',430000,349000,250000,40,false,true,'{"نوع پوست":"خشک و معمولی","رایحه":"ملایم"}',330),
  ('HC-011','دئودورانت رول‌آن بدون الکل','alcohol-free-deodorant','محافظت روزانه بدون ایجاد حساسیت','رول‌آن ملایم مناسب پوست حساس','personal-hygiene','FreshCare','50 میلی‌لیتر',220000,179000,125000,52,false,true,'{"فاقد":"الکل","مدت محافظت":"24 ساعت"}',65),
  ('HC-012','میسلار واتر پاک‌کننده آرایش','micellar-cleansing-water','پاک‌کننده آرایش صورت و چشم','پاک‌کننده ملایم بدون نیاز به آبکشی','skincare','CleanGlow','250 میلی‌لیتر',410000,329000,240000,46,true,true,'{"مناسب":"صورت و چشم","نیاز به آبکشی":"خیر"}',270)
) AS v(sku,name,slug,short_desc,long_desc,category_slug,brand,pack_size,market_price,our_price,cost_price,stock_qty,is_featured,is_hygiene,specs,weight_grams)
JOIN categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, short_desc = EXCLUDED.short_desc, long_desc = EXCLUDED.long_desc, category_id = EXCLUDED.category_id, brand = EXCLUDED.brand, pack_size = EXCLUDED.pack_size, market_price = EXCLUDED.market_price, our_price = EXCLUDED.our_price, cost_price = EXCLUDED.cost_price, stock_qty = EXCLUDED.stock_qty, is_active = true, is_featured = EXCLUDED.is_featured, is_hygiene = EXCLUDED.is_hygiene, specs = EXCLUDED.specs, weight_grams = EXCLUDED.weight_grams;

NOTIFY pgrst, 'reload schema';