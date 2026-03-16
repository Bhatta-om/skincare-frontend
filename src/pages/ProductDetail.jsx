// src/pages/ProductDetail.jsx — 100% Professional + Tailwind v4
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'

// ── Star Rating ────────────────────────────────────────────
const StarRating = ({ rating = 0, max = 5, size = 'md', interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(0)
  const sizeClass = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' }[size]

  if (!interactive) {
    return (
      <div className={`flex gap-0.5 ${sizeClass}`}>
        {[...Array(max)].map((_, i) => (
          <span key={i} className={rating >= i + 1 || rating >= i + 0.5 ? 'text-amber-400' : 'text-gray-200'}>★</span>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[...Array(max)].map((_, i) => {
        const val    = i + 1
        const filled = (hovered || rating) >= val
        return (
          <span key={i}
            className={`cursor-pointer transition-transform hover:scale-125 select-none ${filled ? 'text-amber-400' : 'text-gray-300'}`}
            onMouseEnter={() => setHovered(val)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange?.(val)}>
            ★
          </span>
        )
      })}
    </div>
  )
}

// ── Image Gallery ──────────────────────────────────────────
const ImageGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0)
  const all = images.filter(Boolean)

  if (all.length === 0) return (
    <div className="bg-purple-50 rounded-3xl h-80 sm:h-105 flex items-center justify-center">
      <span className="text-8xl">🧴</span>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-3xl overflow-hidden h-80 sm:h-105 flex items-center justify-center relative group">
        <img src={getProductImageUrl(all[active])} alt={name}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
      </div>
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {all.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                active === i ? 'border-purple-500 shadow-md shadow-purple-200' : 'border-gray-200 hover:border-purple-300 opacity-70 hover:opacity-100'}`}>
              <img src={getProductImageUrl(img)} alt={`${name} ${i+1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Review Form ────────────────────────────────────────────
const ReviewForm = ({ productSlug, onSubmit }) => {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const ratingLabels = { 1:'Poor', 2:'Fair', 3:'Good', 4:'Very Good', 5:'Excellent' }
  const ratingColors = { 1:'text-red-500', 2:'text-orange-500', 3:'text-amber-500', 4:'text-lime-600', 5:'text-green-600' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a rating!'); return }
    setLoading(true)
    try {
      await api.post(`/products/${productSlug}/reviews/`, { rating, comment })
      toast.success('Review submitted! ⭐')
      setRating(0); setComment('')
      onSubmit?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review.')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-linear-to-br from-purple-50 to-pink-50 rounded-3xl p-6 space-y-5 border border-purple-100">
      <h3 className="font-black text-gray-900 text-lg">Write a Review</h3>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating <span className="text-red-400">*</span></p>
        <div className="flex items-center gap-3">
          <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          {rating > 0 && (
            <span className={`text-sm font-bold ${ratingColors[rating]}`}>{ratingLabels[rating]}</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Comment <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          rows={3} placeholder="Share your honest experience with this product..."
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400 focus:bg-white bg-white/80 resize-none transition-colors" />
      </div>

      <button type="submit" disabled={loading || !rating}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors flex items-center gap-2">
        {loading
          ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting...</>
          : '⭐ Submit Review'}
      </button>
    </form>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function ProductDetail() {
  const { slug }           = useParams()
  const navigate           = useNavigate()
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [product,   setProduct]   = useState(null)
  const [related,   setRelated]   = useState([])
  const [reviews,   setReviews]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [quantity,  setQuantity]  = useState(1)
  const [adding,    setAdding]    = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const fetchReviews = () => {
    api.get(`/products/${slug}/reviews/`)
      .then(r => setReviews(r.data.results || r.data || []))
      .catch(() => setReviews([]))
  }

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${slug}/`)
      .then(res => {
        const p = res.data.product || res.data
        setProduct(p)
        fetchReviews()
        if (p.category) {
          api.get(`/products/?category=${p.category}&page_size=5`)
            .then(r => setRelated((r.data.results || []).filter(x => x.slug !== slug).slice(0, 4)))
            .catch(() => {})
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [slug])

  const addToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await api.post('/orders/cart/add/', { product_id: product.id, quantity })
      await fetchCartCount()
      toast.success(`${quantity} item(s) added to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart.')
    } finally { setAdding(false) }
  }

  const buyNow = () => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity } } })
  }

  // ── Loading skeleton ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="bg-gray-100 rounded-3xl h-96" />
          <div className="space-y-4">
            <div className="bg-gray-100 h-4 w-1/4 rounded-full" />
            <div className="bg-gray-100 h-8 w-3/4 rounded-xl" />
            <div className="bg-gray-100 h-4 w-1/3 rounded-full" />
            <div className="bg-gray-100 h-10 w-1/3 rounded-xl" />
            <div className="bg-gray-100 h-14 w-full rounded-2xl" />
            <div className="bg-gray-100 h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const images  = [product.image, product.image_2, product.image2, product.image_3, product.image3].filter(Boolean)
  const inStock = product.stock_status === 'In Stock' || (product.stock > 0)
  const wishlisted = isWishlisted?.(product.id)

  const avgRating  = product.avg_rating  ?? (reviews.length ? parseFloat((reviews.reduce((s,r) => s+r.rating,0)/reviews.length).toFixed(1)) : 0)
  const totalCount = product.review_count ?? reviews.length
  const ratingDist = product.rating_distribution ?? [5,4,3,2,1].map(star => ({
    star,
    count:   reviews.filter(r => r.rating === star).length,
    percent: reviews.length ? Math.round(reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0,
  }))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm flex-wrap">
          <Link to="/"         className="text-gray-400 hover:text-purple-600 transition-colors">Home</Link>
          <span className="text-gray-300">›</span>
          <Link to="/products" className="text-gray-400 hover:text-purple-600 transition-colors">Products</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Product Main ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

          {/* Left — Images */}
          <ImageGallery images={images} name={product.name} />

          {/* Right — Info */}
          <div className="space-y-5">

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">⭐ Featured</span>
              )}
              {product.discount_percent > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200">🔥 {product.discount_percent}% OFF</span>
              )}
              <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full border border-purple-200 capitalize">
                {product.suitable_skin_type} skin
              </span>
            </div>

            {/* Brand + Name */}
            <div>
              <p className="text-purple-600 font-bold text-sm mb-1 uppercase tracking-wide">{product.brand}</p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-gray-400 text-sm mt-1">{product.category?.name || product.category_name}</p>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-3 flex-wrap">
              {totalCount > 0 ? (
                <>
                  <StarRating rating={avgRating} size="md" />
                  <span className="font-black text-gray-900 text-xl">{avgRating}</span>
                  <span className="text-gray-400 text-sm">
                    ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
                  </span>
                  <button onClick={() => setActiveTab('reviews')}
                    className="text-purple-600 text-sm font-semibold hover:underline transition-colors">
                    Read reviews →
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <StarRating rating={0} size="md" />
                  <span className="text-gray-400 text-sm">No reviews yet</span>
                  {user && (
                    <button onClick={() => setActiveTab('reviews')}
                      className="text-purple-600 text-sm font-semibold hover:underline">
                      Be the first →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-purple-700">Rs. {product.discounted_price}</span>
              {product.discount_percent > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">Rs. {product.price}</span>
                  <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-xl">
                    Save Rs. {(parseFloat(product.price) - parseFloat(product.discounted_price)).toFixed(0)}
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}
                style={inStock ? {boxShadow:'0 0 0 3px rgba(34,197,94,0.2)'} : {}} />
              <span className={`font-semibold text-sm ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock_status || (inStock ? `In Stock${product.stock ? ` (${product.stock} left)` : ''}` : 'Out of Stock')}
              </span>
            </div>

            {/* Quantity selector */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold text-xl transition-colors">
                    −
                  </button>
                  <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q+1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold text-xl transition-colors">
                    +
                  </button>
                </div>
                {product.stock && product.stock <= 10 && (
                  <span className="text-xs text-red-500 font-semibold">Only {product.stock} left!</span>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button onClick={addToCart} disabled={adding || !inStock}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                style={!adding && inStock ? {boxShadow:'0 8px 24px rgba(124,58,237,0.3)'} : {}}>
                {adding
                  ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Adding...</>
                  : <>🛒 Add to Cart</>}
              </button>

              <button onClick={buyNow} disabled={!inStock}
                className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                ⚡ {inStock ? 'Buy Now' : 'Out of Stock'}
              </button>

              {/* Wishlist */}
              <button onClick={() => toggleWishlist?.(product.id)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'}`}>
                <svg className={`w-5 h-5 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`}
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  fill={wishlisted ? 'currentColor' : 'none'}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>

            {/* Delivery info pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon:'🚚', label:'Free delivery above Rs. 2000' },
                { icon:'↩️', label:'Easy returns' },
                { icon:'✅', label:'Genuine products' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-600 font-medium">
                  <span>{item.icon}</span>{item.label}
                </div>
              ))}
            </div>

            {/* Product meta */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {[
                { label: 'Brand',        value: product.brand },
                { label: 'Category',     value: product.category?.name || product.category_name },
                { label: 'Skin Type',    value: product.suitable_skin_type },
                { label: 'Skin Concern', value: product.skin_concern },
                { label: 'Gender',       value: product.gender },
              ].filter(i => i.value).map((item, i, arr) => (
                <div key={i} className={`flex justify-between items-center px-5 py-3 text-sm ${i < arr.length - 1 ? 'border-b border-gray-50' : ''} ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <span className="text-gray-500 font-medium">{item.label}</span>
                  <span className="font-bold text-gray-800 capitalize">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-12">
          <div className="flex border-b border-gray-100">
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews',     label: `Reviews${totalCount > 0 ? ` (${totalCount})` : ''}` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 font-bold text-sm transition-all relative ${
                  activeTab === tab.key ? 'text-purple-600 bg-purple-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6 max-w-3xl">
                {product.description ? (
                  <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No description available.</p>
                )}
                {product.ingredients && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">🧪</span> Key Ingredients
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.ingredients}</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-7">

                {/* Rating Overview */}
                {totalCount > 0 && (
                  <div className="flex flex-col sm:flex-row gap-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    {/* Big number */}
                    <div className="flex flex-col items-center justify-center text-center shrink-0 min-w-32.5">
                      <p className="text-7xl font-black text-purple-700 leading-none mb-2">{avgRating}</p>
                      <StarRating rating={avgRating} size="md" />
                      <p className="text-gray-500 text-sm mt-2 font-medium">
                        {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>

                    <div className="hidden sm:block w-px bg-purple-200/60" />

                    {/* Bars */}
                    <div className="flex-1 space-y-3">
                      {ratingDist.map(({ star, count, percent }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-600 w-3 text-right shrink-0">{star}</span>
                          <span className="text-amber-400 text-sm shrink-0">★</span>
                          <div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden border border-gray-100">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${percent}%`,
                                background: star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444',
                              }} />
                          </div>
                          <span className="text-gray-700 text-xs font-bold w-5 text-right shrink-0">{count}</span>
                          <span className="text-gray-400 text-xs w-8 shrink-0">{percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Form or Login prompt */}
                {user ? (
                  <ReviewForm productSlug={slug} onSubmit={fetchReviews} />
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                    <p className="text-gray-500 mb-3 text-sm">Login to write a review</p>
                    <Link to="/login"
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      Login to Review →
                    </Link>
                  </div>
                )}

                {/* Review List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">⭐</div>
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-purple-200 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                              style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
                              {review.user_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-900 text-sm">{review.user_name || 'Anonymous'}</span>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>
                          <span className="text-gray-400 text-xs shrink-0 pt-0.5">
                            {new Date(review.created_at).toLocaleDateString('en-NP', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm leading-relaxed pl-13">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">Related Products</h2>
              <Link to={`/products?category=${product.category}`}
                className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 overflow-hidden group active:scale-[0.98]">
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 h-36 sm:h-44 flex items-center justify-center overflow-hidden">
                    {p.image
                      ? <img src={getProductImageUrl(p.image)} alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <span className="text-4xl">🧴</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-purple-600 font-bold truncate">{p.brand}</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 mt-0.5 leading-snug group-hover:text-purple-600 transition-colors">{p.name}</p>
                    {p.review_count > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs text-gray-700 font-bold">{p.avg_rating}</span>
                        <span className="text-xs text-gray-400">({p.review_count})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-purple-700 font-black text-sm">Rs. {p.discounted_price}</span>
                      {p.discount_percent > 0 && (
                        <span className="text-xs text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-full">-{p.discount_percent}%</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}