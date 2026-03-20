// src/pages/admin/AdminCategories.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, FolderOpen } from 'lucide-react'

const AdminToast = ({ message }) => message.text ? (
  <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: message.type === 'success' ? A.success : A.danger, color: '#FFFFFF', padding: '12px 20px', fontFamily: A.sans, fontSize: '13px', fontWeight: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
    {message.text}
  </div>
) : null

const inp = { width: '100%', background: '#1A1A1A', border: `1px solid ${A.border2}`, color: A.text, padding: '10px 14px', fontFamily: A.sans, fontSize: '12.5px', outline: 'none', transition: 'border-color 0.15s', fontWeight: 300, boxSizing: 'border-box' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleting,   setDeleting]   = useState(null)
  const [message,    setMessage]    = useState({ text: '', type: '' })
  const [form,       setForm]       = useState({ name: '', description: '', is_active: true, image: null })
  const [preview,    setPreview]    = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState({})

  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000) }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/?is_active=all')
      setCategories(res.data.results || res.data || [])
    } catch {
      try { const res = await api.get('/products/categories/'); setCategories(res.data.results || res.data || []) }
      catch { showMsg('Failed to load categories.', 'error') }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => { setEditItem(null); setForm({ name: '', description: '', is_active: true, image: null }); setPreview(null); setErrors({}); setShowForm(true) }
  const openEdit = (cat) => { setEditItem(cat); setForm({ name: cat.name, description: cat.description||'', is_active: cat.is_active??true, image: null }); setPreview(cat.image||null); setErrors({}); setShowForm(true) }
  const handleChange = e => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type==='checkbox'?checked:value })); if (errors[name]) setErrors(p => ({ ...p, [name]: '' })) }
  const handleImage  = e => { const file = e.target.files[0]; if (!file) return; setForm(p => ({ ...p, image: file })); setPreview(URL.createObjectURL(file)) }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErrors({ name: 'Name is required' }); return }
    setSaving(true)
    const fd = new FormData()
    fd.append('name', form.name); fd.append('description', form.description); fd.append('is_active', form.is_active ? 'true' : 'false')
    if (form.image) fd.append('image', form.image)
    try {
      if (editItem) { await api.patch(`/products/categories/${editItem.slug}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); showMsg('Category updated', 'success') }
      else          { await api.post('/products/categories/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); showMsg('Category created', 'success') }
      setShowForm(false); fetchCategories()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') setErrors(data)
      else showMsg('Something went wrong.', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This may affect products.`)) return
    setDeleting(cat.id)
    try { await api.delete(`/products/categories/${cat.slug}/`); showMsg('Category deleted', 'success'); fetchCategories() }
    catch { showMsg('Failed to delete — category may have products.', 'error') }
    finally { setDeleting(null) }
  }

  const toggleActive = async (cat) => {
    try { await api.patch(`/products/categories/${cat.slug}/`, { is_active: !cat.is_active }); showMsg(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`, 'success'); fetchCategories() }
    catch { showMsg('Failed to update.', 'error') }
  }

  return (
    <AdminLayout>
      <AdminToast message={message} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px', fontWeight: 400 }}>Categories</p>
            <p style={{ fontFamily: A.sans, fontSize: '12px', color: A.textMid, fontWeight: 300 }}>{categories.length} total</p>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: A.accent, color: '#FFFFFF',
            border: 'none', padding: '9px 16px', cursor: 'pointer',
            fontFamily: A.sans, fontSize: '11.5px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = A.accentHov}
            onMouseLeave={e => e.currentTarget.style.background = A.accent}
          >
            <Plus size={13} strokeWidth={2} /> Add Category
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '32px', height: '32px', border: `1.5px solid ${A.border2}`, borderTopColor: A.accent, borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: A.surface, border: `1px solid ${A.border}` }}>
            <FolderOpen size={32} strokeWidth={1} style={{ color: A.textDim, margin: '0 auto 16px' }} />
            <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textMid, marginBottom: '16px' }}>No categories yet</p>
            <button onClick={openAdd} style={{ background: A.accent, color: '#FFFFFF', border: 'none', padding: '9px 20px', cursor: 'pointer', fontFamily: A.sans, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Add First Category
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ background: A.surface, border: `1px solid ${cat.is_active ? A.border : A.danger + '40'}`, overflow: 'hidden', opacity: cat.is_active ? 1 : 0.65, transition: 'all 0.15s' }}>
                {/* Image */}
                <div style={{ height: '110px', background: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {cat.image ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FolderOpen size={28} strokeWidth={1} style={{ color: A.textDim }} />}
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    fontFamily: A.sans, fontSize: '9px', fontWeight: 400,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: cat.is_active ? A.success : A.danger,
                    background: cat.is_active ? 'rgba(74,122,87,0.2)' : 'rgba(150,56,56,0.2)',
                    border: `1px solid ${cat.is_active ? A.success + '40' : A.danger + '40'}`,
                    padding: '2px 7px',
                  }}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: '12px' }}>
                  <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</p>
                  {cat.description && <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</p>}
                  <p style={{ fontFamily: A.sans, fontSize: '10px', color: A.textDim, fontWeight: 300, marginBottom: '10px' }}>/{cat.slug}</p>

                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => openEdit(cat)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '7px', border: `1px solid ${A.info}30`, background: 'rgba(43,95,166,0.1)', color: A.info, cursor: 'pointer', fontFamily: A.sans, fontSize: '10.5px', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,95,166,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(43,95,166,0.1)'}
                    >
                      <Pencil size={11} strokeWidth={1.5} /> Edit
                    </button>
                    <button onClick={() => toggleActive(cat)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '7px', border: `1px solid ${A.border2}`, background: 'transparent', color: A.textMid, cursor: 'pointer', fontFamily: A.sans, fontSize: '10.5px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = A.accent; e.currentTarget.style.color = A.accent }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = A.border2; e.currentTarget.style.color = A.textMid }}
                    >
                      {cat.is_active ? <EyeOff size={11} strokeWidth={1.5} /> : <Eye size={11} strokeWidth={1.5} />}
                      {cat.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id} style={{ width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${A.danger}30`, background: 'rgba(150,56,56,0.1)', color: A.danger, cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0, opacity: deleting === cat.id ? 0.5 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(150,56,56,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(150,56,56,0.1)'}
                    >
                      <Trash2 size={11} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }} onClick={() => setShowForm(false)} />
          <div style={{ position: 'relative', background: A.surface, border: `1px solid ${A.border}`, width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: '2px', background: `linear-gradient(to right, ${A.accent}, #D4A96A, ${A.accent})` }} />
            <div style={{ padding: '20px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: A.sans, fontSize: '13px', color: A.text, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {editItem ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.textMid, display: 'flex', padding: '4px' }}
                onMouseEnter={e => e.currentTarget.style.color = A.text}
                onMouseLeave={e => e.currentTarget.style.color = A.textMid}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontFamily: A.sans, fontSize: '10px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px', fontWeight: 400 }}>
                  Category Name <span style={{ color: A.danger }}>*</span>
                </label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Moisturizer" style={inp}
                  onFocus={e => e.target.style.borderColor = A.accent}
                  onBlur={e  => e.target.style.borderColor = A.border2}
                />
                {errors.name && <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.danger, marginTop: '4px', fontWeight: 300 }}>{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontFamily: A.sans, fontSize: '10px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px', fontWeight: 400 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Category description..." style={{ ...inp, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = A.accent}
                  onBlur={e  => e.target.style.borderColor = A.border2}
                />
              </div>

              {/* Image */}
              <div>
                <label style={{ display: 'block', fontFamily: A.sans, fontSize: '10px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px', fontWeight: 400 }}>Category Image</label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ border: `1.5px dashed ${preview ? A.accent : A.border2}`, transition: 'border-color 0.15s', overflow: 'hidden', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {preview ? (
                      <div style={{ position: 'relative', width: '100%' }}>
                        <img src={preview} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '20px' }}>
                        <Upload size={18} strokeWidth={1.5} style={{ color: A.textDim }} />
                        <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim }}>Click to upload</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </label>
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400 }}>Active</p>
                  <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginTop: '1px' }}>Visible in store</p>
                </div>
                <div onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                  style={{ width: '40px', height: '22px', borderRadius: '11px', background: form.is_active ? A.accent : A.border2, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '3px', left: form.is_active ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s' }} />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${A.border2}`, color: A.textMid, padding: '11px', cursor: 'pointer', fontFamily: A.sans, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = A.muted; e.currentTarget.style.color = A.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = A.border2; e.currentTarget.style.color = A.textMid }}
                >
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: saving ? A.muted : A.accent, border: 'none', color: '#FFFFFF', padding: '11px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: A.sans, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = A.accentHov }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = A.accent }}
                >
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}