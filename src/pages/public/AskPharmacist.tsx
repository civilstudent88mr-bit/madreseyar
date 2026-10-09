import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Loader2, MessageCircle, Mic, Send, Sparkles, Square, Trash2 } from 'lucide-react'
import { formatTomanShort } from '../../lib/format'

type Recommendation = {
  id: string
  name: string
  brand?: string
  packSize?: string
  price: number
  reason: string
  usage: string
  path: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  recommendations?: Recommendation[]
}

export default function AskPharmacist() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const recordingTimerRef = useRef<number | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  useEffect(() => () => {
    if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current)
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function startRecording() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('ضبط صدا در این مرورگر پشتیبانی نمی‌شود؛ پیام را تایپ کنید.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current)
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        recorderRef.current = null
        setRecording(false)
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        chunksRef.current = []
        if (audio.size > 2_500_000) {
          setAudioBlob(null)
          setError('حجم صدا زیاد است؛ لطفاً یک پیام کوتاه‌تر ضبط کنید (حداکثر ۲٫۵ مگابایت).')
        } else if (audio.size) {
          setAudioBlob(audio)
          setError('')
        }
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      recordingTimerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, 60_000)
    } catch {
      setError('دسترسی به میکروفون ممکن نشد. اجازهٔ میکروفون را بررسی کنید یا پیام را تایپ کنید.')
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (loading || (!text && !audioBlob)) return
    setLoading(true)
    setError('')
    try {
      let audio: { mimeType: string; base64: string } | undefined
      if (audioBlob) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('audio'))
          reader.onerror = () => reject(new Error('audio'))
          reader.readAsDataURL(audioBlob)
        })
        audio = { mimeType: audioBlob.type, base64: dataUrl.slice(dataUrl.indexOf(',') + 1) }
      }

      const response = await fetch('/api/ask-pharmacist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(-10).map(({ role, content }) => ({ role, content })), message: text, audio }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'پاسخ دریافت نشد؛ دوباره تلاش کنید.')

      const userContent = [result.transcript ? `متن ویس: ${result.transcript}` : '', text].filter(Boolean).join('\n') || 'پیام صوتی'
      const followUpText = Array.isArray(result.followUpQuestions) && result.followUpQuestions.length
        ? `\n\nبرای راهنمایی دقیق‌تر:\n${result.followUpQuestions.map((question: string) => `• ${question}`).join('\n')}`
        : ''
      setMessages((current) => [
        ...current,
        { role: 'user', content: userContent },
        { role: 'assistant', content: `${result.reply || ''}${followUpText}`, recommendations: Array.isArray(result.recommendations) ? result.recommendations : [] },
      ])
      setDraft('')
      setAudioBlob(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ارتباط با دستیار برقرار نشد.')
    } finally {
      setLoading(false)
    }
  }

  function resetConversation() {
    if (loading) return
    setMessages([])
    setDraft('')
    setAudioBlob(null)
    setError('')
  }

  return <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
    <header className="text-center max-w-2xl mx-auto mb-7">
      <div className="w-14 h-14 rounded-2xl bg-[#e6f4f1] text-[#0f766e] flex items-center justify-center mx-auto mb-3"><MessageCircle className="w-7 h-7" /></div>
      <h1 className="text-2xl sm:text-3xl font-black text-[#3f2c29]">از داروسازت بپرس</h1>
      <p className="text-sm text-gray-600 leading-7 mt-2">مشکل پوست یا موی خود را بنویسید یا ویس بفرستید تا دستیار هوش مصنوعی محصولات مرتبط فروشگاه را پیدا کند.</p>
    </header>

    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5 text-sm text-amber-950 leading-7">
      <div className="flex gap-2"><AlertTriangle className="w-5 h-5 shrink-0 mt-1" /><p><strong>اطلاع مهم:</strong> پیام‌ها و صدای ارسالی برای تحلیل و رونویسی به AvalAI فرستاده می‌شوند و در دیتابیس یا حساب کاربری سایت ذخیره نمی‌شوند. لطفاً نام و اطلاعات هویتی ننویسید. این دستیار تشخیص پزشکی نمی‌دهد؛ دستور مصرف را فقط از اطلاعات ثبت‌شدهٔ محصول نمایش می‌دهد.</p></div>
    </div>

    <section className="rounded-3xl border border-[#eee3dd] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[#f1e8e3] px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#3f2c29]"><Sparkles className="w-4 h-4 text-[#d8665d]" /> گفتگوی راهنمای محصولات</div>
        {messages.length > 0 && <button type="button" onClick={resetConversation} disabled={loading} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50"><Trash2 className="w-4 h-4" /> گفتگوی جدید</button>}
      </div>

      <div className="min-h-64 max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && <div className="max-w-xl mx-auto text-center py-8 text-gray-500">
          <p className="font-bold text-gray-700">سلام! چطور می‌توانم در انتخاب محصولات پوست و مو کمک کنم؟</p>
          <p className="text-sm mt-2 leading-7">مثلاً بنویسید: «پوستم خشک و حساس است و دنبال مرطوب‌کننده می‌گردم.»</p>
        </div>}
        {messages.map((message, index) => <article key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[92%] sm:max-w-[82%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-[#f7f2ef] text-gray-800' : 'bg-[#eaf5f3] text-gray-800'}`}>
            <p className="text-sm leading-7 whitespace-pre-wrap">{message.content}</p>
            {message.recommendations?.map((product) => <div key={product.id} className="mt-3 rounded-xl border border-white bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold text-[#3f2c29]">{product.name}</h3>{product.brand && <p className="text-xs text-gray-500 mt-1">{product.brand}{product.packSize ? ` · ${product.packSize}` : ''}</p>}</div><span className="text-sm font-bold text-[#0f766e]">{formatTomanShort(product.price)} تومان</span></div>
              {product.reason && <p className="text-sm leading-6 text-gray-600 mt-3">{product.reason}</p>}
              <div className="mt-3 rounded-lg bg-[#f8f6f4] p-3"><p className="text-xs font-bold text-gray-700">روش مصرف ثبت‌شده</p><p className="text-sm text-gray-600 leading-6 mt-1">{product.usage || 'روش مصرف در مشخصات سایت درج نشده است؛ دستور درج‌شده روی بسته‌بندی را بررسی کنید.'}</p></div>
              <Link to={product.path} className="btn-primary inline-flex mt-3 py-2 px-4 text-sm">مشاهدهٔ محصول</Link>
            </div>)}
          </div>
        </article>)}
        {loading && <div className="flex justify-end"><div className="rounded-2xl bg-[#eaf5f3] px-4 py-3 text-sm text-gray-600 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> در حال بررسی محصولات سایت...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-[#f1e8e3] p-4 sm:p-5">
        {audioBlob && <div className="mb-3 flex items-center justify-between rounded-lg bg-[#f7f2ef] px-3 py-2 text-xs text-gray-600"><span>ویس آمادهٔ ارسال است ({(audioBlob.size / 1024).toFixed(0)} کیلوبایت)</span><button type="button" onClick={() => setAudioBlob(null)} className="text-red-600">حذف</button></div>}
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} rows={3} placeholder="مشکل پوست یا موی خود را توضیح دهید..." className="input resize-y min-h-20" disabled={loading || recording} />
        {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2">
            {recording ? <button type="button" onClick={stopRecording} className="btn-secondary py-2 px-3 text-sm text-red-600"><Square className="w-4 h-4 fill-current" /> پایان ضبط</button> : <button type="button" onClick={startRecording} disabled={loading} className="btn-secondary py-2 px-3 text-sm"><Mic className="w-4 h-4" /> ضبط ویس (حداکثر ۶۰ ثانیه)</button>}
            {audioBlob && <button type="button" onClick={() => setAudioBlob(null)} className="btn-ghost p-2" aria-label="حذف ویس"><Trash2 className="w-4 h-4" /></button>}
          </div>
          <button type="submit" disabled={loading || recording || (!draft.trim() && !audioBlob)} className="btn-primary py-2.5 px-5 disabled:opacity-50"><Send className="w-4 h-4" /> {loading ? 'در حال ارسال...' : 'ارسال پیام'}</button>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">میکروفون فقط هنگام ضبط فعال است. هر گفتگو با انتخاب «گفتگوی جدید» پاک می‌شود.</p>
      </form>
    </section>
  </div>
}
