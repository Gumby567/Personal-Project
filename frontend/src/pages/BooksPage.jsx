import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { bookApi, cartApi } from '../api/index.js'
import { useStore } from '../store/useStore.js'
import BookCard from '../components/common/BookCard.jsx'
import { PageSpinner, ErrorBox, Pagination } from '../components/common/UI.jsx'
import toast from 'react-hot-toast'

export default function BooksPage() {
  const { t } = useTranslation()
  const { sessionId } = useStore()

  const [search, setSearch]         = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [maxPrice, setMaxPrice]     = useState('')
  const [sortBy, setSortBy]         = useState('title')
  const [sortDir, setSortDir]       = useState('asc')
  const [page, setPage]             = useState(0)
  const [addingId, setAddingId]     = useState(null)

  const params = {
    search:     search     || undefined,
    categoryId: categoryId || undefined,
    maxPrice:   maxPrice   || undefined,
    sortBy, sortDir, page, size: 12,
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['books', params],
    queryFn:  () => bookApi.browse(params),
    keepPreviousData: true,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  bookApi.categories,
    staleTime: Infinity,
  })

  const books      = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const clearFilters = () => {
    setSearch(''); setCategoryId(''); setMaxPrice(''); setPage(0)
  }
  const hasFilters = search || categoryId || maxPrice

  const handleAddToCart = async (book) => {
    setAddingId(book.id)
    try {
      await cartApi.addItem(sessionId, book.id, 1)
      toast.success(`"${book.title}" ${t('books.add_to_cart').toLowerCase()}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-title">{t('books.title')}</h1>
        <p className="section-subtitle">{t('books.subtitle')}</p>
      </div>

      {/* Filters bar */}
      <div className="card p-4 mb-8 flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder={t('books.search_ph')}
            className="input pl-9"/>
        </div>

        {/* Category */}
        <select value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(0) }}
          className="input w-auto min-w-40">
          <option value="">{t('books.all_categories')}</option>
          {(categories ?? []).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Max price */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">€</span>
          <input type="number" min="0" step="0.01" value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setPage(0) }}
            placeholder="Max price" className="input pl-7 w-32"/>
        </div>

        {/* Sort */}
        <select value={`${sortBy}-${sortDir}`}
          onChange={e => {
            const [sb, sd] = e.target.value.split('-')
            setSortBy(sb); setSortDir(sd); setPage(0)
          }}
          className="input w-auto">
          <option value="title-asc">{t('books.sort_title')} A→Z</option>
          <option value="title-desc">{t('books.sort_title')} Z→A</option>
          <option value="price-asc">{t('books.sort_price')} ↑</option>
          <option value="price-desc">{t('books.sort_price')} ↓</option>
          <option value="author-asc">{t('books.sort_author')} A→Z</option>
        </select>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5 text-sm text-stone-500">
            <X className="w-4 h-4"/> {t('books.clear_filters')}
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading && <PageSpinner/>}
      {isError   && <ErrorBox message={error?.message} onRetry={refetch}/>}

      {!isLoading && !isError && (
        <>
          {books.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-500 text-lg">{t('books.no_results')}</p>
              <button onClick={clearFilters} className="btn-secondary mt-4 text-sm">{t('books.clear_filters')}</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-400 mb-4">{data?.totalElements ?? 0} {t('common.items')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {books.map(book => (
                  <BookCard key={book.id} book={book}
                    onAddToCart={handleAddToCart}
                    adding={addingId === book.id}/>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
            </>
          )}
        </>
      )}
    </div>
  )
}
