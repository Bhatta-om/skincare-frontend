// src/pages/SkinAnalysis.jsx — Mobile Responsive + SEO
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPersonalizedTips, getProductsForStep } from '../utils/skinTips'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { getProductImageUrl } from '../utils/productImage'
import {
  Upload, ShoppingBag, Zap, FlaskConical,
  CheckCircle, AlertCircle, RotateCcw, Package,
  ChevronRight, Droplets, Leaf, Sun, Camera,
  UserX, Users, ImageOff, Lightbulb,
} from 'lucide-react'

const SKIN_CSS = `
  .skin-hero-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 48px;
    align-items: center;
  }
  .skin-legend { display: flex; }
  .skin-how-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #E6DDD3;
  }
  .skin-tips-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .skin-photo-tips {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .skin-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 768px) {
    .skin-hero-grid { grid-template-columns: 1fr; gap: 24px; }
    .skin-legend { display: none; }
    .skin-how-grid { grid-template-columns: 1fr; }
    .skin-tips-grid { grid-template-columns: 1fr; }
    .skin-photo-tips { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .skin-how-grid { grid-template-columns: 1fr; }
    .skin-form-row { grid-template-columns: 1fr; }
    .skin-rec-grid  { grid-template-columns: 1fr !important; }
  }
`

const SKIN_CONFIG = {
  oily:   { accent: '#B8895A', accentLight: '#EAD8C2', label: 'Oily Skin',   desc: 'Your skin produces excess sebum. Focus on balancing and controlling shine.',  icon: <Droplets size={22} strokeWidth={1.5} />, tips: ['Use oil-free, non-comedogenic moisturizer','Cleanse twice daily with gentle foaming wash','Use mattifying SPF-30+ sunscreen daily','Try niacinamide serum to regulate oil production','Avoid over-washing — it triggers more oil','Look for salicylic acid or BHA exfoliants'] },
  dry:    { accent: '#5A7FA6', accentLight: '#DDE8F0', label: 'Dry Skin',    desc: 'Your skin lacks moisture. Prioritize deep hydration and barrier repair.',        icon: <Leaf     size={22} strokeWidth={1.5} />, tips: ['Use rich, cream-based moisturizer twice daily','Apply hyaluronic acid serum on damp skin','Avoid hot showers — use lukewarm water','Use overnight sleeping mask 2–3x per week','Choose gentle, fragrance-free cleanser','Drink 8+ glasses of water daily'] },
  normal: { accent: '#4A7A57', accentLight: '#DDF0E4', label: 'Normal Skin', desc: 'Well-balanced skin with good hydration. Focus on maintaining and protecting.',  icon: <Sun      size={22} strokeWidth={1.5} />, tips: ['Apply SPF 30+ sunscreen every morning','Maintain hydration with a light moisturizer','Use gentle cleanser morning and night','Add Vitamin C serum for antioxidant protection','Use retinol at night for anti-aging benefits','Exfoliate 1–2x per week for a radiant glow'] },
}
const getSkinConfig = (type) => SKIN_CONFIG[type] || SKIN_CONFIG.normal

const HOW_IT_WORKS = [
  { step: '01', icon: <Camera       size={18} strokeWidth={1.5} />, title: 'Upload Photo',     desc: 'Take a clear selfie in natural lighting — no filters'  },
  { step: '02', icon: <FlaskConical size={18} strokeWidth={1.5} />, title: 'AI Analyzes',      desc: 'Our model detects your skin type instantly'             },
  { step: '03', icon: <ShoppingBag  size={18} strokeWidth={1.5} />, title: 'Get Your Results', desc: 'Personalized tips and matched product recommendations'  },
]

