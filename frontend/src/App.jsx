import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage    from './pages/HomePage.jsx'
import BooksPage   from './pages/BooksPage.jsx'
import BookDetail  from './pages/BookDetail.jsx'
import CartPage    from './pages/CartPage.jsx'
import OrdersPage  from './pages/OrdersPage.jsx'
import AdminPage   from './pages/AdminPage.jsx'
import NotFound    from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index          element={<HomePage />} />
        <Route path="books"   element={<BooksPage />} />
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="cart"    element={<CartPage />} />
        <Route path="orders"  element={<OrdersPage />} />
        <Route path="admin"   element={<AdminPage />} />
        <Route path="*"       element={<NotFound />} />
      </Route>
    </Routes>
  )
}
