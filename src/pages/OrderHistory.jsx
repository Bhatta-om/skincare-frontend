// src/pages/OrderHistory.jsx — Mobile Responsive + SEO
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { OrderCardSkeleton } from '../components/Skeleton'
import SEO from '../components/SEO'
import { getProductImageUrl } from '../utils/productImage'
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  RefreshCw, ChevronDown, MapPin, ChevronRight,
  ArrowRight,
} from 'lucide-react'

const ORDERS_CSS = `
  .orders-filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .order-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .order-item-grid {
    display: grid;
    grid-template-columns: 56px 1fr auto;
    gap: 14px;
    align-items: center;
  }
  .order-tabs-row {
    display: flex;
    border-bottom: 1px solid #EEE7DF;
    overflow-x: auto;
  }
  @media (max-width: 480px) {
    .order-item-grid { grid-template-columns: 48px 1fr; }
    .order-item-price { display: none; }
  }
`

const STATUS_META = {
  pending:    { color: '#89670F', bg: '#FCF3E4', border: '#E5D39C', label: 'Pending',    icon: <Clock       size={13} strokeWidth={1.5} /> },
  confirmed:  { color: '#2B5FA6', bg: '#E6F0FA', border: '#B0CCE8', label: 'Confirmed',  icon: <CheckCircle size={13} strokeWidth={1.5} /> },
  processing: { color: '#5A4A9A', bg: '#EEE8F8', border: '#C8BCEA', label: 'Processing', icon: <RefreshCw   size={13} strokeWidth={1.5} /> },
  shipped:    { color: '#2B5FA6', bg: '#E6F0FA', border: '#B0CCE8', label: 'Shipped',    icon: <Truck       size={13} strokeWidth={1.5} /> },
  delivered:  { color: '#4A7A57', bg: '#EEF6F1', border: '#C4DAC8', label: 'Delivered',  icon: <Package     size={13} strokeWidth={1.5} /> },
  cancelled:  { color: '#963838', bg: '#FCF3F3', border: '#D8BEBE', label: 'Cancelled',  icon: <XCircle     size={13} strokeWidth={1.5} /> },
  refunded:   { color: '#7B6458', bg: '#F4EDE4', border: '#E6DDD3', label: 'Refunded',   icon: <RefreshCw   size={13} strokeWidth={1.5} /> },
}
const PAYMENT_META = { paid: { color: '#4A7A57', label: 'Paid' }, pending: { color: '#89670F', label: 'Pending' }, failed: { color: '#963838', label: 'Failed' }, refunded: { color: '#7B6458', label: 'Refunded' } }
const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed' },
  { key: 'confirmed',  label: 'Confirmed'    },
  { key: 'processing', label: 'Processing'   },
  { key: 'shipped',    label: 'Shipped'      },
  { key: 'delivered',  label: 'Delivered'    },
]

