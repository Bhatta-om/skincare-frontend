// src/pages/admin/AdminProductForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'
import { getProductImageUrl } from '../../utils/productImage'

const SKIN_TYPES    = ['oily', 'dry', 'normal', 'combination', 'sensitive', 'all']
const SKIN_CONCERNS = ['acne', 'aging', 'brightening', 'hydration', 'pigmentation', 'sensitivity', 'general']
const GENDERS       = ['male', 'female', 'unisex']

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-gray-400 text-sm font-medium mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
)

const inputCls  = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600"
const selectCls = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"

export default function AdminProductForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(slug)

  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(isEdit)
  const [errors, setErrors]         = useState({})
  const [message, setMessage]       = useState({ text: '', type: '' })
  const [previews, setPreviews]     = useState({ image: null, image_2: null, image_3: null })

  const [form, setForm] = useState({
    name:                '',
    brand:               '',
    category:            '',
    description:         '',
    ingredients:         '',
    price:               '',
    discount_percent:    '0',
    suitable_skin_type:  'all',
    skin_concern:        'general',
    min_age:             '13',
    max_age:             '65',
    gender:              'unisex',
    stock:               '0',
    low_stock_threshold: '10',
    is_available:        true,
    is_featured:         false,
    image:               null,
    image_2:             null,
    image_3:             null,
  })

  // Fetch categories
  const fetchCategories = () => {
    api.get('/products/categories/').then(res => {
      setCategories(res.data.results || res.data || [])
    })
  }

  useEffect(() => { fetchCategories() }, [])

  // Fetch product if editing
  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${slug}/`)
      .then(res => {
        const p = res.data.product || res.data
        setForm({
          name:                p.name || '',
          brand:               p.brand || '',
          category:            p.category?.id || '',
          description:         p.description || '',
          ingredients:         p.ingredients || '',
          price:               p.price || '',
          discount_percent:    p.discount_percent || '0',
          suitable_skin_type:  p.suitable_skin_type || 'all',
          skin_concern:        p.skin_concern || 'general',
          min_age:             p.min_age || '13',
          max_age:             p.max_age || '65',
          gender:              p.gender || 'unisex',
          stock:               p.stock || '0',
          low_stock_threshold: p.low_stock_threshold || '10',
          is_available:        p.is_available ?? true,
          is_featured:         p.is_featured ?? false,
          image:               null,
          image_2:             null,
          image_3:             null,
        })
        if (p.image)   setPreviews(prev => ({ ...prev, image:   getProductImageUrl(p.image) }))
        if (p.image_2) setPreviews(prev => ({ ...prev, image_2: getProductImageUrl(p.image_2) }))
        if (p.image_3) setPreviews(prev => ({ ...prev, image_3: getProductImageUrl(p.image_3) }))
      })
      .catch(() => showMsg('Failed to load product.', 'error'))
      .finally(() => setFetching(false))
  }, [slug])

  const showMsg = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImage = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(prev => ({ ...prev, [field]: file }))
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())      errs.name     = 'Name is required'
    if (!form.brand.trim())     errs.brand    = 'Brand is required'
    if (!form.category)         errs.category = 'Category is required'
    if (!form.price)            errs.price    = 'Price is required'
    if (!isEdit && !form.image) errs.image    = 'Main image is required'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    const formData = new FormData()

    Object.entries(form).forEach(([key, val]) => {
      if (val === null || val === undefined) return
      if (['image', 'image_2', 'image_3'].includes(key) && !val) return
      formData.append(key, val)
    })

    try {
      if (isEdit) {
        await api.patch(`/products/${slug}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showMsg('Product updated successfully!', 'success')
      } else {
        await api.post('/products/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showMsg('Product created successfully!', 'success')
      }
      setTimeout(() => navigate('/admin/products'), 1500)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setErrors(data)
        showMsg('Please fix the errors below.', 'error')
      } else {
        showMsg('Something went wrong. Try again.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <AdminLayout>
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Toast */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/products')}
            className="text-gray-500 hover:text-white transition-colors">← Back</button>
          <h2 className="text-white font-bold text-xl">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Main Fields ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3">Basic Info</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Product Name *" error={errors.name}>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Vitamin C Serum" className={inputCls} />
                </Field>
                <Field label="Brand *" error={errors.brand}>
                  <input name="brand" value={form.brand} onChange={handleChange}
                    placeholder="e.g. Himalaya" className={inputCls} />
                </Field>
              </div>

              {/* Category with Quick Add button */}
              <Field label="Category *" error={errors.category}>
                <div className="flex gap-2">
                  <select name="category" value={form.category} onChange={handleChange} className={selectCls}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Link to="/admin/categories"
                    className="shrink-0 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 whitespace-nowrap border border-gray-600">
                    <span>+</span> New
                  </Link>
                </div>
                {categories.length === 0 && (
                  <p className="text-yellow-500 text-xs mt-1">
                    ⚠️ No categories found.{' '}
                    <Link to="/admin/categories" className="underline hover:text-yellow-400">
                      Add categories first →
                    </Link>
                  </p>
                )}
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={4} placeholder="Product description..." className={inputCls} />
              </Field>

              <Field label="Ingredients" error={errors.ingredients}>
                <textarea name="ingredients" value={form.ingredients} onChange={handleChange}
                  rows={3} placeholder="List ingredients..." className={inputCls} />
              </Field>
            </div>

            {/* Pricing */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3">Pricing & Stock</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Price (Rs.) *" error={errors.price}>
                  <input name="price" type="number" value={form.price} onChange={handleChange}
                    placeholder="0" className={inputCls} />
                </Field>
                <Field label="Discount %" error={errors.discount_percent}>
                  <input name="discount_percent" type="number" value={form.discount_percent}
                    onChange={handleChange} min="0" max="100" className={inputCls} />
                </Field>
                <Field label="Stock" error={errors.stock}>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange}
                    min="0" className={inputCls} />
                </Field>
                <Field label="Low Stock Alert" error={errors.low_stock_threshold}>
                  <input name="low_stock_threshold" type="number" value={form.low_stock_threshold}
                    onChange={handleChange} min="0" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* AI Matching */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3">AI Matching</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Skin Type" error={errors.suitable_skin_type}>
                  <select name="suitable_skin_type" value={form.suitable_skin_type} onChange={handleChange} className={selectCls}>
                    {SKIN_TYPES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </Field>
                <Field label="Skin Concern" error={errors.skin_concern}>
                  <select name="skin_concern" value={form.skin_concern} onChange={handleChange} className={selectCls}>
                    {SKIN_CONCERNS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </Field>
                <Field label="Gender" error={errors.gender}>
                  <select name="gender" value={form.gender} onChange={handleChange} className={selectCls}>
                    {GENDERS.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                  </select>
                </Field>
                <Field label="Min Age" error={errors.min_age}>
                  <input name="min_age" type="number" value={form.min_age}
                    onChange={handleChange} min="0" max="100" className={inputCls} />
                </Field>
                <Field label="Max Age" error={errors.max_age}>
                  <input name="max_age" type="number" value={form.max_age}
                    onChange={handleChange} min="0" max="100" className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Right: Images + Settings ── */}
          <div className="space-y-5">

            {/* Images */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3">Images</h3>
              {[
                { field: 'image',   label: 'Main Image *' },
                { field: 'image_2', label: 'Image 2' },
                { field: 'image_3', label: 'Image 3' },
              ].map(({ field, label }) => (
                <Field key={field} label={label} error={errors[field]}>
                  <label className="block cursor-pointer">
                    <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                      errors[field] ? 'border-red-500' : 'border-gray-700 hover:border-purple-500'}`}>
                      {previews[field] ? (
                        <div className="relative">
                          <img src={previews[field]} alt={label} className="w-full h-36 object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs">Click to change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-24 flex flex-col items-center justify-center text-gray-600 gap-1">
                          <span className="text-2xl">📷</span>
                          <span className="text-xs">Click to upload</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleImage(e, field)} />
                  </label>
                </Field>
              ))}
            </div>

            {/* Settings */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3">Settings</h3>
              {[
                { name: 'is_available', label: 'Available for sale', desc: 'Show in store' },
                { name: 'is_featured',  label: 'Featured product',   desc: 'Show on homepage' },
              ].map(({ name, label, desc }) => (
                <label key={name} className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="text-white text-sm">{label}</p>
                    <p className="text-gray-600 text-xs">{desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${form[name] ? 'bg-purple-600' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[name] ? 'left-6' : 'left-1'}`} />
                    <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="hidden" />
                  </div>
                </label>
              ))}
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}