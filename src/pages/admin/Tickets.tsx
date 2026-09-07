import { useEffect, useState } from 'react'
import { LifeBuoy, Send, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast'
import type { Ticket, TicketMessage } from '../../lib/types'
import { formatJalaliDateTime } from '../../lib/jalali'
import { EmptyState } from '../../lib/ui'

export default function AdminTickets() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [active, setActive] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
    setTickets(data as Ticket[] ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!active) return
    supabase.from('ticket_messages').select('*').eq('ticket_id', active.id).order('created_at', { ascending: true }).then(({ data }) => setMessages(data as TicketMessage[] ?? []))
  }, [active])

  const sendMsg = async () => {
    if (!active || !newMsg.trim()) return
    const { data: authData } = await supabase.auth.getUser()
    await supabase.from('ticket_messages').insert({ ticket_id: active.id, sender_id: authData.user!.id, message: newMsg, is_admin: true })
    await supabase.from('tickets').update({ status: 'answered' }).eq('id', active.id)
    setNewMsg('')
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', active.id).order('created_at', { ascending: true })
    setMessages(data as TicketMessage[] ?? [])
    toast('success', 'پاسخ ارسال شد')
    load()
  }

  const closeTicket = async (t: Ticket) => {
    await supabase.from('tickets').update({ status: 'closed' }).eq('id', t.id)
    toast('success', 'تیکت بسته شد')
    load()
  }

  if (loading) return <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-primary-700" /> تیکت‌های پشتیبانی</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <EmptyState icon={<MessageCircle className="w-8 h-8" />} title="تیکتی وجود ندارد" />
          ) : (
            tickets.map((t) => (
              <button key={t.id} onClick={() => setActive(t)} className={`card p-3 w-full text-right transition ${active?.id === t.id ? 'border-primary-400 bg-primary-50' : 'hover:bg-gray-50'}`}>
                <p className="font-medium text-sm text-gray-800 truncate">{t.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`chip text-[10px] ${t.status === 'open' ? 'bg-accent-100 text-accent-700' : t.status === 'answered' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status === 'open' ? 'باز' : t.status === 'answered' ? 'پاسخ داده شده' : 'بسته'}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatJalaliDateTime(t.created_at)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {active ? (
            <div className="card flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{active.subject}</h3>
                {active.status !== 'closed' && <button onClick={() => closeTicket(active)} className="btn-ghost py-1 px-3 text-xs">بستن تیکت</button>}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-xl px-3 py-2 max-w-[70%] ${m.is_admin ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm">{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.is_admin ? 'text-primary-200' : 'text-gray-400'}`}>{formatJalaliDateTime(m.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {active.status !== 'closed' && (
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="پاسخ بنویسید..." className="input py-2 text-sm" />
                  <button onClick={sendMsg} className="btn-primary py-2 px-4"><Send className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-500">یک تیکت انتخاب کنید</div>
          )}
        </div>
      </div>
    </div>
  )
}
