import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookApi, cartApi } from '../api/index.js'
import { useStore } from '../store/useStore.js'
import { PageSpinner, ErrorBox } from '../components/common/UI.jsx'
import { ShoppingCart, ArrowLeft, BookOpen, Hash, Globe, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BookDetail() {
  const { id }          = useParams()
  const { t }           = useTranslation()
  const { sessionId }   = useStore()
  const qc              = useQueryClient()
  const [qty, setQty]   = useState(1)
  const [adding, setAdding] = useState(false)

  const { data: book, isLoading, isError, error } = useQuery({
    queryKey: ['book', id],
    queryFn:  () => bookApi.getById(id),
  })

  const handleAdd = async () => {
    setAdding(true)
    try {
      await cartApi.addItem(sessionId, book.id, qty)
      qc.invalidateQueries(['cart', sessionId])
      toast.success(`${qty}× "${book.title}" added to cart`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAdding(false)
    }
  }

  if (isLoading) return <PageSpinner/>
  if (isError)   return <ErrorBox message={error?.message}/>

  const cover = book.coverUrl ||
    `https://placehold.co/280x400/f5f0eb/a8a29e?text=${encodeURIComponent(book.title.slice(0,20))}`

  const inStock = book.stock > 0

  return (
    <div className="page-container animate-fade-in">
      <Link to="/books" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to catalogue
      </Link>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="card overflow-hidden aspect-[2/3] max-w-xs mx-auto md:mx-0">
            <img src={cover} alt={book.title} className="w-full h-full object-cover"
              onError={e => e.target.src = 'https://placehold.co/280x400/f5f0eb/a8a29e?text=No+Cover'}/>
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {book.categoryName && <span className="badge-gray self-start">{book.categoryName}</span>}

          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 leading-tight">{book.title}</h1>
            <p className="text-stone-500 text-lg mt-1">{book.author}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-stone-900">€{Number(book.price).toFixed(2)}</span>
            {inStock
              ? <span className="badge-green">{book.stock > 5 ? t('books.in_stock') : `${book.stock} left`}</span>
              : <span className="badge-red">{t('books.out_of_stock')}</span>}
          </div>

          {book.description && (
            <p className="text-stone-600 leading-relaxed">{book.description}</p>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: 'Pages',     value: book.pages     ? `${book.pages} ${t('books.pages')}` : null },
              { icon: Hash,     label: 'ISBN',       value: book.isbn },
              { icon: Users,    label: 'Publisher',  value: book.publisher  },
              { icon: Globe,    label: 'Language',   value: book.language  },
            ].filter(m => m.value).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-stone-500">
                <Icon className="w-4 h-4 text-stone-400 shrink-0"/>
                <span className="text-stone-400">{label}:</span>
                <span className="text-stone-700 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Add to cart */}
          {inStock && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-stone-600 hover:bg-stone-50 transition-colors font-medium">−</button>
                <span className="px-4 py-2.5 text-stone-900 font-semibold border-x border-stone-200 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(book.stock, q + 1))}
                  className="px-3 py-2.5 text-stone-600 hover:bg-stone-50 transition-colors font-medium">+</button>
              </div>
              <button onClick={handleAdd} disabled={adding}
                className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
                <ShoppingCart className="w-5 h-5"/>
                {adding ? 'Adding…' : t('books.add_to_cart')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
