// src/pages/Checkout.jsx — Mobile Responsive + SEO
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import { Lock, ShieldCheck, CreditCard, Truck, Package, ChevronRight, CheckCircle, Zap } from 'lucide-react'

const CHECKOUT_CSS = `
  .checkout-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 32px;
    align-items: flex-start;
  }
  .checkout-summary-sticky { position: sticky; top: 110px; }
  .checkout-form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .checkout-trust-badges {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 14px;
  }
  .checkout-step-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 40px;
  }
  @media (max-width: 900px) {
    .checkout-layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .checkout-summary-sticky { position: static; order: -1; }
  }
  @media (max-width: 480px) {
    .checkout-form-grid-2 { grid-template-columns: 1fr; gap: 12px; }
    .checkout-step-bar { gap: 0; }
  }
`

const StepBar = ({ current }) => (
  <div className="checkout-step-bar">
    {['Shipping','Payment','Review'].map((label, i) => (
      <React.Fragment key={i}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '32px', height: '32px', border: `1px solid ${i<=current?'#B8895A':'#E6DDD3'}`, background: i<current?'#B8895A':i===current?'#FAF8F5':'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
            {i < current ? <CheckCircle size={14} strokeWidth={1.5} style={{ color: '#FFFFFF' }} /> : <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: i===current?'#B8895A':'#D4C4B0', fontWeight: 400 }}>{i+1}</span>}
          </div>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: i<=current?'#B8895A':'#AA9688', fontWeight: 400, whiteSpace: 'nowrap' }}>{label}</span>
        </div>
        {i < 2 && <div style={{ width: 'clamp(32px,5vw,64px)', height: '1px', background: i<current?'#B8895A':'#E6DDD3', marginBottom: '22px', transition: 'background 0.25s', flexShrink: 0 }} />}
      </React.Fragment>
    ))}
  </div>
)

const Field = ({ label, required, children }) => (
  <div>
    <label className="input-label">{label}{required && <span style={{ color: '#963838' }}> *</span>}</label>
    <div style={{ marginTop: '8px' }}>{children}</div>
  </div>
)

const PaymentOption = ({ value, selected, onChange, label, desc, icon }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: `1px solid ${selected?'#B8895A':'#E6DDD3'}`, background: selected?'#FFFCF9':'#FFFFFF', cursor: 'pointer', transition: 'all 0.2s' }}>
    <input type="radio" name="payment_method" value={value} checked={selected} onChange={onChange} style={{ display: 'none' }} />
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${selected?'#B8895A':'#E6DDD3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
      {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B8895A' }} />}
    </div>
    <div style={{ width: '40px', height: '40px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#FDFAF7' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '13.5px', color: '#16100C', fontWeight: 400 }}>{label}</p>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11.5px', color: '#AA9688', fontWeight: 300, marginTop: '2px' }}>{desc}</p>
    </div>
    {selected && <CheckCircle size={15} strokeWidth={1.5} style={{ color: '#B8895A', flexShrink: 0 }} />}
  </label>
)

const SectionCard = ({ step, title, children }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', overflow: 'hidden' }}>
    <div style={{ padding: 'clamp(14px,2vw,20px) clamp(16px,3vw,24px)', borderBottom: '1px solid #EEE7DF', display: 'flex', alignItems: 'center', gap: '12px', background: '#FDFAF7' }}>
      <div style={{ width: '28px', height: '28px', border: '1px solid #B8895A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#B8895A', fontWeight: 400, flexShrink: 0 }}>{step}</div>
      <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '17px', color: '#16100C', fontWeight: 400 }}>{title}</h2>
    </div>
    <div style={{ padding: 'clamp(16px,3vw,24px)' }}>{children}</div>
  </div>
)

