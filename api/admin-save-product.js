const { createClient } = require('@supabase/supabase-js')
function json(res, status, body) { res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body)) }
function isUuid(value) { return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value) }
function slugify(value) { return String(value).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || `product-${Date.now()}` }
function imageExtension(dataUrl) { const match = /^data:image\/(jpeg|png|webp);base64,/i.exec(dataUrl); return match ? (match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase()) : null }
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.AI_ADMIN_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'Admin catalog service is not configured in Vercel.' })
  if (req.headers['x-admin-secret'] !== process.env.AI_ADMIN_SECRET) return json(res, 401, { error: 'Invalid admin secret' })
  const input = req.body?.product
  if (!input || typeof input.name !== 'string' || input.name.trim().length < 2) return json(res, 400, { error: 'Product name is required' })
  if (![input.marketPrice, input.ourPrice].every((price) => typeof price === 'number' && Number.isFinite(price) && price >= 0)) return json(res, 400, { error: 'قیمت‌ها باید عدد نامنفی و به تومان باشند' })
  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data: category, error: categoryError } = await supabase.from('categories').select('id').eq('name', input.category).maybeSingle()
    if (categoryError) throw categoryError
    const slug = slugify(input.slug || input.name)
    const row = {
      ...(isUuid(input.id) ? { id: input.id } : {}),
      sku: input.sku || null, name: input.name.trim(), slug,
      short_desc: input.desc || '', long_desc: input.longDesc || input.desc || '', category_id: category?.id || null,
      brand: input.brand || null, unit: input.unit || 'عدد', pack_size: input.packQty || null,
      market_price: Math.max(0, Number(input.marketPrice) || 0), our_price: Math.max(0, Number(input.ourPrice) || 0), cost_price: 0,
      min_order_qty: 1, step_qty: 1, max_order_qty: 9999, stock_qty: Math.max(0, Number(input.stock) || 0), low_stock_threshold: 5,
      is_active: input.active !== false, is_featured: Boolean(input.featured), is_hygiene: input.category === 'بهداشتی',
      suitable_for: Array.isArray(input.tags) ? input.tags.map(String).slice(0, 20) : [],
      specs: {
        ...(input.specs && typeof input.specs === 'object' && !Array.isArray(input.specs) ? input.specs : {}),
        features: Array.isArray(input.specs?.features) ? input.specs.features.map(String).slice(0, 30) : [],
        tags: Array.isArray(input.specs?.tags) ? input.specs.tags.map(String).slice(0, 30) : [],
        ingredients: Array.isArray(input.specs?.ingredients) ? input.specs.ingredients.slice(0, 50).map((item) => ({
          name: String(item?.name || '').slice(0, 160),
          amount_per_serving: String(item?.amount_per_serving || '').slice(0, 80),
          daily_value_percent: String(item?.daily_value_percent || '').slice(0, 40),
        })) : [],
      }, weight_grams: 0,
    }
    let saved
    if (isUuid(input.id)) {
      const result = await supabase.from('products').update(row).eq('id', input.id).select('*').single()
      if (result.error) throw result.error
      saved = result.data
    } else {
      const result = await supabase.from('products').upsert(row, { onConflict: 'slug' }).select('*').single()
      if (result.error) throw result.error
      saved = result.data
    }
    let imageUrl = typeof input.image === 'string' && input.image.startsWith('https://') ? input.image : null
    const extension = typeof input.image === 'string' ? imageExtension(input.image) : null
    if (extension) {
      const base64 = input.image.replace(/^data:image\/(jpeg|png|webp);base64,/i, '')
      const path = `${saved.id}/primary-${Date.now()}.${extension}`
      const upload = await supabase.storage.from('product-images').upload(path, Buffer.from(base64, 'base64'), { contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`, upsert: true })
      if (upload.error) throw upload.error
      imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    }
    if (imageUrl) {
      const old = await supabase.from('product_images').select('id').eq('product_id', saved.id).eq('sort_order', 0).maybeSingle()
      if (old.error) throw old.error
      if (old.data) {
        const updated = await supabase.from('product_images').update({ url: imageUrl }).eq('id', old.data.id)
        if (updated.error) throw updated.error
      } else {
        const inserted = await supabase.from('product_images').insert({ product_id: saved.id, url: imageUrl, sort_order: 0 })
        if (inserted.error) throw inserted.error
      }
    }
    return json(res, 200, { product: saved, image: imageUrl })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: error.message || 'Product could not be saved' })
  }
}
