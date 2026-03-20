// src/pages/admin/AdminOrders.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import {
  Search, X, ChevronDown, CheckCircle, Clock,
  RefreshCw, Truck, Package, XCircle, CreditCard,
} from 'lucide-react'

const STATUS_META = {
  pending:    { color: '#89670F', bg: 'rgba(137,103,15,0.12)',  label: 'Pending',    icon: Clock      },
  confirmed:  { color: '#2B5FA6', bg: 'rgba(43,95,166,0.12)',  label: 'Confirmed',  icon: CheckCircle },
  processing: { color: '#B8895A', bg: 'rgba(184,137,90,0.12)', label: 'Processing', icon: RefreshCw  },
  shipped:    { color: '#5A7FA6', bg: 'rgba(90,127,166,0.12)', label: 'Shipped',    icon: Truck      },
  delivered:  { color: '#4A7A57', bg: 'rgba(74,122,87,0.12)',  label: 'Delivered',  icon: Package    },
  cancelled:  { color: '#963838', bg: 'rgba(150,56,56,0.12)',  label: 'Cancelled',  icon: XCircle    },
}

const PAYMENT_META = {
  paid:    { color: '#4A7A57', bg: 'rgba(74,122,87,0.12)'  },
  pending: { color: '#89670F', bg: 'rgba(137,103,15,0.12)' },
  failed:  { color: '#963838', bg: 'rgba(150,56,56,0.12)'  },
}

const VALID_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled']

const AdminToast = ({ message }) => message.text ? (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    background: message.type === 'success' ? A.success : A.danger,
    color: '#FFFFFF', padding: '12px 20px',
    fontFamily: A.sans, fontSize: '13px', fontWeight: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'pageFadeIn 0.2s ease',
  }}>
    {message.text}
  </div>
) : null

