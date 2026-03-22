// src/pages/MyAnalysis.jsx — Skin Analysis History
// Professional industry-level page matching SkinMedica design system

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import { getPersonalizedTips, getProductsForStep } from '../utils/skinTips'
import {
  FlaskConical, Droplets, Leaf, Sun, ShoppingBag,
  Zap, Package, ChevronRight, AlertCircle, CheckCircle,
  Calendar, TrendingUp, RotateCcw, ArrowRight, Activity,
} from 'lucide-react'

// ── Design tokens (matching SkinMedica) ──────────────────
const T = {
  dark:   '#16100C',
  body:   '#3A2820',
  muted:  '#7B6458',
  subtle: '#AA9688',
  accent: '#B8895A',
  border: '#E6DDD3',
  borderL:'#EEE7DF',
  serif:  "'Playfair Display', serif",
  sans:   "'DM Sans', 'Inter', sans-serif",
  bg:     '#FAF8F5',
}

const ANALYSIS_CSS = `
  .analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
  }
  .analysis-header-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
  }
  .analysis-tips-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .analysis-products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  @media (max-width: 768px) {
    .analysis-grid { grid-template-columns: 1fr; }
    .analysis-header-stats { grid-template-columns: 1fr 1fr 1fr; }
    .analysis-products-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .analysis-header-stats { grid-template-columns: 1fr; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .fade-slide-up {
    animation: fadeSlideUp 0.4s ease forwards;
  }
`

// ── Skin type config ──────────────────────────────────────
const SKIN_CONFIG = {
  oily:   { accent: '#B8895A', accentLight: '#EAD8C2', label: 'Oily Skin',   icon: <Droplets size={18} strokeWidth={1.5} />, desc: 'Focus on balancing and controlling shine.' },
  dry:    { accent: '#5A7FA6', accentLight: '#DDE8F0', label: 'Dry Skin',    icon: <Leaf     size={18} strokeWidth={1.5} />, desc: 'Prioritize deep hydration and barrier repair.' },
  normal: { accent: '#4A7A57', accentLight: '#DDF0E4', label: 'Normal Skin', icon: <Sun      size={18} strokeWidth={1.5} />, desc: 'Focus on maintaining and protecting.' },
}
const getSkinCfg = (type) => SKIN_CONFIG[type] || SKIN_CONFIG.normal

// ── Helpers ───────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })
}

const ConfidenceBadge = ({ label }) => {
  const colors = {
    High:   { bg: 'rgba(74,122,87,0.10)',  color: '#4A7A57'  },
    Medium: { bg: 'rgba(137,103,15,0.10)', color: '#89670F'  },
    Low:    { bg: 'rgba(150,56,56,0.10)',  color: '#963838'  },
  }
  const c = colors[label] || colors.Medium
  return (
    <span style={{
      fontFamily: T.sans, fontSize: '10px', fontWeight: 400,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: c.color, background: c.bg,
      padding: '3px 9px',
    }}>
      {label} Confidence
    </span>
  )
}

