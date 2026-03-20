// src/pages/Products.jsx — Mobile Responsive + SEO
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth }     from '../context/AuthContext'
import { useCart }     from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { ProductCardSkeleton } from '../components/Skeleton'
import SearchBox from '../components/SearchBox'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import {
  SlidersHorizontal, X, Star, Heart, ShoppingBag,
  Zap, Package, ChevronLeft, ChevronRight, Search,
  ChevronDown,
} from 'lucide-react'

const PRODUCTS_CSS = `
  .products-header-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 32px;
    align-items: flex-end;
  }
  .products-search-box { width: 320px; }
  .products-filter-panel {
    display: grid;
    grid-template-columns: 240px 240px auto;
    gap: 16px;
    align-items: end;
  }
  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #E6DDD3;
  }
  .products-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #E6DDD3;
  }
  .filter-chips-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  @media (max-width: 1024px) {
    .products-grid { grid-template-columns: repeat(3, 1fr); }
    .products-skeleton-grid { grid-template-columns: repeat(3, 1fr); }
    .products-search-box { width: 240px; }
  }
  @media (max-width: 768px) {
    .products-header-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .products-search-box { width: 100%; }
    .products-grid { grid-template-columns: repeat(2, 1fr); }
    .products-skeleton-grid { grid-template-columns: repeat(2, 1fr); }
    .products-filter-panel {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .filter-bar { gap: 10px; }
    .filter-chips-row { gap: 5px; }
  }
  @media (max-width: 480px) {
    .products-grid { grid-template-columns: repeat(2, 1fr); }
    .products-skeleton-grid { grid-template-columns: repeat(2, 1fr); }
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

const LuxSelect = ({ value, onChange, children }) => (
  <div style={{ position: 'relative' }}>
    <select value={value} onChange={onChange} style={{
      width: '100%', appearance: 'none', background: '#FFFFFF',
      border: '1px solid #E6DDD3', padding: '10px 36px 10px 14px',
      fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px',
      color: value ? '#16100C' : '#AA9688',
      outline: 'none', cursor: 'pointer', fontWeight: 300,
    }}>
      {children}
    </select>
    <ChevronDown size={13} strokeWidth={1.5} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#AA9688', pointerEvents: 'none' }} />
  </div>
)

const FilterChip = ({ label, onRemove }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: '#16100C', color: '#FAF8F5',
    fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', fontWeight: 400,
    textTransform: 'uppercase', letterSpacing: '0.1em', padding: '5px 12px',
  }}>
    {label}
    <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0, transition: 'color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#B8895A'}
      onMouseLeave={e => e.currentTarget.style.color = '#AA9688'}
    >
      <X size={11} strokeWidth={2} />
    </button>
  </div>
)

const ProductCard = ({ product, onAddToCart, onBuyNow, onWishlist, isWishlisted, addingId }) => {
  const [hov, setHov] = useState(false)
  const inStock = product.stock_status === 'In Stock' || product.stock > 0

  return (
    <Link to={`/products/${product.slug}`} className="product-card" style={{ display: 'block', textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {product.discount_percent > 0 && <span className="card-badge card-badge-sale">-{product.discount_percent}%</span>}
      {!product.discount_percent && product.is_featured && <span className="card-badge card-badge-new">Featured</span>}

      <button onClick={e => { e.preventDefault(); e.stopPropagation(); onWishlist(e, product.id) }}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          width: '32px', height: '32px', background: '#FFFFFF',
          border: '1px solid #E6DDD3', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 2,
          opacity: hov || isWishlisted(product.id) ? 1 : 0,
          transform: hov || isWishlisted(product.id) ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(22,16,12,0.1)',
        }}>
        <Heart size={14} strokeWidth={1.5}
          style={{ fill: isWishlisted(product.id) ? '#B8895A' : 'none', color: isWishlisted(product.id) ? '#B8895A' : '#7B6458' }}
        />
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
        {product.review_count > 0
          ? <Stars rating={product.avg_rating} count={product.review_count} />
          : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#D4C4B0' }}>No reviews yet</span>
        }
        {product.suitable_skin_type && (
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#AA9688', border: '1px solid #E6DDD3', padding: '3px 8px', display: 'inline-block', marginTop: '4px', fontWeight: 400 }}>
            {product.suitable_skin_type}
          </span>
        )}
        <div className="card-price" style={{ marginTop: '10px' }}>
          {product.discount_percent > 0 && <span className="original">Rs. {product.price}</span>}
          <span className={product.discount_percent > 0 ? 'sale' : ''}>Rs. {product.discounted_price}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); onAddToCart(e, product.id) }}
            disabled={addingId === product.id || !inStock}
            style={{
              flex: 1, background: addingId === product.id || !inStock ? '#E6DDD3' : '#16100C',
              color: addingId === product.id || !inStock ? '#AA9688' : '#FAF8F5',
              border: 'none', cursor: !inStock ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', fontWeight: 400,
              textTransform: 'uppercase', letterSpacing: '0.12em', padding: '9px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { if (inStock && addingId !== product.id) e.currentTarget.style.background = '#3A2820' }}
            onMouseLeave={e => { if (inStock && addingId !== product.id) e.currentTarget.style.background = '#16100C' }}
          >
            <ShoppingBag size={12} strokeWidth={1.5} />
            {addingId === product.id ? 'Adding...' : 'Add to Cart'}
          </button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); onBuyNow(e, product) }}
            disabled={!inStock}
            style={{
              flex: 1, background: 'transparent', color: '#B8895A',
              border: '1px solid #B8895A', cursor: !inStock ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', fontWeight: 400,
              textTransform: 'uppercase', letterSpacing: '0.12em', padding: '9px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'all 0.2s ease', opacity: !inStock ? 0.4 : 1,
            }}
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

const SKIN_TYPES = ['oily', 'dry', 'normal']

export default function Products() {
  const { user }                         = useAuth()
  const { fetchCartCount }               = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const navigate                         = useNavigate()
  const [searchParams, setSearchParams]  = useSearchParams()

  const [search,     setSearch]     = useState(searchParams.get('search') || '')
  const [skinType,   setSkinType]   = useState(searchParams.get('suitable_skin_type') || searchParams.get('skin_type') || '')
  const [category,   setCategory]   = useState(searchParams.get('category') || '')
  const [ordering,   setOrdering]   = useState(searchParams.get('ordering') || '')
  const [categories, setCategories] = useState([])
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [addingId,   setAddingId]   = useState(null)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    api.get('/products/categories/')
      .then(res => setCategories(res.data.results || res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)   params.append('search',              search)
    if (skinType) params.append('suitable_skin_type',  skinType)
    if (category) params.append('category',            category)
    if (ordering) params.append('ordering',            ordering)
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
  }, [search, skinType, category, ordering, page])

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
      toast.success('Added to cart')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add.')
    } finally { setAddingId(null) }
  }

  const buyNow = (e, product) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity: 1 } } })
  }

  const handleWishlist = (e, productId) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId) }
  const clearAll = () => { setSearch(''); setSkinType(''); setCategory(''); setOrdering(''); setPage(1); setSearchParams({}, { replace: true }) }
  const hasFilters = search || skinType || category || ordering

  return (
    <>
      <SEO title="Products" description="Browse our full collection of AI-recommended, clinically proven skincare products." url="/products" />
      <style>{PRODUCTS_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: 'clamp(32px,5vw,56px) 0 clamp(24px,4vw,40px)' }}>
          <div className="container-luxury">
            <div className="breadcrumb" style={{ marginBottom: '20px' }}>
              <Link to="/">Home</Link>
              <span className="sep">/</span>
              <span className="current">Products</span>
            </div>
            <div className="products-header-grid">
              <div>
                <div className="section-eyebrow">Our Collection</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3.5vw,42px)', color: '#16100C', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Skincare Products
                </h1>
                {totalCount > 0 && (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#AA9688', marginTop: '8px', fontWeight: 300 }}>
                    {totalCount} products for every skin type
                  </p>
                )}
              </div>
              <div className="products-search-box">
                <SearchBox variant="inline" placeholder="Search products..." initialValue={search} onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: '0 32px' }}>

          {/* Filter bar */}
          <div style={{ borderBottom: '1px solid #E6DDD3', padding: '16px 0' }}>
            <div className="filter-bar">
              <button onClick={() => setFilterOpen(s => !s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: filterOpen ? '#16100C' : 'transparent',
                  border: '1px solid #E6DDD3', padding: '9px 16px',
                  fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: filterOpen ? '#FAF8F5' : '#3A2820',
                  cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
                }}>
                <SlidersHorizontal size={13} strokeWidth={1.5} />
                Filter
                {(skinType || category) && (
                  <span style={{ background: '#B8895A', color: '#FFFFFF', fontSize: '9px', fontWeight: 500, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {[skinType, category].filter(Boolean).length}
                  </span>
                )}
              </button>

              <div style={{ width: '1px', height: '20px', background: '#E6DDD3', flexShrink: 0 }} />

              <div className="filter-chips-row">
                {['', ...SKIN_TYPES].map(t => (
                  <button key={t || 'all'} onClick={() => { setSkinType(t); setPage(1) }}
                    style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: 400,
                      textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 14px',
                      border: '1px solid', cursor: 'pointer', transition: 'all 0.2s ease',
                      borderColor: skinType === t ? '#16100C' : '#E6DDD3',
                      background:  skinType === t ? '#16100C' : 'transparent',
                      color:       skinType === t ? '#FAF8F5' : '#7B6458',
                      whiteSpace: 'nowrap',
                    }}>
                    {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All Types'}
                  </button>
                ))}
              </div>

              {!loading && totalCount > 0 && (
                <div style={{ marginLeft: 'auto' }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300, whiteSpace: 'nowrap' }}>
                    {products.length} of {totalCount}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Filter panel */}
          {filterOpen && (
            <div style={{ borderBottom: '1px solid #E6DDD3', padding: '20px 0' }}>
              <div className="products-filter-panel">
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#AA9688', marginBottom: '10px', fontWeight: 400 }}>Category</p>
                  <LuxSelect value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </LuxSelect>
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#AA9688', marginBottom: '10px', fontWeight: 400 }}>Sort By</p>
                  <LuxSelect value={ordering} onChange={e => { setOrdering(e.target.value); setPage(1) }}>
                    <option value="">Default</option>
                    <option value="-created_at">New Arrivals</option>
                    <option value="-views_count">Best Sellers</option>
                    <option value="-discount_percent">On Sale</option>
                    <option value="price">Price: Low → High</option>
                    <option value="-price">Price: High → Low</option>
                  </LuxSelect>
                </div>
                {hasFilters && (
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={clearAll} className="btn-ghost" style={{ color: '#963838', fontSize: '12px', gap: '5px' }}>
                      <X size={13} strokeWidth={1.5} /> Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active chips */}
          {hasFilters && (
            <div style={{ display: 'flex', gap: '8px', padding: '14px 0', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Active:</span>
              {search   && <FilterChip label={`"${search}"`} onRemove={() => handleSearch('')} />}
              {skinType && <FilterChip label={skinType.charAt(0).toUpperCase() + skinType.slice(1) + ' Skin'} onRemove={() => { setSkinType(''); setPage(1) }} />}
              {category && <FilterChip label={categories.find(c => String(c.id) === String(category))?.name || 'Category'} onRemove={() => { setCategory(''); setPage(1) }} />}
              {ordering && <FilterChip label={{ '-created_at': 'New Arrivals', '-views_count': 'Best Sellers', '-discount_percent': 'On Sale', 'price': 'Price: Low→High', '-price': 'Price: High→Low' }[ordering] || ordering} onRemove={() => { setOrdering(''); setPage(1) }} />}
            </div>
          )}

          {/* Grid */}
          <div style={{ padding: '28px 0 64px' }}>
            {loading ? (
              <div className="products-skeleton-grid">
                {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product}
                    onAddToCart={addToCart} onBuyNow={buyNow}
                    onWishlist={handleWishlist} isWishlisted={isWishlisted} addingId={addingId}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'clamp(48px,8vw,96px) 0' }}>
                <div style={{ width: '56px', height: '56px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#D4C4B0' }}>
                  <Search size={22} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#16100C', fontWeight: 400, marginBottom: '8px' }}>No products found</h3>
                {search && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#AA9688', marginBottom: '24px', fontWeight: 300 }}>No results for "<strong style={{ fontWeight: 400, color: '#7B6458' }}>{search}</strong>"</p>}
                <button onClick={clearAll} className="btn-outline" style={{ fontSize: '11px' }}>Clear Filters</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', paddingBottom: '64px', flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 14px', border: '1px solid #E6DDD3', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: page === 1 ? '#D4C4B0' : '#3A2820', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (page !== 1) e.currentTarget.style.borderColor = '#16100C' }}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E6DDD3'}
              >
                <ChevronLeft size={14} strokeWidth={1.5} /> Prev
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1
                const show = totalPages <= 7 || p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
                const ellipsis = p === page - 2 || p === page + 2
                if (!show && !ellipsis) return null
                if (ellipsis && !show) return <span key={p} style={{ padding: '0 4px', color: '#AA9688', fontFamily: "'DM Sans',sans-serif", fontSize: '12px' }}>…</span>
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: '38px', height: '38px', border: '1px solid', borderColor: page === p ? '#16100C' : '#E6DDD3', background: page === p ? '#16100C' : 'transparent', color: page === p ? '#FAF8F5' : '#3A2820', fontFamily: "'DM Sans',sans-serif", fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: page === p ? 500 : 300 }}
                  >{p}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 14px', border: '1px solid #E6DDD3', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: page === totalPages ? '#D4C4B0' : '#3A2820', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.borderColor = '#16100C' }}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E6DDD3'}
              >
                Next <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}