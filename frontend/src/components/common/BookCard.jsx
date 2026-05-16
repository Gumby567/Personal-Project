import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Eye } from 'lucide-react'
import clsx from 'clsx'

function StockBadge({ stock, t }) {
  if (stock === 0) return <span className="badge-red">{t('books.out_of_stock')}</span>
  if (stock <= 5)  return <span className="badge-yellow">{t('books.low_stock')}</span>
  return               <span className="badge-green">{t('books.in_stock')}</span>
}

export default function BookCard({ book, onAddToCart, adding }) {
  const { t } = useTranslation()

  const cover = book.coverUrl ||
    `https://placehold.co/200x280/f5f0eb/a8a29e?text=${encodeURIComponent(book.title.slice(0,20))}`

  return (
    <div className="card-hover flex flex-col overflow-hidden group">
      {/* Cover */}
      <Link to={`/books/${book.id}`} className="block relative overflow-hidden bg-stone-100 aspect-[2/3]">
        <img src={cover} alt={book.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={e => { e.target.src = `https://placehold.co/200x280/f5f0eb/a8a29e?text=No+Cover` }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"/>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/books/${book.id}`}
              className="font-display font-semibold text-stone-900 line-clamp-2 hover:text-amber-700 transition-colors leading-tight">
              {book.title}
            </Link>
            <p className="text-sm text-stone-500 mt-0.5 truncate">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-semibold text-stone-900 text-lg">€{Number(book.price).toFixed(2)}</span>
          <StockBadge stock={book.stock} t={t}/>
        </div>

        {book.categoryName && (
          <span className="badge-gray self-start">{book.categoryName}</span>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onAddToCart(book)}
            disabled={book.stock === 0 || adding}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm py-2">
            <ShoppingCart className="w-3.5 h-3.5"/>
            {t('books.add_to_cart')}
          </button>
          <Link to={`/books/${book.id}`} className="btn-secondary px-3 py-2">
            <Eye className="w-4 h-4"/>
          </Link>
        </div>
      </div>
    </div>
  )
}
