// src/pages/SkinAnalysis.jsx — 100% Professional + Tailwind v4
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'

// ── Skin config ────────────────────────────────────────────
const SKIN_CONFIG = {
  oily: {
    gradient: 'from-amber-400 to-orange-500',
    lightBg:  'bg-amber-50',
    border:   'border-amber-200',
    text:     'text-amber-700',
    badge:    'bg-amber-100 text-amber-800',
    bar:      'bg-amber-500',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707"/>
      </svg>
    ),
    label: 'Oily Skin',
    desc:  'Your skin produces excess sebum. Focus on balancing & controlling shine.',
    tips: [
      { icon: '🧴', text: 'Use oil-free, non-comedogenic moisturizer' },
      { icon: '💧', text: 'Cleanse twice daily with gentle foaming wash' },
      { icon: '🌿', text: 'Use mattifying SPF-30+ sunscreen daily' },
      { icon: '✨', text: 'Try niacinamide serum to regulate oil production' },
      { icon: '🚿', text: 'Avoid over-washing — it triggers more oil' },
      { icon: '🍃', text: 'Look for salicylic acid or BHA exfoliants' },
    ],
  },
  dry: {
    gradient: 'from-sky-400 to-blue-600',
    lightBg:  'bg-sky-50',
    border:   'border-sky-200',
    text:     'text-sky-700',
    badge:    'bg-sky-100 text-sky-800',
    bar:      'bg-sky-500',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 3.185-9 7.116 0 2.873 2.04 5.388 5.07 6.543C9.01 18.72 10.46 21 12 21s2.99-2.28 3.93-4.341C18.96 15.504 21 12.989 21 10.116 21 6.185 16.97 3 12 3z"/>
      </svg>
    ),
    label: 'Dry Skin',
    desc:  'Your skin lacks moisture. Prioritize hydration and barrier repair.',
    tips: [
      { icon: '🧴', text: 'Use rich, cream-based moisturizer twice daily' },
      { icon: '💧', text: 'Apply hyaluronic acid serum on damp skin' },
      { icon: '🚿', text: 'Avoid hot showers — use lukewarm water' },
      { icon: '🌙', text: 'Use overnight sleeping mask 2-3x per week' },
      { icon: '🛡️', text: 'Choose gentle, fragrance-free cleanser' },
      { icon: '🥤', text: 'Drink 8+ glasses of water daily' },
    ],
  },
  normal: {
    gradient: 'from-emerald-400 to-green-600',
    lightBg:  'bg-emerald-50',
    border:   'border-emerald-200',
    text:     'text-emerald-700',
    badge:    'bg-emerald-100 text-emerald-800',
    bar:      'bg-emerald-500',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
    label: 'Normal Skin',
    desc:  'Well-balanced skin with good hydration. Maintain and protect.',
    tips: [
      { icon: '☀️', text: 'Apply SPF 30+ sunscreen every morning' },
      { icon: '💧', text: 'Maintain hydration with light moisturizer' },
      { icon: '🧼', text: 'Use gentle cleanser morning and night' },
      { icon: '✨', text: 'Add Vitamin C serum for antioxidant protection' },
      { icon: '🌙', text: 'Use retinol at night for anti-aging benefits' },
      { icon: '🍃', text: 'Exfoliate 1-2x per week for radiant glow' },
    ],
  },
  combination: {
    gradient: 'from-violet-400 to-purple-600',
    lightBg:  'bg-violet-50',
    border:   'border-violet-200',
    text:     'text-violet-700',
    badge:    'bg-violet-100 text-violet-800',
    bar:      'bg-violet-500',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
      </svg>
    ),
    label: 'Combination Skin',
    desc:  'Oily T-zone with normal/dry cheeks. Target each zone differently.',
    tips: [
      { icon: '🎯', text: 'Use different products for T-zone vs cheeks' },
      { icon: '💧', text: 'Lightweight gel moisturizer for whole face' },
      { icon: '🧴', text: 'Clay mask on T-zone 1-2x per week' },
      { icon: '✨', text: 'Niacinamide serum balances both zones' },
      { icon: '🌿', text: 'Gentle non-stripping cleanser daily' },
      { icon: '☀️', text: 'Oil-free SPF sunscreen every morning' },
    ],
  },
  sensitive: {
    gradient: 'from-rose-400 to-pink-600',
    lightBg:  'bg-rose-50',
    border:   'border-rose-200',
    text:     'text-rose-700',
    badge:    'bg-rose-100 text-rose-800',
    bar:      'bg-rose-500',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
      </svg>
    ),
    label: 'Sensitive Skin',
    desc:  'Your skin reacts easily. Choose gentle, minimal ingredient products.',
    tips: [
      { icon: '🌿', text: 'Use fragrance-free, hypoallergenic products' },
      { icon: '🧪', text: 'Patch test every new product before using' },
      { icon: '❄️', text: 'Avoid extreme temperatures on face' },
      { icon: '🛡️', text: 'Centella asiatica & ceramides soothe skin' },
      { icon: '🚫', text: 'Avoid harsh exfoliants and physical scrubs' },
      { icon: '💧', text: 'Minimal routine: cleanser, moisturizer, SPF' },
    ],
  },
}

