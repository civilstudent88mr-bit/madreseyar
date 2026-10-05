const { createClient } = require('@supabase/supabase-js')
function json(res, status, body) { res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body)) }
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.AI_ADMIN_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Admin catalog service is not configured in Vercel.' })
  if (req.headers['x-admin-secret'] !== process.env.AI_ADMIN_SECRET) return json(res, 401, { error: 'Invalid admin secret' })
  const productId = typeof req.body?.productId === 'string' ? req.body.productId : ''
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return json(res, 400, { error: 'Invalid product id' })
  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data, error } = await supabase.from('products').update({ is_active: false }).eq('id', productId).select('id,name,is_active').maybeSingle()
    if (error) throw error
    if (!data) return json(res, 404, { error: 'Product not found' })
    return json(res, 200, { product: data })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: error.message || 'Product could not be removed' })
  }
}