export default function Checkout() {
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const navigate           = useNavigate()
  const location           = useLocation()
  const buyNowData         = location.state?.buyNow || null

  const [cart,    setCart]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '',
    address_line1: '', city: '', payment_method: 'esewa',
  })

  useEffect(() => {
    if (user) setFormData(f => ({
      ...f,
      full_name: `${user.first_name||''} ${user.last_name||''}`.trim(),
      email:     user.email  || '',
      phone:     user.phone  || '',
    }))
  }, [user])

  useEffect(() => {
    if (buyNowData) { setLoading(false); return }
    api.get('/orders/cart/')
      .then(res => setCart(res.data?.cart || res.data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!buyNowData && !loading && cart && (cart?.items||[]).length === 0) navigate('/cart')
  }, [cart, loading, buyNowData])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const submitEsewaForm = (esewaFormData, esewaUrl) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = esewaUrl
    Object.keys(esewaFormData).forEach(key => {
      const input   = document.createElement('input')
      input.type    = 'hidden'
      input.name    = key
      input.value   = esewaFormData[key]
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPlacing(true)
    const toastId = toast.loading(
      formData.payment_method === 'esewa'
        ? 'Redirecting to eSewa...'
        : 'Placing your order...'
    )
    try {
      let orderId
      if (buyNowData) {
        const res = await api.post('/orders/buy-now/', {
          product_id:    buyNowData.product_id,
          quantity:      buyNowData.quantity,
          full_name:     formData.full_name,
          phone:         formData.phone,
          email:         formData.email,
          address_line1: formData.address_line1,
          city:          formData.city,
          payment_method: formData.payment_method,
        })
        orderId = res.data.order.id
      } else {
        const res = await api.post('/orders/create/', formData)
        orderId   = res.data.order.id
        await fetchCartCount()
      }

      if (formData.payment_method === 'esewa') {
        const esewaRes = await api.post('/payments/esewa/initiate/', { order_id: orderId })

        // ✅ Store pending order id
        localStorage.setItem('pending_order_id', orderId)

        // ✅ Store buy now data so EsewaFailure knows where to redirect
        if (buyNowData) {
          localStorage.setItem('pending_buy_now', JSON.stringify(buyNowData))
        } else {
          localStorage.removeItem('pending_buy_now')
        }

        toast.success('Redirecting to eSewa...', { id: toastId })
        submitEsewaForm(esewaRes.data.form_data, esewaRes.data.esewa_url)
      } else {
        toast.success('Order placed successfully', { id: toastId })
        navigate('/orders')
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to place order.'
      toast.error(msg, { id: toastId })
      setPlacing(false)
    }
  }

  if (loading) return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '1.5px solid #E6DDD3', borderTopColor: '#B8895A', borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite', margin: '0 auto' }} />
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '13px', color: '#AA9688', marginTop: '16px', fontWeight: 300 }}>Loading checkout...</p>
      </div>
    </div>
  )

  const items    = buyNowData
    ? [{ id: 1, product: buyNowData.product, quantity: buyNowData.quantity, total_price: (parseFloat(buyNowData.product?.discounted_price||0) * buyNowData.quantity).toFixed(2) }]
    : (cart?.items || [])
  const subtotal = buyNowData
    ? parseFloat(buyNowData.product?.discounted_price||0) * buyNowData.quantity
    : parseFloat(cart?.subtotal || cart?.total_amount || 0)
  const delivery = subtotal >= 2000 ? 0 : 100
  const total    = (subtotal + delivery).toFixed(2)

  return (
    <>
      <SEO title="Checkout" description="Secure checkout" url="/checkout" noIndex />
      <style>{CHECKOUT_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ background: '#F4EDE4', borderBottom: '1px solid #E6DDD3', padding: 'clamp(32px,5vw,48px) 0 40px' }}>
          <div className="container-luxury">
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a href="/cart" style={{ color: '#AA9688', textDecoration: 'none', fontFamily: 'DM Sans,sans-serif', fontSize: '12px' }}>Cart</a>
              <ChevronRight size={11} strokeWidth={1.5} style={{ color: '#AA9688' }} />
              <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#16100C' }}>Checkout</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="section-eyebrow" style={{ margin: 0 }}>Secure Checkout</div>
              {buyNowData && (
                <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={10} strokeWidth={1.5} /> Quick Buy
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(26px,3vw,36px)', color: '#16100C', fontWeight: 400, marginTop: '8px' }}>
              Checkout
            </h1>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,48px) 32px clamp(48px,6vw,80px)' }}>
          <form onSubmit={handleSubmit}>
            <div className="checkout-layout">

              {/* Left: Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SectionCard step="1" title="Shipping Information">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Field label="Full Name" required>
                      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="John Doe" className="input-luxury" />
                    </Field>
                    <div className="checkout-form-grid-2">
                      <Field label="Email" required>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="input-luxury" />
                      </Field>
                      <Field label="Phone" required>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="98XXXXXXXX" className="input-luxury" />
                      </Field>
                    </div>
                    <Field label="Delivery Address" required>
                      <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} required placeholder="Street, Area, Landmark" className="input-luxury" />
                    </Field>
                    <Field label="City" required>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Kathmandu" className="input-luxury" />
                    </Field>
                  </div>
                </SectionCard>

                <SectionCard step="2" title="Payment Method">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <PaymentOption
                      value="esewa" selected={formData.payment_method === 'esewa'}
                      onChange={handleChange} label="eSewa"
                      desc="Fast and secure digital wallet payment"
                      icon={<span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '10px', fontWeight: 500, color: '#16a34a' }}>eSewa</span>}
                    />
                    <PaymentOption
                      value="cod" selected={formData.payment_method === 'cod'}
                      onChange={handleChange} label="Cash on Delivery"
                      desc="Pay in cash when your order arrives"
                      icon={<CreditCard size={16} strokeWidth={1.5} style={{ color: '#B8895A' }} />}
                    />
                  </div>
                  {formData.payment_method === 'esewa' && (
                    <div style={{ marginTop: '14px', background: '#EEF6F1', border: '1px solid #C4DAC8', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <ShieldCheck size={14} strokeWidth={1.5} style={{ color: '#4A7A57', flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#4A7A57', fontWeight: 400, marginBottom: '3px' }}>eSewa Sandbox</p>
                        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#7AAA87', fontWeight: 300 }}>
                          ID: <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#4A7A57' }}>9806800001</span>
                          {' '}· Password: <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#4A7A57' }}>Nepal@123</span>
                        </p>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Right: Summary */}
              <div className="checkout-summary-sticky">
                <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', overflow: 'hidden' }}>
                  <div style={{ height: '2px', background: 'linear-gradient(to right,#B8895A,#D4A96A,#B8895A)' }} />
                  <div style={{ padding: 'clamp(14px,2vw,20px) clamp(16px,3vw,24px)', borderBottom: '1px solid #EEE7DF' }}>
                    <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '17px', color: '#16100C', fontWeight: 400 }}>Order Summary</h2>
                    {buyNowData && (
                      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#AA9688', marginTop: '3px', fontWeight: 300 }}>
                        Quick Buy — cart unchanged
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div style={{ padding: 'clamp(12px,2vw,16px) clamp(16px,3vw,24px)', borderBottom: '1px solid #EEE7DF', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', background: '#F4EDE4', border: '1px solid #E6DDD3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.product?.image
                            ? <img src={getProductImageUrl(item.product?.image)} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={18} strokeWidth={1} style={{ color: '#D4C4B0' }} />
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#16100C', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</p>
                          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#AA9688', fontWeight: 300 }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#16100C', fontWeight: 400, flexShrink: 0 }}>Rs. {item.total_price}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: 'clamp(16px,3vw,20px) clamp(16px,3vw,24px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#7B6458', fontWeight: 300 }}>Subtotal</span>
                        <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#16100C', fontWeight: 400 }}>Rs. {subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Truck size={12} strokeWidth={1.5} style={{ color: '#AA9688' }} />
                          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#7B6458', fontWeight: 300 }}>Delivery</span>
                        </div>
                        {delivery === 0
                          ? <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#4A7A57', fontWeight: 400 }}>Free</span>
                          : <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#16100C', fontWeight: 400 }}>Rs. {delivery}</span>
                        }
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E6DDD3', paddingTop: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '16px', color: '#16100C', fontWeight: 400 }}>Total</span>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(18px,2.5vw,22px)', color: '#16100C', fontWeight: 400 }}>Rs. {total}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={placing}
                      style={{
                        width: '100%',
                        background: formData.payment_method === 'esewa' ? '#16a34a' : '#16100C',
                        color: '#FFFFFF', border: 'none', padding: '15px',
                        fontFamily: 'DM Sans,sans-serif', fontSize: '11.5px',
                        fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.14em',
                        cursor: placing ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: placing ? 0.7 : 1, transition: 'background 0.25s',
                      }}
                      onMouseEnter={e => {
                        if (!placing) e.currentTarget.style.background = formData.payment_method === 'esewa' ? '#15803d' : '#3A2820'
                      }}
                      onMouseLeave={e => {
                        if (!placing) e.currentTarget.style.background = formData.payment_method === 'esewa' ? '#16a34a' : '#16100C'
                      }}
                    >
                      <Lock size={13} strokeWidth={1.5} />
                      {placing ? 'Processing...' : formData.payment_method === 'esewa' ? 'Pay with eSewa' : 'Place Order (COD)'}
                    </button>

                    <div className="checkout-trust-badges">
                      {[
                        { icon: <Lock size={13} strokeWidth={1.5} />,       label: 'Secure' },
                        { icon: <ShieldCheck size={13} strokeWidth={1.5} />, label: 'eSewa'  },
                        { icon: <CreditCard size={13} strokeWidth={1.5} />,  label: 'COD'    },
                      ].map(({ icon, label }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', border: '1px solid #EEE7DF', background: '#FDFAF7' }}>
                          <span style={{ color: '#B8895A' }}>{icon}</span>
                          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', fontWeight: 400 }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#AA9688', textAlign: 'center', marginTop: '10px', fontWeight: 300 }}>
                      100% secure &amp; encrypted checkout
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  )
}