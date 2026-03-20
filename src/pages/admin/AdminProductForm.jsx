// src/pages/admin/AdminProductForm.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { getProductImageUrl } from '../../utils/productImage'
import { ArrowLeft, Upload, Plus } from 'lucide-react'

const SKIN_TYPES    = ['oily','dry','normal','combination','sensitive','all']
const SKIN_CONCERNS = ['acne','aging','brightening','hydration','pigmentation','sensitivity','general']
const GENDERS       = ['male','female','unisex']

const AdminToast = ({ message }) => message.text ? (
  <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: message.type === 'success' ? A.success : A.danger, color: '#FFFFFF', padding: '12px 20px', fontFamily: A.sans, fontSize: '13px', fontWeight: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
    {message.text}
  </div>
) : null

const inp     = { width: '100%', background: '#1A1A1A', border: `1px solid ${A.border2}`, color: A.text, padding: '10px 14px', fontFamily: A.sans, fontSize: '12.5px', outline: 'none', transition: 'border-color 0.15s', fontWeight: 300, boxSizing: 'border-box' }
const inpFocus = (e) => e.target.style.borderColor = A.accent
const inpBlur  = (e) => e.target.style.borderColor = A.border2

const Field = ({ label, error, required, children }) => (
  <div>
    <label style={{ display: 'block', fontFamily: A.sans, fontSize: '10px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px', fontWeight: 400 }}>
      {label}{required && <span style={{ color: A.danger, marginLeft: '3px' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.danger, marginTop: '4px', fontWeight: 300 }}>{error}</p>}
  </div>
)

const SectionCard = ({ title, children }) => (
  <div style={{ background: A.surface, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
    <div style={{ padding: '12px 18px', borderBottom: `1px solid ${A.border}`, background: A.bg }}>
      <h3 style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 400 }}>{title}</h3>
    </div>
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>{children}</div>
  </div>
)

const Toggle = ({ name, label, desc, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400 }}>{label}</p>
      <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginTop: '1px' }}>{desc}</p>
    </div>
    <div onClick={() => onChange({ target: { name, type: 'checkbox', checked: !value } })}
      style={{ width: '40px', height: '22px', borderRadius: '11px', background: value ? A.accent : A.border2, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s' }} />
    </div>
  </div>
)

const ImageUpload = ({ field, label, preview, required, error, onImage }) => (
  <Field label={label} error={error} required={required}>
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <div style={{ border: `1.5px dashed ${error ? A.danger : preview ? A.accent : A.border2}`, overflow: 'hidden', transition: 'border-color 0.15s', minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {preview ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img src={preview} alt={label} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            >
              <span style={{ fontFamily: A.sans, fontSize: '11px', color: '#FFFFFF' }}>Click to change</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '20px' }}>
            <Upload size={18} strokeWidth={1.5} style={{ color: A.textDim }} />
            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim }}>Click to upload</span>
          </div>
        )}
      </div>
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onImage(e, field)} />
    </label>
  </Field>
)

