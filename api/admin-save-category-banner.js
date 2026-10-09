const { createClient } = require('@supabase/supabase-js')

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.AI_ADMIN_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Admin category service is not configured.' })
  if (req.headers['x-admin-secret'] !== process.env.AI_ADMIN_SECRET) return json(res, 401, { error: 'Invalid admin secret' })

  const input = req.body || {}
  const requestedId = typeof input.categoryId === 'string' ? input.categoryId : ''
  const categoryInput = input.category && typeof input.category === 'object' ? input.category : {}
  const categorySlug = typeof categoryInput.slug === 'string' ? categoryInput.slug.trim() : ''
  const isUuid = /^[0-9a-f-]{36}$/i.test(requestedId)
  if (!isUuid && !/^[\p{L}\p{N}_-]{1,120}$/u.test(categorySlug)) return json(res, 400, { error: 'Invalid category' })
  if (input.remove !== true && (typeof input.image !== 'string' || input.image.length > 1_500_000)) {
    return json(res, 400, { error: 'Select an image smaller than 1 MB.' })
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    let categoryQuery = supabase.from('categories').select('id').limit(1)
    categoryQuery = isUuid ? categoryQuery.eq('id', requestedId) : categoryQuery.eq('slug', categorySlug)
    let { data: existingCategory, error: lookupError } = await categoryQuery.maybeSingle()
    if (lookupError) throw lookupError
    if (!existingCategory && isUuid && /^[\p{L}\p{N}_-]{1,120}$/u.test(categorySlug)) {
      const fallback = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
      if (fallback.error) throw fallback.error
      existingCategory = fallback.data
    }

    let categoryId = existingCategory?.id
    if (!categoryId && !isUuid && typeof categoryInput.name === 'string' && categoryInput.name.trim()) {
      const { data: createdCategory, error: createError } = await supabase.from('categories').insert({
        name: categoryInput.name.trim().slice(0, 120),
        slug: categorySlug,
        icon: typeof categoryInput.icon === 'string' ? categoryInput.icon.slice(0, 80) : null,
        sort_order: Number.isInteger(categoryInput.order) ? categoryInput.order : 0,
        is_active: categoryInput.active !== false,
      }).select('id').single()
      if (createError) throw createError
      categoryId = createdCategory.id
    }
    if (!categoryId) return json(res, 404, { error: 'Category was not found.' })

    let bannerUrl = null

    if (input.remove !== true) {
      const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/i.exec(input.image)
      if (!match) return json(res, 400, { error: 'Only JPG, PNG, or WEBP images are supported.' })
      const extension = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase()
      const path = `category-banners/${categoryId}/${Date.now()}.${extension}`
      const upload = await supabase.storage.from('product-images').upload(path, Buffer.from(match[2], 'base64'), {
        contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        cacheControl: '3600',
        upsert: false,
      })
      if (upload.error) throw upload.error
      bannerUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    }

    const { data, error } = await supabase.from('categories').update({ banner_url: bannerUrl }).eq('id', categoryId).select('id, banner_url').single()
    if (error) throw error
    return json(res, 200, { categoryId: data.id, bannerUrl: data.banner_url || undefined })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: error.message || 'Category banner could not be saved.' })
  }
}
