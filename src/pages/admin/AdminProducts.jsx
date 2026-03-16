// src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'
import { getProductImageUrl } from '../../utils/productImage'

export default function AdminProducts() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/admin/products/stats/')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load product stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">{error}</div>
    </AdminLayout>
  )

  const { stats, low_stock_products, out_of_stock_products } = data

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total',       value: stats.total,        color: 'text-white',       bg: 'bg-gray-900 border-gray-800' },
            { label: 'Low Stock',   value: stats.low_stock,    color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30' },
            { label: 'Out of Stock',value: stats.out_of_stock, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
            { label: 'Featured',    value: stats.featured,     color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30' },
            { label: 'Unavailable', value: stats.unavailable,  color: 'text-gray-400',    bg: 'bg-gray-800 border-gray-700' },
          ].map((s, i) => (
            <div key={i} className={`border rounded-2xl p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Manage Products Link */}
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Stock Alerts</h2>
          <a href="http://127.0.0.1:8000/admin/products/product/" target="_blank" rel="noreferrer"
            className="text-purple-400 hover:text-purple-300 text-sm border border-purple-500/30 px-4 py-2 rounded-xl transition-colors">
            Manage in Django Admin →
          </a>
        </div>

        {/* Low Stock */}
        {low_stock_products?.length > 0 && (
          <div className="bg-gray-900 border border-orange-500/20 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
              <span className="text-orange-400">⚠️</span>
              <h3 className="text-orange-400 font-bold text-sm">Low Stock ({low_stock_products.length})</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {low_stock_products.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                    {p.image ? (
                      <img src={getProductImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                    ) : <span>🧴</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.name}</p>
                    <p className="text-gray-500 text-xs">{p.brand} · {p.category_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-orange-400 font-bold text-sm">{p.stock_status}</span>
                    <p className="text-gray-600 text-xs">Rs. {p.discounted_price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Out of Stock */}
        {out_of_stock_products?.length > 0 && (
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
              <span className="text-red-400">❌</span>
              <h3 className="text-red-400 font-bold text-sm">Out of Stock ({out_of_stock_products.length})</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {out_of_stock_products.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 opacity-75">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                    {p.image ? (
                      <img src={getProductImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                    ) : <span>🧴</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.name}</p>
                    <p className="text-gray-500 text-xs">{p.brand} · {p.category_name}</p>
                  </div>
                  <span className="text-red-400 text-xs font-medium shrink-0">Out of Stock</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {low_stock_products?.length === 0 && out_of_stock_products?.length === 0 && (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-gray-400">All products are well stocked!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}