export default function AdminProductForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(slug)

  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [fetching,   setFetching]   = useState(isEdit)
  const [errors,     setErrors]     = useState({})
  const [message,    setMessage]    = useState({ text: '', type: '' })
  const [previews,   setPreviews]   = useState({ image: null, image_2: null, image_3: null })

  const [form, setForm] = useState({
    name: '', brand: '', category: '', description: '', ingredients: '',
    price: '', discount_percent: '0', suitable_skin_type: 'all',
    skin_concern: 'general', min_age: '13', max_age: '65', gender: 'unisex',
    stock: '0', low_stock_threshold: '10',
    is_available: true, is_featured: false,
    image: null, image_2: null, image_3: null,
  })

  useEffect(() => { api.get('/products/categories/').then(res => setCategories(res.data.results || res.data || [])) }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${slug}/`).then(res => {
      const p = res.data.product || res.data
      setForm({ name: p.name||'', brand: p.brand||'', category: p.category?.id||'', description: p.description||'', ingredients: p.ingredients||'', price: p.price||'', discount_percent: p.discount_percent||'0', suitable_skin_type: p.suitable_skin_type||'all', skin_concern: p.skin_concern||'general', min_age: p.min_age||'13', max_age: p.max_age||'65', gender: p.gender||'unisex', stock: p.stock||'0', low_stock_threshold: p.low_stock_threshold||'10', is_available: p.is_available??true, is_featured: p.is_featured??false, image: null, image_2: null, image_3: null })
      if (p.image)   setPreviews(pr => ({ ...pr, image:   getProductImageUrl(p.image)   }))
      if (p.image_2) setPreviews(pr => ({ ...pr, image_2: getProductImageUrl(p.image_2) }))
      if (p.image_3) setPreviews(pr => ({ ...pr, image_3: getProductImageUrl(p.image_3) }))
    }).catch(() => showMsg('Failed to load product.', 'error'))
    .finally(() => setFetching(false))
  }, [slug])

  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000) }
  const handleChange = e => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); if (errors[name]) setErrors(p => ({ ...p, [name]: '' })) }
  const handleImage  = (e, field) => { const file = e.target.files[0]; if (!file) return; setForm(p => ({ ...p, [field]: file })); setPreviews(p => ({ ...p, [field]: URL.createObjectURL(file) })) }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name     = 'Required'
    if (!form.brand.trim()) errs.brand    = 'Required'
    if (!form.category)     errs.category = 'Required'
    if (!form.price)        errs.price    = 'Required'
    if (!isEdit && !form.image) errs.image = 'Main image required'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate(); if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v === null || v === undefined) return; if (['image','image_2','image_3'].includes(k) && !v) return; fd.append(k, v) })
    try {
      if (isEdit) { await api.patch(`/products/${slug}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); showMsg('Product updated!', 'success') }
      else        { await api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); showMsg('Product created!', 'success') }
      setTimeout(() => navigate('/admin/products'), 1500)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') { setErrors(data); showMsg('Please fix the errors.', 'error') }
      else showMsg('Something went wrong.', 'error')
    } finally { setLoading(false) }
  }

  if (fetching) return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ width: '32px', height: '32px', border: `1.5px solid ${A.border2}`, borderTopColor: A.accent, borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <AdminToast message={message} />
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => navigate('/admin/products')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: A.sans, fontSize: '12px', color: A.textMid, padding: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = A.text}
            onMouseLeave={e => e.currentTarget.style.color = A.textMid}
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </button>
          <span style={{ color: A.border2 }}>|</span>
          <h2 style={{ fontFamily: A.sans, fontSize: '14px', color: A.text, fontWeight: 500, letterSpacing: '0.02em' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'flex-start' }} className="admin-form-grid">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <SectionCard title="Basic Information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Product Name" required error={errors.name}>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Vitamin C Serum" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
                <Field label="Brand" required error={errors.brand}>
                  <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Himalaya" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
              </div>

              <Field label="Category" required error={errors.category}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <select name="category" value={form.category} onChange={handleChange}
                      style={{ ...inp, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
                      onFocus={inpFocus} onBlur={inpBlur}
                    >
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 12px', border: `1px solid ${A.border2}`, background: 'transparent', color: A.textMid, textDecoration: 'none', fontFamily: A.sans, fontSize: '11px', transition: 'all 0.15s', flexShrink: 0, whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = A.accent; e.currentTarget.style.color = A.accent }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = A.border2; e.currentTarget.style.color = A.textMid }}
                  >
                    <Plus size={11} strokeWidth={2} /> New
                  </Link>
                </div>
              </Field>

              <Field label="Description">
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Product description..." style={{ ...inp, resize: 'vertical', minHeight: '80px' }} onFocus={inpFocus} onBlur={inpBlur} />
              </Field>

              <Field label="Ingredients">
                <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={3} placeholder="Key ingredients..." style={{ ...inp, resize: 'vertical', minHeight: '60px' }} onFocus={inpFocus} onBlur={inpBlur} />
              </Field>
            </SectionCard>

            <SectionCard title="Pricing & Stock">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <Field label="Price (Rs.)" required error={errors.price}>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
                <Field label="Discount %">
                  <input name="discount_percent" type="number" value={form.discount_percent} onChange={handleChange} min="0" max="100" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
                <Field label="Stock">
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} min="0" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
                <Field label="Low Stock Alert">
                  <input name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} min="0" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="AI Matching">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <Field label="Skin Type">
                  <select name="suitable_skin_type" value={form.suitable_skin_type} onChange={handleChange} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={inpFocus} onBlur={inpBlur}>
                    {SKIN_TYPES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Skin Concern">
                  <select name="skin_concern" value={form.skin_concern} onChange={handleChange} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={inpFocus} onBlur={inpBlur}>
                    {SKIN_CONCERNS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Gender">
                  <select name="gender" value={form.gender} onChange={handleChange} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={inpFocus} onBlur={inpBlur}>
                    {GENDERS.map(g => <option key={g} value={g} style={{ textTransform: 'capitalize' }}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Min Age">
                  <input name="min_age" type="number" value={form.min_age} onChange={handleChange} min="0" max="100" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
                <Field label="Max Age">
                  <input name="max_age" type="number" value={form.max_age} onChange={handleChange} min="0" max="100" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <SectionCard title="Product Images">
              <ImageUpload field="image"   label="Main Image"  required preview={previews.image}   error={errors.image}   onImage={handleImage} />
              <ImageUpload field="image_2" label="Image 2"               preview={previews.image_2} error={errors.image_2} onImage={handleImage} />
              <ImageUpload field="image_3" label="Image 3"               preview={previews.image_3} error={errors.image_3} onImage={handleImage} />
            </SectionCard>

            <SectionCard title="Settings">
              <Toggle name="is_available" label="Available for Sale" desc="Show in store" value={form.is_available} onChange={handleChange} />
              <Toggle name="is_featured"  label="Featured Product"   desc="Show on homepage" value={form.is_featured} onChange={handleChange} />
            </SectionCard>

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', background: loading ? A.muted : A.accent,
              color: '#FFFFFF', border: 'none', padding: '14px',
              fontFamily: A.sans, fontSize: '11.5px', fontWeight: 400,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = A.accentHov }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = A.accent }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .admin-form-grid {
          grid-template-columns: 1fr 300px !important;
        }
        @media (max-width: 900px) {
          .admin-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AdminLayout>
  )
}