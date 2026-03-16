// src/pages/admin/AdminOrders.jsx — Mobile Polish
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  confirmed:  'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  shipped:    'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  delivered:  'bg-green-500/20 text-green-400 border border-green-500/30',
  cancelled:  'bg-red-500/20 text-red-400 border border-red-500/30',
}

const paymentColors = {
  paid:    'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed:  'bg-red-500/20 text-red-400',
}

const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

// Status emoji map
const statusEmoji = {
  pending: '📋', confirmed: '✅', processing: '⚙️',
  shipped: '🚚', delivered: '📦', cancelled: '❌',
}

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
      .catch(() => showMessage('Failed to load orders.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [search, statusFilter])

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status/`, { status: newStatus })
      showMessage(`→ ${newStatus}`, 'success')
      fetchOrders()
    } catch {
      showMessage('Failed to update.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4">

        {/* Toast */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search order, name..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500">
            <option value="">All Status</option>
            {validStatuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('') }}
              className="text-gray-400 hover:text-white border border-gray-700 px-4 py-2.5 rounded-xl text-sm">
              Clear
            </button>
          )}
        </div>

        <p className="text-gray-600 text-xs">{orders.length} orders</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-5xl mb-3">📦</p>
            <p className="text-gray-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">

                {/* Order row — tap to expand */}
                <div className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Status icon */}
                      <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-base shrink-0">
                        {statusEmoji[order.status] || '📋'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm">{order.order_number}</p>
                        <p className="text-gray-500 text-xs truncate">{order.full_name}</p>
                        <p className="text-gray-600 text-xs">{order.city} · {order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-sm">Rs. {order.total_amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-700 text-gray-400'}`}>
                        {order.status}
                      </span>
                      <p className="text-gray-600 text-xs mt-1">{expandedId === order.id ? '▲' : '▼'}</p>
                    </div>
                  </div>

                  {/* Payment badge + date */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${paymentColors[order.payment_status] || 'bg-gray-700 text-gray-400'}`}>
                      💳 {order.payment_status} · {order.payment_method?.toUpperCase()}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-NP', { month:'short', day:'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Expanded panel */}
                {expandedId === order.id && (
                  <div className="border-t border-gray-800 p-4 space-y-3">
                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-800 rounded-lg p-2.5">
                        <p className="text-gray-500 mb-0.5">📞 Phone</p>
                        <p className="text-white font-medium">{order.phone}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-2.5">
                        <p className="text-gray-500 mb-0.5">📧 Email</p>
                        <p className="text-white font-medium truncate">{order.email}</p>
                      </div>
                    </div>

                    {/* Status update */}
                    <div>
                      <p className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">Update Status</p>
                      {/* Mobile: 2 rows of 3, Desktop: 1 row */}
                      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
                        {validStatuses.map(s => (
                          <button key={s} onClick={() => updateStatus(order.id, s)}
                            disabled={updating === order.id || order.status === s}
                            className={`py-2 px-2 rounded-lg text-xs font-medium capitalize transition-all disabled:opacity-40 ${
                              order.status === s
                                ? `${statusColors[s]} cursor-default`
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 hover:border-gray-500'
                            }`}>
                            {updating === order.id ? '...' : `${statusEmoji[s]} ${s}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}