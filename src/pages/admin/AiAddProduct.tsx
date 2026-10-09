import { useState, type FormEvent } from 'react'
import { BrainCircuit, CheckCircle2, Image, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '../../lib/toast'

interface GeneratedProduct {
  id: string
  name: string
  short_desc: string | null
  brand: string | null
  our_price: number
  image?: string
}

export default function AiAddProduct() {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<GeneratedProduct | null>(null)

  async function generateProduct(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return toast('error', 'نام محصول را وارد کنید')
    setLoading(true)
    setProduct(null)
    try {
      const response = await fetch('/api/ai-add-product', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name.trim(), productDetails: details.trim(), productUrl: sourceUrl.trim() }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'تولید محصول انجام نشد')
      setProduct(result.product)
      setName(''); setDetails(''); setSourceUrl('')
      toast('success', 'محصول تولید و در فروشگاه منتشر شد')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'خطا در تولید محصول')
    } finally { setLoading(false) }
  }

  return <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center"><BrainCircuit className="w-6 h-6" /></div><div><h1 className="text-xl font-extrabold text-gray-900">افزودن محصول با هوش مصنوعی</h1><p className="text-sm text-gray-500">نام محصول یا لینک منبع را بدهید تا اطلاعات محصول برای بررسی تولید شود.</p></div></div>
    <form onSubmit={generateProduct} className="card p-5 space-y-4">
      <div><label className="label">نام دقیق محصول</label><input required value={name} onChange={(event) => setName(event.target.value)} className="input text-lg" placeholder="مثلاً سرم ویتامین C، برند و حجم" disabled={loading} /></div>
      <div><label className="label">لینک صفحهٔ محصول (اختیاری)</label><input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="input" dir="ltr" placeholder="https://example.com/product/..." disabled={loading} /><p className="text-xs text-gray-500 mt-1">صفحه باید عمومی و بدون ورود باشد. اطلاعات تولیدشده را پیش از انتشار بررسی کنید.</p></div>
      <div><label className="label">اطلاعات تکمیلی (اختیاری)</label><textarea value={details} onChange={(event) => setDetails(event.target.value)} className="input min-h-36 leading-7" maxLength={4000} placeholder="ترکیبات دقیق، حجم، روش مصرف، هشدارهای روی بسته‌بندی و قیمت تأییدشده را وارد کنید." disabled={loading} /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 justify-center">{loading ? <><Loader2 className="w-5 h-5 animate-spin" />در حال تولید و ثبت…</> : <><Sparkles className="w-5 h-5" />تولید و ثبت خودکار</>}</button>
    </form>
    {product && <section className="card p-5"><div className="flex items-center gap-2 text-success-700 font-bold mb-4"><CheckCircle2 className="w-5 h-5" />محصول منتشر شد</div><div className="grid md:grid-cols-[180px_1fr] gap-5">{product.image && <img src={product.image} alt={product.name} className="w-full h-44 object-cover rounded-2xl" />}<div><h2 className="text-xl font-extrabold text-gray-900">{product.name}</h2><p className="text-sm text-gray-500 mt-1">{product.brand}</p><p className="text-sm text-gray-700 mt-4 leading-7">{product.short_desc}</p><p className="text-sm text-primary-700 font-bold mt-4">قیمت فروش: {product.our_price.toLocaleString('fa-IR')} تومان</p>{product.image && <div className="flex items-center gap-2 text-xs text-gray-500 mt-3"><Image className="w-4 h-4" />تصویر محصول ثبت شد</div>}</div></div></section>}
  </div>
}