const getSkinConfig = (type) => SKIN_CONFIG[type] || SKIN_CONFIG.normal

// ── How it works steps ─────────────────────────────────────
const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Photo',     desc: 'Take or upload a clear face photo in good lighting' },
  { step: '02', title: 'Enter Details',    desc: 'Provide your age and gender for accurate analysis'  },
  { step: '03', title: 'AI Analysis',      desc: 'Our AI analyzes your skin type and condition'       },
  { step: '04', title: 'Get Results',      desc: 'Receive personalized tips and product recommendations' },
]

export default function SkinAnalysis() {
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const navigate           = useNavigate()

  const [image,    setImage]    = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [age,      setAge]      = useState('')
  const [gender,   setGender]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [addingId, setAddingId] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleImage = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image)  { setError('Please upload a face photo.'); return }
    if (!age)    { setError('Please enter your age.'); return }
    if (!gender) { setError('Please select your gender.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', image)
      fd.append('age', age)
      fd.append('gender', gender)
      const res = await api.post('/skin-analysis/analyze/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      // Smooth scroll to result
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior:'smooth' }), 100)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Try a clearer, well-lit photo.')
    } finally { setLoading(false) }
  }

  const addToCart = async (productId) => {
    if (!user) { navigate('/login'); return }
    setAddingId(productId)
    try {
      await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 })
      await fetchCartCount()
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add.')
    } finally { setAddingId(null) }
  }

  const buyNow = (product) => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity: 1 } } })
  }

  const resetAnalysis = () => {
    setResult(null); setImage(null); setPreview(null); setAge(''); setGender(''); setError('')
  }

  const cfg = result ? getSkinConfig(result.analysis.skin_type) : null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ── */}
      <div className="relative text-white overflow-hidden" style={{background:'linear-gradient(135deg,#1e0a3c 0%,#3b0764 40%,#581c87 70%,#7e1d6e 100%)'}}>
        {/* Mesh bg dots */}
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',backgroundSize:'28px 28px'}} />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(168,85,247,0.25) 0%,transparent 70%)',transform:'translate(30%,-30%)'}} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(236,72,153,0.18) 0%,transparent 70%)',transform:'translate(-30%,30%)'}} />

        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center gap-10">

            {/* Left — text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 border"
                style={{background:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.85)'}}>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                AI-Powered · Free to use
              </div>

              <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight tracking-tight">
                Discover Your
                <span className="block" style={{background:'linear-gradient(90deg,#f0abfc,#fb7185)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  Skin Type
                </span>
              </h1>

              <p className="text-sm sm:text-base leading-relaxed max-w-sm mx-auto sm:mx-0 mb-6"
                style={{color:'rgba(255,255,255,0.6)'}}>
                Upload a face photo — our AI analyzes your skin in seconds and recommends products that genuinely work for your skin.
              </p>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[
                  {icon:'🔒', text:'Photo not stored'},
                  {icon:'⚡', text:'Results in seconds'},
                  {icon:'🎯', text:'Personalized picks'},
                ].map((f,i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.7)'}}>
                    <span>{f.icon}</span>{f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — skin type grid */}
            <div className="shrink-0 hidden sm:block">
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-center"
                style={{color:'rgba(255,255,255,0.35)'}}>Skin Types We Detect</p>
              <div className="grid grid-cols-2 gap-2 w-52">
                {[
                  { label:'Oily',        sub:'Shiny, large pores',  icon:'☀️', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.3)'  },
                  { label:'Dry',         sub:'Tight & flaky',        icon:'💧', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.3)'  },
                  { label:'Normal',      sub:'Balanced & clear',     icon:'✨', bg:'rgba(52,211,153,0.12)',  border:'rgba(52,211,153,0.3)'  },
                  { label:'Combination', sub:'Mixed zones',          icon:'⚡', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.3)' },
                  { label:'Sensitive',   sub:'Reactive skin',        icon:'🌸', bg:'rgba(251,113,133,0.12)', border:'rgba(251,113,133,0.3)' },
                ].map((t,i) => (
                  <div key={i}
                    className={`${i===3||i===4?'col-span-2':''} rounded-2xl px-3 py-2.5`}
                    style={{background:t.bg, border:`1px solid ${t.border}`}}>
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{t.icon}</span>
                      <div className="min-w-0">
                        <p className="text-white font-black text-xs leading-tight truncate">{t.label}</p>
                        <p className="text-xs leading-tight truncate" style={{color:'rgba(255,255,255,0.45)'}}>{t.sub}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">

        {/* ── How it works ── */}
        {!result && (
          <div className="mb-10">
            <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-6">How It Works</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center relative overflow-hidden group hover:border-purple-200 transition-all">
                  <div className="absolute top-0 right-0 text-5xl font-black text-gray-50 leading-none select-none">
                    {step.step}
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2.5 relative z-10">
                    <span className="text-purple-600 font-black text-sm">{i + 1}</span>
                  </div>
                  <p className="font-black text-gray-900 text-xs sm:text-sm mb-1 relative z-10">{step.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed relative z-10 hidden sm:block">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Upload Form ── */}
        {!result && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-black text-gray-900">Skin Analysis</h2>
                <p className="text-xs text-gray-400">Upload a clear face photo for best results</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Upload area */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Face Photo <span className="text-red-400">*</span>
                </label>
                <div
                  onClick={() => !preview && fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl transition-all ${
                    dragOver ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                    : preview ? 'border-purple-300 bg-purple-50/30 cursor-default'
                    : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50/30 cursor-pointer'}`}>

                  {preview ? (
                    <div className="p-4 flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative shrink-0">
                        <img src={preview} alt="preview"
                          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-2xl border-2 border-purple-200 shadow-md" />
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="font-black text-gray-900 mb-1">Photo uploaded!</p>
                        <p className="text-gray-400 text-sm mb-3">{image?.name}</p>
                        <div className="flex gap-2 justify-center sm:justify-start">
                          <button type="button" onClick={() => fileRef.current.click()}
                            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-3 py-1.5 rounded-xl transition-colors">
                            Change Photo
                          </button>
                          <button type="button" onClick={() => { setImage(null); setPreview(null) }}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-600 font-bold px-3 py-1.5 rounded-xl transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 sm:py-14 px-6 text-center">
                      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                        </svg>
                      </div>
                      <p className="font-black text-gray-800 mb-1">Drop your photo here</p>
                      <p className="text-gray-400 text-sm mb-3">or click to browse files</p>
                      <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                        JPG, PNG, WEBP — Max 10MB
                      </span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={e => e.target.files[0] && handleImage(e.target.files[0])} className="hidden" />
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-1.5">
                    Age <span className="text-red-400">*</span>
                  </label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 25" min="10" max="100"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-1.5">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors cursor-pointer">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Photo tips */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wide mb-2">📸 Tips for best results</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Good lighting (natural or bright)', 'Face centered in frame',
                    'No heavy filters or makeup', 'Clear, sharp focus'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-blue-600">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <p className="text-red-600 text-sm font-semibold">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full text-white font-black py-4 rounded-2xl transition-all text-base active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg,#7c3aed,#ec4899)',
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(124,58,237,0.4)',
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Analyzing your skin...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    </svg>
                    Analyze My Skin
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Results ── */}
        {result && cfg && (
          <div id="result-section" className="space-y-5">

            {/* Hero result card */}
            <div className={`rounded-3xl border-2 overflow-hidden ${cfg.border}`}>
              {/* Gradient top band */}
              <div className={`bg-linear-to-r ${cfg.gradient} p-6 sm:p-8 text-white`}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shrink-0">
                    <div className="text-white">{cfg.icon}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm font-semibold mb-0.5">Your Skin Type</p>
                    <h2 className="text-2xl sm:text-3xl font-black mb-1">{cfg.label}</h2>
                    <p className="text-white/80 text-sm leading-relaxed">{cfg.desc}</p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="mt-5 bg-white/15 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm font-semibold">Analysis Confidence</span>
                    <span className="text-white font-black text-lg">{result.analysis.confidence_percent}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${result.analysis.confidence_percent}%` }} />
                  </div>
                </div>
              </div>

              {/* Image preview */}
              {preview && (
                <div className={`${cfg.lightBg} px-6 py-4 flex items-center gap-4 border-t ${cfg.border}`}>
                  <img src={preview} alt="Analyzed" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" />
                  <div>
                    <p className="font-black text-gray-900 text-sm">Analysis Complete</p>
                    <p className="text-gray-400 text-xs">Based on your uploaded photo</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cfg.badge}`}>
                      ✓ Analyzed
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Skincare tips */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${cfg.lightBg}`}>
                  <svg className={`w-5 h-5 ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-gray-900">Personalized Skincare Tips</h3>
                  <p className="text-xs text-gray-400">Curated for your {cfg.label.toLowerCase()}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cfg.tips.map((tip, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl border ${cfg.lightBg} ${cfg.border}`}>
                      <span className="text-xl shrink-0">{tip.icon}</span>
                      <p className={`text-sm font-semibold leading-relaxed ${cfg.text}`}>{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended products */}
            {result.recommendations?.products?.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">Recommended Products</h3>
                      <p className="text-xs text-gray-400">{result.recommendations.total} products matched to your skin</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {result.recommendations.products.map((item, i) => (
                    <div key={i} className="border-2 border-gray-100 hover:border-purple-200 rounded-2xl p-4 transition-all hover:shadow-md">
                      <div className="flex gap-4 mb-4">
                        {/* Product image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-purple-50 border border-gray-100 shrink-0 flex items-center justify-center">
                          {item.product.image
                            ? <img src={getProductImageUrl(item.product.image)}
                                alt={item.product.name} className="w-full h-full object-cover" />
                            : <span className="text-3xl">🧴</span>}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-purple-600 font-black mb-0.5">{item.product.brand}</p>
                          <p className="font-black text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug mb-2">
                            {item.product.name}
                          </p>

                          {/* Match score */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[100px]">
                              <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                                style={{ width: `${item.match_score * 100}%` }} />
                            </div>
                            <span className={`text-xs font-black ${cfg.text}`}>
                              {Math.round(item.match_score * 100)}% match
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-purple-700 font-black text-base">Rs. {item.product.discounted_price}</span>
                            {item.product.discount_percent > 0 && (
                              <>
                                <span className="text-gray-400 text-xs line-through">Rs. {item.product.price}</span>
                                <span className="bg-red-100 text-red-600 text-xs font-black px-1.5 py-0.5 rounded-full">
                                  -{item.product.discount_percent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button onClick={() => addToCart(item.product.id)}
                          disabled={addingId === item.product.id}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95">
                          {addingId === item.product.id
                            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Adding...</>
                            : '🛒 Add to Cart'}
                        </button>
                        <button onClick={() => buyNow(item.product)}
                          disabled={addingId === item.product.id}
                          className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-black py-2.5 rounded-xl text-sm transition-all active:scale-95">
                          ⚡ Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze again */}
            <button onClick={resetAnalysis}
              className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-purple-400 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-black py-4 rounded-2xl transition-all active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Analyze Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}