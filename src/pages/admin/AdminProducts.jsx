// src/pages/admin/AdminProducts.jsx — Stock Alerts (Professional Dark Admin)
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { getProductImageUrl } from '../../utils/productImage'
import { Package, AlertTriangle, XCircle, CheckCircle, Star, ExternalLink } from 'lucide-react'

export default function AdminProducts() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/admin/products/stats/')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load product stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ width: '32px', height: '32px', border: `1.5px solid ${A.border2}`, borderTopColor: A.accent, borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
      </div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <div style={{ background: 'rgba(150,56,56,0.1)', border: '1px solid rgba(150,56,56,0.3)', padding: '16px 20px', fontFamily: A.sans, fontSize: '13px', color: A.danger }}>{error}</div>
    </AdminLayout>
  )

  const { stats, low_stock_products, out_of_stock_products } = data

  const statCards = [
    { icon: Package,       label: 'Total Products', value: stats.total,         color: A.accent  },
    { icon: AlertTriangle, label: 'Low Stock',       value: stats.low_stock,    color: A.warning },
    { icon: XCircle,       label: 'Out of Stock',    value: stats.out_of_stock, color: A.danger  },
    { icon: Star,          label: 'Featured',        value: stats.featured,     color: '#89670F' },
    { icon: XCircle,       label: 'Unavailable',     value: stats.unavailable,  color: A.textMid },
  ]

  const ProductRow = ({ p, outOfStock }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderBottom: `1px solid ${A.border}` }}>
      <div style={{ width: '40px', height: '40px', background: A.bg, border: `1px solid ${A.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {p.image ? <img src={getProductImageUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={16} strokeWidth={1} style={{ color: A.textDim }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: outOfStock ? A.textMid : A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginTop: '2px' }}>{p.brand} · {p.category_name}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: A.sans, fontSize: '11.5px', color: outOfStock ? A.danger : A.warning, fontWeight: 400 }}>
          {outOfStock ? 'Out of Stock' : p.stock_status}
        </p>
        <p style={{ fontFamily: A.serif, fontSize: '13px', color: A.textMid, fontWeight: 400, marginTop: '2px' }}>Rs. {p.discounted_price}</p>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {statCards.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{ background: A.surface, border: `1px solid ${A.border}`, padding: '16px 18px' }}>
                <Icon size={16} strokeWidth={1.5} style={{ color: s.color, marginBottom: '10px' }} />
                <p style={{ fontFamily: A.serif, fontSize: '24px', color: A.text, fontWeight: 400, lineHeight: 1, marginBottom: '6px' }}>{s.value}</p>
                <p style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontFamily: A.sans, fontSize: '13px', color: A.text, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Stock Alerts</h2>
          <a href="http://127.0.0.1:8000/admin/products/product/" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: A.sans, fontSize: '11.5px', color: A.accent, textDecoration: 'none', border: `1px solid rgba(184,137,90,0.25)`, padding: '7px 14px', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = A.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(184,137,90,0.25)'}
          >
            Django Admin <ExternalLink size={12} strokeWidth={1.5} />
          </a>
        </div>

        {/* Low Stock */}
        {low_stock_products?.length > 0 && (
          <div style={{ background: A.surface, border: `1px solid rgba(137,103,15,0.3)`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(137,103,15,0.06)' }}>
              <AlertTriangle size={14} strokeWidth={1.5} style={{ color: A.warning }} />
              <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.warning, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>
                Low Stock — {low_stock_products.length} product{low_stock_products.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              {low_stock_products.map((p, i) => (
                <div key={p.id} style={{ borderBottom: i < low_stock_products.length - 1 ? `1px solid ${A.border}` : 'none' }}>
                  <ProductRow p={p} outOfStock={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Out of Stock */}
        {out_of_stock_products?.length > 0 && (
          <div style={{ background: A.surface, border: `1px solid rgba(150,56,56,0.3)`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(150,56,56,0.06)' }}>
              <XCircle size={14} strokeWidth={1.5} style={{ color: A.danger }} />
              <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.danger, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>
                Out of Stock — {out_of_stock_products.length} product{out_of_stock_products.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              {out_of_stock_products.map((p, i) => (
                <div key={p.id} style={{ borderBottom: i < out_of_stock_products.length - 1 ? `1px solid ${A.border}` : 'none', opacity: 0.7 }}>
                  <ProductRow p={p} outOfStock={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!low_stock_products?.length && !out_of_stock_products?.length && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: A.surface, border: `1px solid ${A.border}` }}>
            <CheckCircle size={32} strokeWidth={1} style={{ color: A.success, margin: '0 auto 16px' }} />
            <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textMid }}>All products are well stocked</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}