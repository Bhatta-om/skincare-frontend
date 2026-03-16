// src/pages/OrderHistory.jsx — 100% Professional + Tailwind v4
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { OrderCardSkeleton } from '../components/Skeleton'
import { getProductImageUrl } from '../utils/productImage'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: '📋' },
  { key: 'confirmed',  label: 'Confirmed',     icon: '✅' },
  { key: 'processing', label: 'Processing',    icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',       icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',     icon: '📦' },
]

const STATUS_META = {
  pending:    { color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-500'  },
  confirmed:  { color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   dot: 'bg-blue-500'   },
  processing: { color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', dot: 'bg-purple-500' },
  shipped:    { color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200', dot: 'bg-indigo-500' },
  delivered:  { color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200',  dot: 'bg-green-500'  },
  cancelled:  { color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-500'    },
  refunded:   { color: 'text-gray-700',   bg: 'bg-gray-50',    border: 'border-gray-200',   dot: 'bg-gray-400'   },
}

const PAYMENT_META = {
  paid:     { color: 'text-green-700',  bg: 'bg-green-50',  label: 'Paid'     },
  pending:  { color: 'text-amber-700',  bg: 'bg-amber-50',  label: 'Pending'  },
  failed:   { color: 'text-red-700',    bg: 'bg-red-50',    label: 'Failed'   },
  refunded: { color: 'text-gray-700',   bg: 'bg-gray-100',  label: 'Refunded' },
}

const STATUS_ICON = {
  pending: '📋', confirmed: '✅', processing: '⚙️',
  shipped: '🚚', delivered: '📦', cancelled: '❌', refunded: '↩️',
}

// ── Status Timeline ────────────────────────────────────────
const StatusTimeline = ({ order }) => {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    const meta = STATUS_META[order.status]
    return (
      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${meta.bg} ${meta.border}`}>
        <div className={`w-12 h-12 rounded-2xl ${meta.bg} border ${meta.border} flex items-center justify-center text-2xl shrink-0`}>
          {order.status === 'cancelled' ? '❌' : '↩️'}
        </div>
        <div>
          <p className={`font-black text-sm capitalize ${meta.color}`}>
            Order {order.status}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.updated_at).toLocaleDateString('en-NP', { year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
  const timestamps = {
    pending:    order.created_at,
    confirmed:  order.confirmed_at,
    processing: order.confirmed_at,
    shipped:    order.shipped_at,
    delivered:  order.delivered_at,
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 rounded-full" />
      <div className="absolute left-5 top-5 w-0.5 bg-purple-400 rounded-full transition-all duration-700"
        style={{ height: `${currentIdx === 0 ? 0 : (currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }} />

      <div className="space-y-5">
        {STATUS_STEPS.map((step, i) => {
          const isDone    = i <= currentIdx
          const isCurrent = i === currentIdx
          const ts        = timestamps[step.key]
          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all ${
                isCurrent ? 'bg-purple-600 shadow-lg shadow-purple-200/60 scale-110'
                : isDone   ? 'bg-purple-100'
                :            'bg-white border-2 border-gray-200'}`}>
                {isDone
                  ? <span className="text-sm">{step.icon}</span>
                  : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
              </div>
              <div className={`flex-1 pt-1 ${!isDone ? 'opacity-30' : ''}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className={`font-bold text-sm ${
                    isCurrent ? 'text-purple-700' : isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-bold">
                        Current
                      </span>
                    )}
                  </p>
                  {ts && isDone && (
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(ts).toLocaleDateString('en-NP', { month:'short', day:'numeric', year:'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status messages */}
      {order.status === 'shipped' && (
        <div className="mt-5 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-xl shrink-0">🚚</span>
          <div>
            <p className="font-black text-indigo-700 text-sm">Your order is on the way!</p>
            <p className="text-xs text-indigo-500 mt-0.5">Estimated delivery: 2–3 business days</p>
          </div>
        </div>
      )}
      {order.status === 'delivered' && (
        <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-xl shrink-0">🎉</span>
          <div>
            <p className="font-black text-green-700 text-sm">Order delivered successfully!</p>
            {order.delivered_at && (
              <p className="text-xs text-green-600 mt-0.5">
                Delivered on {new Date(order.delivered_at).toLocaleDateString('en-NP', { year:'numeric', month:'long', day:'numeric' })}
              </p>
            )}
            <Link to="/products" className="inline-block mt-2 text-xs text-purple-600 font-bold hover:underline">
              Rate products → ⭐
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Order Card ─────────────────────────────────────────────
const OrderCard = ({ order, expanded, onToggle }) => {
  const [activeTab, setActiveTab] = useState('timeline')
  const meta    = STATUS_META[order.status]    || STATUS_META.pending
  const payMeta = PAYMENT_META[order.payment_status] || PAYMENT_META.pending
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isTerminal = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden transition-all duration-200 ${
      expanded ? 'border-purple-200 shadow-lg shadow-purple-50' : 'border-gray-100 hover:border-purple-200 hover:shadow-md'}`}>

      {/* ── Card Header ── */}
      <div className="p-5 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-start gap-4">

          {/* Status icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${meta.bg} ${meta.border}`}>
            {STATUS_ICON[order.status] || '📋'}
          </div>

          {/* Order info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-black text-gray-900 text-sm">{order.order_number}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-NP', {
                    year:'numeric', month:'short', day:'numeric'
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="font-black text-purple-700 text-base">Rs. {order.total_amount}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black capitalize border ${meta.bg} ${meta.color} ${meta.border}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {!isTerminal && (
              <div className="flex gap-1 mt-3">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step.key} className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < currentIdx  ? 'bg-purple-400'
                    : i === currentIdx ? 'bg-purple-600'
                    :                   'bg-gray-100'}`} />
                ))}
              </div>
            )}

            {/* Payment + expand */}
            <div className="flex items-center justify-between mt-2.5">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${payMeta.bg} ${payMeta.color}`}>
                {order.payment_status === 'paid'   ? '✓ Paid'
                : order.payment_status === 'failed' ? '✗ Failed'
                : `⏳ ${payMeta.label}`}
                {order.payment_method && (
                  <span className="opacity-60 font-normal">· {order.payment_method}</span>
                )}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                {expanded ? 'Hide' : 'Details'}
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Item thumbnails preview */}
        {!expanded && order.items?.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
            <div className="flex -space-x-2">
              {order.items.slice(0, 4).map((item, i) => (
                <div key={i} className="w-8 h-8 rounded-xl border-2 border-white bg-purple-50 overflow-hidden shrink-0">
                  {item.product?.image
                    ? <img src={getProductImageUrl(item.product?.image)} alt="" className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xs">🧴</span>}
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="w-8 h-8 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                  +{order.items.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Expanded Content ── */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[{ key:'timeline', label:'Tracking' }, { key:'details', label:'Details' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-sm font-bold transition-all relative ${
                  activeTab === tab.key
                    ? 'text-purple-600 bg-purple-50/50'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Timeline */}
            {activeTab === 'timeline' && <StatusTimeline order={order} />}

            {/* Details */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-2xl p-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        {item.product?.image
                          ? <img src={getProductImageUrl(item.product?.image)}
                              alt={item.product.name} className="w-full h-full object-cover" />
                          : <span className="text-xl">🧴</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {item.product?.name || item.product_name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Rs. {item.unit_price} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-black text-gray-900 text-sm shrink-0">Rs. {item.total_price}</p>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                  {[
                    { label: 'Subtotal', value: `Rs. ${order.subtotal}` },
                    { label: 'Delivery', value: `Rs. ${order.shipping_cost || 100}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-semibold text-gray-800">{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black">
                    <span className="text-gray-900">Total</span>
                    <span className="text-purple-700 text-base">Rs. {order.total_amount}</span>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Shipping To</p>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{order.full_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{order.address_line1}, {order.city}</p>
                      <p className="text-gray-500 text-xs">{order.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function OrderHistory() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    api.get('/orders/my-orders/')
      .then(res => setOrders(res.data.orders || res.data.results || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const FILTERS = [
    { key: 'all',       label: 'All'       },
    { key: 'active',    label: 'Active'    },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const filtered = orders.filter(o => {
    if (filter === 'all')       return true
    if (filter === 'active')    return !['delivered','cancelled','refunded'].includes(o.status)
    if (filter === 'delivered') return o.status === 'delivered'
    if (filter === 'cancelled') return ['cancelled','refunded'].includes(o.status)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-700 to-pink-500 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black">My Orders</h1>
          <p className="text-purple-100 text-sm mt-0.5">
            {loading ? '...' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        {!loading && orders.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                  filter === f.key
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}>
                {f.label}
                {f.key !== 'all' && (
                  <span className="ml-1.5 opacity-70 text-xs">
                    ({orders.filter(o =>
                      f.key === 'active'    ? !['delivered','cancelled','refunded'].includes(o.status) :
                      f.key === 'delivered' ? o.status === 'delivered' :
                      f.key === 'cancelled' ? ['cancelled','refunded'].includes(o.status) : true
                    ).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-12 h-12 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here!</p>
            <Link to="/products"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all"
              style={{boxShadow:'0 8px 24px rgba(124,58,237,0.3)'}}>
              Browse Products →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No {filter} orders</p>
            <button onClick={() => setFilter('all')} className="mt-3 text-purple-600 text-sm font-bold hover:underline">
              View all orders
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expanded === order.id}
                onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}