// ── Skin trend tracker ────────────────────────────────────
const SkinTrendTracker = ({ analyses }) => {
  if (!analyses || analyses.length < 2) return null

  const recent = [...analyses].slice(0, 5).reverse()

  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.borderL}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={16} strokeWidth={1.5} style={{ color: T.accent }} />
        <div>
          <h3 style={{ fontFamily: T.serif, fontSize: '16px', color: T.dark, fontWeight: 400 }}>Skin Type Progress</h3>
          <p style={{ fontFamily: T.sans, fontSize: '11.5px', color: T.subtle, marginTop: '2px', fontWeight: 300 }}>Track how your skin changes over time</p>
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {recent.map((a, i) => {
            const cfg = getSkinCfg(a.skin_type)
            return (
              <React.Fragment key={a.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: cfg.accentLight,
                    border: `1.5px solid ${cfg.accent}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.accent,
                  }}>
                    {cfg.icon}
                  </div>
                  <span style={{ fontFamily: T.sans, fontSize: '10px', color: cfg.accent, fontWeight: 500, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {a.skin_type}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: '9px', color: T.subtle, fontWeight: 300, whiteSpace: 'nowrap' }}>
                    {new Date(a.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {i < recent.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: T.border, minWidth: '24px', maxWidth: '60px', margin: '0 4px', marginBottom: '32px' }} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Insight text */}
        {(() => {
          const first = recent[0]?.skin_type
          const last  = recent[recent.length - 1]?.skin_type
          if (first === last) {
            return (
              <div style={{ marginTop: '16px', padding: '10px 14px', background: getSkinCfg(last).accentLight, borderLeft: `2px solid ${getSkinCfg(last).accent}` }}>
                <p style={{ fontFamily: T.sans, fontSize: '12px', color: T.body, fontWeight: 300 }}>
                  Your skin type has been consistently <strong>{last}</strong> across your last {recent.length} analyses.
                  Keep following your current routine!
                </p>
              </div>
            )
          }
          return (
            <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(74,122,87,0.06)', borderLeft: '2px solid #4A7A57' }}>
              <p style={{ fontFamily: T.sans, fontSize: '12px', color: T.body, fontWeight: 300 }}>
                Your skin has changed from <strong>{first}</strong> to <strong>{last}</strong>.
                Your skincare routine is making a difference!
              </p>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ── Single Analysis Card ──────────────────────────────────
const AnalysisCard = ({ analysis, index, onAddToCart, addingId }) => {
  const [expanded, setExpanded] = useState(index === 0) // first card open by default
  const cfg = getSkinCfg(analysis.skin_type)

  // Build recommendations array matching SkinAnalysis.jsx format
  const recommendations = (analysis.recommendations || []).map(r => ({
    product:     r.product,
    match_score: r.match_score,
    reasoning:   r.reasoning,
  }))

  const tips = getPersonalizedTips(
    analysis.skin_type,
    analysis.age,
    analysis.gender
  )

  return (
    <div className="fade-slide-up" style={{
      background: '#FFFFFF',
      border: `1px solid ${T.border}`,
      overflow: 'hidden',
      animationDelay: `${index * 0.08}s`,
    }}>
      {/* ── Card header ── */}
      <div style={{ height: '3px', background: cfg.accent }} />
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '18px 24px',
          background: expanded ? cfg.accentLight : '#FFFFFF',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '16px',
          borderBottom: expanded ? `1px solid ${T.borderL}` : 'none',
        }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = '#FFFCF9' }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = '#FFFFFF' }}
      >
        {/* Skin icon */}
        <div style={{
          width: '44px', height: '44px', flexShrink: 0,
          border: `1px solid ${cfg.accent}`,
          background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.accent,
        }}>
          {cfg.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3 style={{ fontFamily: T.serif, fontSize: '17px', color: T.dark, fontWeight: 400 }}>
              {cfg.label}
            </h3>
            <ConfidenceBadge label={analysis.confidence_label || 'Medium'} />
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: T.sans, fontSize: '11.5px', color: T.subtle, fontWeight: 300, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={11} strokeWidth={1.5} /> {formatDate(analysis.created_at)} · {formatTime(analysis.created_at)}
            </span>
            <span style={{ fontFamily: T.sans, fontSize: '11.5px', color: T.subtle, fontWeight: 300 }}>
              Age {analysis.age} · {analysis.gender}
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronRight size={16} strokeWidth={1.5} style={{
          color: T.subtle, flexShrink: 0,
          transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.25s ease',
        }} />
      </div>

      {/* ── Expanded content ── */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Skin description */}
          <div style={{ padding: '16px 24px', background: cfg.accentLight, borderBottom: `1px solid ${T.borderL}` }}>
            <p style={{ fontFamily: T.sans, fontSize: '13px', color: T.body, lineHeight: 1.7, fontWeight: 300 }}>
              {cfg.desc}
            </p>
          </div>

          {/* ── Personalized Routine ── */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderL}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FlaskConical size={14} strokeWidth={1.5} style={{ color: cfg.accent }} />
              <h4 style={{ fontFamily: T.serif, fontSize: '15px', color: T.dark, fontWeight: 400 }}>Your Personalized Routine</h4>
            </div>
            <p style={{ fontFamily: T.sans, fontSize: '11px', color: T.subtle, marginBottom: '14px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Based on {cfg.label.toLowerCase()} · Age {analysis.age} · {analysis.gender}
            </p>

            <div className="analysis-tips-grid">
              {tips.map((item, i) => {
                const stepProducts = getProductsForStep(item.ingredients || [], recommendations)
                return (
                  <div key={i} style={{ border: `1px solid ${T.borderL}`, background: '#FDFAF7' }}>
                    <div style={{ padding: '14px 16px 0 16px' }}>
                      <p style={{ fontFamily: T.sans, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: cfg.accent, fontWeight: 500, marginBottom: '6px' }}>
                        {item.step}
                      </p>
                      <p style={{ fontFamily: T.sans, fontSize: '12.5px', color: T.body, lineHeight: 1.7, fontWeight: 300, marginBottom: '8px' }}>
                        {item.tip}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', background: 'rgba(150,56,56,0.05)', padding: '7px 10px', borderLeft: '2px solid #963838', marginBottom: stepProducts.length > 0 ? '12px' : '14px' }}>
                        <AlertCircle size={10} strokeWidth={1.5} style={{ color: '#963838', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontFamily: T.sans, fontSize: '11px', color: '#963838', lineHeight: 1.6, fontWeight: 300 }}>{item.warning}</p>
                      </div>
                    </div>

                    {/* Matched products per step */}
                    {stepProducts.length > 0 && (
                      <div style={{ borderTop: `1px solid ${T.borderL}`, padding: '10px 16px', background: '#FFFFFF' }}>
                        <p style={{ fontFamily: T.sans, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.16em', color: cfg.accent, fontWeight: 500, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ShoppingBag size={9} strokeWidth={1.5} /> Matched for this step
                        </p>
                        {stepProducts.map((rec, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', border: `1px solid ${T.borderL}`, background: '#FDFAF7', marginBottom: j < stepProducts.length - 1 ? '6px' : '0' }}>
                            <div style={{ width: '36px', height: '36px', flexShrink: 0, background: '#F4EDE4', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              {rec.product.image
                                ? <img src={getProductImageUrl(rec.product.image)} alt={rec.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <Package size={14} strokeWidth={1} style={{ color: '#D4C4B0' }} />
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: T.sans, fontSize: '9.5px', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 400 }}>{rec.product.brand}</p>
                              <Link to={`/products/${rec.product.slug}`} style={{ textDecoration: 'none' }}>
                                <p style={{ fontFamily: T.serif, fontSize: '11.5px', color: T.dark, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.product.name}</p>
                              </Link>
                            </div>
                            <div style={{ flexShrink: 0, textAlign: 'right' }}>
                              <p style={{ fontFamily: T.serif, fontSize: '12px', color: T.dark }}>Rs. {rec.product.discounted_price}</p>
                              <button onClick={() => onAddToCart(rec.product.id)} disabled={addingId === rec.product.id}
                                style={{ marginTop: '3px', background: cfg.accent, color: '#FFFFFF', border: 'none', padding: '3px 8px', fontFamily: T.sans, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', opacity: addingId === rec.product.id ? 0.6 : 1 }}>
                                {addingId === rec.product.id ? '...' : 'Add'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Recommended Products ── */}
          {recommendations.length > 0 && (
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderL}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={14} strokeWidth={1.5} style={{ color: cfg.accent }} />
                  <h4 style={{ fontFamily: T.serif, fontSize: '15px', color: T.dark, fontWeight: 400 }}>
                    Recommended Products
                  </h4>
                </div>
                <Link to={`/products?suitable_skin_type=${analysis.skin_type}`}
                  style={{ fontFamily: T.sans, fontSize: '11px', color: cfg.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: `1px solid ${cfg.accent}`, paddingBottom: '1px' }}>
                  Shop all <ChevronRight size={11} strokeWidth={2} />
                </Link>
              </div>

              <div className="analysis-products-grid" style={{ background: T.border }}>
                {recommendations.slice(0, 4).map((item, i) => {
                  const rankLabel = ['#1 Pick', '#2 Pick', '#3 Pick', '#4 Pick']
                  const inStock   = item.product.stock > 0 || item.product.stock_status === 'In Stock'
                  return (
                    <div key={i} style={{ background: '#FFFFFF', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: cfg.accent, color: '#FFFFFF', fontFamily: T.sans, fontSize: '8.5px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 7px', zIndex: 1 }}>
                        {rankLabel[i]}
                      </div>
                      <Link to={`/products/${item.product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{ width: '100%', aspectRatio: '1', background: '#F4EDE4', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {item.product.image
                            ? <img src={getProductImageUrl(item.product.image)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={28} strokeWidth={1} style={{ color: '#D4C4B0' }} />
                          }
                        </div>
                      </Link>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ fontFamily: T.sans, fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.12em', color: T.accent, fontWeight: 400 }}>{item.product.brand}</p>
                        <Link to={`/products/${item.product.slug}`} style={{ textDecoration: 'none' }}>
                          <p style={{ fontFamily: T.serif, fontSize: '13px', color: T.dark, fontWeight: 400, lineHeight: 1.3 }}>{item.product.name}</p>
                        </Link>
                        {item.reasoning && (
                          <p style={{ fontFamily: T.sans, fontSize: '10px', color: T.muted, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.5 }}>
                            {item.reasoning.split('.')[0]}.
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '4px' }}>
                          <span style={{ fontFamily: T.serif, fontSize: '15px', color: T.dark }}> Rs. {item.product.discounted_price}</span>
                          {item.product.discount_percent > 0 && (
                            <>
                              <span style={{ fontFamily: T.sans, fontSize: '10.5px', color: T.subtle, textDecoration: 'line-through', fontWeight: 300 }}>Rs. {item.product.price}</span>
                              <span style={{ fontFamily: T.sans, fontSize: '9px', background: 'rgba(150,56,56,0.08)', color: '#963838', padding: '1px 5px', fontWeight: 400 }}>-{item.product.discount_percent}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => onAddToCart(item.product.id)} disabled={addingId === item.product.id || !inStock}
                          className="btn-primary"
                          style={{ flex: 1, justifyContent: 'center', gap: '4px', padding: '8px 6px', fontSize: '9.5px', opacity: !inStock ? 0.4 : addingId === item.product.id ? 0.6 : 1 }}>
                          <ShoppingBag size={11} strokeWidth={1.5} />
                          {addingId === item.product.id ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <Link to={`/products/${item.product.slug}`}
                          className="btn-accent"
                          style={{ flex: 1, justifyContent: 'center', gap: '4px', padding: '8px 6px', fontSize: '9.5px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                          <Zap size={11} strokeWidth={1.5} /> View
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Re-analyze button ── */}
          <div style={{ padding: '16px 24px', background: '#FFFCF9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ fontFamily: T.sans, fontSize: '11.5px', color: T.subtle, fontWeight: 300 }}>
              Analyzed on {formatDate(analysis.created_at)}
            </p>
            <Link to="/skin-analysis" className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '10.5px' }}>
              <RotateCcw size={12} strokeWidth={1.5} /> Analyze Again
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function MyAnalysis() {
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const navigate           = useNavigate()

  const [analyses, setAnalyses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [addingId, setAddingId] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/skin-analysis/my-history/')
      .then(res => setAnalyses(res.data.results || []))
      .catch(() => toast.error('Failed to load analysis history.'))
      .finally(() => setLoading(false))
  }, [user])

  const addToCart = async (productId) => {
    if (!user) { navigate('/login'); return }
    setAddingId(productId)
    try {
      await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 })
      await fetchCartCount()
      toast.success('Added to cart')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart.')
    } finally { setAddingId(null) }
  }

  // ── Stats ─────────────────────────────────────────────
  const totalAnalyses = analyses.length
  const skinTypeCounts = analyses.reduce((acc, a) => {
    acc[a.skin_type] = (acc[a.skin_type] || 0) + 1
    return acc
  }, {})
  const mostCommonType = Object.entries(skinTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  const latestType     = analyses[0]?.skin_type || '—'

  return (
    <>
      <SEO title="My Skin Analysis" description="View your skin analysis history, personalized routine and product recommendations." url="/my-analysis" noIndex />
      <style>{ANALYSIS_CSS}</style>

      <div style={{ background: T.bg, minHeight: '100vh' }}>

        {/* ── Hero Header ── */}
        <div style={{
          background: 'rgb(244, 237, 228)',
          borderBottom: `1px solid ${T.border}`,
          padding: 'clamp(32px,5vw,56px) 0 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(184,137,90,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(184,137,90,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

          <div className="container-luxury" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: '10px', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400 }}>
                  <FlaskConical size={12} strokeWidth={1.5} /> My Skin Journey
                </div>
                <h1 style={{ fontFamily: T.serif, fontSize: 'clamp(24px,4vw,38px)', color: T.dark, fontWeight: 400, lineHeight: 1.1, marginBottom: '10px' }}>
                  Skin Analysis History
                </h1>
                <p style={{ fontFamily: T.sans, fontSize: '13.5px', color: T.muted, fontWeight: 300, maxWidth: '480px', lineHeight: 1.7 }}>
                  View your past analyses, personalized routines, and matched product recommendations all in one place.
                </p>
              </div>
              <Link to="/skin-analysis" className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontSize: '11px', flexShrink: 0 }}>
                <FlaskConical size={14} strokeWidth={1.5} /> New Analysis
              </Link>
            </div>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,40px) 32px clamp(48px,6vw,80px)' }}>

          {loading ? (
            // ── Loading skeleton ──
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, height: '80px', opacity: 0.5 + i * 0.1 }}>
                  <div style={{ height: '3px', background: T.border }} />
                  <div style={{ padding: '18px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', background: T.border, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ height: '14px', background: T.border, width: '40%' }} />
                      <div style={{ height: '10px', background: T.border, width: '60%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : analyses.length === 0 ? (
            // ── Empty state ──
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#FFFFFF', border: `1px solid ${T.border}` }}>
              <div style={{ width: '64px', height: '64px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#D4C4B0', background: '#FFFCF9' }}>
                <FlaskConical size={26} strokeWidth={1} />
              </div>
              <h2 style={{ fontFamily: T.serif, fontSize: '22px', color: T.dark, fontWeight: 400, marginBottom: '10px' }}>
                No analyses yet
              </h2>
              <p style={{ fontFamily: T.sans, fontSize: '13px', color: T.subtle, fontWeight: 300, marginBottom: '28px', maxWidth: '360px', margin: '0 auto 28px', lineHeight: 1.7 }}>
                Upload a photo to get your first skin type analysis, personalized routine, and product recommendations.
              </p>
              <Link to="/skin-analysis" className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px' }}>
                <FlaskConical size={15} strokeWidth={1.5} /> Start Your First Analysis
              </Link>
            </div>

          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* ── Stats row ── */}
              <div className="analysis-header-stats" style={{ background: T.border }}>
                {[
                  { icon: <FlaskConical size={15} strokeWidth={1.5} />, label: 'Total Analyses',   value: totalAnalyses                                     },
                  { icon: <TrendingUp   size={15} strokeWidth={1.5} />, label: 'Most Common Type', value: mostCommonType ? mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1) : '—' },
                  { icon: <Activity     size={15} strokeWidth={1.5} />, label: 'Latest Result',    value: latestType    ? latestType.charAt(0).toUpperCase()    + latestType.slice(1)    : '—' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#FFFFFF', padding: 'clamp(14px,2vw,20px) clamp(14px,2vw,24px)', textAlign: 'center' }}>
                    <div style={{ color: T.accent, display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{s.icon}</div>
                    <p style={{ fontFamily: T.serif, fontSize: 'clamp(20px,3vw,28px)', color: T.dark, fontWeight: 400, lineHeight: 1, marginBottom: '6px' }}>{s.value}</p>
                    <p style={{ fontFamily: T.sans, fontSize: '10.5px', color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Skin Trend Tracker ── */}
              <SkinTrendTracker analyses={analyses} />

              {/* ── Analysis cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <p style={{ fontFamily: T.sans, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: T.subtle, fontWeight: 400 }}>
                    {totalAnalyses} {totalAnalyses === 1 ? 'analysis' : 'analyses'} found
                  </p>
                  <div style={{ flex: 1, height: '1px', background: T.border }} />
                </div>
                {analyses.map((analysis, i) => (
                  <AnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    index={i}
                    onAddToCart={addToCart}
                    addingId={addingId}
                  />
                ))}
              </div>

              {/* ── Bottom CTA ── */}
              <div style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ fontFamily: T.serif, fontSize: '17px', color: T.dark, fontWeight: 400, marginBottom: '4px' }}>
                    Skin changes over time
                  </p>
                  <p style={{ fontFamily: T.sans, fontSize: '12.5px', color: T.muted, fontWeight: 300 }}>
                    Re-analyze every 4–6 weeks to track your progress
                  </p>
                </div>
                <Link to="/skin-analysis" className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontSize: '11px' }}>
                  <RotateCcw size={13} strokeWidth={1.5} /> Analyze Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}