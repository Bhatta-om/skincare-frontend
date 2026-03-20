// src/pages/EsewaSuccess.jsx — SkinMedica Luxury Redesign
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { CheckCircle, XCircle, ArrowRight, Home, Package } from 'lucide-react'

export default function EsewaSuccess() {
  const navigate = useNavigate()
  const [status,  setStatus]  = useState('verifying') // verifying | success | failed
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        const params  = new URLSearchParams(window.location.search)
        const data    = params.get('data')
        const orderId = localStorage.getItem('pending_order_id')

        if (!data || !orderId) {
          setStatus('failed')
          setMessage('Missing payment data. Please contact support.')
          return
        }

        const res = await api.post('/payments/esewa/verify/', {
          data:     data,
          order_id: parseInt(orderId),
        })

        if (res.data.success) {
          localStorage.removeItem('pending_order_id')
          setStatus('success')
          setMessage(`Rs. ${res.data.payment?.amount} verified successfully`)
          setTimeout(() => navigate('/orders'), 3500)
        } else {
          setStatus('failed')
          setMessage(res.data.error || 'Payment verification failed.')
        }
      } catch (err) {
        setStatus('failed')
        setMessage(err.response?.data?.error || 'Payment verification failed. Please contact support.')
      }
    }

    verify()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#16100C', letterSpacing: '0.04em' }}>
            SkinCare
          </span>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', overflow: 'hidden' }}>

          {/* Top accent line — changes color by status */}
          <div style={{
            height: '3px',
            background: status === 'success'
              ? '#4A7A57'
              : status === 'failed'
              ? '#963838'
              : 'linear-gradient(to right, #B8895A, #D4A96A, #B8895A)',
          }} />

          <div style={{ padding: '48px 40px', textAlign: 'center' }}>

            {/* ── Verifying ── */}
            {status === 'verifying' && (
              <>
                {/* Animated spinner */}
                <div style={{
                  width: '72px', height: '72px',
                  border: '1px solid #E6DDD3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                  background: '#FDFAF7',
                }}>
                  <div style={{
                    width: '32px', height: '32px',
                    border: '1.5px solid #E6DDD3',
                    borderTopColor: '#B8895A',
                    borderRadius: '50%',
                    animation: 'luxurySpinner 0.9s linear infinite',
                  }} />
                </div>

                <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                  eSewa Payment
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>
                  Verifying Payment
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300 }}>
                  Please wait while we confirm your payment with eSewa.
                </p>

                {/* Animated dots */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '28px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#B8895A',
                      animation: 'dotPulse 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.22}s`,
                    }} />
                  ))}
                </div>
              </>
            )}

            {/* ── Success ── */}
            {status === 'success' && (
              <>
                {/* Success icon */}
                <div style={{
                  width: '72px', height: '72px',
                  border: '1px solid #C4DAC8',
                  background: '#EEF6F1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                }}>
                  <CheckCircle size={28} strokeWidth={1.5} style={{ color: '#4A7A57' }} />
                </div>

                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#4A7A57', marginBottom: '12px', fontWeight: 400 }}>
                  Payment Confirmed
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>
                  Payment Successful
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, marginBottom: '28px' }}>
                  {message}
                </p>

                {/* Confirmation card */}
                <div style={{ background: '#EEF6F1', border: '1px solid #C4DAC8', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Package size={16} strokeWidth={1.5} style={{ color: '#4A7A57', flexShrink: 0 }} />
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#4A7A57', fontWeight: 300, textAlign: 'left', lineHeight: 1.6 }}>
                    Your order has been confirmed. Redirecting to your orders in a moment...
                  </p>
                </div>

                {/* Redirect progress bar */}
                <div style={{ height: '2px', background: '#E6DDD3', marginBottom: '28px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#4A7A57', animation: 'redirectProgress 3.5s linear forwards' }} />
                </div>

                <button
                  onClick={() => navigate('/orders')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '8px', background: '#4A7A57' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3A6044'}
                  onMouseLeave={e => e.currentTarget.style.background = '#4A7A57'}
                >
                  <Package size={15} strokeWidth={1.5} />
                  View My Orders
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </>
            )}

            {/* ── Failed ── */}
            {status === 'failed' && (
              <>
                {/* Error icon */}
                <div style={{
                  width: '72px', height: '72px',
                  border: '1px solid #D8BEBE',
                  background: '#FCF3F3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                }}>
                  <XCircle size={28} strokeWidth={1.5} style={{ color: '#963838' }} />
                </div>

                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#963838', marginBottom: '12px', fontWeight: 400 }}>
                  Payment Failed
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>
                  Verification Failed
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, marginBottom: '28px' }}>
                  {message}
                </p>

                {/* Error notice */}
                <div className="alert-error" style={{ marginBottom: '28px', textAlign: 'left' }}>
                  <XCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  If your amount was deducted, please contact our support team with your order reference.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                  >
                    Try Again
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="btn-outline"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                  >
                    <Home size={14} strokeWidth={1.5} />
                    Go to Home
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Help text */}
        {status !== 'verifying' && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', color: '#AA9688', textAlign: 'center', marginTop: '20px', fontWeight: 300 }}>
            Need help?{' '}
            <a href="mailto:support@skincare.com" style={{ color: '#B8895A', textDecoration: 'none' }}>
              Contact support
            </a>
          </p>
        )}

        {/* CSS Animations */}
        <style>{`
          @keyframes dotPulse {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40%            { opacity: 1;   transform: scale(1);   }
          }
          @keyframes redirectProgress {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}