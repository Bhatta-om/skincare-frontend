// src/pages/EsewaFailure.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowRight, Home, ShoppingBag, AlertTriangle } from 'lucide-react'

const interFont = 'Inter, sans-serif'
const serifFont = 'Playfair Display, serif'

export default function EsewaFailure() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            fontFamily: serifFont,
            fontSize: '22px',
            color: '#1A0F0A',
            letterSpacing: '0.05em',
          }}>
            SkinCare
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8DDD4',
          overflow: 'hidden',
        }}>

          {/* Top red accent line */}
          <div style={{ height: '3px', background: '#9B3A3A' }} />

          <div style={{ padding: '48px 40px', textAlign: 'center' }}>

            {/* Error Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              border: '1px solid #DCC0C0',
              background: '#FDF5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
            }}>
              <XCircle size={28} strokeWidth={1.5} color="#9B3A3A" />
            </div>

            {/* Eyebrow */}
            <p style={{
              fontFamily: interFont,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: '#9B3A3A',
              marginBottom: '12px',
              fontWeight: 500,
            }}>
              Payment Cancelled
            </p>

            {/* Heading */}
            <h2 style={{
              fontFamily: serifFont,
              fontSize: '28px',
              color: '#1A0F0A',
              fontWeight: 400,
              marginBottom: '12px',
              letterSpacing: '-0.01em',
            }}>
              Payment Failed
            </h2>

            {/* Divider */}
            <div style={{
              width: '40px',
              height: '1px',
              background: '#9B3A3A',
              margin: '0 auto 20px',
            }} />

            {/* Message */}
            <p style={{
              fontFamily: interFont,
              fontSize: '14px',
              color: '#7A6355',
              lineHeight: 1.75,
              marginBottom: '28px',
            }}>
              Your payment was not completed successfully.
              Your order has not been placed and no amount
              has been charged from your account.
            </p>

            {/* Info box */}
            <div style={{
              background: '#FDF5F5',
              border: '1px solid #DCC0C0',
              padding: '16px 18px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              textAlign: 'left',
            }}>
              <AlertTriangle
                size={15}
                strokeWidth={1.5}
                color="#9B3A3A"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <p style={{
                fontFamily: interFont,
                fontSize: '13px',
                color: '#9B3A3A',
                lineHeight: 1.65,
                margin: 0,
              }}>
                If any amount was deducted from your eSewa account,
                it will be automatically refunded within 24 hours.
                Please contact support if the issue persists.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Try Again */}
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%',
                  background: '#1A0F0A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 32px',
                  fontFamily: interFont,
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '2px',
                  transition: 'background 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3D2B1F' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1A0F0A' }}
              >
                Try Again
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>

              {/* Back to Cart */}
              <button
                onClick={() => navigate('/cart')}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#1A0F0A',
                  border: '1.5px solid #1A0F0A',
                  padding: '13px 32px',
                  fontFamily: interFont,
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '2px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1A0F0A'
                  e.currentTarget.style.color = '#FFFFFF'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#1A0F0A'
                }}
              >
                <ShoppingBag size={14} strokeWidth={1.5} />
                Back to Cart
              </button>

              {/* Go Home */}
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#7A6355',
                  border: 'none',
                  padding: '10px',
                  fontFamily: interFont,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C49A6C' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A6355' }}
              >
                <Home size={14} strokeWidth={1.5} />
                Go to Home
              </button>

            </div>
          </div>
        </div>

        {/* Help text */}
        <div style={{
          fontFamily: interFont,
          fontSize: '12px',
          color: '#A89585',
          textAlign: 'center',
          marginTop: '20px',
          letterSpacing: '0.02em',
        }}>
          <span>Need help? </span>
          <a
            href="mailto:support@skincare.com"
            style={{ color: '#C49A6C', textDecoration: 'underline' }}
          >
            Contact support
          </a>
        </div>

      </div>
    </div>
  )
}