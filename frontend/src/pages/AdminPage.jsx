import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Shield, BookOpen, TrendingDown, Package } from 'lucide-react'
import { bookApi } from '../api/index.js'
import { useStore } from '../store/useStore.js'
import { PageSpinner, ErrorBox, Modal } from '../components/common/UI.jsx'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title:'', author:'', isbn:'', description:'', price:'', stock:'',
  coverUrl:'', publisher:'', publishedYear:'', pages:'', language:'English',
  isActive: true, categoryId:'',
}

function BookForm({ initial, categories, onSave, onCancel, saving }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.title.trim())      e.title = 'Required'
    if (!form.author.trim())     e.author = 'Required'
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required'
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Valid stock required'
    if (!form.categoryId)        e.categoryId = 'Required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      pages: form.pages ? Number(form.pages) : null,
    })
  }

  const F = ({ label, name, type='text', required, options }) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <select value={form[name]} onChange={e=>set(name,e.target.value)}
          className={`input ${errors[name]?'border-red-400':''}`}>
          <option value="">— select —</option>
          {options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea rows={3} value={form[name]} onChange={e=>set(name,e.target.value)}
          className={`input resize-none ${errors[name]?'border-red-400':''}`}/>
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form[name]} onChange={e=>set(name,e.target.checked)}
            className="w-4 h-4 accent-amber-600"/>
          <span className="text-sm text-stone-600">Active (visible to customers)</span>
        </label>
      ) : (
        <input type={type} value={form[name]} onChange={e=>set(name,e.target.value)}
          className={`input ${errors[name]?'border-red-400':''}`}/>
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2"><F label={t('admin.title_f')}  name="title"  required/></div>
      <div className="col-span-2"><F label={t('admin.author_f')} name="author" required/></div>
      <F label={t('admin.price_f')}  name="price"  type="number" required/>
      <F label={t('admin.stock_f')}  name="stock"  type="number" required/>
      <F label={t('admin.cat_f')}    name="categoryId" options={categories} required/>
      <F label={t('admin.isbn_f')}   name="isbn"/>
      <F label={t('admin.publisher_f')} name="publisher"/>
      <F label={t('admin.year_f')}   name="publishedYear" type="number"/>
      <F label={t('admin.pages_f')}  name="pages"  type="number"/>
      <F label={t('admin.lang_f')}   name="language"/>
      <div className="col-span-2"><F label={t('admin.cover_f')}  name="coverUrl"/></div>
      <div className="col-span-2"><F label={t('admin.desc_f')}   name="description" type="textarea"/></div>
      <div className="col-span-2"><F label={t('admin.active_f')} name="isActive" type="checkbox"/></div>

      <div className="col-span-2 flex gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary flex-1">{t('admin.cancel')}</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving…' : t('admin.save')}
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { t }       = useTranslation()
  const { isAdmin } = useStore()
  const qc          = useQueryClient()

  const [showForm, setShowForm]     = useState(false)
  const [editBook, setEditBook]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [search, setSearch]         = useState('')

  if (!isAdmin) {
    return (
      <div className="page-container flex flex-col items-center py-24 gap-4 text-center">
        <Shield className="w-16 h-16 text-stone-300" strokeWidth={1.5}/>
        <h2 className="font-display text-2xl text-stone-700">Admin Access Required</h2>
        <p className="text-stone-400">Click the shield icon in the navigation bar to enable admin mode.</p>
      </div>
    )
  }

  const { data: booksPage, isLoading, isError, error } = useQuery({
    queryKey: ['admin-books', search],
    queryFn: () => bookApi.browse({ search: search || undefined, size: 50, sortBy: 'title' }),
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  bookApi.categories,
    staleTime: Infinity,
  })

  const books = booksPage?.content ?? []

  const createMutation = useMutation({
    mutationFn: bookApi.create,
    onSuccess: () => { qc.invalidateQueries(['admin-books']); setShowForm(false); toast.success(t('admin.created')) },
    onError: e => toast.error(e.message),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bookApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-books']); setEditBook(null); toast.success(t('admin.updated')) },
    onError: e => toast.error(e.message),
  })
  const deleteMutation = useMutation({
    mutationFn: bookApi.remove,
    onSuccess: () => { qc.invalidateQueries(['admin-books']); setDeleteId(null); toast.success(t('admin.deleted')) },
    onError: e => toast.error(e.message),
  })

  const stats = [
    { icon: BookOpen,     label: t('admin.stat_total'),  value: booksPage?.totalElements ?? '—' },
    { icon: Package,      label: t('admin.stat_active'), value: books.filter(b=>b.isActive).length },
    { icon: TrendingDown, label: t('admin.stat_low'),    value: books.filter(b=>b.stock<=5).length },
  ]

  return (
    <div className="page-container">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="section-title">{t('admin.title')}</h1>
          <p className="section-subtitle">{t('admin.subtitle')}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/> {t('admin.add')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-amber-600"/>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search books…" className="input max-w-sm"/>
      </div>

      {/* Table */}
      {isLoading && <PageSpinner/>}
      {isError   && <ErrorBox message={error?.message}/>}
      {!isLoading && !isError && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Title','Author','Category','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-stone-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {books.map(book => (
                <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900 max-w-xs truncate">{book.title}</p>
                    {book.isbn && <p className="text-xs text-stone-400 font-mono">{book.isbn}</p>}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{book.author}</td>
                  <td className="px-4 py-3">
                    <span className="badge-gray">{book.categoryName}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-900">€{Number(book.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={book.stock === 0 ? 'badge-red' : book.stock <= 5 ? 'badge-yellow' : 'badge-green'}>
                      {book.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={book.isActive ? 'badge-green' : 'badge-gray'}>
                      {book.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditBook(book)}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-stone-400 hover:text-amber-600 transition-colors">
                        <Edit2 className="w-4 h-4"/>
                      </button>
                      <button onClick={() => setDeleteId(book.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && (
            <div className="py-12 text-center text-stone-400">No books found.</div>
          )}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('admin.add')}>
        <BookForm categories={categories ?? []} saving={createMutation.isPending}
          onCancel={() => setShowForm(false)}
          onSave={data => createMutation.mutate(data)}/>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editBook} onClose={() => setEditBook(null)} title={t('admin.edit')}>
        {editBook && (
          <BookForm categories={categories ?? []} saving={updateMutation.isPending}
            initial={{ ...editBook, categoryId: editBook.categoryId ?? '' }}
            onCancel={() => setEditBook(null)}
            onSave={data => updateMutation.mutate({ id: editBook.id, data })}/>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="text-stone-600 mb-6">{t('admin.confirm_del')}</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            className="btn-danger flex-1 py-2.5">
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
