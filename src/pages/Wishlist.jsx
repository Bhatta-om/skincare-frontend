// src/pages/Wishlist.jsx — Mobile Responsive + SEO
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useWishlist } from '../context/WishlistContext'
import { useCart }     from '../context/CartContext'
import { useAuth }     from '../context/AuthContext'
import { ProductCardSkeleton } from '../components/Skeleton'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import { Heart, ShoppingBag, Zap, Trash2, Package, Star, ArrowRight, ChevronRight, X } from 'lucide-react'

const WISHLIST_CSS = `
  .wishlist-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #E6DDD3;
  }
  .wishlist-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #E6DDD3;
  }
  @media (max-width: 1024px) {
    .wishlist-grid { grid-template-columns: repeat(3, 1fr); }
    .wishlist-skeleton-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
    .wishlist-skeleton-grid { grid-template-columns: repeat(2, 1fr); }
  }
`

const Stars = ({ rating = 0, count = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10} strokeWidth={1}
          style={{ fill: i <= Math.round(rating) ? '#B8895A' : 'none', color: i <= Math.round(rating) ? '#B8895A' : '#E6DDD3' }}
        />
      ))}
    </div>
    {count > 0 && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688' }}>({count})</span>}
  </div>
)

const WishlistCard = ({ product, onRemove, onAddToCart, onBuyNow, addingId, removingId }) => {
  const [hov, setHov] = useState(false)
  const inStock  = product.stock > 0
  const removing = removingId === product.id

  return (
    <Link to={`/products/${product.slug}`} className="product-card"
      style={{ display: 'block', textDecoration: 'none', opacity: removing ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: removing ? 'none' : 'auto' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {product.discount_percent > 0 && <span className="card-badge card-badge-sale">-{product.discount_percent}%</span>}

      <button onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(e, product.id) }}
        style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', background: '#FFFFFF', border: '1px solid #E6DDD3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, opacity: hov ? 1 : 0, transition: 'all 0.25s', boxShadow: '0 1px 6px rgba(22,16,12,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FCF3F3'; e.currentTarget.style.borderColor = '#963838' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E6DDD3' }}
      >
        <X size={12} strokeWidth={2} style={{ color: '#963838' }} />
      </button>

      <div className="card-image">
        {product.image
          ? <img src={getProductImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4EDE4' }}><Package size={40} strokeWidth={1} style={{ color: '#D4C4B0' }} /></div>
        }
        {!inStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,248,245,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#7B6458', border: '1px solid #E6DDD3', padding: '6px 14px', background: '#FFFFFF' }}>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <p className="card-category">{product.brand}</p>
        <p className="card-name">{product.name}</p>
        {product.review_count > 0 ? <Stars rating={product.avg_rating} count={product.review_count} /> : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#D4C4B0' }}>No reviews yet</span>}
        <div className="card-price" style={{ marginTop: '8px' }}>
          {product.discount_percent > 0 && <span className="original">Rs. {product.price}</span>}
          <span className={product.discount_percent > 0 ? 'sale' : ''}>Rs. {product.discounted_price}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); onAddToCart(e, product.id) }}
            disabled={addingId === product.id || !inStock}
            style={{ flex: 1, background: addingId === product.id || !inStock ? '#E6DDD3' : '#16100C', color: addingId === product.id || !inStock ? '#AA9688' : '#FAF8F5', border: 'none', cursor: !inStock ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '9px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'background 0.2s' }}
            onMouseEnter={e => { if (inStock && addingId !== product.id) e.currentTarget.style.background = '#3A2820' }}
            onMouseLeave={e => { if (inStock && addingId !== product.id) e.currentTarget.style.background = '#16100C' }}
          >
            <ShoppingBag size={12} strokeWidth={1.5} />{addingId === product.id ? 'Adding...' : 'Add to Cart'}
          </button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); onBuyNow(e, product) }}
            disabled={!inStock}
            style={{ flex: 1, background: 'transparent', color: '#B8895A', border: '1px solid #B8895A', cursor: !inStock ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '9px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s', opacity: !inStock ? 0.4 : 1 }}
            onMouseEnter={e => { if (inStock) { e.currentTarget.style.background = '#B8895A'; e.currentTarget.style.color = '#FFFFFF' } }}
            onMouseLeave={e => { if (inStock) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B8895A' } }}
          >
            <Zap size={12} strokeWidth={1.5} /> Buy Now
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function Wishlist() {
  const { toggleWishlist, fetchWishlistIds } = useWishlist()
  const { fetchCartCount }                   = useCart()
  const { user }                             = useAuth()
  const navigate                             = useNavigate()

  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [addingId,   setAddingId]   = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [clearing,   setClearing]   = useState(false)

  const fetchWishlist = () => {
    setLoading(true)
    api.get('/products/wishlist/').then(res => setProducts(res.data.results || [])).catch(() => setProducts([])).finally(() => setLoading(false))
  }
  useEffect(() => { fetchWishlist() }, [])

  const handleRemove = async (e, productId) => {
    e.preventDefault(); e.stopPropagation(); setRemovingId(productId)
    await toggleWishlist(productId)
    setProducts(prev => prev.filter(p => p.id !== productId)); setRemovingId(null)
  }

  const handleClear = async () => {
    if (!window.confirm('Remove all items from your wishlist?')) return
    setClearing(true)
    try { await api.delete('/products/wishlist/clear/'); setProducts([]); fetchWishlistIds(); toast.success('Wishlist cleared') }
    catch { toast.error('Failed to clear wishlist.') }
    finally { setClearing(false) }
  }

  const addToCart = async (e, productId) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login'); return }
    setAddingId(productId)
    try { await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 }); await fetchCartCount(); toast.success('Added to cart') }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to add.') }
    finally { setAddingId(null) }
  }

  const buyNow = (e, product) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity: 1 } } })
  }

  const headerBlock = (
    <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: 'clamp(32px,5vw,48px) 0 40px' }}>
      <div className="container-luxury">
        <div className="breadcrumb" style={{ marginBottom: '20px' }}>
          <Link to="/">Home</Link><span className="sep"><ChevronRight size={11} strokeWidth={1.5} /></span>
          <span className="current">Wishlist</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="section-eyebrow">My Wishlist</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', color: '#16100C', fontWeight: 400, lineHeight: 1.1 }}>
              Saved Items
              {products.length > 0 && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '16px', color: '#AA9688', fontWeight: 300, marginLeft: '14px' }}>{products.length} item{products.length!==1?'s':''}</span>}
            </h1>
          </div>
          {products.length > 0 && (
            <button onClick={handleClear} disabled={clearing} className="btn-ghost" style={{ color: '#963838', fontSize: '12px', gap: '6px' }}>
              <Trash2 size={13} strokeWidth={1.5} />{clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <>
      <SEO title="Wishlist" description="Your saved products" url="/wishlist" noIndex />
      <style>{WISHLIST_CSS}</style>
      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
        {headerBlock}
        <div className="container-luxury" style={{ padding: '40px 32px' }}>
          <div className="wishlist-skeleton-grid">{[...Array(4)].map((_,i) => <ProductCardSkeleton key={i} />)}</div>
        </div>
      </div>
    </>
  )

  if (products.length === 0) return (
    <>
      <SEO title="Wishlist" description="Your saved products" url="/wishlist" noIndex />
      <style>{WISHLIST_CSS}</style>
      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
        {headerBlock}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(48px,8vw,80px) 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '360px' }}>
            <div style={{ width: '80px', height: '80px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: '#D4C4B0' }}><Heart size={32} strokeWidth={1} /></div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '24px', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>Your wishlist is empty</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, marginBottom: '32px' }}>Save products you love by tapping the heart icon.</p>
            <Link to="/products" className="btn-primary" style={{ gap: '8px' }}>Discover Products <ArrowRight size={14} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <SEO title="Wishlist" description="Your saved skincare products" url="/wishlist" noIndex />
      <style>{WISHLIST_CSS}</style>
      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
        {headerBlock}
        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,48px) 32px clamp(48px,6vw,80px)' }}>
          <div className="wishlist-grid" style={{ marginBottom: '48px' }}>
            {products.map(product => (
              <WishlistCard key={product.id} product={product} onRemove={handleRemove} onAddToCart={addToCart} onBuyNow={buyNow} addingId={addingId} removingId={removingId} />
            ))}
          </div>
          <div style={{ textAlign: 'center', paddingTop: '32px', borderTop: '1px solid #E6DDD3' }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#AA9688', marginBottom: '14px', fontWeight: 300 }}>Looking for more products?</p>
            <Link to="/products" className="btn-ghost" style={{ gap: '6px', fontSize: '12.5px' }}>Continue Shopping <ArrowRight size={14} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </div>
    </>
  )
}