// src/pages/ProductDetail.jsx — Mobile Responsive + SEO
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth }     from '../context/AuthContext'
import { useCart }     from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import {
  Star, Heart, ShoppingBag, Zap, Truck, RefreshCw,
  ShieldCheck, Minus, Plus, ChevronRight, Package,
  User, CheckCircle, Send,
} from 'lucide-react'

const DETAIL_CSS = `
  .detail-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    margin-bottom: 72px;
  }
  .detail-assurance-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }
  .detail-related-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #E6DDD3;
  }
  .detail-tabs-content { padding: 40px; }
  .detail-rating-overview {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 40px;
  }
  .detail-gallery-thumbs { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .detail-cta-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
  .detail-badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
  @media (max-width: 1024px) {
    .detail-main-grid { gap: 40px; }
    .detail-related-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .detail-main-grid {
      grid-template-columns: 1fr;
      gap: 32px;
      margin-bottom: 48px;
    }
    .detail-assurance-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .detail-related-grid { grid-template-columns: repeat(2, 1fr); }
    .detail-tabs-content { padding: 24px 16px; }
    .detail-rating-overview { grid-template-columns: 1fr; gap: 20px; }
    .detail-cta-row { gap: 8px; }
  }
  @media (max-width: 480px) {
    .detail-related-grid { grid-template-columns: repeat(2, 1fr); }
    .detail-assurance-grid { grid-template-columns: 1fr; gap: 8px; }
  }
`

