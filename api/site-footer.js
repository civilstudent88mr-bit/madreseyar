const { createClient } = require('@supabase/supabase-js')

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Site settings are not configured.' })
  if (req.method === 'POST' && (!process.env.AI_ADMIN_SECRET || req.headers['x-admin-secret'] !== process.env.AI_ADMIN_SECRET)) {
    return json(res, process.env.AI_ADMIN_SECRET ? 401 : 503, { error: 'Invalid or missing admin configuration.' })
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'site_footer').maybeSingle()
      if (error) throw error
      let footer = {}
      try { footer = data?.value ? JSON.parse(data.value) : {} } catch { footer = {} }
      return json(res, 200, { footer })
    }

    const footer = req.body?.footer
    if (!footer || typeof footer !== 'object' || Array.isArray(footer)) return json(res, 400, { error: 'Invalid footer settings.' })
    const values = {
      description: String(footer.description || '').trim().slice(0, 1000),
      phone: String(footer.phone || '').trim().slice(0, 40),
      hours: String(footer.hours || '').trim().slice(0, 240),
    }
    const { error } = await supabase.from('settings').upsert({ key: 'site_footer', value: JSON.stringify(values) })
    if (error) throw error
    return json(res, 200, { footer: values })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: 'Could not load or save footer settings.' })
  }
}