export default function AdminOrders() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating,     setUpdating]     = useState(null)
  const [message,      setMessage]      = useState({ text: '', type: '' })
  const [expandedId,   setExpandedId]   = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)       params.append('search', search)
    if (statusFilter) params.append('status', statusFilter)
    api.get(`/admin/orders/?${params}`)
      .then(res => setOrders(res.data.orders || []))
      .catch(() => showMsg('Failed to load orders.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [search, statusFilter])

  const showMsg = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status/`, { status: newStatus })
      showMsg(`Status updated to ${newStatus}`, 'success')
      fetchOrders()
    } catch {
      showMsg('Failed to update status.', 'error')
    } finally { setUpdating(null) }
  }

  const inp = {
    background: A.surface, border: `1px solid ${A.border2}`,
    color: A.text, padding: '9px 14px',
    fontFamily: A.sans, fontSize: '12.5px', outline: 'none',
    width: '100%', transition: 'border-color 0.15s',
    fontWeight: 300,
  }

  return (
    <AdminLayout>
      <AdminToast message={message} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: A.textDim, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order, name, email..."
              style={{ ...inp, paddingLeft: '34px' }}
              onFocus={e => e.target.style.borderColor = A.accent}
              onBlur={e  => e.target.style.borderColor = A.border2}
            />
          </div>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ ...inp, width: 'auto', paddingRight: '32px', appearance: 'none', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = A.accent}
              onBlur={e  => e.target.style.borderColor = A.border2}
            >
              <option value="">All Statuses</option>
              {VALID_STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <ChevronDown size={12} strokeWidth={1.5} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: A.textMid, pointerEvents: 'none' }} />
          </div>

          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid ${A.border2}`, color: A.textMid, padding: '9px 14px', cursor: 'pointer', fontFamily: A.sans, fontSize: '12px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = A.text; e.currentTarget.style.borderColor = A.muted }}
              onMouseLeave={e => { e.currentTarget.style.color = A.textMid; e.currentTarget.style.borderColor = A.border2 }}
            >
              <X size={12} strokeWidth={1.5} /> Clear
            </button>
          )}
        </div>

        <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>{orders.length} orders</p>

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '32px', height: '32px', border: `1.5px solid ${A.border2}`, borderTopColor: A.accent, borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: A.surface, border: `1px solid ${A.border}` }}>
            <Package size={32} strokeWidth={1} style={{ color: A.textDim, margin: '0 auto 16px' }} />
            <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textMid }}>No orders found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {orders.map(order => {
              const meta    = STATUS_META[order.status] || STATUS_META.pending
              const payMeta = PAYMENT_META[order.payment_status] || PAYMENT_META.pending
              const Icon    = meta.icon
              const isOpen  = expandedId === order.id

              return (
                <div key={order.id} style={{ background: A.surface, border: `1px solid ${isOpen ? A.accent : A.border}`, overflow: 'hidden', transition: 'border-color 0.15s' }}>

                  {/* Header row */}
                  <div style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }} onClick={() => setExpandedId(isOpen ? null : order.id)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      {/* Status icon */}
                      <div style={{ width: '36px', height: '36px', border: `1px solid ${meta.color}30`, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} strokeWidth={1.5} style={{ color: meta.color }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.text, fontWeight: 400, letterSpacing: '0.02em' }}>{order.order_number}</p>
                            <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                              {order.full_name} · {order.city}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontFamily: A.serif, fontSize: '16px', color: A.text, fontWeight: 400 }}>Rs. {order.total_amount}</p>
                            <span style={{ fontFamily: A.sans, fontSize: '10px', color: meta.color, background: meta.bg, padding: '2px 8px', textTransform: 'capitalize', letterSpacing: '0.06em', fontWeight: 400 }}>
                              {meta.label}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: A.sans, fontSize: '10px', color: payMeta.color, background: payMeta.bg, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 400 }}>
                              {order.payment_status}
                            </span>
                            {order.payment_method && (
                              <span style={{ fontFamily: A.sans, fontSize: '10px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{order.payment_method}</span>
                            )}
                            <span style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, fontWeight: 300 }}>
                              {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, fontWeight: 300 }}>
                              {new Date(order.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                            </span>
                            <ChevronDown size={12} strokeWidth={1.5} style={{ color: A.textDim, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${A.border}`, padding: '16px 18px' }}>
                      {/* Contact */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                        {[{ label: 'Phone', value: order.phone }, { label: 'Email', value: order.email }, { label: 'Address', value: `${order.address_line1}, ${order.city}` }].filter(i => i.value).map(item => (
                          <div key={item.label} style={{ background: A.bg, border: `1px solid ${A.border}`, padding: '10px 14px' }}>
                            <p style={{ fontFamily: A.sans, fontSize: '9.5px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', fontWeight: 400 }}>{item.label}</p>
                            <p style={{ fontFamily: A.sans, fontSize: '12px', color: A.text, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Status update */}
                      <p style={{ fontFamily: A.sans, fontSize: '10px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px', fontWeight: 400 }}>Update Status</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {VALID_STATUSES.map(s => {
                          const sm = STATUS_META[s]
                          const isCurrent = order.status === s
                          return (
                            <button key={s} onClick={() => updateStatus(order.id, s)}
                              disabled={updating === order.id || isCurrent}
                              style={{
                                padding: '6px 14px',
                                border: `1px solid ${isCurrent ? sm.color : A.border2}`,
                                background: isCurrent ? sm.bg : 'transparent',
                                color: isCurrent ? sm.color : A.textMid,
                                fontFamily: A.sans, fontSize: '10.5px',
                                textTransform: 'capitalize', letterSpacing: '0.06em',
                                cursor: isCurrent ? 'default' : updating === order.id ? 'wait' : 'pointer',
                                transition: 'all 0.15s', fontWeight: 400,
                                opacity: updating === order.id && !isCurrent ? 0.5 : 1,
                              }}
                              onMouseEnter={e => { if (!isCurrent && updating !== order.id) { e.currentTarget.style.borderColor = sm.color; e.currentTarget.style.color = sm.color } }}
                              onMouseLeave={e => { if (!isCurrent && updating !== order.id) { e.currentTarget.style.borderColor = A.border2; e.currentTarget.style.color = A.textMid } }}
                            >
                              {updating === order.id ? '...' : sm.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}