// src/pages/Home.jsx — 100% Professional Mobile Polish
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { HomeSkeleton } from '../components/Skeleton'
import { getProductImageUrl } from '../utils/productImage'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/products/?is_featured=true&page_size=4')
      .then(res => setFeatured(res.data.results || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative bg-linear-to-br from-purple-700 via-purple-600 to-pink-500 text-white overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-300/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 py-14 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Skin Analysis — Free
          </div>

          <h1 className="text-4xl sm:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Know Your Skin.<br />
            <span className="text-yellow-300">Glow Better.</span>
          </h1>

          <p className="text-base sm:text-xl text-purple-100 mb-8 max-w-lg mx-auto leading-relaxed">
            Personalized skincare powered by AI. Find your skin type and the products made for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/skin-analysis"
              className="bg-white text-purple-700 font-bold px-8 py-4 rounded-2xl hover:bg-yellow-50 active:scale-95 transition-all shadow-xl shadow-purple-900/25 text-base">
              ✨ Analyze My Skin — Free
            </Link>
            <Link to="/products"
              className="border-2 border-white/60 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-base backdrop-blur-sm">
              Shop Products →
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex items-center justify-center gap-3 sm:gap-8 mt-10 flex-wrap">
            {[
              { icon: '🎯', label: '96% Accuracy' },
              { icon: '🧴', label: '500+ Products' },
              { icon: '⚡', label: '30 Sec Analysis' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-sm">{t.icon}</span>
                <span className="text-purple-100 text-xs sm:text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-12 sm:py-20 px-5 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-purple-600 text-sm font-bold uppercase tracking-widest mb-2">Why SkinCare</p>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900">Everything for Healthy Skin</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: '🔬', title: 'AI Skin Analysis',
                desc: 'Our CNN model identifies your skin type with 96% accuracy — dry, oily, or normal.',
                color: 'bg-purple-600', light: 'bg-purple-50 border-purple-100',
              },
              {
                icon: '💊', title: 'Personalized Picks',
                desc: 'Recommendations tailored to your skin type, age, and gender — not generic lists.',
                color: 'bg-pink-500', light: 'bg-pink-50 border-pink-100',
              },
              {
                icon: '🛡️', title: 'Trusted Brands',
                desc: 'Curated collection of dermatologist-recommended products you can trust.',
                color: 'bg-blue-600', light: 'bg-blue-50 border-blue-100',
              },
            ].map((f, i) => (
              <div key={i} className={`rounded-2xl p-6 sm:p-8 border-2 ${f.light} hover:shadow-lg transition-all group`}>
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 sm:py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-purple-600 text-sm font-bold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              { step: '1', icon: '📸', title: 'Upload Photo',  desc: 'Clear selfie in good lighting', color: 'bg-purple-100 text-purple-600' },
              { step: '2', icon: '🤖', title: 'AI Analyzes',   desc: 'CNN model reads your skin',    color: 'bg-pink-100 text-pink-600'   },
              { step: '3', icon: '📋', title: 'Get Results',   desc: 'See your skin type & profile', color: 'bg-blue-100 text-blue-600'   },
              { step: '4', icon: '🛒', title: 'Shop Products', desc: 'Buy what\'s made for you',     color: 'bg-green-100 text-green-600' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${s.color} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 font-black`}>
                  {s.icon}
                </div>
                <div className="text-purple-500 font-black text-xs mb-1 tracking-widest">STEP {s.step}</div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{s.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA inline */}
          <div className="mt-10 sm:mt-14 text-center">
            <Link to="/skin-analysis"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-purple-200 text-sm sm:text-base">
              ✨ Try It Free Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-12 sm:py-20 px-5 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-6 sm:mb-10">
            <div>
              <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-1">Handpicked</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Featured Products</h2>
            </div>
            <Link to="/products"
              className="hidden sm:flex items-center gap-1 text-purple-600 font-semibold hover:text-purple-700 text-sm bg-white border border-purple-200 px-4 py-2 rounded-xl transition-colors hover:border-purple-400">
              View All →
            </Link>
          </div>

          {loading ? (
            <HomeSkeleton />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
              {featured.map(product => (
                <Link key={product.id} to={`/products/${product.slug}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group active:scale-95 border border-gray-100 hover:border-purple-200">
                  {/* Image */}
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 h-36 sm:h-48 flex items-center justify-center overflow-hidden relative">
                    {product.image
                      ? <img src={getProductImageUrl(product.image)} alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <span className="text-5xl">🧴</span>}
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{product.discount_percent}%
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <p className="text-xs text-purple-600 font-bold mb-0.5 truncate">{product.brand}</p>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-black text-sm sm:text-base">Rs. {product.discounted_price}</span>
                      {product.discount_percent > 0 && (
                        <span className="text-gray-400 text-xs line-through">Rs. {product.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-16">No featured products found.</div>
          )}

          {/* Mobile "View All" */}
          <div className="mt-5 sm:hidden">
            <Link to="/products"
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all">
              Browse All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SHOP BY SKIN TYPE ── */}
      <section className="py-12 sm:py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-1">Curated For You</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Shop By Skin Type</h2>
          </div>
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible scrollbar-hide">
            {[
              { type: 'oily',        emoji: '💧', label: 'Oily',        color: 'bg-amber-50   border-amber-200   text-amber-700   hover:bg-amber-100'   },
              { type: 'dry',         emoji: '🌵', label: 'Dry',         color: 'bg-sky-50     border-sky-200     text-sky-700     hover:bg-sky-100'     },
              { type: 'normal',      emoji: '✨', label: 'Normal',      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
              { type: 'combination', emoji: '🌓', label: 'Combination', color: 'bg-violet-50  border-violet-200  text-violet-700  hover:bg-violet-100'  },
              { type: 'sensitive',   emoji: '🌸', label: 'Sensitive',   color: 'bg-rose-50    border-rose-200    text-rose-700    hover:bg-rose-100'    },
            ].map(s => (
              <Link key={s.type} to={`/products?skin_type=${s.type}`}
                className={`shrink-0 flex flex-col items-center gap-2.5 px-5 py-4 sm:py-5 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-md active:scale-95 ${s.color}`}>
                <span className="text-3xl">{s.emoji}</span>
                <span className="whitespace-nowrap">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 sm:py-24 px-5 bg-linear-to-br from-purple-700 via-purple-600 to-pink-500 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-yellow-300 font-bold text-xs uppercase tracking-widest mb-3">It's 100% Free</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">Ready to Glow?</h2>
          <p className="text-purple-100 text-base sm:text-lg mb-8 max-w-sm mx-auto leading-relaxed">
            Start your skin analysis today — takes only 30 seconds!
          </p>
          <Link to="/skin-analysis"
            className="inline-block bg-white text-purple-700 font-black px-10 py-4 rounded-2xl hover:bg-yellow-50 active:scale-95 transition-all text-base sm:text-lg shadow-2xl shadow-purple-900/40">
            ✨ Get Started Free
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400 px-5 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
            {/* Brand */}
            <div className="max-w-xs">
              <p className="text-xl font-black text-white mb-2">✨ SkinCare</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your AI-powered skincare companion. Know your skin, glow better.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
              {[
                { to: '/products',      label: 'Products'      },
                { to: '/skin-analysis', label: 'Skin Analysis' },
                { to: '/cart',          label: 'Cart'          },
                { to: '/orders',        label: 'Orders'        },
                { to: '/wishlist',      label: 'Wishlist'      },
                { to: '/profile',       label: 'Profile'       },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-gray-500 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-600">© 2026 SkinCare App. All rights reserved.</p>
            <p className="text-xs text-gray-700">Made with ❤️ for healthy skin</p>
          </div>
        </div>
      </footer>

    </div>
  )
}