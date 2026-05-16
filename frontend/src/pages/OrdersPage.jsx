import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Package, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { orderApi } from '../api/index.js'
import { PageSpinner, ErrorBox, EmptyState, OrderStatusBadge, Pagination } from '../components/common/UI.jsx'
import { useStore } from '../store/useStore.js'
import toast from 'react-hot-toast'

function OrderRow({ order, isAdmin, onStatusChange }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const statuses = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']

  return (
    <div className="card overflow-hidden">
      {/* Header row */}
      <div className="p-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
           onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-amber-700">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status}/>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">{order.customerName} · {order.customerEmail}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-stone-900">€{Number(order.totalAmount).toFixed(2)}</p>
          <p className="text-xs text-stone-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400"/> : <ChevronDown className="w-4 h-4 text-stone-400"/>}
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-stone-100 bg-stone-50/50 p-4 space-y-3">
          {(order.items ?? []).map(item => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <BookOpen className="w-4 h-4 text-stone-400 shrink-0"/>
              <div className="flex-1">
                <span className="font-medium text-stone-800">{item.bookTitle}</span>
                <span className="text-stone-500"> by {item.bookAuthor}</span>
              </div>
              <span className="text-stone-500">{item.quantity}×</span>
              <span className="font-medium text-stone-800 min-w-[4rem] text-right">€{Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
          {order.notes && (
            <p className="text-xs text-stone-400 italic border-t border-stone-200 pt-2">Note: {order.notes}</p>
          )}
          {/* Admin status changer */}
          {isAdmin && (
            <div className="flex items-center gap-2 border-t border-stone-200 pt-3">
              <span className="text-xs text-stone-500 font-medium">Change status:</span>
              <select defaultValue={order.status}
                onChange={e => onStatusChange(order.id, e.target.value)}
                className="input text-sm w-auto py-1.5">
                {statuses.map(s => <option key={s} value={s}>{t(`orders.${s}`)}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { t }       = useTranslation()
  const { isAdmin } = useStore()
  const qc          = useQueryClient()

  const [mode, setMode]         = useState('history') // 'history' | 'track'
  const [email, setEmail]       = useState('')
  const [trackNum, setTrackNum] = useState('')
  const [searched, setSearched] = useState(false)
  const [page, setPage]         = useState(0)

  // Admin all-orders view
  const { data: allOrders, isLoading: loadingAll } = useQuery({
    queryKey: ['orders', 'all', page],
    queryFn:  () => orderApi.getAll(page, 15),
    enabled:  isAdmin,
  })

  // Customer history by email
  const { data: myOrders, isLoading: loadingMy, refetch: refetchMy } = useQuery({
    queryKey: ['orders', 'my', email],
    queryFn:  () => orderApi.getMyOrders(email),
    enabled:  false,
  })

  // Track single order
  const { data: trackedOrder, isLoading: loadingTrack, refetch: refetchTrack } = useQuery({
    queryKey: ['orders', 'track', trackNum],
    queryFn:  () => orderApi.getByNumber(trackNum.trim()),
    enabled:  false,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['orders']); toast.success('Status updated') },
    onError: e => toast.error(e.message),
  })

  const handleSearch = () => {
    setSearched(true)
    if (mode === 'history') refetchMy()
    else refetchTrack()
  }

  const displayOrders = isAdmin
    ? allOrders?.content ?? []
    : mode === 'history' ? myOrders ?? [] : trackedOrder ? [trackedOrder] : []

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-title">{t('orders.title')}</h1>
        <p className="section-subtitle">{isAdmin ? 'All customer orders' : t('orders.subtitle')}</p>
      </div>

      {/* Customer search bar */}
      {!isAdmin && (
        <div className="card p-5 mb-8">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'history', label: 'Order History (by email)' },
              { key: 'track',   label: t('orders.track_title') },
            ].map(m => (
              <button key={m.key}
                onClick={() => { setMode(m.key); setSearched(false) }}
                className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                  mode === m.key ? 'bg-amber-600 text-white' : 'btn-ghost'}`}>
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {mode === 'history' ? (
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="input flex-1"/>
            ) : (
              <input value={trackNum} onChange={e => setTrackNum(e.target.value)}
                placeholder={t('orders.track_ph')}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="input flex-1"/>
            )}
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2 px-6">
              <Search className="w-4 h-4"/> {t('orders.track_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {(loadingAll || loadingMy || loadingTrack) && <PageSpinner/>}

      {!loadingAll && !loadingMy && !loadingTrack && (
        <>
          {!isAdmin && !searched ? (
            <EmptyState title="Find your orders" subtitle="Enter your email or order number above."/>
          ) : displayOrders.length === 0 ? (
            <EmptyState title={t('orders.none')} subtitle="No orders found for this search."/>
          ) : (
            <div className="flex flex-col gap-3">
              {displayOrders.map(order => (
                <OrderRow key={order.id} order={order} isAdmin={isAdmin}
                  onStatusChange={(id, status) => statusMutation.mutate({ id, status })}/>
              ))}
            </div>
          )}

          {isAdmin && allOrders && (
            <Pagination page={page} totalPages={allOrders.totalPages} onChange={setPage}/>
          )}
        </>
      )}
    </div>
  )
}
