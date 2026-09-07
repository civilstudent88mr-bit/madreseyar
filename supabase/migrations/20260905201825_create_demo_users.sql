/*
# ایجاد کاربران دموی احراز هویت

این مایگریشن دو کاربر دمو ایجاد می‌کند:
- school@demo.com (کاربر مدرسه، تأیید شده)
- admin@demo.com (مدیر فروشنده)

رمز عبور هر دو: Demo1234!
*/

-- Insert admin user (seller) - check existence first
DO $$
DECLARE
  admin_id uuid;
  school_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@demo.com';
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated', 'admin@demo.com',
      crypt('Demo1234!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}'
    )
    RETURNING id INTO admin_id;
  END IF;

  SELECT id INTO school_id FROM auth.users WHERE email = 'school@demo.com';
  IF school_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated', 'school@demo.com',
      crypt('Demo1234!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}'
    )
    RETURNING id INTO school_id;
  END IF;
END $$;

-- Create profiles
INSERT INTO profiles (id, full_name, mobile, email, role, school_id, is_active)
SELECT u.id, 'مدیر فروش', '09120000000', 'admin@demo.com', 'seller_admin', null, true
FROM auth.users u WHERE u.email = 'admin@demo.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, full_name, mobile, email, role, school_id, is_active)
SELECT u.id, 'آقای رضایی', '09120000001', 'school@demo.com', 'school_admin', s.id, true
FROM auth.users u, schools s
WHERE u.email = 'school@demo.com' AND s.name = 'دبیرستان نمونه شهید بهشتی'
ON CONFLICT (id) DO NOTHING;
