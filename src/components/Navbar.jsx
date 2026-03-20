// src/components/Navbar.jsx — SkinMedica Layout (Clean Rewrite)
// Hamburger ≡ always visible on LEFT (desktop + mobile)
// Logo CENTERED (desktop) / absolute centered (mobile)
// Icons on RIGHT

import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { useCart }     from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import {
  Search, ShoppingBag, Heart, User, Menu, X,
  ChevronDown, LogOut, Settings, Package, FlaskConical,
  ArrowRight,
} from 'lucide-react'
import SearchBox from './SearchBox'

// ── Design tokens ─────────────────────────────────────────
const T = {
  dark:    '#16100C',
  body:    '#3A2820',
  muted:   '#7B6458',
  subtle:  '#AA9688',
  accent:  '#B8895A',
  border:  '#E6DDD3',
  borderL: '#EEE7DF',
  serif:   "'Playfair Display', serif",
  sans:    "'DM Sans', 'Inter', sans-serif",
}

// ── Responsive CSS ────────────────────────────────────────
const NAV_CSS = `
  .nav-only-mobile  { display: flex !important; }
  .nav-only-desktop { display: none !important; }
  @media (min-width: 768px) {
    .nav-only-mobile  { display: none !important; }
    .nav-only-desktop { display: flex !important; }
  }
  @keyframes megaSlideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0);     }
  }
  @keyframes menuFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .mega-menu-panel {
    animation: megaSlideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .mega-drop-link {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 300;
    color: #3A2820;
    text-decoration: none;
    padding: 7px 0;
    border-bottom: 1px solid #F4EDE4;
    letter-spacing: 0.01em;
    transition: color 0.15s ease, padding-left 0.15s ease;
    line-height: 1.4;
  }
  .mega-drop-link:last-child { border-bottom: none; }
  .mega-drop-link:hover { color: #B8895A; padding-left: 6px; }

  /* Announcement bar — scrolls away naturally */
  .announcement-bar-wrap {
    background: #16100C;
    width: 100%;
  }
  /* Navbar transparent → white transition */
  .nav-transparent { background: transparent !important; border-bottom-color: transparent !important; }
  .nav-white        { background: #FFFFFF !important; }
  nav { transition: background 0.35s ease, box-shadow 0.3s ease, border-color 0.35s ease !important; }
`

// ── Small helpers ─────────────────────────────────────────
const IconBtn = ({ children, onClick, style, title }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px', color: hov ? T.accent : T.dark,
        transition: 'color 0.2s ease', flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

const CountBadge = ({ count }) => (
  <span style={{
    position: 'absolute', top: '-6px', right: '-6px',
    background: T.accent, color: '#FFFFFF',
    fontSize: '9px', fontWeight: 500,
    borderRadius: '50%', width: '16px', height: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: 0,
  }}>
    {count > 9 ? '9+' : count}
  </span>
)

const DropLink = ({ to, children }) => (
  <Link to={to} className="mega-drop-link">{children}</Link>
)

const DropdownItem = ({ to, icon, label, accent }) => {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px',
        fontFamily: T.sans, fontSize: '13px',
        color: accent ? T.accent : T.body,
        textDecoration: 'none',
        background: hov ? '#FAF8F5' : 'transparent',
        borderRadius: '2px', fontWeight: 300,
        transition: 'background 0.2s ease',
      }}
    >
      {icon} {label}
    </Link>
  )
}

const MobileLink = ({ to, label, active, icon, accent, sub }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: sub ? '11px 24px 11px 40px' : '14px 24px',
    borderBottom: `1px solid ${T.borderL}`,
    fontFamily: T.sans, fontSize: sub ? '12px' : '11.5px',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    color: accent ? T.accent : active ? T.accent : T.body,
    textDecoration: 'none',
    background: active ? '#FAF8F5' : 'transparent',
    fontWeight: 400,
  }}>
    {icon}{label}
  </Link>
)

