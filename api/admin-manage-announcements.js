const { createClient } = require('@supabase/supabase-js')

const { isAdmin } = require('./_admin-auth')

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body))
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.AI_ADMIN_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Admin announcements are not configured in Vercel.' })
  if (!isAdmin(req)) return json(res, 401, { error: 'Unauthorized' })

  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return json(res, 200, { announcements: data })
    }

    const { action, id, title, body, is_active } = req.body || {}
    if (action === 'create') {
      if (typeof title !== 'string' || !title.trim() || title.length > 160 || (body != null && (typeof body !== 'string' || body.length > 4000))) {
        return json(res, 400, { error: 'عنوان یا متن اطلاعیه نامعتبر است.' })
      }
      const { data, error } = await supabase.from('announcements').insert({ title: title.trim(), body: body || '', is_active: true }).select('*').single()
      if (error) throw error
      return json(res, 200, { announcement: data })
    }

    if (!['toggle', 'delete'].includes(action) || typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
      return json(res, 400, { error: 'درخواست اطلاعیه نامعتبر است.' })
    }

    if (action === 'toggle') {
      if (typeof is_active !== 'boolean') return json(res, 400, { error: 'وضعیت اطلاعیه نامعتبر است.' })
      const { data, error } = await supabase.from('announcements').update({ is_active }).eq('id', id).select('id').maybeSingle()
      if (error) throw error
      if (!data) return json(res, 404, { error: 'اطلاعیه پیدا نشد.' })
      return json(res, 200, { success: true })
    }

    const { data, error } = await supabase.from('announcements').delete().eq('id', id).select('id').maybeSingle()
    if (error) throw error
    if (!data) return json(res, 404, { error: 'اطلاعیه پیدا نشد.' })
    return json(res, 200, { success: true })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: 'ذخیره‌سازی اطلاعیه در پایگاه داده ناموفق بود.' })
  }
}
