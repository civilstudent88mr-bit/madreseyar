import { createClient } from '@supabase/supabase-js'
const categories = ['skincare', 'sunscreen', 'face-makeup', 'eye-lip-makeup', 'haircare', 'bodycare', 'personal-hygiene', 'fragrance']
const fallbackImages = {
  skincare: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80',
  sunscreen: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
  'face-makeup': 'https://images.unsplash.com/photo-1522335789203-a043ef5917c7?auto=format&fit=crop&w=900&q=80',
  'eye-lip-makeup': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
  haircare: 'https://images.unsplash.com/photo-1527799820374-dcf8c1d4b9bb?auto=format&fit=crop&w=900&q=80',
  bodycare: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80',
  'personal-hygiene': 'https://images.unsplash.com/photo-1556229010-6c3f2c9c7f9f?auto=format&fit=crop&w=900&q=80',
  fragrance: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
}
function json(res, status, body) { res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body)) }
function slugify(value) { return String(value).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || `product-${Date.now()}` }
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!process.env.AI_ADMIN_SECRET || !process.env.OPENAI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 503, { error: 'AI service is not configured in Vercel.' })
  if (req.headers['x-admin-secret'] !== process.env.AI_ADMIN_SECRET) return json(res, 401, { error: 'کلید دسترسی AI نامعتبر است' })
  const productName = typeof req.body?.productName === 'string' ? req.body.productName.trim() : ''
  if (productName.length < 2 || productName.length > 160) return json(res, 400, { error: 'نام محصول باید بین ۲ تا ۱۶۰ کاراکتر باشد' })
  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.35, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'برای فروشگاه Healthcare محتوای دقیق و محتاطانه فارسی برای محصولات مراقبت پوست، آرایشی و بهداشتی تولید کن. ادعای درمان پزشکی نساز. فقط JSON معتبر برگردان.' }, { role: 'user', content: `برای محصول «${productName}» فقط JSON با کلیدهای name, slug, short_desc, long_desc, brand, category_slug, pack_size, market_price, our_price, cost_price, stock_qty, is_featured, is_hygiene, suitable_for, specs, image_url تولید کن. category_slug باید یکی از این‌ها باشد: ${categories.join(', ')}. عنوان، نقد علمی، ترکیبات مؤثر، نحوه مصرف، هشدار مصرف و قیمت تقریبی را در long_desc و specs فارسی بنویس. our_price نباید از market_price بیشتر باشد. اگر تصویر مطمئن نداری image_url را خالی بگذار.` }] }) })
    const aiPayload = await aiResponse.json()
    if (!aiResponse.ok) throw new Error(aiPayload.error?.message || 'AI request failed')
    const generated = JSON.parse(aiPayload.choices?.[0]?.message?.content || '{}')
    const categorySlug = categories.includes(generated.category_slug) ? generated.category_slug : 'skincare'
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: category, error: categoryError } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
    if (categoryError) throw categoryError
    const marketPrice = Math.max(0, Math.round(Number(generated.market_price) || 0))
    const row = { sku: `HC-AI-${Date.now().toString().slice(-8)}`, name: String(generated.name || productName).slice(0, 180), slug: slugify(generated.slug || generated.name || productName), short_desc: String(generated.short_desc || '').slice(0, 500), long_desc: String(generated.long_desc || '').slice(0, 5000), category_id: category?.id || null, brand: String(generated.brand || 'Healthcare').slice(0, 120), unit: 'عدد', pack_size: String(generated.pack_size || '').slice(0, 120), market_price: marketPrice, our_price: Math.min(marketPrice, Math.max(0, Math.round(Number(generated.our_price) || 0))), cost_price: Math.max(0, Math.round(Number(generated.cost_price) || 0)), min_order_qty: 1, step_qty: 1, max_order_qty: 100, stock_qty: Math.max(0, Math.round(Number(generated.stock_qty) || 0)), low_stock_threshold: 5, is_active: true, is_featured: Boolean(generated.is_featured), is_hygiene: Boolean(generated.is_hygiene), suitable_for: Array.isArray(generated.suitable_for) ? generated.suitable_for.map(String).slice(0, 10) : [], specs: generated.specs && typeof generated.specs === 'object' ? generated.specs : {}, weight_grams: 0 }
    const { data: product, error: productError } = await supabase.from('products').insert(row).select('*').single()
    if (productError) throw productError
    const imageUrl = typeof generated.image_url === 'string' && generated.image_url.startsWith('https://') ? generated.image_url : fallbackImages[categorySlug]
    const { error: imageError } = await supabase.from('product_images').insert({ product_id: product.id, url: imageUrl, sort_order: 0 })
    if (imageError) throw imageError
    return json(res, 201, { product: { ...product, image: imageUrl } })
  } catch (error) { console.error(error); return json(res, 500, { error: error.message || 'تولید محصول انجام نشد' }) }
}