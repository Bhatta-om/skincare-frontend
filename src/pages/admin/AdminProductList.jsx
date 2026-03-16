// src/pages/admin/AdminProductList.jsx — Mobile Polish
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'
import { getProductImageUrl } from '../../utils/productImage'

export default function AdminProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(null)
  const [message, setMessage]   = useState({ text: '', type: '' })

  const fetchProducts = () => {
    setLoading(true)
    const params = search ? `?search=${search}` : ''
    api.get(`/products/${params}`)
      .then(res => setProducts(res.data.results || res.data.products || []))
      .catch(() => showMsg('Failed to load products.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [search])

  const showMsg = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const deleteProduct = async (slug, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    setDeleting(slug)
    try {
      await api.delete(`/products/${slug}/`)
      showMsg(`"${name}" deleted!`, 'success')
      fetchProducts()
    } catch {
      showMsg('Failed to delete.', 'error')
    } finally {
      setDeleting(null)
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

        {/* Header */}
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search products..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600" />
          <Link to="/admin/products/add"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            + Add
          </Link>
        </div>

        <p className="text-gray-600 text-xs">{products.length} products</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-5xl mb-3">🧴</p>
            <p className="text-gray-400 text-sm mb-4">No products found</p>
            <Link to="/admin/products/add" className="text-purple-400 text-sm hover:text-purple-300">+ Add first product</Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-gray-800 text-gray-600 text-xs font-semibold uppercase tracking-wider">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Stock</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            <div className="divide-y divide-gray-800/60">
              {products.map(product => (
                <div key={product.id}
                  className="hover:bg-gray-800/20 transition-colors">

                  {/* ── Mobile card layout ── */}
                  <div className="md:hidden flex items-center gap-3 p-4">
                    <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                      {product.image
                        ? <img src={getProductImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🧴</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{product.name}</p>
                      <p className="text-gray-500 text-xs">{product.brand} · {product.category_name}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-purple-400 text-xs font-bold">Rs. {product.discounted_price}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          product.stock_status === 'Out of Stock'
                            ? 'bg-red-500/20 text-red-400'
                            : product.stock_status?.startsWith('Low')
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'}`}>
                          {product.stock_status}
                        </span>
                        {product.is_featured && <span className="text-yellow-400 text-xs">⭐</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link to={`/admin/products/edit/${product.slug}`}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium text-center hover:bg-blue-500/30 transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => deleteProduct(product.slug, product.name)}
                        disabled={deleting === product.slug}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-40">
                        {deleting === product.slug ? '...' : 'Del'}
                      </button>
                    </div>
                  </div>

                  {/* ── Desktop table row ── */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3.5 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-11 h-11 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                        {product.image
                          ? <img src={getProductImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">🧴</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{product.name}</p>
                        <p className="text-gray-500 text-xs">{product.brand} · {product.category_name}</p>
                        {product.is_featured && <span className="text-yellow-400 text-xs">⭐ Featured</span>}
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-white text-sm">Rs. {product.discounted_price}</p>
                      {product.discount_percent > 0 && (
                        <p className="text-gray-600 text-xs line-through">Rs. {product.price}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock_status === 'Out of Stock'
                          ? 'bg-red-500/20 text-red-400'
                          : product.stock_status?.startsWith('Low')
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-green-500/20 text-green-400'}`}>
                        {product.stock_status}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.is_available ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                        {product.is_available ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center gap-2">
                      <Link to={`/admin/products/edit/${product.slug}`}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30 transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => deleteProduct(product.slug, product.name)}
                        disabled={deleting === product.slug}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/30 transition-colors disabled:opacity-40">
                        {deleting === product.slug ? '...' : 'Del'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}