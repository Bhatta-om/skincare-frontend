// src/pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [message, setMessage]       = useState({ text: '', type: '' })
  const [form, setForm]             = useState({ name: '', description: '', is_active: true, image: null })
  const [preview, setPreview]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [errors, setErrors]         = useState({})

  const inputCls = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600"

  const showMsg = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const fetchCategories = async () => {
    try {
      // Fetch all categories including inactive ones for admin
      const res = await api.get('/products/categories/?is_active=all')
      setCategories(res.data.results || res.data || [])
    } catch {
      try {
        // Fallback to default endpoint
        const res = await api.get('/products/categories/')
        setCategories(res.data.results || res.data || [])
      } catch {
        showMsg('Failed to load categories.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => {
    setEditItem(null)
    setForm({ name: '', description: '', is_active: true, image: null })
    setPreview(null)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditItem(cat)
    setForm({ name: cat.name, description: cat.description || '', is_active: cat.is_active ?? true, image: null })
    setPreview(cat.image || null)
    setErrors({})
    setShowForm(true)
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setForm(prev => ({ ...prev, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }
    setSaving(true)
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('is_active', form.is_active ? 'true' : 'false')
    if (form.image) formData.append('image', form.image)

    try {
      if (editItem) {
        await api.patch(`/products/categories/${editItem.slug}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showMsg('Category updated successfully!', 'success')
      } else {
        await api.post('/products/categories/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showMsg('Category created successfully!', 'success')
      }
      setShowForm(false)
      fetchCategories()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') setErrors(data)
      else showMsg('Something went wrong.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This may affect existing products.`)) return
    setDeleting(cat.id)
    try {
      await api.delete(`/products/categories/${cat.slug}/`)
      showMsg('Category deleted!', 'success')
      fetchCategories()
    } catch {
      showMsg('Failed to delete. Category may have products.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (cat) => {
    try {
      await api.patch(`/products/categories/${cat.slug}/`, {
        is_active: !cat.is_active
      })
      showMsg(`Category ${!cat.is_active ? 'activated' : 'deactivated'}!`, 'success')
      fetchCategories()
    } catch {
      showMsg('Failed to update status.', 'error')
    }
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">Categories</h2>
            <p className="text-gray-500 text-sm">{categories.length} categories total</p>
          </div>
          <button onClick={openAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <span>+</span> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-white font-medium">No categories yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first category to get started</p>
            <button onClick={openAdd}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm transition-colors">
              + Add Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id}
                className={`bg-gray-900 border rounded-2xl overflow-hidden transition-colors ${
                  cat.is_active ? 'border-gray-800 hover:border-gray-700' : 'border-red-900/50 opacity-70'
                }`}>
                {/* Image */}
                <div className="h-32 bg-gray-800 flex items-center justify-center overflow-hidden relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📂</span>
                  )}
                  {/* Active badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    cat.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{cat.description}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-1">/{cat.slug}</p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(cat)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs py-2 rounded-lg transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => toggleActive(cat)}
                      className={`flex-1 text-xs py-2 rounded-lg transition-colors ${
                        cat.is_active
                          ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400'
                          : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                      }`}>
                      {cat.is_active ? '⏸ Disable' : '▶ Enable'}
                    </button>
                    <button onClick={() => handleDelete(cat)}
                      disabled={deleting === cat.id}
                      className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs py-2 rounded-lg transition-colors disabled:opacity-50">
                      {deleting === cat.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowForm(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                {editItem ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Category Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Moisturizer" className={inputCls} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Category description..." className={inputCls} />
            </div>

            {/* Image */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Category Image</label>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl overflow-hidden transition-colors">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="preview" className="w-full h-32 object-cover" />
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
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Active</p>
                <p className="text-gray-500 text-xs">Show in store</p>
              </div>
              <div
                onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.is_active ? 'bg-purple-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}