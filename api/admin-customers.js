const { createClient } = require('@supabase/supabase-js')
const { isAdmin } = require('./_admin-auth')

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  if (!isAdmin(req)) return json(res, 401, { error: 'Unauthorized' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Customer list is not configured.' })
  try {
    const client = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data, error } = await client.from('profiles').select('id,full_name,mobile,email,role,created_at,schools(id,name,province,city,address,postal_code,status)').in('role', ['school_admin', 'school_user']).order('created_at', { ascending: false })
    if (error) throw error
    return json(res, 200, { customers: data || [] })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: 'فهرست مشتریان دریافت نشد.' })
  }
}