// ── Error config per error_code from backend ──────────────
const ERROR_CONFIG = {
  NO_FACE_DETECTED: {
    icon:  <UserX size={20} strokeWidth={1.5} />,
    color: '#963838',
    bg:    '#FCF3F3',
    border:'#F5C4C4',
    title: 'No face detected',
    tips: [
      'Make sure your face is clearly visible',
      'Face the camera directly (front-facing)',
      'Ensure good lighting — avoid dark photos',
      'Remove sunglasses, masks, or face coverings',
    ],
  },
  MULTIPLE_FACES: {
    icon:  <Users size={20} strokeWidth={1.5} />,
    color: '#89670F',
    bg:    '#FFFBF0',
    border:'#F5DFA0',
    title: 'Multiple faces detected',
    tips: [
      'Upload a photo with only your face',
      'Make sure no other people are in the frame',
      'Crop the photo to show just your face',
    ],
  },
  LOW_CONFIDENCE: {
    icon:  <Lightbulb size={20} strokeWidth={1.5} />,
    color: '#89670F',
    bg:    '#FFFBF0',
    border:'#F5DFA0',
    title: 'Image quality too low',
    tips: [
      'Use natural or bright lighting',
      'Avoid heavy filters or editing',
      'Make sure the photo is sharp and in focus',
      'Remove heavy makeup if possible',
      'Take the photo in front of a plain background',
    ],
  },
  INVALID_IMAGE: {
    icon:  <ImageOff size={20} strokeWidth={1.5} />,
    color: '#963838',
    bg:    '#FCF3F3',
    border:'#F5C4C4',
    title: 'Invalid image file',
    tips: [
      'Upload a valid JPG, PNG, or WEBP file',
      'Make sure the file is not corrupted',
      'Try taking a new photo and uploading again',
    ],
  },
}

const LuxSelect = ({ value, onChange, children }) => (
  <div style={{ position: 'relative' }}>
    <select value={value} onChange={onChange} className="input-luxury" style={{ paddingRight: '36px', cursor: 'pointer', appearance: 'none' }}>
      {children}
    </select>
    <ChevronRight size={13} strokeWidth={1.5} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#AA9688', pointerEvents: 'none' }} />
  </div>
)

