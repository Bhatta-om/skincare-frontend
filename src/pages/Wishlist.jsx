// src/pages/Wishlist.jsx — 100% Professional + Tailwind v4
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ProductCardSkeleton } from '../components/Skeleton'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'

const Stars = ({ rating = 0, count = 0 }) => {
  const full  = Math.floor(rating)
  const half  = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(full)].map((_,i)  => <span key={`f${i}`} className="text-amber-400 text-xs leading-none">★</span>)}
        {half                         && <span               className="text-amber-400 text-xs leading-none">★</span>}
        {[...Array(empty)].map((_,i) => <span key={`e${i}`} className="text-gray-200   text-xs leading-none">★</span>)}
      </div>
      {count > 0 && <span className="text-gray-400 text-xs">({count})</span>}
    </div>
  )
}

export default function Wishlist() {
  const { toggleWishlist, fetchWishlistIds } = useWishlist()
  const { fetchCartCount }                   = useCart()
  const { user }                             = useAuth()
  const navigate                             = useNavigate()

  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [addingId,  setAddingId]  = useState(null)
  const [removingId,setRemovingId]= useState(null)
  const [clearing,  setClearing]  = useState(false)

  const fetchWishlist = () => {
    setLoading(true)
    api.get('/products/wishlist/')
      .then(res => setProducts(res.data.results || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWishlist() }, [])

  const handleRemove = async (e, productId) => {
    e.preventDefault(); e.stopPropagation()
    setRemovingId(productId)
    await toggleWishlist(productId)
    setProducts(prev => prev.filter(p => p.id !== productId))
    setRemovingId(null)
  }

  const handleClear = async () => {
    if (!window.confirm('Remove all items from wishlist?')) return
    setClearing(true)
    try {
      await api.delete('/products/wishlist/clear/')
      setProducts([])
      fetchWishlistIds()
      toast.success('Wishlist cleared!')
    } catch {
      toast.error('Failed to clear wishlist.')
    } finally { setClearing(false) }
  }

  const addToCart = async (e, productId) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login'); return }
    setAddingId(productId)
    try {
      await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 })
      await fetchCartCount()
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add.')
    } finally { setAddingId(null) }
  }

  const buyNow = (e, product) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity: 1 } } })
  }

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-r from-pink-500 to-purple-700 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-white/20 rounded-xl animate-pulse" />
          <div className="h-4 w-24 bg-white/10 rounded-lg mt-2 animate-pulse" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )

  // ── Empty state ──
  if (products.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-linear-to-r from-pink-500 to-purple-700 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Wishlist</h1>
          <p className="text-pink-100 text-sm mt-0.5">0 saved items</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm py-12">
          <div className="w-28 h-28 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-14 h-14 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Save products you love by tapping the heart icon — find them here anytime!
          </p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-4 rounded-2xl transition-all active:scale-95"
            style={{boxShadow:'0 8px 24px rgba(124,58,237,0.3)'}}>
            Discover Products →
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-pink-500 to-purple-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Wishlist</h1>
            <p className="text-pink-100 text-sm mt-0.5">
              {products.length} saved item{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={handleClear} disabled={clearing}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map(product => {
            const inStock   = product.stock > 0
            const removing  = removingId === product.id
            return (
              <Link key={product.id} to={`/products/${product.slug}`}
                className={`bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative active:scale-[0.98] ${removing ? 'opacity-40 pointer-events-none' : ''}`}>

                {/* Remove btn */}
                <button onClick={e => handleRemove(e, product.id)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-red-200 shadow-sm flex items-center justify-center transition-all hover:bg-red-50 hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-red-500 fill-red-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>

                {/* Image */}
                <div className="bg-linear-to-br from-pink-50 to-purple-50 h-40 sm:h-48 flex items-center justify-center relative overflow-hidden">
                  {product.image
                    ? <img src={getProductImageUrl(product.image)} alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    : <span className="text-5xl">🧴</span>}
                  {product.discount_percent > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                      -{product.discount_percent}%
                    </span>
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-gray-800/80 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-xs text-purple-600 font-bold truncate mb-0.5">{product.brand}</p>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 flex-1 leading-snug group-hover:text-purple-600 transition-colors mb-2">
                    {product.name}
                  </h3>

                  {/* Stars */}
                  <div className="mb-2">
                    {product.review_count > 0
                      ? <Stars rating={product.avg_rating} count={product.review_count} />
                      : <span className="text-xs text-gray-300">No reviews yet</span>}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-700 font-black text-sm sm:text-base">Rs. {product.discounted_price}</span>
                    {product.discount_percent > 0 && (
                      <span className="text-gray-400 text-xs line-through">Rs. {product.price}</span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-1.5">
                    <button onClick={e => addToCart(e, product.id)}
                      disabled={addingId === product.id || !inStock}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2 rounded-xl text-xs transition-colors active:scale-95 flex items-center justify-center">
                      {addingId === product.id
                        ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        : '🛒 Cart'}
                    </button>
                    <button onClick={e => buyNow(e, product)}
                      disabled={!inStock}
                      className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:border-gray-300 disabled:text-gray-300 font-bold py-2 rounded-xl text-xs transition-all active:scale-95">
                      ⚡ Buy
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 py-8 border-t border-gray-200">
          <p className="text-gray-400 text-sm mb-3">Want to discover more products?</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 text-purple-600 font-black hover:text-purple-700 text-sm transition-colors">
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  )
}