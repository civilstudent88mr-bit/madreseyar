const { createClient } = require('@supabase/supabase-js')

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

function normalizeMobile(value) {
  return String(value || '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s-]/g, '')
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'ثبت‌نام مشتری فعلاً پیکربندی نشده است.' })
  const { name, schoolName, password, address, city, province, postalCode } = req.body || {}
  const mobile = normalizeMobile(req.body?.mobile)
  if (!/^09\d{9}$/.test(mobile) || typeof name !== 'string' || name.trim().length < 2 || name.length > 120 || typeof schoolName !== 'string' || schoolName.trim().length < 2 || schoolName.length > 120 || typeof password !== 'string' || password.length < 8 || password.length > 128 || typeof address !== 'string' || address.trim().length < 5 || address.length > 1000) {
    return json(res, 400, { error: 'نام، نام مرکز، شماره موبایل، نشانی معتبر و گذرواژهٔ حداقل ۸ کاراکتری لازم است.' })
  }

  const client = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  let userId
  let schoolId
  try {
    const email = `${mobile}@accounts.healthcare24.ir`
    const createdUser = await client.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name.trim(), mobile } })
    if (createdUser.error) throw createdUser.error
    userId = createdUser.data.user.id

    const createdSchool = await client.from('schools').insert({
      name: schoolName.trim(), type: null, principal_name: name.trim(), address: address.trim(),
      city: typeof city === 'string' ? city.trim().slice(0, 100) : '',
      province: typeof province === 'string' ? province.trim().slice(0, 100) : '',
      postal_code: typeof postalCode === 'string' ? postalCode.trim().slice(0, 20) : '', status: 'approved',
    }).select('id').single()
    if (createdSchool.error) throw createdSchool.error
    schoolId = createdSchool.data.id

    const createdProfile = await client.from('profiles').insert({ id: userId, full_name: name.trim(), mobile, email, role: 'school_admin', school_id: schoolId, is_active: true })
    if (createdProfile.error) throw createdProfile.error
    return json(res, 201, { ok: true })
  } catch (error) {
    if (schoolId) await client.from('schools').delete().eq('id', schoolId)
    if (userId) await client.auth.admin.deleteUser(userId)
    const duplicate = /already|duplicate|unique/i.test(String(error.message || ''))
    return json(res, duplicate ? 409 : 500, { error: duplicate ? 'این شماره موبایل قبلاً ثبت شده است.' : 'ثبت‌نام انجام نشد؛ اطلاعات را بررسی و دوباره تلاش کنید.' })
  }
}