// ── Smart Error Block ─────────────────────────────────────
const ErrorBlock = ({ errorCode, errorMsg }) => {
  const cfg = ERROR_CONFIG[errorCode]

  // Unknown error — show simple alert
  if (!cfg) return (
    <div className="alert-error" style={{ marginBottom: '16px' }}>
      <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
      {errorMsg || 'Analysis failed. Please try again.'}
    </div>
  )

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '16px 18px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400 }}>
          {cfg.title}
        </p>
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#7B6458', fontWeight: 300, marginBottom: '12px', lineHeight: 1.6 }}>
        {errorMsg}
      </p>
      <div style={{ borderTop: `1px solid ${cfg.border}`, paddingTop: '10px' }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: cfg.color, marginBottom: '8px', fontWeight: 400 }}>
          How to fix this
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {cfg.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
              <CheckCircle size={11} strokeWidth={1.5} style={{ color: cfg.color, flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#7B6458', fontWeight: 300 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SkinAnalysis() {
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const navigate           = useNavigate()

  const [image,     setImage]     = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [age,       setAge]       = useState('')
  const [gender,    setGender]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [addingId,  setAddingId]  = useState(null)
  const [dragOver,  setDragOver]  = useState(false)
  const fileRef = useRef()

  const handleImage = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WEBP).')
      setErrorCode('INVALID_IMAGE')
      return
    }
    setImage(file); setPreview(URL.createObjectURL(file))
    setResult(null); setError(''); setErrorCode('')
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image)  { setError('Please upload a face photo.'); setErrorCode(''); return }
    if (!age)    { setError('Please enter your age.');      setErrorCode(''); return }
    if (!gender) { setError('Please select your gender.');  setErrorCode(''); return }

    setLoading(true); setError(''); setErrorCode(''); setResult(null)

    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 13) {
      setError('Age must be at least 13 years old.')
      setErrorCode('')
      setLoading(false)
      return
    }
    if (ageNum > 80) {
      setError('Age must be 80 or below.')
      setErrorCode('')
      setLoading(false)
      return
    }

    try {
      const fd = new FormData()
      fd.append('image', image)
      fd.append('age',   age)
      fd.append('gender', gender)

      const res = await api.post('/skin-analysis/analyze/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResult(res.data)
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100)

    } catch (err) {
      const data      = err.response?.data
      const code      = data?.error_code || ''
      const message   = data?.error || 'Analysis failed. Try a clearer, well-lit photo.'
      setErrorCode(code)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId) => {
    if (!user) { navigate('/login'); return }
    setAddingId(productId)
    try {
      await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 })
      await fetchCartCount()
      toast.success('Added to cart')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add.') }
    finally { setAddingId(null) }
  }

  const buyNow = (product) => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity: 1 } } })
  }

  const resetAnalysis = () => {
    setResult(null); setImage(null); setPreview(null)
    setAge(''); setGender(''); setError(''); setErrorCode('')
  }

  const cfg = result ? getSkinConfig(result.analysis.skin_type) : null

  return (
    <>
      <SEO title="Free Skin Analysis" description="Upload a photo and get your AI skin type analysis in 30 seconds. Free, personalized skincare recommendations." url="/skin-analysis" />
      <style>{SKIN_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* Hero — changed from #16100C to rgb(244, 237, 228) */}
        <section style={{ background: 'rgb(244, 237, 228)', padding: 'clamp(40px,6vw,64px) 0', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #E6DDD3' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '380px', height: '380px', borderRadius: '50%', border: '1px solid rgba(184,137,90,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(184,137,90,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

          <div className="container-luxury" style={{ position: 'relative', zIndex: 1 }}>
            <div className="skin-hero-grid">
              <div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 400 }}>
                  <FlaskConical size={14} strokeWidth={1.5} /> AI-Powered · Free to use
                </div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,50px)', color: '#16100C', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px' }}>
                  Discover Your<br /><em style={{ color: '#B8895A' }}>Skin Type</em>
                </h1>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, maxWidth: '420px', marginBottom: '28px' }}>
                  Upload a face photo — our AI analyzes your skin in seconds and recommends products that genuinely work for your skin type.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Photo not stored after analysis','Results in seconds','Personalized picks'].map((f,i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', border: '1px solid rgba(184,137,90,0.35)', background: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#7B6458', fontWeight: 300 }}>
                      <CheckCircle size={11} strokeWidth={1.5} style={{ color: '#B8895A' }} /> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skin type legend */}
              <div className="skin-legend" style={{ flexDirection: 'column', gap: '8px', width: '200px' }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#7B6458', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px', fontWeight: 400 }}>Skin Types We Detect</p>
                {Object.entries(SKIN_CONFIG).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1px solid rgba(184,137,90,0.25)', background: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ color: val.accent }}>{val.icon}</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#5A4A3A', fontWeight: 300 }}>{val.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="container-luxury" style={{ padding: 'clamp(32px,5vw,56px) 32px clamp(48px,6vw,80px)' }}>

          {/* How it works */}
          {!result && (
            <div style={{ marginBottom: 'clamp(32px,5vw,56px)' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Simple Process</div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px,2.5vw,26px)', color: '#16100C', fontWeight: 400 }}>How It Works</h2>
              </div>
              <div className="skin-how-grid">
                {HOW_IT_WORKS.map(s => (
                  <div key={s.step} style={{ background: '#FFFFFF', padding: 'clamp(20px,3vw,32px) clamp(14px,2vw,24px)', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #B8895A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8895A', margin: '0 auto 16px' }}>{s.icon}</div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '9.5px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px', fontWeight: 400 }}>Step {s.step}</p>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(13px,1.8vw,15px)', color: '#16100C', fontWeight: 400, marginBottom: '6px' }}>{s.title}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload form */}
          {!result && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right,#B8895A,#D4A96A,#B8895A)' }} />
              <div style={{ padding: 'clamp(16px,3vw,28px) clamp(16px,3vw,32px)', borderBottom: '1px solid #EEE7DF', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8895A', background: '#FDFAF7', flexShrink: 0 }}>
                  <FlaskConical size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400 }}>Skin Analysis</h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300, marginTop: '2px' }}>Upload a clear face photo for best results</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: 'clamp(16px,3vw,32px)' }}>

                {/* Upload zone */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="input-label">Face Photo <span style={{ color: '#963838' }}>*</span></label>
                  <div
                    onClick={() => !preview && fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{ border: `1.5px dashed ${dragOver ? '#B8895A' : preview ? '#B8895A' : '#E6DDD3'}`, background: dragOver ? '#FFFCF9' : preview ? '#FDFAF7' : '#FAF8F5', cursor: preview ? 'default' : 'pointer', transition: 'all 0.2s', marginTop: '8px' }}
                  >
                    {preview ? (
                      <div style={{ padding: 'clamp(12px,2vw,20px)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={preview} alt="preview" style={{ width: '88px', height: '88px', objectFit: 'cover', border: '1px solid #E6DDD3', display: 'block' }} />
                          <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#4A7A57', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={12} strokeWidth={2} style={{ color: '#FFFFFF' }} />
                          </div>
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '15px', color: '#16100C', fontWeight: 400, marginBottom: '4px' }}>Photo uploaded</p>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', fontWeight: 300, marginBottom: '12px' }}>{image?.name}</p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={() => fileRef.current.click()} style={{ background: 'none', border: '1px solid #E6DDD3', padding: '5px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', cursor: 'pointer', fontWeight: 400 }}>Change</button>
                            <button type="button" onClick={() => { setImage(null); setPreview(null); setError(''); setErrorCode('') }} style={{ background: 'none', border: '1px solid #E6DDD3', padding: '5px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#963838', cursor: 'pointer', fontWeight: 400 }}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 'clamp(28px,5vw,48px) 24px', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#D4C4B0', background: '#FFFFFF' }}>
                          <Upload size={22} strokeWidth={1.5} />
                        </div>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400, marginBottom: '6px' }}>Drop your photo here</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300, marginBottom: '12px' }}>or click to browse files</p>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#AA9688', textTransform: 'uppercase', letterSpacing: '0.12em', border: '1px solid #E6DDD3', padding: '4px 12px', background: '#FFFFFF' }}>JPG · PNG · WEBP</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files[0] && handleImage(e.target.files[0])} style={{ display: 'none' }} />
                </div>

                {/* Age + Gender */}
                <div className="skin-form-row" style={{ marginBottom: '20px' }}>
                  <div>
                    <label className="input-label">Age <span style={{ color: '#963838' }}>*</span></label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="13 – 80" min="13" max="80" className="input-luxury" style={{ marginTop: '8px' }} />
                  </div>
                  <div>
                    <label className="input-label">Gender <span style={{ color: '#963838' }}>*</span></label>
                    <div style={{ marginTop: '8px' }}>
                      <LuxSelect value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </LuxSelect>
                    </div>
                  </div>
                </div>

                {/* Photo tips */}
                <div style={{ background: '#F4EDE4', border: '1px solid #E6DDD3', padding: '14px 16px', marginBottom: '20px' }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#B8895A', marginBottom: '10px', fontWeight: 400 }}>Tips for best results</p>
                  <div className="skin-photo-tips">
                    {['Good lighting (natural or bright)','Face centered in frame','No heavy filters or makeup','Clear, sharp focus'].map((tip,i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={11} strokeWidth={1.5} style={{ color: '#B8895A', flexShrink: 0 }} />
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#7B6458', fontWeight: 300 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Error Block */}
                {error && (
                  <ErrorBlock errorCode={errorCode} errorMsg={error} />
                )}

                <button type="submit" disabled={loading} className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '15px', opacity: loading ? 0.7 : 1 }}>
                  <FlaskConical size={16} strokeWidth={1.5} />
                  {loading ? 'Analyzing your skin...' : 'Analyze My Skin'}
                </button>
              </form>
            </div>
          )}

          {/* Results */}
          {result && cfg && (
            <div id="result-section" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Result hero */}
              <div style={{ background: '#FFFFFF', border: `1px solid ${cfg.accentLight}`, overflow: 'hidden' }}>
                <div style={{ height: '3px', background: cfg.accent }} />
                <div style={{ padding: 'clamp(24px,3vw,36px)', background: cfg.accentLight }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ width: '56px', height: '56px', border: `1px solid ${cfg.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.accent, background: '#FFFFFF', flexShrink: 0 }}>{cfg.icon}</div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: cfg.accent, marginBottom: '6px', fontWeight: 400 }}>Your Skin Type</p>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,28px)', color: '#16100C', fontWeight: 400, marginBottom: '8px' }}>{cfg.label}</h2>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#7B6458', lineHeight: 1.65, fontWeight: 300 }}>{cfg.desc}</p>
                    </div>
                    {preview && <img src={preview} alt="Analyzed" style={{ width: '64px', height: '64px', objectFit: 'cover', border: `1px solid ${cfg.accent}`, display: 'block', flexShrink: 0 }} />}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEE7DF' }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400 }}>Personalized Skincare Tips</h3>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', marginTop: '3px', fontWeight: 300 }}>Based on your {cfg.label.toLowerCase()} · age {result.analysis.age} · {result.analysis.gender}</p>
                </div>
                <div style={{ padding: 'clamp(16px,3vw,24px) clamp(16px,3vw,28px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {getPersonalizedTips(result.analysis.skin_type, result.analysis.age, result.analysis.gender).map((item, i) => {
                    // ── Level 3: Find products matching this step's ingredients ──
                    const allProducts = result.recommendations?.products || []
                    const stepProducts = getProductsForStep(item.ingredients || [], allProducts)

                    return (
                      <div key={i} style={{ border: '1px solid #EEE7DF', background: '#FDFAF7' }}>

                        {/* Step header */}
                        <div style={{ padding: '16px 16px 0 16px' }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: cfg.accent, fontWeight: 500, marginBottom: '8px' }}>{item.step}</p>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#3A2820', lineHeight: 1.7, fontWeight: 300, marginBottom: '8px' }}>{item.tip}</p>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', background: 'rgba(150,56,56,0.05)', padding: '8px 10px', borderLeft: '2px solid #963838', marginBottom: stepProducts.length > 0 ? '14px' : '16px' }}>
                            <AlertCircle size={11} strokeWidth={1.5} style={{ color: '#963838', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#963838', lineHeight: 1.6, fontWeight: 300 }}>{item.warning}</p>
                          </div>
                        </div>

                        {/* ── Matched products for this step ── */}
                        {stepProducts.length > 0 && (
                          <div style={{ borderTop: '1px solid #EEE7DF', padding: '12px 16px', background: '#FFFFFF' }}>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.16em', color: cfg.accent, fontWeight: 500, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShoppingBag size={10} strokeWidth={1.5} /> Matched products for this step
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {stepProducts.map((rec, j) => (
                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', border: '1px solid #EEE7DF', background: '#FDFAF7' }}>
                                  {/* Product image */}
                                  <div style={{ width: '44px', height: '44px', flexShrink: 0, background: '#F4EDE4', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {rec.product.image
                                      ? <img src={getProductImageUrl(rec.product.image)} alt={rec.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      : <Package size={16} strokeWidth={1} style={{ color: '#D4C4B0' }} />
                                    }
                                  </div>
                                  {/* Product info */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 400 }}>{rec.product.brand}</p>
                                    <a href={`/products/${rec.product.slug}`} style={{ textDecoration: 'none' }}>
                                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '12px', color: '#16100C', fontWeight: 400, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.product.name}</p>
                                    </a>
                                    {/* Why matched — ingredient reasoning */}
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#7B6458', fontStyle: 'italic', fontWeight: 300, marginTop: '2px', lineHeight: 1.4 }}>
                                      {rec.reasoning?.split('.')[0]}.
                                    </p>
                                  </div>
                                  {/* Price + Cart */}
                                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '13px', color: '#16100C', fontWeight: 400 }}>Rs. {rec.product.discounted_price}</p>
                                    <button onClick={() => addToCart(rec.product.id)} disabled={addingId === rec.product.id}
                                      style={{ marginTop: '4px', background: cfg.accent, color: '#FFFFFF', border: 'none', padding: '4px 10px', fontFamily: "'DM Sans',sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', opacity: addingId === rec.product.id ? 0.6 : 1 }}>
                                      {addingId === rec.product.id ? '...' : 'Add'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommended products */}
              {result.recommendations?.products?.length > 0 && (() => {
                const top4      = result.recommendations.products.slice(0, 4)
                const rankLabel = ['#1 Pick', '#2 Pick', '#3 Pick', '#4 Pick']
                return (
                  <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEE7DF', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400, marginBottom: '3px' }}>Recommended For You</h3>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300 }}>Top {top4.length} picks matched to your {cfg.label.toLowerCase()}</p>
                      </div>
                      <a href={`/products?suitable_skin_type=${result.analysis.skin_type}`}
                        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: cfg.accent, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '5px', borderBottom: `1px solid ${cfg.accent}`, paddingBottom: '1px', whiteSpace: 'nowrap' }}>
                        Shop all {cfg.label} products <ChevronRight size={12} strokeWidth={2} />
                      </a>
                    </div>

                    <div style={{ padding: 'clamp(14px,2vw,20px)', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: '#E6DDD3' }}>
                      {top4.map((item, i) => {
                        const inStock = item.product.stock > 0 || item.product.stock_status === 'In Stock'
                        return (
                          <div key={i} style={{ background: '#FFFFFF', padding: 'clamp(14px,2vw,18px)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '12px', left: '12px', background: cfg.accent, color: '#FFFFFF', fontFamily: "'DM Sans',sans-serif", fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', zIndex: 1 }}>
                              {rankLabel[i]}
                            </div>
                            <a href={`/products/${item.product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                              <div style={{ width: '100%', aspectRatio: '1', background: '#F4EDE4', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {item.product.image ? <img src={getProductImageUrl(item.product.image)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={32} strokeWidth={1} style={{ color: '#D4C4B0' }} />}
                              </div>
                            </a>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#B8895A', fontWeight: 400 }}>{item.product.brand}</p>
                              <a href={`/products/${item.product.slug}`} style={{ textDecoration: 'none' }}>
                                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(12px,1.8vw,14px)', color: '#16100C', fontWeight: 400, lineHeight: 1.35 }}>{item.product.name}</p>
                              </a>
                              {item.reasoning && (
                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', color: '#7B6458', lineHeight: 1.5, fontWeight: 300, fontStyle: 'italic' }}>
                                  {item.reasoning.split('.')[0]}.
                                </p>
                              )}
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '4px' }}>
                                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(14px,2vw,17px)', color: '#16100C', fontWeight: 400 }}>Rs. {item.product.discounted_price}</span>
                                {item.product.discount_percent > 0 && (
                                  <>
                                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', textDecoration: 'line-through', fontWeight: 300 }}>Rs. {item.product.price}</span>
                                    <span className="badge badge-error" style={{ fontSize: '9px' }}>-{item.product.discount_percent}%</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => addToCart(item.product.id)} disabled={addingId === item.product.id || !inStock} className="btn-primary"
                                style={{ flex: 1, justifyContent: 'center', gap: '5px', padding: '10px 8px', fontSize: '10px', opacity: !inStock ? 0.4 : addingId === item.product.id ? 0.6 : 1 }}>
                                <ShoppingBag size={12} strokeWidth={1.5} />
                                {addingId === item.product.id ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                              <button onClick={() => buyNow(item.product)} disabled={!inStock} className="btn-accent"
                                style={{ flex: 1, justifyContent: 'center', gap: '5px', padding: '10px 8px', fontSize: '10px', opacity: !inStock ? 0.4 : 1 }}>
                                <Zap size={12} strokeWidth={1.5} />Buy Now
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ padding: '16px 24px', borderTop: '1px solid #EEE7DF', textAlign: 'center' }}>
                      <a href={`/products?suitable_skin_type=${result.analysis.skin_type}`}
                        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = cfg.accent}
                        onMouseLeave={e => e.currentTarget.style.color = '#7B6458'}
                      >
                        View all {cfg.label} products <ChevronRight size={13} strokeWidth={1.5} />
                      </a>
                    </div>
                  </div>
                )
              })()}

              <button onClick={resetAnalysis} className="btn-outline" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
                <RotateCcw size={14} strokeWidth={1.5} /> Analyze Again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}