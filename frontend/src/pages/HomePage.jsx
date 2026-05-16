import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ShoppingCart, Package, ArrowRight, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { bookApi, cartApi } from '../api/index.js'
import { useStore } from '../store/useStore.js'
import { PageSpinner } from '../components/common/UI.jsx'
import BookCard from '../components/common/BookCard.jsx'
import toast from 'react-hot-toast'

export default function HomePage() {
  const { t } = useTranslation()
  const { sessionId } = useStore()

  const { data: booksPage, isLoading } = useQuery({
    queryKey: ['books', 'featured'],
    queryFn: () => bookApi.browse({ size: 4, sortBy: 'title' }),
  })

  const handleAddToCart = async (book) => {
    try {
      await cartApi.addItem(sessionId, book.id, 1)
      toast.success(`"${book.title}" added to cart`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const featured = booksPage?.content ?? []

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-stone-800 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm text-amber-200">
            <Star className="w-3.5 h-3.5 fill-current"/>
            Online Bookstore — Personal Project
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">
            {t('home.hero_title')}
          </h1>
          <p className="text-stone-300 text-lg max-w-xl">{t('home.hero_sub')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link to="/books" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
              <BookOpen className="w-5 h-5"/> {t('home.browse_btn')}
            </Link>
            <Link to="/orders" className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2 text-base px-6 py-3">
              <Package className="w-5 h-5"/> {t('home.track_btn')}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 pt-8 border-t border-white/10">
            {[
              { label: t('home.stats_books'),  value: '500+' },
              { label: t('home.stats_genres'), value: '6' },
              { label: t('home.stats_orders'), value: '1 000+' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-amber-400">{s.value}</div>
                <div className="text-stone-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User stories callouts */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-3 gap-6">
          {[
            { icon: BookOpen,      title: 'Browse & Discover', desc: 'Explore our catalogue by category, title, or author.' },
            { icon: ShoppingCart,  title: 'Add & Order',       desc: 'Add books to your cart and confirm your order in seconds.' },
            { icon: Package,       title: 'Track History',     desc: 'View all your past orders and check their status anytime.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-amber-600"/>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{title}</h3>
                <p className="text-stone-500 text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured books */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title">Featured Books</h2>
            <p className="section-subtitle">Hand-picked from our catalogue</p>
          </div>
          <Link to="/books" className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>

        {isLoading ? <PageSpinner/> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(book => (
              <BookCard key={book.id} book={book} onAddToCart={handleAddToCart}/>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
