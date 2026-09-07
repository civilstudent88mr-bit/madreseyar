import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { useToast } from '../../lib/toast'
import { Breadcrumbs } from '../../lib/ui'

export default function Contact() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', school: '', phone: '', message: '' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    toast('success', 'پیام شما ثبت شد. به زودی با شما تماس می‌گیریم.')
    setForm({ name: '', school: '', phone: '', message: '' })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'تماس با ما' }]} />
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">تماس با ما</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[
            { icon: Phone, title: 'تلفن تماس', value: '۰۲۱-۹۱۰۰۰۰۰۰' },
            { icon: MessageCircle, title: 'واتساپ', value: '۰۹۱۲۰۰۰۰۰۰۰' },
            { icon: Mail, title: 'ایمیل', value: 'info@madrese-yar.ir' },
            { icon: MapPin, title: 'آدرس', value: 'تهران، خیابان ولیعصر، پلاک ۱۲۰' },
          ].map((c, i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <c.icon className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="font-bold text-gray-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="card p-5 space-y-4">
          <div>
            <label className="label">نام و نام خانوادگی</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="نام شما" />
          </div>
          <div>
            <label className="label">نام مدرسه</label>
            <input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className="input" placeholder="نام مدرسه" />
          </div>
          <div>
            <label className="label">شماره تماس</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="۰۹۱۲۰۰۰۰۰۰۰" />
          </div>
          <div>
            <label className="label">پیام شما</label>
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input min-h-[100px]" placeholder="پیام خود را بنویسید..." />
          </div>
          <button type="submit" className="btn-primary w-full"><Send className="w-5 h-5" /> ارسال پیام</button>
        </form>
      </div>
    </div>
  )
}
