const { createClient } = require('@supabase/supabase-js')
const { isAdmin, setAdminCookie, clearAdminCookie } = require('./_admin-auth')

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

function serviceClient() {
  return createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'GET') {
    if (!isAdmin(req)) return json(res, 401, { authenticated: false })
    return json(res, 200, { authenticated: true })
  }
  if (req.method === 'DELETE') {
    clearAdminCookie(res)
    return json(res, 200, { ok: true })
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.AI_ADMIN_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Admin authentication is not configured.' })
  const accessToken = req.body?.accessToken
  if (typeof accessToken !== 'string' || accessToken.length > 4096) return json(res, 401, { error: 'نشست ورود معتبر نیست.' })
  try {
    const client = serviceClient()
    const { data: authData, error: authError } = await client.auth.getUser(accessToken)
    if (authError || !authData.user) return json(res, 401, { error: 'نشست ورود معتبر نیست.' })
    const { data: profile, error } = await client.from('profiles').select('role,is_active').eq('id', authData.user.id).maybeSingle()
    if (error || !profile?.is_active || !String(profile.role).startsWith('seller_')) return json(res, 403, { error: 'این حساب دسترسی مدیریت ندارد.' })
    setAdminCookie(res)
    return json(res, 200, { authenticated: true })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: 'تأیید حساب مدیریت انجام نشد.' })
  }
}
