// src/pages/Products.jsx — 100% Professional
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { ProductCardSkeleton } from '../components/Skeleton'
import SearchBox from '../components/SearchBox'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'

const Stars = ({ rating = 0, count = 0 }) => {
  const full  = Math.floor(rating)
  const half  = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(full)].map((_,i)  => <span key={`f${i}`} className="text-amber-400 text-xs leading-none">★</span>)}
        {half                         && <span               className="text-amber-400 text-xs leading-none">★</span>}
        {[...Array(empty)].map((_,i) => <span key={`e${i}`} className="text-gray-200   text-xs leading-none">★</span>)}
      </div>
      {count > 0 && <span className="text-gray-400 text-xs">({count})</span>}
    </div>
  )
}

const SKIN_TYPES = ['oily','dry','normal','combination','sensitive','all']

export default function Products() {
  const { user }                         = useAuth()
  const { fetchCartCount }               = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const navigate                         = useNavigate()
  const [searchParams, setSearchParams]  = useSearchParams()

  const [search,     setSearch]     = useState(searchParams.get('search') || '')
  const [skinType,   setSkinType]   = useState(searchParams.get('skin_type') || '')
  const [category,   setCategory]   = useState(searchParams.get('category') || '')
  const [categories, setCategories] = useState([])
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [addingId,   setAddingId]   = useState(null)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    api.get('/products/categories/')
      .then(res => setCategories(res.data.results || res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)   params.append('search',             search)
    if (skinType) params.append('suitable_skin_type', skinType)
    if (category) params.append('category',           category)
    params.append('page', page)
    api.get(`/products/?${params.toString()}`)
      .then(res => {
        setProducts(res.data.results || [])
        const count = res.data.count || 0
        setTotalCount(count)
        setTotalPages(Math.ceil(count / 12))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [search, skinType, category, page])

  const handleSearch = (q) => {
    setSearch(q); setPage(1)
    const params = new URLSearchParams(searchParams)
    if (q) params.set('search', q); else params.delete('search')
    setSearchParams(params, { replace: true })
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

  const handleWishlist = (e, productId) => {
    e.preventDefault(); e.stopPropagation()
    toggleWishlist(productId)
  }

  const clearAll = () => {
    setSearch(''); setSkinType(''); setCategory(''); setPage(1)
    setSearchParams({}, { replace: true })
  }

  const hasFilters = search || skinType || category
  const activeFilterCount = [search, skinType, category].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-700 to-pink-500 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-black mb-1">Our Products</h1>
            <p className="text-purple-100 text-sm">
              {totalCount > 0 ? `${totalCount} products for every skin type` : 'Find the perfect skincare for your skin'}
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBox
              variant="inline"
              placeholder="Search products, brands, ingredients..."
              initialValue={search}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Desktop Filters ── */}
        <div className="hidden sm:flex items-center gap-3 mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <svg className="w-4 h-4 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>

          <select value={skinType} onChange={e => { setSkinType(e.target.value); setPage(1) }}
            className="flex-1 border-0 bg-gray-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm font-medium cursor-pointer">
            <option value="">All Skin Types</option>
            {SKIN_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>

          <div className="w-px h-6 bg-gray-200" />

          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
            className="flex-1 border-0 bg-gray-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm font-medium cursor-pointer">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          {hasFilters && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <button onClick={clearAll}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Clear
              </button>
            </>
          )}
        </div>

        {/* ── Mobile Filter Bar ── */}
        <div className="sm:hidden mb-4">
          <div className="flex gap-2">
            <button onClick={() => setShowMobileFilters(s => !s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                showMobileFilters || activeFilterCount > 0
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {hasFilters && (
              <button onClick={clearAll} className="px-3 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 text-sm font-semibold">
                Clear All
              </button>
            )}
          </div>

          {showMobileFilters && (
            <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Skin Type</label>
                <div className="flex flex-wrap gap-2">
                  {['', ...SKIN_TYPES].map(t => (
                    <button key={t} onClick={() => { setSkinType(t); setPage(1) }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${
                        skinType === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                      {t || 'All'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label>
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400 text-gray-700 text-sm bg-white">
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                🔍 "{search}"
                <button onClick={() => handleSearch('')} className="hover:text-purple-900 font-black text-base leading-none">×</button>
              </span>
            )}
            {skinType && (
              <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full capitalize">
                💧 {skinType}
                <button onClick={() => { setSkinType(''); setPage(1) }} className="hover:text-blue-900 font-black text-base leading-none">×</button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                📦 {categories.find(c => String(c.id) === String(category))?.name || 'Category'}
                <button onClick={() => { setCategory(''); setPage(1) }} className="hover:text-green-900 font-black text-base leading-none">×</button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && totalCount > 0 && (
          <p className="text-sm text-gray-500 mb-4 font-medium">
            Showing <span className="text-gray-800 font-bold">{products.length}</span> of <span className="text-gray-800 font-bold">{totalCount}</span> products
          </p>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map(product => (
              <Link key={product.id} to={`/products/${product.slug}`}
                className="bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative active:scale-[0.98]">

                {/* Wishlist btn */}
                <button onClick={e => handleWishlist(e, product.id)}
                  className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all backdrop-blur-sm ${
                    isWishlisted(product.id) ? 'bg-red-50 border border-red-200 scale-110' : 'bg-white/90 border border-gray-200 hover:border-red-300'}`}>
                  <svg className={`w-4 h-4 transition-colors ${isWishlisted(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`}
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    fill={isWishlisted(product.id) ? 'currentColor' : 'none'}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>

                {/* Image */}
                <div className="bg-linear-to-br from-purple-50 to-pink-50 h-40 sm:h-48 flex items-center justify-center relative overflow-hidden">
                  {product.image
                    ? <img src={getProductImageUrl(product.image)} alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    : <span className="text-5xl">🧴</span>}
                  {product.discount_percent > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                      -{product.discount_percent}%
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-gray-800/80 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <p className="text-xs text-purple-600 font-bold mb-0.5 truncate">{product.brand}</p>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 line-clamp-2 flex-1 leading-snug group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Stars */}
                  <div className="mb-2">
                    {product.review_count > 0
                      ? <Stars rating={product.avg_rating} count={product.review_count} />
                      : <span className="text-xs text-gray-300">No reviews yet</span>}
                  </div>

                  {/* Skin type badge */}
                  <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full w-fit mb-2.5 font-medium capitalize">
                    {product.suitable_skin_type} skin
                  </span>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-700 font-black text-sm sm:text-base">Rs. {product.discounted_price}</span>
                    {product.discount_percent > 0 && (
                      <span className="text-gray-400 text-xs line-through">Rs. {product.price}</span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-1.5 mt-auto">
                    <button onClick={e => addToCart(e, product.id)}
                      disabled={addingId === product.id || product.stock === 0}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2 rounded-xl text-xs transition-colors active:scale-95">
                      {addingId === product.id
                        ? <span className="flex items-center justify-center gap-1"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></span>
                        : '🛒 Cart'}
                    </button>
                    <button onClick={e => buyNow(e, product)}
                      disabled={product.stock === 0}
                      className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:border-gray-300 disabled:text-gray-300 font-bold py-2 rounded-xl text-xs transition-all active:scale-95">
                      ⚡ Buy
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-gray-700 text-lg font-bold mb-1">No products found</h3>
            {search && <p className="text-gray-400 text-sm mb-4">No results for "<span className="font-semibold">{search}</span>"</p>}
            <button onClick={clearAll} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 text-sm font-semibold transition-all">
              ← Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1
              if (totalPages <= 7 || p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${
                      page === p ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200' : 'border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600'}`}>
                    {p}
                  </button>
                )
              }
              if (p === page - 2 || p === page + 2) return <span key={p} className="text-gray-400 px-1">…</span>
              return null
            })}

            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 text-sm font-semibold transition-all">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}