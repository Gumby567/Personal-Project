import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, BookOpen, Package, Settings, Shield, Globe } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import { useQuery } from '@tanstack/react-query'
import { cartApi } from '../../api/index.js'
import clsx from 'clsx'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { sessionId, cartCount, isAdmin, toggleAdmin } = useStore()

  // Keep cart badge in sync
  const { data: cart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => cartApi.get(sessionId),
    refetchInterval: 30_000,
  })
  const itemCount = cart?.totalItems ?? cartCount

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language.startsWith('et') ? 'en' : 'et')

  const navItem = ({ isActive }) =>
    clsx('flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors',
      isActive
        ? 'bg-amber-50 text-amber-700'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900')

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
            <BookOpen className="w-6 h-6 text-amber-600" strokeWidth={2} />
            PageTurn
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/books"  className={navItem}><BookOpen  className="w-4 h-4"/>{t('nav.books')}</NavLink>
            <NavLink to="/orders" className={navItem}><Package   className="w-4 h-4"/>{t('nav.orders')}</NavLink>
            {isAdmin && <NavLink to="/admin" className={navItem}><Settings className="w-4 h-4"/>{t('nav.admin')}</NavLink>}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button onClick={toggleLang}
              className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <Globe className="w-3.5 h-3.5"/>
              {i18n.language.startsWith('et') ? 'ET' : 'EN'}
            </button>

            {/* Admin toggle */}
            <button onClick={toggleAdmin}
              title="Toggle admin mode"
              className={clsx('p-2 rounded-lg transition-colors',
                isAdmin ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:bg-stone-100')}>
              <Shield className="w-4 h-4"/>
            </button>

            {/* Cart */}
            <NavLink to="/cart"
              className="relative flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors">
              <ShoppingCart className="w-4 h-4"/>
              <span className="hidden sm:inline">{t('nav.cart')}</span>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}
