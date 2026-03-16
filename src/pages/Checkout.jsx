// src/pages/Checkout.jsx — 100% Professional + Tailwind v4
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'

// ── Step Indicator ─────────────────────────────────────────
const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {['Shipping', 'Payment', 'Review'].map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
            i < current  ? 'bg-purple-600 text-white'
            : i === current ? 'bg-purple-600 text-white ring-4 ring-purple-100'
            : 'bg-gray-200 text-gray-400'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs mt-1 font-semibold whitespace-nowrap ${i <= current ? 'text-purple-600' : 'text-gray-400'}`}>
            {label}
          </span>
        </div>
        {i < 2 && <div className={`h-0.5 w-12 sm:w-16 mb-5 mx-1 transition-all ${i < current ? 'bg-purple-600' : 'bg-gray-200'}`} />}
      </React.Fragment>
    ))}
  </div>
)

// ── Input Field ────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
)

const inputCls = "w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors placeholder:text-gray-300"

export default function Checkout() {
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const navigate           = useNavigate()
  const location           = useLocation()

  const buyNowData = location.state?.buyNow || null

  const [cart,    setCart]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [step,    setStep]    = useState(0)   // 0=shipping, 1=payment, 2=review

  const [formData, setFormData] = useState({
    full_name:      '',
    email:          '',
    phone:          '',
    address_line1:  '',
    city:           '',
    payment_method: 'esewa',
  })

  useEffect(() => {
    if (user) {
      setFormData(f => ({
        ...f,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email:     user.email || '',
        phone:     user.phone || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (buyNowData) { setLoading(false); return }
    api.get('/orders/cart/')
      .then(res => setCart(res.data?.cart || res.data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!buyNowData && !loading && cart) {
      if ((cart?.items || []).length === 0) navigate('/cart')
    }
  }, [cart, loading, buyNowData])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const submitEsewaForm = (esewaFormData, esewaUrl) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = esewaUrl
    Object.keys(esewaFormData).forEach(key => {
      const input = document.createElement('input')
      input.type = 'hidden'; input.name = key; input.value = esewaFormData[key]
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPlacing(true)
    const toastId = toast.loading(
      formData.payment_method === 'esewa' ? 'Redirecting to eSewa...' : 'Placing your order...'
    )
    try {
      let orderId
      if (buyNowData) {
        const res = await api.post('/orders/buy-now/', {
          product_id:     buyNowData.product_id,
          quantity:       buyNowData.quantity,
          full_name:      formData.full_name,
          phone:          formData.phone,
          email:          formData.email,
          address_line1:  formData.address_line1,
          city:           formData.city,
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
        localStorage.setItem('pending_order_id', orderId)
        toast.success('Redirecting to eSewa...', { id: toastId })
        submitEsewaForm(esewaRes.data.form_data, esewaRes.data.esewa_url)
      } else {
        toast.success('Order placed successfully! 🎉', { id: toastId })
        navigate('/orders')
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to place order.'
      toast.error(msg, { id: toastId })
      setPlacing(false)
    }
  }

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading checkout...</p>
      </div>
    </div>
  )

  const items = buyNowData
    ? [{ id: 1, product: buyNowData.product, quantity: buyNowData.quantity,
         total_price: (parseFloat(buyNowData.product?.discounted_price || 0) * buyNowData.quantity).toFixed(2) }]
    : (cart?.items || [])

  const subtotal = buyNowData
    ? parseFloat(buyNowData.product?.discounted_price || 0) * buyNowData.quantity
    : parseFloat(cart?.subtotal || cart?.total_amount || 0)

  const delivery = subtotal >= 2000 ? 0 : 100
  const total    = (subtotal + delivery).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-700 to-pink-500 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black">Checkout</h1>
            {buyNowData && (
              <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                ⚡ Quick Buy
              </span>
            )}
          </div>
          <p className="text-purple-100 text-sm">
            {items.length} item{items.length !== 1 ? 's' : ''} · Rs. {total} total
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left: Form ── */}
            <div className="flex-1 space-y-4">

              {/* Shipping Info */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-black text-sm">1</div>
                  <h2 className="font-black text-gray-900">Shipping Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <Field label="Full Name" required>
                    <input type="text" name="full_name" value={formData.full_name}
                      onChange={handleChange} required placeholder="John Doe"
                      className={inputCls} />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email" required>
                      <input type="email" name="email" value={formData.email}
                        onChange={handleChange} required placeholder="you@example.com"
                        className={inputCls} />
                    </Field>
                    <Field label="Phone" required>
                      <input type="text" name="phone" value={formData.phone}
                        onChange={handleChange} required placeholder="98XXXXXXXX"
                        className={inputCls} />
                    </Field>
                  </div>

                  <Field label="Delivery Address" required>
                    <input type="text" name="address_line1" value={formData.address_line1}
                      onChange={handleChange} required placeholder="Street, Area, Landmark"
                      className={inputCls} />
                  </Field>

                  <Field label="City" required>
                    <input type="text" name="city" value={formData.city}
                      onChange={handleChange} required placeholder="Kathmandu"
                      className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-black text-sm">2</div>
                  <h2 className="font-black text-gray-900">Payment Method</h2>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    {
                      value: 'esewa',
                      label: 'eSewa',
                      desc:  'Fast & secure digital wallet payment',
                      icon: (
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shrink-0">
                          <span className="text-white font-black text-xs">eSewa</span>
                        </div>
                      ),
                      activeBorder: 'border-green-400 bg-green-50/50',
                      activeDot:    'bg-green-500',
                    },
                    {
                      value: 'cod',
                      label: 'Cash on Delivery',
                      desc:  'Pay in cash when your order arrives',
                      icon: (
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                          💵
                        </div>
                      ),
                      activeBorder: 'border-purple-400 bg-purple-50/50',
                      activeDot:    'bg-purple-600',
                    },
                  ].map(opt => {
                    const active = formData.payment_method === opt.value
                    return (
                      <label key={opt.value}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          active ? opt.activeBorder : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                        <input type="radio" name="payment_method" value={opt.value}
                          checked={active} onChange={handleChange} className="hidden" />

                        {/* Custom radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          active ? `border-current ${opt.activeDot}` : 'border-gray-300'}`}>
                          {active && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>

                        {opt.icon}

                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{opt.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                        </div>

                        {active && (
                          <div className={`w-5 h-5 rounded-full ${opt.activeDot} flex items-center justify-center shrink-0`}>
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* eSewa info */}
              {formData.payment_method === 'esewa' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
                  <span className="text-green-500 text-lg shrink-0">ℹ️</span>
                  <div>
                    <p className="text-green-800 text-sm font-bold mb-0.5">eSewa Sandbox Credentials</p>
                    <p className="text-green-700 text-xs">ID: <span className="font-mono font-bold">9806800001</span> · Password: <span className="font-mono font-bold">Nepal@123</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:w-[320px] shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden lg:sticky lg:top-20">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h2 className="font-black text-gray-900">Order Summary</h2>
                  {buyNowData && (
                    <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ⚡ Quick Buy — Cart unchanged
                    </span>
                  )}
                </div>

                {/* Items list */}
                <div className="p-5 space-y-3 max-h-56 overflow-y-auto border-b border-gray-50">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-50 flex items-center justify-center shrink-0">
                        {item.product?.image
                          ? <img src={getProductImageUrl(item.product?.image)}
                              alt={item.product?.name} className="w-full h-full object-cover" />
                          : <span className="text-lg">🧴</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-semibold line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-gray-900 shrink-0">Rs. {item.total_price}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="p-5 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-800">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      {delivery === 0
                        ? <span className="text-green-600 font-bold">FREE</span>
                        : <span className="font-semibold text-gray-800">Rs. {delivery}</span>}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="font-black text-purple-700 text-xl">Rs. {total}</span>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={placing}
                    className="w-full text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1 text-sm"
                    style={{
                      background: formData.payment_method === 'esewa'
                        ? 'linear-gradient(135deg,#16a34a,#15803d)'
                        : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                      boxShadow: placing ? 'none' : formData.payment_method === 'esewa'
                        ? '0 8px 24px rgba(22,163,74,0.35)'
                        : '0 8px 24px rgba(124,58,237,0.35)',
                    }}>
                    {placing
                      ? <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                          Processing...
                        </span>
                      : formData.payment_method === 'esewa'
                        ? '💚 Pay with eSewa'
                        : '📦 Place Order (COD)'}
                  </button>

                  {/* Trust */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[{icon:'🔒',label:'Secure'},{icon:'💚',label:'eSewa'},{icon:'💵',label:'COD'}].map(b => (
                      <div key={b.label} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-2 border border-gray-100">
                        <span className="text-base">{b.icon}</span>
                        <span className="text-xs text-gray-500 font-semibold">{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-400">🛡️ 100% secure & encrypted</p>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}