const { createClient } = require('@supabase/supabase-js')

const { isAdmin } = require('./_admin-auth')

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Site settings are not configured.' })
  if (req.method === 'POST' && !isAdmin(req)) {
    return json(res, process.env.AI_ADMIN_SECRET ? 401 : 503, { error: 'Invalid or missing admin configuration.' })
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'site_footer').maybeSingle()
      if (error) throw error
      let stored = {}
      try { stored = data?.value ? JSON.parse(data.value) : {} } catch { stored = {} }
      const footer = stored.footer || (stored.description || stored.phone || stored.hours ? stored : {})
      return json(res, 200, { footer, contact: stored.contact || {} })
    }

    const footer = req.body?.footer
    const contact = req.body?.contact
    if (!footer || typeof footer !== 'object' || Array.isArray(footer) || !contact || typeof contact !== 'object' || Array.isArray(contact)) return json(res, 400, { error: 'Invalid site content settings.' })
    const footerValues = {
      description: String(footer.description || '').trim().slice(0, 1000),
      phone: String(footer.phone || '').trim().slice(0, 40),
      hours: String(footer.hours || '').trim().slice(0, 240),
    }
    const contactValues = {
      phone: String(contact.phone || '').trim().slice(0, 40),
      whatsapp: String(contact.whatsapp || '').trim().slice(0, 40),
      email: String(contact.email || '').trim().slice(0, 160),
      address: String(contact.address || '').trim().slice(0, 500),
    }
    const { error } = await supabase.from('settings').upsert({ key: 'site_footer', value: JSON.stringify({ footer: footerValues, contact: contactValues }) })
    if (error) throw error
    return json(res, 200, { footer: footerValues, contact: contactValues })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: 'Could not load or save footer settings.' })
  }
}
