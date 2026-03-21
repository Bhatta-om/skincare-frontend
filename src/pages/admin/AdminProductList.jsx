// src/pages/admin/AdminProductList.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { getProductImageUrl } from '../../utils/productImage'
import { Search, Plus, Pencil, Trash2, Star, Package } from 'lucide-react'

const AdminToast = ({ message }) => message.text ? (
  <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: message.type === 'success' ? A.success : A.danger, color: '#FFFFFF', padding: '12px 20px', fontFamily: A.sans, fontSize: '13px', fontWeight: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
    {message.text}
  </div>
) : null

export default function AdminProductList() {
  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [deleting, setDeleting] = useState(null)
  const [message,  setMessage]  = useState({ text: '', type: '' })

  const fetchProducts = () => {
    setLoading(true)
    // ✅ page_size=200 ensures all products load for admin
    // ✅ admin=true tells backend to return ALL products including unavailable
    const params = new URLSearchParams({ page_size: 200, admin: 'true' })
    if (search) params.append('search', search)

    api.get(`/products/?${params}`)
      .then(res => {
        setProducts(res.data.results || res.data.products || [])
        setTotal(res.data.count || res.data.total || 0)
      })
      .catch(() => showMsg('Failed to load products.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [search])

  const showMsg = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const deleteProduct = async (slug, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(slug)
    try {
      await api.delete(`/products/${slug}/`)
      showMsg(`"${name}" deleted`, 'success')
      fetchProducts()
    } catch { showMsg('Failed to delete product.', 'error') }
    finally { setDeleting(null) }
  }

  const stockStyle = (status) => {
    if (!status || status === 'Out of Stock') return { color: A.danger,  bg: 'rgba(150,56,56,0.12)'  }
    if (status.startsWith('Low'))             return { color: A.warning, bg: 'rgba(137,103,15,0.12)' }
    return { color: A.success, bg: 'rgba(74,122,87,0.12)' }
  }

  return (
    <AdminLayout>
      <AdminToast message={message} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: A.textDim, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              style={{ width: '100%', background: A.surface, border: `1px solid ${A.border2}`, color: A.text, padding: '9px 14px 9px 34px', fontFamily: A.sans, fontSize: '12.5px', outline: 'none', transition: 'border-color 0.15s', fontWeight: 300 }}
              onFocus={e => e.target.style.borderColor = A.accent}
              onBlur={e  => e.target.style.borderColor = A.border2}
            />
          </div>
          <Link to="/admin/products/add" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: A.accent, color: '#FFFFFF',
            padding: '9px 16px', textDecoration: 'none',
            fontFamily: A.sans, fontSize: '12px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            transition: 'background 0.15s', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.background = A.accentHov}
            onMouseLeave={e => e.currentTarget.style.background = A.accent}
          >
            <Plus size={14} strokeWidth={2} /> Add Product
          </Link>
        </div>

        {/* Count */}
        <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>
          {loading ? 'Loading...' : `${total} total products`}
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '32px', height: '32px', border: `1.5px solid ${A.border2}`, borderTopColor: A.accent, borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: A.surface, border: `1px solid ${A.border}` }}>
            <Package size={32} strokeWidth={1} style={{ color: A.textDim, margin: '0 auto 16px' }} />
            <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textMid, marginBottom: '16px' }}>No products found</p>
            <Link to="/admin/products/add" style={{ fontFamily: A.sans, fontSize: '12px', color: A.accent, textDecoration: 'none' }}>Add your first product →</Link>
          </div>
        ) : (
          <div style={{ background: A.surface, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
            {/* Desktop header */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr 1.2fr 1fr 100px', gap: '12px', padding: '10px 18px', borderBottom: `1px solid ${A.border}`, background: A.bg }} className="admin-prod-header">
              {['Product','Price','Stock','Status','Actions'].map((h, i) => (
                <div key={h} style={{ fontFamily: A.sans, fontSize: '9.5px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 400, textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {products.map((product, i) => {
                const ss = stockStyle(product.stock_status)
                return (
                  <div key={product.id} style={{ borderBottom: i < products.length - 1 ? `1px solid ${A.border}` : 'none' }}>

                    {/* Desktop row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr 1.2fr 1fr 100px', gap: '12px', padding: '12px 18px', alignItems: 'center' }} className="admin-prod-desktop">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{ width: '40px', height: '40px', background: '#1A1A1A', border: `1px solid ${A.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {product.image ? <img src={getProductImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={16} strokeWidth={1} style={{ color: A.textDim }} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                          <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>
                            {product.brand} · {product.category_name}
                            {product.is_featured && <Star size={10} strokeWidth={1.5} style={{ color: A.warning, display: 'inline', marginLeft: '5px', verticalAlign: 'middle' }} />}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: A.serif, fontSize: '14px', color: A.text, fontWeight: 400 }}>Rs. {product.discounted_price}</p>
                        {product.discount_percent > 0 && <p style={{ fontFamily: A.sans, fontSize: '10px', color: A.textDim, textDecoration: 'line-through', fontWeight: 300 }}>Rs. {product.price}</p>}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: A.sans, fontSize: '10px', color: ss.color, background: ss.bg, padding: '3px 8px', textTransform: 'capitalize', letterSpacing: '0.06em' }}>{product.stock_status}</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: A.sans, fontSize: '10px', color: product.is_available ? A.success : A.textDim, background: product.is_available ? 'rgba(74,122,87,0.12)' : A.bg, padding: '3px 8px', letterSpacing: '0.06em' }}>
                          {product.is_available ? 'Live' : 'Off'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <Link to={`/admin/products/edit/${product.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', border: `1px solid ${A.info}30`, background: `rgba(43,95,166,0.1)`, color: A.info, textDecoration: 'none', transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,95,166,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(43,95,166,0.1)'}
                        >
                          <Pencil size={12} strokeWidth={1.5} />
                        </Link>
                        <button onClick={() => deleteProduct(product.slug, product.name)} disabled={deleting === product.slug}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', border: `1px solid ${A.danger}30`, background: 'rgba(150,56,56,0.1)', color: A.danger, cursor: 'pointer', transition: 'all 0.15s', opacity: deleting === product.slug ? 0.5 : 1 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(150,56,56,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(150,56,56,0.1)'}
                        >
                          <Trash2 size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }} className="admin-prod-mobile">
                      <div style={{ width: '52px', height: '52px', background: '#1A1A1A', border: `1px solid ${A.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.image ? <img src={getProductImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} strokeWidth={1} style={{ color: A.textDim }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                        <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginTop: '2px' }}>{product.brand}</p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: A.serif, fontSize: '13px', color: A.accent }}>Rs. {product.discounted_price}</span>
                          <span style={{ fontFamily: A.sans, fontSize: '10px', color: ss.color, background: ss.bg, padding: '2px 7px', letterSpacing: '0.04em' }}>{product.stock_status}</span>
                          <span style={{ fontFamily: A.sans, fontSize: '10px', color: product.is_available ? A.success : A.textDim, background: product.is_available ? 'rgba(74,122,87,0.12)' : A.bg, padding: '2px 7px' }}>
                            {product.is_available ? 'Live' : 'Off'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        <Link to={`/admin/products/edit/${product.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', border: `1px solid ${A.info}30`, background: 'rgba(43,95,166,0.1)', color: A.info, textDecoration: 'none', fontFamily: A.sans, fontSize: '11px', fontWeight: 400 }}>
                          <Pencil size={11} strokeWidth={1.5} /> Edit
                        </Link>
                        <button onClick={() => deleteProduct(product.slug, product.name)} disabled={deleting === product.slug}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', border: `1px solid ${A.danger}30`, background: 'rgba(150,56,56,0.1)', color: A.danger, cursor: 'pointer', fontFamily: A.sans, fontSize: '11px', fontWeight: 400 }}>
                          <Trash2 size={11} strokeWidth={1.5} /> Del
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-prod-header  { display: grid !important; }
        .admin-prod-desktop { display: grid !important; }
        .admin-prod-mobile  { display: none !important; }
        @media (max-width: 768px) {
          .admin-prod-header  { display: none !important; }
          .admin-prod-desktop { display: none !important; }
          .admin-prod-mobile  { display: flex !important; }
        }
      `}</style>
    </AdminLayout>
  )
}