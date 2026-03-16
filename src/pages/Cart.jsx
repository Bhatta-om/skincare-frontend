// src/pages/Cart.jsx — 100% Professional + Tailwind v4
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'

export default function Cart() {
  const navigate           = useNavigate()
  const { fetchCartCount } = useCart()

  const [cart,    setCart]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating,setUpdating]= useState(null)
  const [clearing,setClearing]= useState(false)

  const fetchCart = async () => {
    try {
      const res = await api.get('/orders/cart/')
      setCart(res.data?.cart || res.data)
    } catch { setCart(null) }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    setUpdating(itemId)
    try {
      await api.patch(`/orders/cart/items/${itemId}/`, { quantity })
      await fetchCart()
      await fetchCartCount()
    } catch { toast.error('Failed to update quantity.') }
    finally  { setUpdating(null) }
  }

  const removeItem = async (itemId) => {
    setUpdating(itemId)
    try {
      await api.delete(`/orders/cart/items/${itemId}/remove/`)
      await fetchCart()
      await fetchCartCount()
      toast.success('Item removed.')
    } catch { toast.error('Failed to remove item.') }
    finally  { setUpdating(null) }
  }

  const clearCart = async () => {
    setClearing(true)
    try {
      await api.delete('/orders/cart/clear/')
      await fetchCart()
      await fetchCartCount()
      toast.success('Cart cleared!')
    } catch { toast.error('Failed to clear cart.') }
    finally  { setClearing(false) }
  }

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading your cart...</p>
      </div>
    </div>
  )

  const items    = cart?.items || []
  const subtotal = parseFloat(cart?.subtotal || cart?.total_amount || 0)
  const delivery = subtotal >= 2000 ? 0 : 150
  const total    = (subtotal + delivery).toFixed(2)
  const savings  = items.reduce((sum, item) => {
    const orig = parseFloat(item.product?.price || 0)
    const disc = parseFloat(item.product?.discounted_price || 0)
    return sum + (orig - disc) * item.quantity
  }, 0)

  // ── Empty cart ──
  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-linear-to-r from-purple-700 to-pink-500 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black">My Cart</h1>
          <p className="text-purple-100 text-sm mt-0.5">0 items</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center py-12 max-w-sm">
          <div className="w-28 h-28 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-14 h-14 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything yet. Explore our products and find what's perfect for your skin!
          </p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95"
            style={{boxShadow:'0 8px 24px rgba(124,58,237,0.3)'}}>
            Browse Products →
          </Link>
          <div className="mt-4">
            <Link to="/skin-analysis" className="text-purple-600 text-sm font-semibold hover:underline">
              ✨ Try AI Skin Analysis first
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-700 to-pink-500 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Cart</h1>
            <p className="text-purple-100 text-sm mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''}
              {savings > 0 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  Saving Rs. {savings.toFixed(0)}
                </span>
              )}
            </p>
          </div>
          <button onClick={clearCart} disabled={clearing}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl transition-all disabled:opacity-50 border border-white/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Cart Items ── */}
          <div className="flex-1 space-y-3">
            {items.map((item, idx) => (
              <div key={item.id}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 ${
                  updating === item.id ? 'opacity-60 pointer-events-none' : 'hover:border-purple-200 hover:shadow-md'}`}>
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Product image */}
                    <Link to={`/products/${item.product?.slug}`}
                      className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-linearbr from-purple-50 to-pink-50 flex items-center justify-center">
                      {item.product?.image
                        ? <img src={getProductImageUrl(item.product.image)}
                            alt={item.product.name} className="w-full h-full object-cover" />
                        : <span className="text-3xl">🧴</span>}
                    </Link>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-600 font-bold truncate mb-0.5">{item.product?.brand}</p>
                      <Link to={`/products/${item.product?.slug}`}>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug hover:text-purple-600 transition-colors">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-purple-700 font-black text-sm">
                          Rs. {item.product?.discounted_price}
                        </span>
                        {item.product?.discount_percent > 0 && (
                          <>
                            <span className="text-gray-400 text-xs line-through">Rs. {item.product?.price}</span>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                              -{item.product?.discount_percent}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Remove btn */}
                    <button onClick={() => removeItem(item.id)} disabled={updating === item.id}
                      className="self-start w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {/* Qty + subtotal */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    {/* Quantity control */}
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white text-gray-600 font-black text-lg disabled:opacity-30 transition-all active:scale-90">
                        −
                      </button>
                      <span className="w-9 text-center font-black text-gray-900 text-sm">
                        {updating === item.id
                          ? <svg className="animate-spin h-4 w-4 mx-auto text-purple-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                          : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white text-gray-600 font-black text-lg disabled:opacity-30 transition-all active:scale-90">
                        +
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-base">
                        Rs. {item.total_price || (parseFloat(item.product?.discounted_price) * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-gray-400 text-xs">Rs. {item.product?.discounted_price} × {item.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/products"
              className="flex items-center gap-2 text-purple-600 text-sm font-semibold py-2 hover:underline w-fit">
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-[320px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden lg:sticky lg:top-20">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-black text-gray-900 text-base">Order Summary</h2>
              </div>

              <div className="p-5 space-y-3">
                {/* Line items */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="font-semibold text-gray-800">Rs. {subtotal.toFixed(2)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">Discount savings</span>
                      <span className="text-green-600 font-bold">− Rs. {savings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    {delivery === 0
                      ? <span className="text-green-600 font-bold">FREE</span>
                      : <span className="font-semibold text-gray-800">Rs. {delivery}</span>}
                  </div>

                  {delivery > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                      Add Rs. {(2000 - subtotal).toFixed(0)} more for free delivery
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="font-black text-purple-700 text-xl">Rs. {total}</span>
                  </div>
                  {savings > 0 && (
                    <p className="text-green-600 text-xs font-semibold mt-1 text-right">
                      You save Rs. {savings.toFixed(0)}!
                    </p>
                  )}
                </div>

                <button onClick={() => navigate('/checkout')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] text-base mt-1"
                  style={{boxShadow:'0 8px 24px rgba(124,58,237,0.3)'}}>
                  Proceed to Checkout →
                </button>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { icon:'🔒', label:'Secure' },
                    { icon:'💚', label:'eSewa'  },
                    { icon:'💵', label:'COD'    },
                  ].map(b => (
                    <div key={b.label} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-2.5 border border-gray-100">
                      <span className="text-lg">{b.icon}</span>
                      <span className="text-xs text-gray-500 font-semibold">{b.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-gray-400 pt-1">
                  🛡️ 100% secure & encrypted payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}