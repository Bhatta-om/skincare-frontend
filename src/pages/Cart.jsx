// src/pages/Cart.jsx — Mobile Responsive + SEO
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowLeft,
  Package, Truck, ShieldCheck, CreditCard, X,
  ChevronRight, Lock,
} from 'lucide-react'

const CART_CSS = `
  .cart-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 40px;
    align-items: flex-start;
  }
  .cart-item-grid {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 20px;
    align-items: start;
  }
  .cart-summary-sticky { position: sticky; top: 110px; }
  .cart-payment-badges {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 16px;
  }
  .cart-item-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  @media (max-width: 900px) {
    .cart-layout {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    .cart-summary-sticky { position: static; }
  }
  @media (max-width: 480px) {
    .cart-item-grid {
      grid-template-columns: 72px 1fr;
      gap: 12px;
    }
    .cart-payment-badges { grid-template-columns: repeat(3, 1fr); }
  }
`

const CartItemSkeleton = () => (
  <div style={{ padding: '24px 0', borderBottom: '1px solid #EEE7DF', display: 'grid', gridTemplateColumns: '88px 1fr', gap: '16px' }}>
    <div className="skeleton" style={{ height: '88px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="skeleton" style={{ height: '12px', width: '30%' }} />
      <div className="skeleton" style={{ height: '16px', width: '70%' }} />
      <div className="skeleton" style={{ height: '14px', width: '25%' }} />
    </div>
  </div>
)

export default function Cart() {
  const navigate           = useNavigate()
  const { fetchCartCount } = useCart()

  const [cart,     setCart]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(null)
  const [clearing, setClearing] = useState(false)

  const fetchCart = async () => {
    try { const res = await api.get('/orders/cart/'); setCart(res.data?.cart || res.data) }
    catch { setCart(null) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    setUpdating(itemId)
    try { await api.patch(`/orders/cart/items/${itemId}/`, { quantity }); await fetchCart(); await fetchCartCount() }
    catch { toast.error('Failed to update quantity.') }
    finally { setUpdating(null) }
  }

  const removeItem = async (itemId) => {
    setUpdating(itemId)
    try { await api.delete(`/orders/cart/items/${itemId}/remove/`); await fetchCart(); await fetchCartCount(); toast.success('Item removed') }
    catch { toast.error('Failed to remove item.') }
    finally { setUpdating(null) }
  }

  const clearCart = async () => {
    setClearing(true)
    try { await api.delete('/orders/cart/clear/'); await fetchCart(); await fetchCartCount(); toast.success('Cart cleared') }
    catch { toast.error('Failed to clear cart.') }
    finally { setClearing(false) }
  }

  if (loading) return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
      <style>{CART_CSS}</style>
      <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: '40px 0' }}>
        <div className="container-luxury">
          <div className="skeleton" style={{ height: '14px', width: '120px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '36px', width: '200px' }} />
        </div>
      </div>
      <div className="container-luxury" style={{ padding: '40px 32px' }}>
        <div className="cart-layout">
          <div>{[...Array(3)].map((_,i) => <CartItemSkeleton key={i} />)}</div>
          <div className="skeleton" style={{ height: '360px' }} />
        </div>
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

  if (items.length === 0) return (
    <>
      <SEO title="Cart" description="Your shopping cart" url="/cart" noIndex />
      <style>{CART_CSS}</style>
      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: 'clamp(32px,5vw,48px) 0 40px' }}>
          <div className="container-luxury">
            <div className="breadcrumb" style={{ marginBottom: '20px' }}>
              <Link to="/">Home</Link><span className="sep"><ChevronRight size={11} strokeWidth={1.5} /></span>
              <span className="current">Cart</span>
            </div>
            <div className="section-eyebrow">Shopping Cart</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', color: '#16100C', fontWeight: 400 }}>My Cart</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(48px,8vw,80px) 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '360px' }}>
            <div style={{ width: '80px', height: '80px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: '#D4C4B0' }}>
              <ShoppingBag size={32} strokeWidth={1} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '24px', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>Your cart is empty</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, marginBottom: '32px' }}>
              Looks like you haven't added anything yet.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <Link to="/products" className="btn-primary" style={{ gap: '8px' }}><ShoppingBag size={14} strokeWidth={1.5} /> Browse Products</Link>
              <Link to="/skin-analysis" className="btn-ghost" style={{ fontSize: '12px', color: '#B8895A' }}>Try Free Skin Analysis</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <SEO title="Cart" description="Your shopping cart" url="/cart" noIndex />
      <style>{CART_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: 'clamp(32px,5vw,48px) 0 40px' }}>
          <div className="container-luxury">
            <div className="breadcrumb" style={{ marginBottom: '20px' }}>
              <Link to="/">Home</Link><span className="sep"><ChevronRight size={11} strokeWidth={1.5} /></span>
              <span className="current">Cart</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div className="section-eyebrow">Shopping Cart</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', color: '#16100C', fontWeight: 400, lineHeight: 1.1 }}>
                  My Cart
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '16px', color: '#AA9688', fontWeight: 300, marginLeft: '14px' }}>
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </h1>
              </div>
              <button onClick={clearCart} disabled={clearing} className="btn-ghost" style={{ color: '#963838', fontSize: '12px', gap: '6px' }}>
                <Trash2 size={13} strokeWidth={1.5} />
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,48px) 32px clamp(48px,6vw,80px)' }}>
          <div className="cart-layout">

            {/* Items */}
            <div>
              {items.map(item => (
                <div key={item.id} style={{ opacity: updating === item.id ? 0.5 : 1, transition: 'opacity 0.2s', borderBottom: '1px solid #EEE7DF', padding: 'clamp(16px,3vw,24px) 0' }}>
                  <div className="cart-item-grid">
                    <Link to={`/products/${item.product?.slug}`} style={{ display: 'block', flexShrink: 0 }}>
                      <div style={{ width: '100%', aspectRatio: '1', background: '#F4EDE4', border: '1px solid #E6DDD3', overflow: 'hidden' }}>
                        {item.product?.image
                          ? <img src={getProductImageUrl(item.product.image)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={28} strokeWidth={1} style={{ color: '#D4C4B0' }} /></div>
                        }
                      </div>
                    </Link>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px', fontWeight: 400 }}>{item.product?.brand}</p>
                          <Link to={`/products/${item.product?.slug}`} style={{ textDecoration: 'none' }}>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(13px,2vw,15px)', color: '#16100C', fontWeight: 400, lineHeight: 1.3, marginBottom: '8px' }}>{item.product?.name}</h3>
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#16100C', fontWeight: 400 }}>Rs. {item.product?.discounted_price}</span>
                            {item.product?.discount_percent > 0 && (
                              <>
                                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', textDecoration: 'line-through', fontWeight: 300 }}>Rs. {item.product?.price}</span>
                                <span className="badge badge-error">-{item.product?.discount_percent}%</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} disabled={updating === item.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4C4B0', padding: '4px', display: 'flex', transition: 'color 0.2s', flexShrink: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#963838'}
                          onMouseLeave={e => e.currentTarget.style.color = '#D4C4B0'}
                        >
                          <X size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="cart-item-bottom">
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E6DDD3' }}>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity-1)} disabled={updating === item.id || item.quantity <= 1}><Minus size={12} strokeWidth={1.5} /></button>
                          <span className="qty-display" style={{ width: '44px', lineHeight: '36px' }}>{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity+1)} disabled={updating === item.id}><Plus size={12} strokeWidth={1.5} /></button>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400 }}>
                            Rs. {item.total_price || (parseFloat(item.product?.discounted_price)*item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', fontWeight: 300, marginTop: '2px' }}>Rs. {item.product?.discounted_price} × {item.quantity}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: '24px' }}>
                <Link to="/products" className="btn-ghost" style={{ gap: '6px', fontSize: '12px' }}>
                  <ArrowLeft size={14} strokeWidth={1.5} /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="cart-summary-sticky">
              <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
                <div style={{ height: '2px', background: 'linear-gradient(to right,#B8895A,#D4A96A,#B8895A)' }} />
                <div style={{ padding: '24px', borderBottom: '1px solid #EEE7DF' }}>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400 }}>Order Summary</h2>
                </div>
                <div style={{ padding: '24px' }}>
                  {savings > 0 && (
                    <div style={{ background: '#EEF6F1', border: '1px solid #C4DAC8', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={14} strokeWidth={1.5} style={{ color: '#4A7A57', flexShrink: 0 }} />
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#4A7A57', fontWeight: 400 }}>You're saving Rs. {savings.toFixed(0)} on this order</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#7B6458', fontWeight: 300 }}>Subtotal ({items.length} item{items.length!==1?'s':''})</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#16100C', fontWeight: 400 }}>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    {savings > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#4A7A57', fontWeight: 300 }}>Discount</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#4A7A57', fontWeight: 400 }}>− Rs. {savings.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#7B6458', fontWeight: 300 }}>Delivery</span>
                      {delivery === 0
                        ? <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#4A7A57', fontWeight: 400 }}>Free</span>
                        : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#16100C', fontWeight: 400 }}>Rs. {delivery}</span>
                      }
                    </div>
                    {delivery > 0 && (
                      <div style={{ background: '#FCF3E4', border: '1px solid #E5D39C', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={13} strokeWidth={1.5} style={{ color: '#89670F', flexShrink: 0 }} />
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#89670F', fontWeight: 300 }}>Add Rs. {(2000-subtotal).toFixed(0)} more for free delivery</span>
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #E6DDD3', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400 }}>Total</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#16100C', fontWeight: 400 }}>Rs. {total}</span>
                  </div>
                  <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '15px' }}>
                    <Lock size={14} strokeWidth={1.5} /> Proceed to Checkout
                  </button>
                  <div className="cart-payment-badges">
                    {[{ icon: <Lock size={14} strokeWidth={1.5} />, label: 'Secure' }, { icon: <CreditCard size={14} strokeWidth={1.5} />, label: 'eSewa' }, { icon: <ShieldCheck size={14} strokeWidth={1.5} />, label: 'COD' }].map(({ icon, label }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px 6px', background: '#FAF8F5', border: '1px solid #EEE7DF' }}>
                        <span style={{ color: '#B8895A' }}>{icon}</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', fontWeight: 400 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', textAlign: 'center', marginTop: '12px', fontWeight: 300 }}>100% secure &amp; encrypted checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}