const StatusTimeline = ({ order }) => {
  const isTerminal = order.status === 'cancelled' || order.status === 'refunded'
  const meta       = STATUS_META[order.status] || STATUS_META.pending

  if (isTerminal) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: meta.bg, border: `1px solid ${meta.border}` }}>
      <div style={{ width: '40px', height: '40px', border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
      <div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: meta.color, fontWeight: 400, textTransform: 'capitalize' }}>Order {order.status}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', marginTop: '2px', fontWeight: 300 }}>
          {new Date(order.updated_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  )

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
  const timestamps = { pending: order.created_at, confirmed: order.confirmed_at, processing: order.confirmed_at, shipped: order.shipped_at, delivered: order.delivered_at }

  return (
    <div>
      {STATUS_STEPS.map((step, i) => {
        const isDone = i <= currentIdx; const isCurrent = i === currentIdx
        const ts = timestamps[step.key]; const stepMeta = STATUS_META[step.key] || STATUS_META.pending
        return (
          <div key={step.key} style={{ display: 'flex', gap: '16px', padding: '10px 0', position: 'relative' }}>
            {i < STATUS_STEPS.length - 1 && <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: '-10px', width: '1px', background: isDone ? '#B8895A' : '#E6DDD3', zIndex: 0 }} />}
            <div style={{ width: '40px', height: '40px', flexShrink: 0, border: `1px solid ${isCurrent ? '#B8895A' : isDone ? '#B8895A' : '#E6DDD3'}`, background: isCurrent ? '#B8895A' : isDone ? '#FFFCF9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCurrent ? '#FFFFFF' : isDone ? '#B8895A' : '#D4C4B0', position: 'relative', zIndex: 1, transition: 'all 0.3s' }}>
              {isDone ? stepMeta.icon : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E6DDD3' }} />}
            </div>
            <div style={{ flex: 1, paddingTop: '8px', opacity: isDone ? 1 : 0.35 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: isCurrent ? '#B8895A' : isDone ? '#16100C' : '#AA9688', fontWeight: isCurrent ? 500 : 400 }}>{step.label}</p>
                  {isCurrent && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B8895A', border: '1px solid #B8895A', padding: '2px 8px', fontWeight: 400 }}>Current</span>}
                </div>
                {ts && isDone && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', fontWeight: 300 }}>{new Date(ts).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </div>
            </div>
          </div>
        )
      })}
      {order.status === 'shipped' && (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: '#E6F0FA', border: '1px solid #B0CCE8' }}>
          <Truck size={16} strokeWidth={1.5} style={{ color: '#2B5FA6', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#2B5FA6', fontWeight: 400 }}>Your order is on the way</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#7B9AC8', fontWeight: 300, marginTop: '2px' }}>Estimated delivery: 2–3 business days</p>
          </div>
        </div>
      )}
      {order.status === 'delivered' && (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: '#EEF6F1', border: '1px solid #C4DAC8' }}>
          <CheckCircle size={16} strokeWidth={1.5} style={{ color: '#4A7A57', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#4A7A57', fontWeight: 400 }}>Order delivered successfully</p>
            {order.delivered_at && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#7AAA87', fontWeight: 300, marginTop: '2px' }}>{new Date(order.delivered_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

const OrderCard = ({ order, expanded, onToggle }) => {
  const [activeTab, setActiveTab] = useState('timeline')
  const meta       = STATUS_META[order.status]    || STATUS_META.pending
  const payMeta    = PAYMENT_META[order.payment_status] || PAYMENT_META.pending
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isTerminal = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${expanded ? '#B8895A' : '#E6DDD3'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <div style={{ padding: 'clamp(16px,3vw,20px) clamp(16px,3vw,24px)', cursor: 'pointer', userSelect: 'none' }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', border: `1px solid ${meta.border}`, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="order-header-row">
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#16100C', fontWeight: 400, letterSpacing: '0.02em' }}>{order.order_number}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', fontWeight: 300, marginTop: '2px' }}>
                  {new Date(order.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(15px,2.5vw,18px)', color: '#16100C', fontWeight: 400 }}>Rs. {order.total_amount}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`, padding: '3px 8px', marginTop: '4px', fontWeight: 400 }}>
                  {meta.icon}{meta.label}
                </span>
              </div>
            </div>
            {!isTerminal && (
              <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                {STATUS_STEPS.map((step,i) => <div key={step.key} style={{ flex: 1, height: '3px', background: i <= currentIdx ? '#B8895A' : '#E6DDD3', transition: 'background 0.3s' }} />)}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: payMeta.color, fontWeight: 300 }}>
                {payMeta.label}{order.payment_method && <span style={{ color: '#AA9688' }}> · {order.payment_method}</span>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', fontWeight: 300 }}>
                {expanded ? 'Hide' : 'Details'}
                <ChevronDown size={13} strokeWidth={1.5} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>
            </div>
          </div>
        </div>

        {!expanded && order.items?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #EEE7DF' }}>
            <div style={{ display: 'flex' }}>
              {order.items.slice(0,4).map((item,i) => (
                <div key={i} style={{ width: '36px', height: '36px', border: '2px solid #FFFFFF', background: '#F4EDE4', overflow: 'hidden', marginLeft: i>0 ? '-8px' : '0' }}>
                  {item.product?.image ? <img src={getProductImageUrl(item.product?.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} strokeWidth={1} style={{ color: '#D4C4B0' }} /></div>}
                </div>
              ))}
              {order.items.length > 4 && <div style={{ width: '36px', height: '36px', border: '2px solid #FFFFFF', background: '#F4EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-8px' }}><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#7B6458', fontWeight: 400 }}>+{order.items.length-4}</span></div>}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', fontWeight: 300 }}>{order.items.length} item{order.items.length!==1?'s':''}</span>
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #EEE7DF' }}>
          <div className="order-tabs-row">
            {[{ key: 'timeline', label: 'Tracking' }, { key: 'details', label: 'Details' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`tab-link ${activeTab === tab.key ? 'active' : ''}`}
                style={{ flex: 1, padding: '14px clamp(12px,2vw,24px)', borderBottom: activeTab===tab.key ? '2px solid #16100C' : '2px solid transparent', borderLeft: 'none', borderRight: 'none', borderTop: 'none', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ padding: 'clamp(16px,3vw,24px)' }}>
            {activeTab === 'timeline' && <StatusTimeline order={order} />}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#E6DDD3' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} className="order-item-grid" style={{ padding: 'clamp(10px,2vw,14px) clamp(12px,2vw,16px)', background: '#FFFFFF' }}>
                      <div style={{ width: '100%', aspectRatio: '1', background: '#F4EDE4', border: '1px solid #E6DDD3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.product?.image ? <img src={getProductImageUrl(item.product?.image)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} strokeWidth={1} style={{ color: '#D4C4B0' }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#16100C', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name || item.product_name}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', fontWeight: 300, marginTop: '2px' }}>Rs. {item.unit_price} × {item.quantity}</p>
                      </div>
                      <p className="order-item-price" style={{ fontFamily: "'Playfair Display',serif", fontSize: '15px', color: '#16100C', fontWeight: 400, flexShrink: 0 }}>Rs. {item.total_price}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#FDFAF7', border: '1px solid #EEE7DF', padding: 'clamp(12px,2vw,16px) clamp(14px,2vw,20px)' }}>
                  {[{ label: 'Subtotal', value: `Rs. ${order.subtotal}` }, { label: 'Delivery', value: `Rs. ${order.shipping_cost||100}` }].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #EEE7DF' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#AA9688', fontWeight: 300 }}>{row.label}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#3A2820', fontWeight: 400 }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400 }}>Total</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,2.5vw,20px)', color: '#16100C', fontWeight: 400 }}>Rs. {order.total_amount}</span>
                  </div>
                </div>
                {order.address_line1 && (
                  <div style={{ background: '#FDFAF7', border: '1px solid #EEE7DF', padding: 'clamp(12px,2vw,16px) clamp(14px,2vw,20px)' }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#AA9688', marginBottom: '12px', fontWeight: 400 }}>Shipping Address</p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={16} strokeWidth={1.5} style={{ color: '#B8895A', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#16100C', fontWeight: 400 }}>{order.full_name}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#7B6458', fontWeight: 300, marginTop: '3px' }}>{order.address_line1}, {order.city}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#AA9688', fontWeight: 300 }}>{order.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrderHistory() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    api.get('/orders/my-orders/').then(res => setOrders(res.data.orders || res.data.results || [])).catch(() => setOrders([])).finally(() => setLoading(false))
  }, [])

  const FILTERS = [{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'delivered', label: 'Delivered' }, { key: 'cancelled', label: 'Cancelled' }]
  const filterFn = (o) => {
    if (filter === 'active')    return !['delivered','cancelled','refunded'].includes(o.status)
    if (filter === 'delivered') return o.status === 'delivered'
    if (filter === 'cancelled') return ['cancelled','refunded'].includes(o.status)
    return true
  }
  const getCount = (key) => {
    if (key === 'all') return orders.length
    if (key === 'active')    return orders.filter(o => !['delivered','cancelled','refunded'].includes(o.status)).length
    if (key === 'delivered') return orders.filter(o => o.status === 'delivered').length
    if (key === 'cancelled') return orders.filter(o => ['cancelled','refunded'].includes(o.status)).length
    return 0
  }
  const filtered = orders.filter(filterFn)

  return (
    <>
      <SEO title="My Orders" description="View and track your skincare orders" url="/orders" noIndex />
      <style>{ORDERS_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: 'clamp(32px,5vw,48px) 0 40px' }}>
          <div className="container-luxury">
            <div className="breadcrumb" style={{ marginBottom: '20px' }}>
              <Link to="/">Home</Link><span className="sep"><ChevronRight size={11} strokeWidth={1.5} /></span>
              <span className="current">Orders</span>
            </div>
            <div className="section-eyebrow">My Account</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3.5vw,40px)', color: '#16100C', fontWeight: 400, lineHeight: 1.1 }}>
              My Orders
              {!loading && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '16px', color: '#AA9688', fontWeight: 300, marginLeft: '14px' }}>{orders.length} total</span>}
            </h1>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,40px) 32px clamp(48px,6vw,80px)', maxWidth: '820px' }}>
          {!loading && orders.length > 0 && (
            <div className="orders-filter-row">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 16px', border: '1px solid', borderColor: filter===f.key ? '#16100C' : '#E6DDD3', background: filter===f.key ? '#16100C' : 'transparent', color: filter===f.key ? '#FAF8F5' : '#7B6458', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {f.label} {f.key !== 'all' && <span style={{ marginLeft: '4px', opacity: 0.6 }}>({getCount(f.key)})</span>}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(3)].map((_,i) => <OrderCardSkeleton key={i} />)}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(48px,8vw,80px) 24px', background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
              <div style={{ width: '72px', height: '72px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#D4C4B0' }}><Package size={28} strokeWidth={1} /></div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#16100C', fontWeight: 400, marginBottom: '8px' }}>No orders yet</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#AA9688', marginBottom: '28px', fontWeight: 300 }}>Start shopping to see your orders here</p>
              <Link to="/products" className="btn-primary" style={{ gap: '8px', display: 'inline-flex' }}>Browse Products <ArrowRight size={14} strokeWidth={1.5} /></Link>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px', background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#AA9688', fontWeight: 300, marginBottom: '12px' }}>No {filter} orders found</p>
              <button onClick={() => setFilter('all')} className="btn-ghost" style={{ fontSize: '12px', color: '#B8895A' }}>View all orders</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map(order => (
                <OrderCard key={order.id} order={order} expanded={expanded===order.id} onToggle={() => setExpanded(expanded===order.id ? null : order.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}