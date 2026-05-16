import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Minus, Plus, ShoppingCart, CheckCircle } from 'lucide-react'
import { cartApi, orderApi } from '../api/index.js'
import { useStore } from '../store/useStore.js'
import { PageSpinner, Modal, EmptyState } from '../components/common/UI.jsx'
import toast from 'react-hot-toast'

function CheckoutForm({ onClose, onSuccess, sessionId }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ customerName:'', customerEmail:'', customerPhone:'', notes:'' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.customerName.trim())                e.customerName  = 'Required'
    if (!form.customerEmail.trim())               e.customerEmail = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = 'Invalid email'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      const res = await orderApi.place({ ...form, sessionId })
      onSuccess(res.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key, label, ph, type='text') => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <input type={type} placeholder={ph} value={form[key]}
        onChange={e => { setForm(f => ({...f,[key]:e.target.value})); setErrors(v=>({...v,[key]:''})) }}
        className={`input ${errors[key] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}/>
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {field('customerName',  t('checkout.name'),  t('checkout.name_ph'))}
      {field('customerEmail', t('checkout.email'), t('checkout.email_ph'), 'email')}
      {field('customerPhone', t('checkout.phone'), t('checkout.phone_ph'))}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">{t('checkout.notes')}</label>
        <textarea rows={3} placeholder={t('checkout.notes_ph')} value={form.notes}
          onChange={e => setForm(f=>({...f,notes:e.target.value}))}
          className="input resize-none"/>
      </div>
      <div className="flex gap-3 mt-2">
        <button onClick={onClose} className="btn-secondary flex-1">{t('checkout.cancel')}</button>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
          {submitting ? 'Placing…' : t('checkout.submit')}
        </button>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { t }         = useTranslation()
  const navigate      = useNavigate()
  const qc            = useQueryClient()
  const { sessionId } = useStore()

  const [showCheckout, setShowCheckout]     = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn:  () => cartApi.get(sessionId),
  })

  const invalidate = () => qc.invalidateQueries(['cart', sessionId])

  const updateMutation = useMutation({
    mutationFn: ({ bookId, quantity }) => cartApi.updateItem(sessionId, bookId, quantity),
    onSuccess: invalidate,
    onError: e => toast.error(e.message),
  })
  const removeMutation = useMutation({
    mutationFn: bookId => cartApi.removeItem(sessionId, bookId),
    onSuccess: () => { invalidate(); toast.success(t('cart.remove')) },
    onError: e => toast.error(e.message),
  })
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(sessionId),
    onSuccess: invalidate,
  })

  const handleOrderSuccess = (order) => {
    setShowCheckout(false)
    setConfirmedOrder(order)
    qc.invalidateQueries(['cart', sessionId])
  }

  if (isLoading) return <PageSpinner/>

  const items = cart?.items ?? []
  const total = cart?.totalAmount ?? 0

  // ── Order confirmed screen ────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20 text-center gap-6">
        <CheckCircle className="w-16 h-16 text-emerald-500"/>
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">{t('checkout.success')}</h1>
          <p className="text-stone-500 mt-2">{t('checkout.order_no')}</p>
          <p className="font-mono text-2xl font-bold text-amber-600 mt-1">{confirmedOrder.orderNumber}</p>
        </div>
        <p className="text-stone-500">Total paid: <strong className="text-stone-900">€{Number(confirmedOrder.totalAmount).toFixed(2)}</strong></p>
        <div className="flex gap-3">
          <Link to="/books"   className="btn-secondary">Continue Shopping</Link>
          <Link to="/orders"  className="btn-primary">View My Orders</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="section-title">{t('cart.title')}</h1>
          <p className="section-subtitle">{t('cart.subtitle')}</p>
        </div>
        {items.length > 0 && (
          <button onClick={() => clearMutation.mutate()} className="btn-ghost text-stone-400 text-sm flex items-center gap-1.5">
            <Trash2 className="w-4 h-4"/> {t('cart.clear')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title={t('cart.empty')} subtitle={t('cart.empty_sub')}
          action={<Link to="/books" className="btn-primary">{t('cart.browse')}</Link>}/>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4 items-center">
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={item.coverUrl || `https://placehold.co/56x80/f5f0eb/a8a29e?text=📖`}
                    alt={item.bookTitle}
                    className="w-full h-full object-cover"
                    onError={e => e.target.src = 'https://placehold.co/56x80/f5f0eb/a8a29e?text=Book'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 line-clamp-1">{item.bookTitle}</p>
                  <p className="text-sm text-stone-500">{item.bookAuthor}</p>
                  <p className="text-sm text-stone-400 mt-0.5">€{Number(item.unitPrice).toFixed(2)} {t('common.per_item')}</p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => updateMutation.mutate({ bookId: item.bookId, quantity: item.quantity - 1 })}
                    className="px-2.5 py-2 hover:bg-stone-50 transition-colors text-stone-600">
                    <Minus className="w-3.5 h-3.5"/>
                  </button>
                  <span className="px-3 text-sm font-semibold border-x border-stone-200 min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button onClick={() => updateMutation.mutate({ bookId: item.bookId, quantity: item.quantity + 1 })}
                    disabled={item.quantity >= item.availableStock}
                    className="px-2.5 py-2 hover:bg-stone-50 transition-colors text-stone-600 disabled:opacity-40">
                    <Plus className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <div className="text-right min-w-[5rem]">
                  <p className="font-semibold text-stone-900">€{Number(item.subtotal).toFixed(2)}</p>
                </div>
                <button onClick={() => removeMutation.mutate(item.bookId)}
                  className="text-stone-300 hover:text-red-500 transition-colors ml-1">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map(i => (
                  <div key={i.id} className="flex justify-between text-stone-500">
                    <span className="truncate max-w-[160px]">{i.bookTitle} ×{i.quantity}</span>
                    <span>€{Number(i.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between">
                <span className="font-semibold text-stone-900">{t('cart.total')}</span>
                <span className="font-display text-2xl font-bold text-stone-900">€{Number(total).toFixed(2)}</span>
              </div>
              <button onClick={() => setShowCheckout(true)}
                className="btn-primary w-full mt-5 py-3 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5"/> {t('cart.place_order')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      <Modal open={showCheckout} onClose={() => setShowCheckout(false)} title={t('checkout.title')}>
        <CheckoutForm sessionId={sessionId}
          onClose={() => setShowCheckout(false)} onSuccess={handleOrderSuccess}/>
      </Modal>
    </div>
  )
}
