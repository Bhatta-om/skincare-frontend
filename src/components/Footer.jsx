// src/components/Footer.jsx — Warm Sand theme
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const S = {
  bg:       '#E8D5BC',       // warm sand base
  bgDeep:   '#DEC9A8',       // slightly deeper for bottom bar
  border:   'rgba(139,92,40,0.18)',
  heading:  '#1C0E04',       // deep espresso
  muted:    '#6B4A2A',       // warm brown
  subtle:   '#9A7050',       // lighter brown
  accent:   '#8A5C28',       // deeper bronze (more contrast on sand)
  accentHov:'#6E4820',
  link:     '#7A5A3A',
  linkHov:  '#8A5C28',
  serif:    "'Playfair Display', serif",
  sans:     "'DM Sans', 'Inter', sans-serif",
}

const colHeadStyle = {
  fontFamily: S.sans,
  fontSize: '9.5px',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: S.accent,
  marginBottom: '16px',
  fontWeight: 400,
  display: 'block',
}

const FootLink = ({ to, label }) => {
  const [hov, setHov] = useState(false)
  const style = {
    fontFamily: S.sans, fontSize: '13px',
    color: hov ? S.linkHov : S.link,
    display: 'block', marginBottom: '10px',
    textDecoration: 'none', fontWeight: 300,
    transition: 'color 0.2s ease', letterSpacing: '0.01em',
  }
  if (to.startsWith('/')) {
    return (
      <Link to={to} style={style}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >{label}</Link>
    )
  }
  return (
    <a href={to} style={style}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >{label}</a>
  )
}

export default function Footer() {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleJoin = (e) => {
    e.preventDefault()
    if (email.trim()) { setSubmitted(true); setEmail('') }
  }

  const goHome = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <footer style={{ background: S.bg, color: S.heading }}>
      <style>{`
        .footer-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
          .footer-brand-col { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
          .footer-brand-col { grid-column: 1 / -1; }
          .footer-bottom-bar { flex-direction: column; align-items: center; text-align: center; }
        }
        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 18px 32px;
          max-width: 1320px;
          margin: 0 auto;
        }
      `}</style>

      {/* ── Top section ── */}
      <div style={{ borderBottom: `1px solid ${S.border}`, padding: '64px 0 48px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 32px' }}>
          <div className="footer-main-grid">

            {/* Brand + Newsletter */}
            <div className="footer-brand-col">
              {/* Logo */}
              <a href="/" onClick={goHome} style={{
                fontFamily: S.serif, fontSize: '22px', fontWeight: 600,
                color: S.heading, textDecoration: 'none',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'block', marginBottom: '6px',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = S.accent}
                onMouseLeave={e => e.currentTarget.style.color = S.heading}
              >
                SkinCare
              </a>
              {/* Gold rule */}
              <div style={{ width: '24px', height: '1.5px', background: S.accent, marginBottom: '18px' }} />

              <p style={{ fontFamily: S.sans, fontSize: '13px', color: S.muted, lineHeight: 1.75, fontWeight: 300, maxWidth: '280px', marginBottom: '28px' }}>
                Premium skincare formulated with clinically proven ingredients for visible, lasting results.
              </p>

              {/* Newsletter */}
              <p style={{ fontFamily: S.sans, fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.2em', color: S.accent, marginBottom: '12px', fontWeight: 400 }}>
                Stay in the know
              </p>
              {submitted ? (
                <p style={{ fontFamily: S.sans, fontSize: '13px', color: S.accent, fontWeight: 300 }}>
                  Thank you for subscribing!
                </p>
              ) : (
                <form onSubmit={handleJoin} style={{ display: 'flex', maxWidth: '320px' }}>
                  <input
                    type="email" value={email} required
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'rgba(139,92,40,0.1)',
                      border: `1px solid ${S.border}`,
                      borderRight: 'none',
                      color: S.heading,
                      fontFamily: S.sans, fontSize: '13px',
                      padding: '11px 16px', outline: 'none',
                      fontWeight: 300,
                    }}
                    onFocus={e => e.target.style.borderColor = S.accent}
                    onBlur={e  => e.target.style.borderColor = S.border}
                  />
                  <button type="submit" style={{
                    background: S.accent, color: '#FFFFFF',
                    border: 'none', fontFamily: S.sans,
                    fontSize: '10.5px', textTransform: 'uppercase',
                    letterSpacing: '0.14em', padding: '11px 20px',
                    cursor: 'pointer', fontWeight: 400,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'background 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = S.accentHov}
                    onMouseLeave={e => e.currentTarget.style.background = S.accent}
                  >
                    Join
                  </button>
                </form>
              )}
            </div>

            {/* Shop */}
            <div>
              <span style={colHeadStyle}>Shop</span>
              <FootLink to="/products"                       label="All Products"   />
              <FootLink to="/products?category=cleanser"     label="Cleansers"      />
              <FootLink to="/products?category=serums"       label="Serums"         />
              <FootLink to="/products?category=moisturizers" label="Moisturizers"   />
              <FootLink to="/products?category=sunscreen"    label="Sunscreen"      />
              <FootLink to="/products?ordering=-created_at"   label="New Arrivals"   />
              <FootLink to="/products?ordering=-views_count"  label="Best Sellers"   />
            </div>

            {/* Account */}
            <div>
              <span style={colHeadStyle}>Account</span>
              <FootLink to="/login"         label="Sign In"       />
              <FootLink to="/register"      label="Register"      />
              <FootLink to="/orders"        label="My Orders"     />
              <FootLink to="/wishlist"      label="My Wishlist"   />
              <FootLink to="/profile"       label="My Profile"    />
              <FootLink to="/skin-analysis" label="Skin Analysis" />
            </div>

            {/* Info + Contact */}
            <div>
              <span style={colHeadStyle}>Info</span>
              <FootLink to="#" label="About Us"        />
              <FootLink to="#" label="Ingredients"     />
              <FootLink to="#" label="Shipping Policy" />
              <FootLink to="#" label="Returns"         />
              <FootLink to="#" label="Privacy Policy"  />
              <FootLink to="#" label="Terms of Service"/>

              <div style={{ marginTop: '24px' }}>
                <span style={colHeadStyle}>Contact</span>
                <p style={{ fontFamily: S.sans, fontSize: '12.5px', color: S.muted, lineHeight: 2, fontWeight: 300 }}>
                  support@skincare.com<br />
                  +977 9800000000<br />
                  Kathmandu, Nepal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ background: S.bgDeep, borderTop: `1px solid ${S.border}` }}>
        <div className="footer-bottom-bar">
          <p style={{ fontFamily: S.sans, fontSize: '11px', color: S.subtle, fontWeight: 300 }}>
            © {new Date().getFullYear()} SkinCare Nepal. All rights reserved.
          </p>
          <p style={{ fontFamily: S.sans, fontSize: '11px', color: S.subtle, display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 300 }}>
            Crafted in Nepal with <span style={{ color: S.accent, fontSize: '13px' }}>♥</span>
          </p>
        </div>
      </div>

    </footer>
  )
}