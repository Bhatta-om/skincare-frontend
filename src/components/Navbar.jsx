// src/components/Navbar.jsx — 100% Professional Mobile Polish
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { useCart }     from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import SearchBox from './SearchBox'

export default function Navbar() {
  const { user, logout }                  = useAuth()
  const { cartCount = 0, fetchCartCount } = useCart() || {}
  const { wishlistIds = [] }              = useWishlist() || {}
  const [menuOpen, setMenuOpen]           = useState(false)
  const [mobileSearch, setMobileSearch]   = useState(false)
  const [scrolled, setScrolled]           = useState(false)
  const location                          = useLocation()
  const menuRef                           = useRef()

  useEffect(() => {
    if (user && typeof fetchCartCount === 'function') fetchCartCount()
  }, [user, location.pathname])

  useEffect(() => {
    setMenuOpen(false)
    setMobileSearch(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const wishlistCount = wishlistIds.length
  const isActive = (path) => location.pathname === path

  return (
    <nav ref={menuRef} className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm border-b border-gray-100'}`}>

      {/* ── Main Bar ── */}
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-purple-600 tracking-tight">✨ SkinCare</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-lg mx-4">
          <SearchBox variant="inline" placeholder="Search products, brands, categories..." />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 ml-auto shrink-0">
          {[
            { to: '/',              label: 'Home'          },
            { to: '/products',      label: 'Products'      },
            { to: '/skin-analysis', label: 'Skin Analysis' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(to) ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'}`}>
              {label}
            </Link>
          ))}

          <div className="w-px h-5 bg-gray-200 mx-2" />

          {user ? (
            <div className="flex items-center gap-1">
              {user?.is_staff && (
                <Link to="/admin"
                  className="flex items-center gap-1.5 text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                  👑 <span>Admin</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" title="Wishlist"
                className="relative p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                <svg className="w-5 h-5" fill={wishlistCount > 0 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  style={{ color: wishlistCount > 0 ? '#ef4444' : undefined }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" title="Cart"
                className="relative p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-xs font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <Link to="/orders" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/orders') ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'}`}>
                Orders
              </Link>

              <Link to="/profile"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ml-1">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:block">{user?.first_name || 'Profile'}</span>
              </Link>

              <button onClick={logout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1" title="Logout">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Right Icons ── */}
        <div className="md:hidden flex items-center gap-0.5 ml-auto">

          {/* Search toggle */}
          <button onClick={() => { setMobileSearch(s => !s); setMenuOpen(false) }}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${mobileSearch ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}>
            {mobileSearch
              ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>}
          </button>

          {user && (
            <>
              {/* Wishlist */}
              <Link to="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill={wishlistCount > 0 ? '#ef4444' : 'none'} viewBox="0 0 24 24" stroke={wishlistCount > 0 ? '#ef4444' : 'currentColor'} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-xs font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button onClick={() => { setMenuOpen(s => !s); setMobileSearch(false) }}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${menuOpen ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            {menuOpen
              ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>}
          </button>
        </div>
      </div>

      {/* ── Mobile Search ── */}
      {mobileSearch && (
        <div className="md:hidden px-4 pb-3 border-t border-gray-100 pt-3 bg-white">
          <SearchBox variant="inline" placeholder="Search products, brands..." autoFocus />
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          {/* User info strip */}
          {user && (
            <div className="px-4 py-3 bg-purple-50 flex items-center gap-3 border-b border-purple-100">
              <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Welcome!'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="px-3 py-3 space-y-0.5">
            {[
              { to: '/',              label: '🏠 Home',          auth: false },
              { to: '/products',      label: '🧴 Products',      auth: false },
              { to: '/skin-analysis', label: '🔬 Skin Analysis', auth: false },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="h-px bg-gray-100 my-2" />

                {user?.is_staff && (
                  <Link to="/admin"
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors">
                    👑 Admin Dashboard
                  </Link>
                )}

                {[
                  { to: '/orders',  label: '📦 My Orders'  },
                  { to: '/profile', label: '👤 My Profile' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive(to) ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {label}
                  </Link>
                ))}

                <div className="h-px bg-gray-100 my-2" />

                <button onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-gray-100 my-2" />
                <Link to="/login" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  🔐 Login
                </Link>
                <Link to="/register"
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors mt-1">
                  Register Free →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}