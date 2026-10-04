# Dermabazar

فروشگاه آنلاین محصولات آرایشی و بهداشتی با React، Vite و Supabase.

## اجرای محلی

```bash
npm install
npm run dev
```

## متغیرهای محیطی

فایل `.env.example` را به `.env` کپی کنید و مقادیر معتبر Supabase را وارد کنید:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

هرگز `service_role key` را داخل فرانت‌اند یا GitHub قرار ندهید.

## Build و انتشار

```bash
npm run build
```

تنظیمات `netlify.toml` برای انتشار روی Netlify آماده است. مقدارهای `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` باید در Environment Variables سرویس انتشار تنظیم شوند.

## Supabase

فایل‌های migration در مسیر `supabase/migrations` قرار دارند. قبل از استفاده عملی، migrationها را روی پروژه Supabase صحیح اجرا کنید و فعال بودن RLS و policyها را بررسی کنید.

## وضعیت فعلی

احراز هویت فعلی هنوز localStorage-based است و برای استفاده تجاری باید به Supabase Auth یا یک backend امن منتقل شود. رمز عبور و OTP نباید در مرورگر یا localStorage نگهداری شوند.
