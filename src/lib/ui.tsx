import { Link } from 'react-router-dom'

export const statusLabels: Record<string, string> = {
  draft: 'پیش‌نویس',
  submitted: 'ثبت شده',
  confirmed: 'تأیید شده',
  packing: 'در حال بسته‌بندی',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  canceled: 'لغو شده',
  returned: 'مرجوع شده',
}

export const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-accent-100 text-accent-700',
  confirmed: 'bg-primary-100 text-primary-700',
  packing: 'bg-warning-100 text-warning-600',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-success-100 text-success-700',
  canceled: 'bg-error-100 text-error-700',
  returned: 'bg-error-100 text-error-700',
}

export const paymentLabels: Record<string, string> = {
  unpaid: 'پرداخت نشده',
  pending_receipt: 'در انتظار فیش',
  paid: 'پرداخت شده',
  credit: 'اعتباری',
}

export const paymentMethodLabels: Record<string, string> = {
  card_to_card: 'کارت به کارت',
  online: 'پرداخت آنلاین',
  cash_on_delivery: 'پرداخت در محل',
  school_credit: 'اعتبار مدرسه',
}

export function StatusChip({ status }: { status: string }) {
  return (
    <span className={`chip ${statusColors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {statusLabels[status] ?? status}
    </span>
  )
}

export function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mb-4 max-w-sm">{subtitle}</p>}
      {action}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton w-full aspect-square" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-8 w-full" />
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="btn-ghost px-3 py-2 disabled:opacity-40"
      >
        قبلی
      </button>
      <span className="text-sm text-gray-600">
        صفحه {page} از {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="btn-ghost px-3 py-2 disabled:opacity-40"
      >
        بعدی
      </button>
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-700 transition">{item.label}</Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-gray-300">/</span>}
        </span>
      ))}
    </nav>
  )
}