const StarRating = ({ rating = 0, max = 5, size = 14, interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(0)
  if (!interactive) return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(max)].map((_, i) => (
        <Star key={i} size={size} strokeWidth={1}
          style={{ fill: rating >= i+1 ? '#B8895A' : 'none', color: rating >= i+1 ? '#B8895A' : '#E6DDD3' }}
        />
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[...Array(max)].map((_, i) => {
        const val = i + 1; const filled = (hovered || rating) >= val
        return (
          <Star key={i} size={22} strokeWidth={1}
            style={{ fill: filled ? '#B8895A' : 'none', color: filled ? '#B8895A' : '#E6DDD3', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={() => setHovered(val)} onMouseLeave={() => setHovered(0)} onClick={() => onChange?.(val)}
          />
        )
      })}
    </div>
  )
}

const ImageGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0)
  const all = images.filter(Boolean)
  if (all.length === 0) return (
    <div style={{ background: '#F4EDE4', height: 'clamp(280px,40vw,480px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Package size={64} strokeWidth={0.8} style={{ color: '#D4C4B0' }} />
    </div>
  )
  return (
    <div>
      <div style={{ background: '#F4EDE4', height: 'clamp(280px,40vw,480px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={getProductImageUrl(all[active])} alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '24px', transition: 'transform 0.65s ease' }}
        />
      </div>
      {all.length > 1 && (
        <div className="detail-gallery-thumbs">
          {all.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: '64px', height: '64px', border: `1.5px solid ${active === i ? '#B8895A' : '#E6DDD3'}`, background: '#F4EDE4', overflow: 'hidden', cursor: 'pointer', padding: 0, transition: 'border-color 0.2s', flexShrink: 0 }}>
              <img src={getProductImageUrl(img)} alt={`${name} ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ReviewForm = ({ productSlug, onSubmit }) => {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a rating'); return }
    setLoading(true)
    try {
      await api.post(`/products/${productSlug}/reviews/`, { rating, comment })
      toast.success('Review submitted'); setRating(0); setComment(''); onSubmit?.()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: '#F4EDE4', border: '1px solid #E6DDD3', padding: 'clamp(20px,3vw,32px)' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400, marginBottom: '24px' }}>Write a Review</h3>
        <div style={{ marginBottom: '20px' }}>
          <label className="input-label">Your Rating <span style={{ color: '#963838' }}>*</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <StarRating rating={rating} size={22} interactive onChange={setRating} />
            {rating > 0 && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{labels[rating]}</span>}
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label className="input-label">Comment <span style={{ color: '#AA9688', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
            placeholder="Share your honest experience..." className="input-luxury" style={{ resize: 'none', marginTop: '8px' }} />
        </div>
        <button type="submit" disabled={loading || !rating} className="btn-primary" style={{ gap: '8px' }}>
          <Send size={14} strokeWidth={1.5} />
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}

const DetailSkeleton = () => (
  <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,48px) 32px' }}>
    <div className="detail-main-grid">
      <div className="skeleton" style={{ height: 'clamp(280px,40vw,480px)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
        <div className="skeleton" style={{ height: '32px', width: '80%' }} />
        <div className="skeleton" style={{ height: '14px', width: '30%' }} />
        <div className="skeleton" style={{ height: '40px', width: '50%' }} />
        <div className="skeleton" style={{ height: '48px' }} />
        <div className="skeleton" style={{ height: '48px' }} />
      </div>
    </div>
  </div>
)

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
        setProduct(p); fetchReviews()
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
      toast.success(`${quantity} item(s) added to cart`)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add.') }
    finally { setAdding(false) }
  }

  const buyNow = () => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity } } })
  }

  if (loading) return <div style={{ background: '#FAF8F5', minHeight: '100vh' }}><DetailSkeleton /></div>
  if (!product) return null

  const images     = [product.image, product.image_2, product.image2, product.image_3, product.image3].filter(Boolean)
  const inStock    = product.stock_status === 'In Stock' || product.stock > 0
  const wishlisted = isWishlisted?.(product.id)
  const avgRating  = product.avg_rating ?? (reviews.length ? parseFloat((reviews.reduce((s,r) => s+r.rating,0)/reviews.length).toFixed(1)) : 0)
  const totalCount = product.review_count ?? reviews.length
  const ratingDist = [5,4,3,2,1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length ? Math.round(reviews.filter(r=>r.rating===star).length/reviews.length*100) : 0,
  }))
  const meta = [
    { label: 'Brand',        value: product.brand },
    { label: 'Category',     value: product.category?.name || product.category_name },
    { label: 'Skin Type',    value: product.suitable_skin_type },
    { label: 'Skin Concern', value: product.skin_concern },
    { label: 'Gender',       value: product.gender },
  ].filter(i => i.value)

  return (
    <>
      <SEO title={product.name} description={product.description?.slice(0,160) || `Buy ${product.name} by ${product.brand}`} url={`/products/${slug}`} />
      <style>{DETAIL_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* Breadcrumb */}
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: '14px 0' }}>
          <div className="container-luxury">
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep"><ChevronRight size={11} strokeWidth={1.5} /></span>
              <Link to="/products">Products</Link>
              <span className="sep"><ChevronRight size={11} strokeWidth={1.5} /></span>
              <span className="current" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,48px) 32px' }}>

          {/* Main grid */}
          <div className="detail-main-grid">
            <ImageGallery images={images} name={product.name} />

            <div>
              <div className="detail-badge-row">
                {product.is_featured && <span className="badge badge-accent">Featured</span>}
                {product.discount_percent > 0 && <span className="badge badge-error">{product.discount_percent}% Off</span>}
                {product.suitable_skin_type && <span className="badge badge-light" style={{ textTransform: 'capitalize' }}>{product.suitable_skin_type} Skin</span>}
              </div>

              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#B8895A', marginBottom: '8px', fontWeight: 400 }}>{product.brand}</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,2.5vw,34px)', color: '#16100C', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '6px' }}>{product.name}</h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 300 }}>{product.category?.name || product.category_name}</p>

              <div style={{ height: '1px', background: '#E6DDD3', margin: '20px 0' }} />

              {/* Ratings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {totalCount > 0 ? (
                  <>
                    <StarRating rating={avgRating} size={14} />
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400 }}>{avgRating}</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300 }}>({totalCount} reviews)</span>
                    <button onClick={() => setActiveTab('reviews')} className="btn-ghost" style={{ fontSize: '11.5px', gap: '4px', padding: '4px 0', color: '#B8895A' }}>
                      Read reviews <ChevronRight size={12} strokeWidth={1.5} />
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating rating={0} size={14} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300 }}>No reviews yet</span>
                    {user && <button onClick={() => setActiveTab('reviews')} className="btn-ghost" style={{ fontSize: '11.5px', padding: '4px 0', color: '#B8895A' }}>Be the first</button>}
                  </div>
                )}
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', color: '#16100C', fontWeight: 400 }}>Rs. {product.discounted_price}</span>
                {product.discount_percent > 0 && (
                  <>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '16px', color: '#AA9688', textDecoration: 'line-through', fontWeight: 300 }}>Rs. {product.price}</span>
                    <span className="badge badge-error">Save Rs. {(parseFloat(product.price)-parseFloat(product.discounted_price)).toFixed(0)}</span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: inStock ? '#4A7A57' : '#963838', boxShadow: inStock ? '0 0 0 3px rgba(74,122,87,0.18)' : 'none' }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: inStock ? '#4A7A57' : '#963838', fontWeight: 400 }}>
                  {product.stock_status || (inStock ? `In Stock${product.stock ? ` — ${product.stock} left` : ''}` : 'Out of Stock')}
                </span>
                {product.stock && product.stock <= 10 && inStock && <span className="badge badge-warning">Only {product.stock} left</span>}
              </div>

              {/* Qty */}
              {inStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#7B6458', fontWeight: 400 }}>Qty</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E6DDD3' }}>
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus size={14} strokeWidth={1.5} /></button>
                    <span className="qty-display">{quantity}</span>
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock||99, q+1))}><Plus size={14} strokeWidth={1.5} /></button>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="detail-cta-row">
                <button onClick={addToCart} disabled={adding || !inStock} className="btn-primary" style={{ flex: 1, gap: '8px', minWidth: '130px' }}>
                  <ShoppingBag size={15} strokeWidth={1.5} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button onClick={buyNow} disabled={!inStock} className="btn-accent" style={{ flex: 1, gap: '8px', minWidth: '110px' }}>
                  <Zap size={15} strokeWidth={1.5} />
                  {inStock ? 'Buy Now' : 'Out of Stock'}
                </button>
                <button onClick={() => toggleWishlist?.(product.id)}
                  style={{ width: '48px', height: '48px', border: `1px solid ${wishlisted ? '#B8895A' : '#E6DDD3'}`, background: wishlisted ? '#FAF4EE' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#B8895A'}
                  onMouseLeave={e => { if (!wishlisted) e.currentTarget.style.borderColor = '#E6DDD3' }}
                >
                  <Heart size={17} strokeWidth={1.5} style={{ fill: wishlisted ? '#B8895A' : 'none', color: wishlisted ? '#B8895A' : '#7B6458' }} />
                </button>
              </div>

              {/* Assurance */}
              <div className="detail-assurance-grid">
                {[
                  { icon: <Truck size={14} strokeWidth={1.5} />, label: 'Free above Rs. 2000' },
                  { icon: <RefreshCw size={14} strokeWidth={1.5} />, label: 'Easy returns' },
                  { icon: <ShieldCheck size={14} strokeWidth={1.5} />, label: 'Genuine product' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', background: '#F4EDE4', border: '1px solid #E6DDD3', textAlign: 'center' }}>
                    <span style={{ color: '#B8895A' }}>{icon}</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#7B6458', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 400, lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Meta */}
              {meta.length > 0 && (
                <div style={{ border: '1px solid #E6DDD3' }}>
                  {meta.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: i < meta.length-1 ? '1px solid #EEE7DF' : 'none', background: i%2===0 ? '#FDFAF7' : '#FFFFFF' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#3A2820', fontWeight: 400, textTransform: 'capitalize' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ border: '1px solid #E6DDD3', marginBottom: '64px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E6DDD3', background: '#FDFAF7', overflowX: 'auto' }}>
              {[{ key: 'description', label: 'Description' }, { key: 'reviews', label: `Reviews${totalCount > 0 ? ` (${totalCount})` : ''}` }].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`tab-link ${activeTab === tab.key ? 'active' : ''}`}
                  style={{ padding: 'clamp(12px,2vw,16px) clamp(16px,3vw,32px)', flex: '0 0 auto', borderBottom: activeTab === tab.key ? '2px solid #16100C' : '2px solid transparent', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="detail-tabs-content">
              {activeTab === 'description' && (
                <div style={{ maxWidth: '680px' }}>
                  {product.description
                    ? <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#3A2820', lineHeight: 1.8, fontWeight: 300 }}>{product.description}</p>
                    : <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#AA9688', fontStyle: 'italic' }}>No description available.</p>
                  }
                  {product.ingredients && (
                    <div style={{ marginTop: '32px', background: '#F4EDE4', border: '1px solid #E6DDD3', padding: '24px' }}>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '17px', color: '#16100C', fontWeight: 400, marginBottom: '12px' }}>Key Ingredients</h3>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.75, fontWeight: 300 }}>{product.ingredients}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ maxWidth: '760px' }}>
                  {totalCount > 0 && (
                    <div style={{ border: '1px solid #E6DDD3', background: '#F4EDE4', padding: 'clamp(16px,3vw,28px)', marginBottom: '32px' }}>
                      <div className="detail-rating-overview">
                        <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid #E6DDD3' }}>
                          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(40px,6vw,52px)', color: '#16100C', fontWeight: 400, lineHeight: 1, marginBottom: '8px' }}>{avgRating}</p>
                          <StarRating rating={avgRating} size={13} />
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', marginTop: '6px', fontWeight: 300 }}>{totalCount} reviews</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                          {ratingDist.map(({ star, count, percent }) => (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#7B6458', width: '12px', textAlign: 'right', flexShrink: 0 }}>{star}</span>
                              <Star size={11} strokeWidth={1} style={{ fill: '#B8895A', color: '#B8895A', flexShrink: 0 }} />
                              <div style={{ flex: 1, height: '4px', background: '#E6DDD3', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${percent}%`, background: star>=4 ? '#4A7A57' : star===3 ? '#B8895A' : '#963838', transition: 'width 0.6s ease' }} />
                              </div>
                              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', width: '20px', textAlign: 'right', flexShrink: 0, fontWeight: 300 }}>{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user
                    ? <div style={{ marginBottom: '32px' }}><ReviewForm productSlug={slug} onSubmit={fetchReviews} /></div>
                    : (
                      <div style={{ background: '#F4EDE4', border: '1px solid #E6DDD3', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#7B6458', marginBottom: '14px', fontWeight: 300 }}>Sign in to write a review</p>
                        <Link to="/login" className="btn-outline" style={{ fontSize: '11px', display: 'inline-flex' }}>Sign In to Review</Link>
                      </div>
                    )
                  }

                  {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <Star size={32} strokeWidth={0.8} style={{ color: '#E6DDD3', margin: '0 auto 16px' }} />
                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400, marginBottom: '6px' }}>No reviews yet</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#AA9688', fontWeight: 300 }}>Be the first to share your experience</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#E6DDD3' }}>
                      {reviews.map((review, i) => (
                        <div key={i} style={{ background: '#FFFFFF', padding: 'clamp(16px,3vw,24px)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F4EDE4', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <User size={16} strokeWidth={1.5} style={{ color: '#B8895A' }} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#16100C', fontWeight: 400 }}>{review.user_name || 'Anonymous'}</span>
                                  {review.is_verified_purchase && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A7A57', background: '#EEF6F1', border: '1px solid #C4DAC8', padding: '2px 8px', fontWeight: 400 }}>
                                      <CheckCircle size={10} strokeWidth={1.5} /> Verified
                                    </span>
                                  )}
                                </div>
                                <StarRating rating={review.rating} size={11} />
                              </div>
                            </div>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', flexShrink: 0, fontWeight: 300, paddingTop: '2px' }}>
                              {new Date(review.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {review.comment && (
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#3A2820', lineHeight: 1.7, fontWeight: 300, paddingLeft: '50px' }}>{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div style={{ marginBottom: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div className="section-eyebrow">You May Also Like</div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px,2.5vw,26px)', color: '#16100C', fontWeight: 400 }}>Related Products</h2>
                </div>
                <Link to={`/products?category=${product.category}`} className="btn-ghost" style={{ fontSize: '12px', gap: '4px' }}>View All <ChevronRight size={13} strokeWidth={1.5} /></Link>
              </div>
              <div className="detail-related-grid">
                {related.map(p => (
                  <Link key={p.id} to={`/products/${p.slug}`} className="product-card" style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="card-image">
                      {p.image
                        ? <img src={getProductImageUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4EDE4' }}><Package size={36} strokeWidth={1} style={{ color: '#D4C4B0' }} /></div>
                      }
                    </div>
                    <div className="card-body">
                      <p className="card-category">{p.brand}</p>
                      <p className="card-name">{p.name}</p>
                      <div className="card-price">
                        {p.discount_percent > 0 && <span className="original">Rs. {p.price}</span>}
                        <span className={p.discount_percent > 0 ? 'sale' : ''}>Rs. {p.discounted_price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}