// ── Main Component ────────────────────────────────────────
export default function Navbar() {
  const { user, logout }                  = useAuth()
  const { cartCount = 0, fetchCartCount } = useCart() || {}
  const { wishlistIds = [] }              = useWishlist() || {}
  const navigate                          = useNavigate()

  const [scrolled,       setScrolled]       = useState(false)
  const [navHovered,     setNavHovered]     = useState(false)
  const [megaOpen,       setMegaOpen]       = useState(false)
  const [megaTimer,      setMegaTimer]      = useState(null)
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [userMenuOpen,   setUserMenuOpen]   = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)

  const location    = useLocation()
  const userMenuRef    = useRef()
  const userDropRef    = useRef()
  const navRef      = useRef()
  const wishlistCount = wishlistIds.length

  // Fetch cart
  useEffect(() => {
    if (user && typeof fetchCartCount === 'function') fetchCartCount()
  }, [user, location.pathname])

  // Close everything on route change
  useEffect(() => {
    setDrawerOpen(false); setSearchOpen(false)
    setMegaOpen(false);   setUserMenuOpen(false)
  }, [location.pathname])

  // Scroll shrink
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close user menu on outside click — checks both button and dropdown panel
  useEffect(() => {
    const fn = (e) => {
      const inButton   = userMenuRef.current  && userMenuRef.current.contains(e.target)
      const inDropdown = userDropRef.current   && userDropRef.current.contains(e.target)
      if (!inButton && !inDropdown) setUserMenuOpen(false)
    }
    if (userMenuOpen) document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [userMenuOpen])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const openMega  = () => {
    clearTimeout(megaTimer)
    // Recalculate position just before opening
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect()
      document.documentElement.style.setProperty('--navbar-bottom', `${rect.bottom}px`)
    }
    setMegaOpen(true)
  }
  const closeMega = () => { const t = setTimeout(() => setMegaOpen(false), 180); setMegaTimer(t) }

  // Keep --navbar-bottom updated for mega menu positioning
  useEffect(() => {
    const updateNavBottom = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect()
        // SCROLLED: navbar on top → announcement bar (44px) is below navbar → mega menu goes below both
        // NOT SCROLLED: announcement on top → navbar below it → mega menu goes below navbar (rect.bottom already correct)
        const extra = scrolled ? 44 : 0
        document.documentElement.style.setProperty('--navbar-bottom', `${rect.bottom + extra}px`)
      }
    }
    updateNavBottom()
    window.addEventListener('scroll', updateNavBottom, { passive: true })
    window.addEventListener('resize', updateNavBottom)
    return () => {
      window.removeEventListener('scroll', updateNavBottom)
      window.removeEventListener('resize', updateNavBottom)
    }
  }, [scrolled])

  const categories = [
    { label: 'Cleansers',    path: '/products?category=cleanser'     },
    { label: 'Serums',       path: '/products?category=serums'        },
    { label: 'Moisturizers', path: '/products?category=moisturizers'  },
    { label: 'Sunscreen',    path: '/products?category=sunscreen'     },
    { label: 'Toners',       path: '/products?category=toners'        },
    { label: 'Face Masks',   path: '/products?category=face-masks'    },
  ]

  const collections = [
    { label: 'New Arrivals',  path: '/products?ordering=-created_at'       },
    { label: 'Best Sellers',  path: '/products?ordering=-views_count'      },
    { label: 'On Sale',       path: '/products?ordering=-discount_percent' },
    { label: 'For Oily Skin', path: '/products?suitable_skin_type=oily'   },
    { label: 'For Dry Skin',  path: '/products?suitable_skin_type=dry'    },
    { label: 'View All',      path: '/products'                            },
  ]

  // Navbar height for announcement bar offset
  const navHeight = scrolled ? '60px' : '68px'
  const navH = navHeight
  const annBarH = 44 // announcement bar height in px

  // Colors based on state
  const isActivated = scrolled || navHovered  // hover OR scroll = activated state

  return (
    <>
      <style>{NAV_CSS}</style>

      {/* ══════════════════════════════════════════════════════
          TECHNIQUE: both bars always in DOM order (announcement first).
          On scroll we translateY each bar to visually swap them:
            - Navbar slides UP   by annBarH  → appears above announcement
            - Announcement slides DOWN by navH → appears below navbar
          Both transitions run simultaneously with cubic-bezier easing
          → smooth luxury crossover effect, no snap
      ══════════════════════════════════════════════════════ */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 51,
        // NOTE: overflow hidden clips the bars during swap animation cleanly
        // Dropdown uses position:fixed so it escapes this clipping
        height: `calc(${navH} + ${annBarH}px)`,
        overflow: 'hidden',
        boxShadow: scrolled ? '0 4px 24px rgba(22,16,12,0.10)' : 'none',
        transition: 'box-shadow 0.4s ease',
      }}>

        {/* ── ANNOUNCEMENT BAR
            Initial:  translateY(0)        — sits at top naturally
            Scrolled: translateY(navH)     — slides down below navbar
        ── */}
        <div
          onMouseEnter={() => setNavHovered(true)}
          onMouseLeave={() => setNavHovered(false)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: `${annBarH}px`,
            transform: scrolled ? `translateY(${navH})` : 'translateY(0)',
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), background 0.35s ease',
            background: isActivated ? '#16100C' : '#FAF8F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '14px', padding: '0 24px',
            fontFamily: T.sans, boxSizing: 'border-box',
            zIndex: 1,
          }}>
          <span style={{
            fontSize: '11px',
            color: isActivated ? '#C8B49A' : '#AA9688',
            letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300,
            transition: 'color 0.35s ease',
          }}>
            Discover Your Skin Type — Free AI Analysis in 30 Seconds
          </span>
          <span style={{ color: 'rgba(184,137,90,0.5)', fontSize: '12px' }}>→</span>
          <Link to="/skin-analysis" style={{
            fontFamily: T.sans, fontSize: '11px', color: T.accent,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 400,
            borderBottom: '1px solid rgba(184,137,90,0.4)',
            paddingBottom: '1px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#D4A96A'}
            onMouseLeave={e => e.currentTarget.style.color = T.accent}
          >
            Start Now
          </Link>
        </div>

        {/* ── NAVBAR
            Initial:  translateY(annBarH)  — sits below announcement bar
            Scrolled: translateY(0)        — slides up to top
        ── */}
        <nav ref={navRef}
          onMouseEnter={() => setNavHovered(true)}
          onMouseLeave={() => setNavHovered(false)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            transform: scrolled ? 'translateY(0)' : `translateY(${annBarH}px)`,
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), background 0.35s ease, border-color 0.35s ease',
            background: isActivated ? '#FFFFFF' : '#FAF8F5',
            borderBottom: `1px solid ${isActivated ? T.borderL : 'transparent'}`,
            zIndex: 2,
          }}>
        <div className="container-luxury" style={{
          height: navH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          transition: 'height 0.25s ease',
          paddingLeft: '20px',
        }}>

          {/* ══ LEFT: [≡ Hamburger] [SKINCARE Logo] ══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1 }}>

            {/* ≡ Hamburger — slightly pulled toward edge */}
            <IconBtn
              title="Menu"
              onClick={() => setDrawerOpen(s => !s)}
              style={{ color: drawerOpen ? T.accent : T.dark, flexShrink: 0, marginLeft: '-4px' }}
            >
              {drawerOpen
                ? <X    size={20} strokeWidth={1.5} />
                : <Menu size={20} strokeWidth={1.5} />}
            </IconBtn>

            {/* Logo — all caps, bold */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                fontFamily:    T.serif,
                fontSize:      '18px',
                fontWeight:    700,
                color:         T.dark,
                letterSpacing: '0.12em',
                textDecoration:'none',
                userSelect:    'none',
                flexShrink:    0,
                whiteSpace:    'nowrap',
                textTransform: 'uppercase',
              }}
            >
              SkinCare
            </Link>
          </div>

          {/* ══ CENTER: Nav Links (desktop only) ══ */}
          <div className="nav-only-desktop" style={{
            alignItems: 'center', gap: '36px',
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            zIndex: 52,
          }}>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>

              {/* Products mega menu trigger */}
              <div style={{ position: 'relative' }}
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <button className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  position: 'relative', zIndex: 52,
                }}>
                  Products
                  <ChevronDown size={12} strokeWidth={1.5} style={{
                    color: T.subtle,
                    transition: 'transform 0.25s ease',
                    transform: megaOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }} />
                </button>
              </div>

              <NavLink to="/skin-analysis" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ position: 'relative', zIndex: 52 }}
              >
                Skin Analysis
              </NavLink>

              {user && (
                <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ position: 'relative', zIndex: 52 }}
                >
                  Orders
                </NavLink>
              )}
            </div>

          {/* ══ RIGHT: Search + Account + Cart ══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, justifyContent: 'flex-end', zIndex: 1 }}>

            {/* Search */}
            <IconBtn title="Search" onClick={() => setSearchOpen(true)}>
              <Search size={19} strokeWidth={1.5} />
            </IconBtn>

            {user ? (
              <>
                {/* Wishlist — desktop only */}
                <div className="nav-only-desktop" style={{ alignItems: 'center' }}>
                  <Link to="/wishlist" style={{ position: 'relative', display: 'flex', color: T.dark, transition: 'color 0.2s ease' }}
                    onMouseEnter={e => e.currentTarget.style.color = T.accent}
                    onMouseLeave={e => e.currentTarget.style.color = T.dark}
                  >
                    <Heart size={19} strokeWidth={1.5}
                      fill={wishlistCount > 0 ? T.accent : 'none'}
                      style={{ color: wishlistCount > 0 ? T.accent : 'inherit' }}
                    />
                    {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
                  </Link>
                </div>

                {/* Cart */}
                <Link to="/cart" style={{ position: 'relative', display: 'flex', color: T.dark, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = T.accent}
                  onMouseLeave={e => e.currentTarget.style.color = T.dark}
                >
                  <ShoppingBag size={19} strokeWidth={1.5} />
                  {cartCount > 0 && <CountBadge count={cartCount} />}
                </Link>

                {/* Account — desktop only */}
                <div className="nav-only-desktop" style={{ position: 'relative', alignItems: 'center' }} ref={userMenuRef}>
                  {/* Button only — dropdown rendered outside wrapper below */}
                  <button
                    onClick={() => setUserMenuOpen(s => !s)}
                    onMouseEnter={e => e.currentTarget.style.color = T.accent}
                    onMouseLeave={e => e.currentTarget.style.color = T.dark}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      color: T.dark, fontFamily: T.sans, fontSize: '12px',
                      transition: 'color 0.2s ease', padding: '4px',
                    }}
                  >
                    <User size={19} strokeWidth={1.5} />
                    <span style={{ fontSize: '12px', letterSpacing: '0.02em', fontWeight: 300 }}>
                      {user?.first_name || 'Account'}
                    </span>
                    <ChevronDown size={11} strokeWidth={1.5} style={{ color: T.subtle }} />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Guest — desktop */}
                <div className="nav-only-desktop" style={{ alignItems: 'center', gap: '20px' }}>
                  <Link to="/login"    className="nav-link">Sign In</Link>
                  <Link to="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: '10.5px' }}>
                    Register
                  </Link>
                </div>
                {/* Guest — mobile sign in */}
                <div className="nav-only-mobile" style={{ alignItems: 'center' }}>
                  <Link to="/login" className="nav-link" style={{ fontSize: '11px' }}>Sign In</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      </div>{/* ── END sticky wrapper ── */}

      {/* ── User dropdown — rendered OUTSIDE sticky wrapper to escape overflow:hidden ── */}
      {userMenuOpen && user && (
        <div ref={userDropRef} style={{
          position: 'fixed',
          top: `calc(${navH} + ${annBarH}px + 8px)`,
          right: '32px',
          background: '#FFFFFF',
          border: `1px solid ${T.border}`,
          boxShadow: '0 12px 40px rgba(22,16,12,0.12)',
          minWidth: '220px',
          zIndex: 200,
          animation: 'menuFadeIn 0.18s ease forwards',
        }}>
          <div style={{ height: '2px', background: T.accent }} />
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.borderL}`, background: '#FFFCF9' }}>
            <p style={{ fontFamily: T.serif, fontSize: '15px', color: T.dark, fontWeight: 400 }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontFamily: T.sans, fontSize: '11.5px', color: T.subtle, marginTop: '3px', fontWeight: 300 }}>
              {user?.email}
            </p>
          </div>
          <div style={{ padding: '6px' }}>
            <DropdownItem to="/profile" icon={<User    size={14} strokeWidth={1.5} />} label="My Profile" />
            <DropdownItem to="/orders"  icon={<Package size={14} strokeWidth={1.5} />} label="My Orders"  />
            {user?.is_staff && (
              <DropdownItem to="/admin" icon={<Settings size={14} strokeWidth={1.5} />} label="Admin Panel" accent />
            )}
            <div style={{ height: '1px', background: T.borderL, margin: '5px 0' }} />
            <button onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', width: '100%',
                fontFamily: T.sans, fontSize: '13px', color: '#963838',
                background: 'none', border: 'none', cursor: 'pointer',
                borderRadius: '2px', textAlign: 'left', fontWeight: 300,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FCF3F3'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={14} strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Mega Menu — outside nav, smooth slide-down ── */}
      {megaOpen && (
        <div
          className="mega-menu-panel"
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          style={{
            position: 'fixed',
            top: 'var(--navbar-bottom, 112px)',
            left: 0, right: 0,
            background: '#FFFFFF',
            borderTop: `2px solid ${T.accent}`,
            borderBottom: `1px solid ${T.borderL}`,
            boxShadow: '0 20px 60px rgba(22,16,12,0.10)',
            padding: '40px 0 44px',
            zIndex: 49,
          }}
        >
          <div className="container-luxury">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 280px', gap: '48px', alignItems: 'start' }}>

              {/* Shop By Category */}
              <div>
                <p style={{ fontFamily: T.sans, fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.22em', color: T.subtle, marginBottom: '18px', fontWeight: 400, paddingBottom: '10px', borderBottom: `1px solid ${T.border}` }}>
                  Shop By Category
                </p>
                {categories.map(cat => (
                  <Link key={cat.label} to={cat.path} className="mega-drop-link" onClick={() => setMegaOpen(false)}>
                    {cat.label}
                  </Link>
                ))}
              </div>

              {/* Collections */}
              <div>
                <p style={{ fontFamily: T.sans, fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.22em', color: T.subtle, marginBottom: '18px', fontWeight: 400, paddingBottom: '10px', borderBottom: `1px solid ${T.border}` }}>
                  Collections
                </p>
                {collections.map(item => (
                  <Link key={item.label} to={item.path} className="mega-drop-link" onClick={() => setMegaOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Skin Tools */}
              <div>
                <p style={{ fontFamily: T.sans, fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.22em', color: T.subtle, marginBottom: '18px', fontWeight: 400, paddingBottom: '10px', borderBottom: `1px solid ${T.border}` }}>
                  Skin Tools
                </p>
                <Link to="/skin-analysis"        className="mega-drop-link" onClick={() => setMegaOpen(false)}>Skin Analysis</Link>
                <Link to="/products?featured=true" className="mega-drop-link" onClick={() => setMegaOpen(false)}>Recommended For You</Link>
              </div>

              {/* CTA card */}
              <div style={{ background: '#F4EDE4', border: `1px solid ${T.border}`, padding: '28px 24px' }}>
                <FlaskConical size={22} strokeWidth={1.5} style={{ color: T.accent, marginBottom: '14px' }} />
                <h4 style={{ fontFamily: T.serif, fontSize: '15px', color: T.dark, fontWeight: 400, marginBottom: '8px', lineHeight: 1.3 }}>Free Skin Analysis</h4>
                <p style={{ fontFamily: T.sans, fontSize: '12px', color: T.muted, lineHeight: 1.7, marginBottom: '18px', fontWeight: 300 }}>
                  Get personalized product recommendations for your unique skin type.
                </p>
                <Link to="/skin-analysis" className="btn-primary" onClick={() => setMegaOpen(false)}
                  style={{ fontSize: '10.5px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center' }}>
                  Analyze My Skin
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer Overlay ── */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(22,16,12,0.45)',
          opacity: drawerOpen ? 1 : 0,
          visibility: drawerOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.35s ease, visibility 0.35s ease',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* ── Side Drawer ── */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '290px',
        background: '#FFFFFF',
        boxShadow: '6px 0 30px rgba(22,16,12,0.13)',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}>
        <div style={{ height: '2px', background: `linear-gradient(to right, ${T.accent}, #D4A96A, ${T.accent})`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${T.borderL}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontFamily: T.serif, fontSize: '16px', fontWeight: 700, color: T.dark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            SkinCare
          </span>
          <IconBtn onClick={() => setDrawerOpen(false)}>
            <X size={19} strokeWidth={1.5} />
          </IconBtn>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: '14px 24px', borderBottom: `1px solid ${T.borderL}`, background: '#FFFCF9', flexShrink: 0 }}>
            <p style={{ fontFamily: T.serif, fontSize: '14px', color: T.dark }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontFamily: T.sans, fontSize: '11.5px', color: T.subtle, marginTop: '2px', fontWeight: 300 }}>
              {user?.email}
            </p>
          </div>
        )}

        {/* Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <MobileLink to="/"              label="Home"          active={location.pathname === '/'} />
          <MobileLink to="/products"      label="All Products"  active={location.pathname === '/products'} />
          <MobileLink to="/skin-analysis" label="Skin Analysis" active={location.pathname === '/skin-analysis'} />

          {/* Shop categories accordion */}
          <button
            onClick={() => setMobileShopOpen(s => !s)}
            style={{
              display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `1px solid ${T.borderL}`,
              fontFamily: T.sans, fontSize: '11.5px',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: T.muted, fontWeight: 400,
            }}
          >
            Shop By Category
            <ChevronDown size={13} strokeWidth={1.5} style={{
              color: T.subtle,
              transform: mobileShopOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.25s ease',
            }} />
          </button>
          {mobileShopOpen && (
            <div style={{ background: '#FFFCF9', paddingLeft: '16px' }}>
              {categories.map(cat => (
                <MobileLink key={cat.label} to={cat.path} label={cat.label} sub />
              ))}
            </div>
          )}

          {user && (
            <>
              <MobileLink to="/wishlist" label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`} icon={<Heart    size={15} strokeWidth={1.5} style={{ marginRight: '2px' }} />} />
              <MobileLink to="/orders"  label="My Orders"                                                       icon={<Package  size={15} strokeWidth={1.5} style={{ marginRight: '2px' }} />} />
              <MobileLink to="/profile" label="My Profile"                                                      icon={<User     size={15} strokeWidth={1.5} style={{ marginRight: '2px' }} />} />
              {user?.is_staff && (
                <MobileLink to="/admin" label="Admin Panel" icon={<Settings size={15} strokeWidth={1.5} style={{ marginRight: '2px' }} />} accent />
              )}
            </>
          )}

          {!user && (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/login"    className="btn-outline" style={{ justifyContent: 'center' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ justifyContent: 'center' }}>Register</Link>
            </div>
          )}
        </nav>

        {/* Logout */}
        {user && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: T.sans, fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#963838', padding: 0, fontWeight: 400,
            }}>
              <LogOut size={15} strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ── Search Overlay — SkinMedica Style ── */}
      {searchOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(22,16,12,0.45)',
            backdropFilter: 'blur(2px)',
            animation: 'pageFadeIn 0.2s ease',
          }}
        >
          <div style={{ background: '#FFFFFF', width: '100%', boxShadow: '0 8px 40px rgba(22,16,12,0.12)' }}>

            {/* Input row — underline only */}
            <div style={{ background: '#FAF8F5', borderBottom: `1px solid ${T.border}` }}>
              <div className="container-luxury" style={{ display: 'flex', alignItems: 'center', height: '68px', gap: '14px' }}>
                <Search size={17} strokeWidth={1.5} style={{ color: '#AA9688', flexShrink: 0 }} />
                <div style={{ flex: 1, borderBottom: '1.5px solid #16100C', position: 'relative' }}>
                  <SearchBox
                    variant="overlay"
                    placeholder="Search by product name, type, or keyword"
                    autoFocus
                    onClose={() => setSearchOpen(false)}
                  />
                </div>
                <IconBtn onClick={() => setSearchOpen(false)} style={{ flexShrink: 0 }}>
                  <X size={19} strokeWidth={1.5} />
                </IconBtn>
              </div>
            </div>

            {/* Popular Categories */}
            <div style={{ background: '#FFFFFF', padding: '32px 0 40px' }}>
              <div className="container-luxury">
                <h3 style={{ fontFamily: T.serif, fontSize: '22px', color: T.dark, fontWeight: 400, marginBottom: '24px' }}>
                  Popular Categories
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {categories.slice(0, 4).map((cat, i) => {
                    const bgs = ['#EBD9C6', '#F4EDE4', '#E8D5C0', '#EDD9C5']
                    return (
                      <button key={cat.label}
                        onClick={() => { navigate(cat.path); setSearchOpen(false) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                      >
                        <div style={{
                          height: '160px', background: bgs[i],
                          marginBottom: '10px', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'opacity 0.2s ease',
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            border: '1px solid rgba(184,137,90,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent,
                          }}>
                            <FlaskConical size={22} strokeWidth={1} />
                          </div>
                        </div>
                        <p style={{
                          fontFamily: T.sans, fontSize: '13.5px', color: T.body,
                          fontWeight: 300, textDecoration: 'underline',
                          textUnderlineOffset: '3px', transition: 'color 0.2s ease',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = T.accent}
                          onMouseLeave={e => e.currentTarget.style.color = T.body}
                        >
                          {cat.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}