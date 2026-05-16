import { X, PackageOpen, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className={`animate-spin rounded-full border-2 border-stone-200 border-t-amber-600 ${s}`}/>
  )
}

export function PageSpinner() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="lg"/>
      <p className="text-stone-400 text-sm">{t('common.loading')}</p>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <PackageOpen className="w-12 h-12 text-stone-300" strokeWidth={1.5}/>
      <div>
        <p className="font-display text-xl text-stone-700">{title}</p>
        {subtitle && <p className="text-stone-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── ErrorBox ──────────────────────────────────────────────────
export function ErrorBox({ message, onRetry }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <RefreshCw className="w-10 h-10 text-red-400" strokeWidth={1.5}/>
      <p className="text-stone-600">{message || t('common.error')}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">{t('common.retry')}</button>
      )}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page === 0}
        className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
      <span className="text-sm text-stone-500">
        {t('common.page')} {page + 1} {t('common.of')} {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
        className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next →</button>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-display text-xl text-stone-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-400"/>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── OrderStatusBadge ──────────────────────────────────────────
export function OrderStatusBadge({ status }) {
  const { t } = useTranslation()
  const map = {
    PENDING:    'badge-yellow',
    CONFIRMED:  'badge-blue',
    PROCESSING: 'badge-purple',
    SHIPPED:    'badge-blue',
    DELIVERED:  'badge-green',
    CANCELLED:  'badge-red',
  }
  return <span className={map[status] || 'badge-gray'}>{t(`orders.${status}`, status)}</span>
}
