import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowRight } from 'lucide-react'
import { useStore } from '../../lib/store'
import { formatToman, formatTomanShort, formatNumber, toPersianDigits } from '../../lib/format'
import { formatJalaliDate } from '../../lib/jalali'

export default function InvoicePrint() {
  const { id } = useParams()
  const { invoices, settings } = useStore()
  const inv = invoices.find((i) => i.id === id)

  if (!inv) {
    return <div className="text-center py-16"><p className="text-gray-500">فاکتور یافت نشد</p><Link to="/admin/invoices" className="btn-primary mt-4">بازگشت</Link></div>
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4 no-print">
        <Link to="/admin/invoices" className="btn-ghost py-2 px-3 text-sm"><ArrowRight className="w-4 h-4" /> بازگشت</Link>
        <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-sm"><Printer className="w-4 h-4" /> چاپ فاکتور</button>
      </div>

      <div className="invoice-paper card p-8 bg-white">
        <div className="flex items-start justify-between mb-6 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-primary-800">{settings.storeName}</h1>
            <p className="text-sm text-gray-500">{settings.slogan}</p>
            <p className="text-xs text-gray-400 mt-1">تلفن: {settings.supportPhone}</p>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-800">{inv.type === 'purchase' ? 'فاکتور خرید' : 'فاکتور فروش'}</h2>
            <p className="text-sm text-gray-600" dir="ltr">{inv.number}</p>
            <p className="text-xs text-gray-500">{formatJalaliDate(inv.date)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">{inv.type === 'purchase' ? 'تأمین‌کننده' : 'مشتری'}</p>
          <p className="font-bold text-gray-800">{inv.party}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-right font-medium border border-gray-200">ردیف</th>
              <th className="px-3 py-2 text-right font-medium border border-gray-200">نام کالا</th>
              <th className="px-3 py-2 text-right font-medium border border-gray-200">تعداد</th>
              <th className="px-3 py-2 text-right font-medium border border-gray-200">قیمت واحد (ریال)</th>
              <th className="px-3 py-2 text-right font-medium border border-gray-200">جمع (ریال)</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i}>
                <td className="px-3 py-2 border border-gray-200 text-center">{toPersianDigits(i + 1)}</td>
                <td className="px-3 py-2 border border-gray-200">{it.name}</td>
                <td className="px-3 py-2 border border-gray-200 text-center">{formatNumber(it.qty)}</td>
                <td className="px-3 py-2 border border-gray-200 text-left">{formatTomanShort(it.unitPrice)}</td>
                <td className="px-3 py-2 border border-gray-200 text-left font-bold">{formatTomanShort(it.qty * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">جمع قیمت بازار</span><span className="text-gray-400 line-through">{formatTomanShort(inv.marketTotal)} ر</span></div>
            <div className="flex justify-between"><span className="text-gray-700 font-medium">جمع فروشگاه</span><span className="font-bold text-primary-700">{formatTomanShort(inv.total)} ر</span></div>
            <div className="flex justify-between bg-success-50 rounded-lg px-3 py-2"><span className="text-success-700 font-bold">صرفه‌جویی</span><span className="font-bold text-success-700">{formatTomanShort(inv.savedAmount)} ر</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-800">مبلغ نهایی</span><span className="font-extrabold text-lg text-primary-700">{formatToman(inv.total)}</span></div>
          </div>
        </div>

        {inv.note && <div className="mb-4 text-sm text-gray-600"><span className="font-medium">یادداشت: </span>{inv.note}</div>}

        <div className="flex justify-between items-end mt-8">
          <div className="text-xs text-gray-400">
            <p>وضعیت: {inv.status === 'posted' ? 'ثبت‌شده' : inv.status === 'void' ? 'باطل' : 'پیش‌نویس'}</p>
            <p className="mt-1">{settings.priceDisclaimer}</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-gray-300 mb-1"></div>
            <p className="text-xs text-gray-500">مهر و امضا</p>
          </div>
        </div>
      </div>
    </div>
  )
}
