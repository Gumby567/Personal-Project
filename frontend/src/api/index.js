import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.message || 'Network error'
    return Promise.reject(new Error(msg))
  }
)

// ── Books ────────────────────────────────────────────────────
export const bookApi = {
  browse: (params = {}) =>
    api.get('/books', { params }).then(r => r.data.data),

  getById: (id) =>
    api.get(`/books/${id}`).then(r => r.data.data),

  categories: () =>
    api.get('/books/categories').then(r => r.data.data),

  create: (body) =>
    api.post('/books', body).then(r => r.data.data),

  update: (id, body) =>
    api.put(`/books/${id}`, body).then(r => r.data.data),

  remove: (id) =>
    api.delete(`/books/${id}`).then(r => r.data),
}

// ── Cart ─────────────────────────────────────────────────────
export const cartApi = {
  get: (sessionId) =>
    api.get(`/cart/${sessionId}`).then(r => r.data.data),

  addItem: (sessionId, bookId, quantity) =>
    api.post(`/cart/${sessionId}/items`, { bookId, quantity }).then(r => r.data.data),

  updateItem: (sessionId, bookId, quantity) =>
    api.put(`/cart/${sessionId}/items/${bookId}`, { quantity }).then(r => r.data.data),

  removeItem: (sessionId, bookId) =>
    api.delete(`/cart/${sessionId}/items/${bookId}`).then(r => r.data.data),

  clear: (sessionId) =>
    api.delete(`/cart/${sessionId}`).then(r => r.data),
}

// ── Orders ───────────────────────────────────────────────────
export const orderApi = {
  getAll: (page = 0, size = 20) =>
    api.get('/orders', { params: { page, size } }).then(r => r.data.data),

  getById: (id) =>
    api.get(`/orders/${id}`).then(r => r.data.data),

  getByNumber: (orderNumber) =>
    api.get(`/orders/number/${orderNumber}`).then(r => r.data.data),

  getMyOrders: (email) =>
    api.get('/orders/my', { params: { email } }).then(r => r.data.data),

  place: (body) =>
    api.post('/orders', body).then(r => r.data),

  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then(r => r.data.data),
}

export default api
