// src/pages/SkinAnalysis.jsx — Mobile Responsive + Webcam Feature + Fixed Age/Gender Fields + DEBUG LOGGING
import React, { useState, useRef, useCallback, useEffect } from 'react'
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
  UserX, Users, ImageOff, Lightbulb, Video,
  VideoOff, RefreshCw, X, ChevronDown, Info,
  Shield, Star, TrendingUp,
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
  .skin-form-row > div {
    display: flex;
    flex-direction: column;
  }
  .tip-card {
    background: #FFFFFF;
    border: 1px solid #EEE7DF;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .tip-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transform: translateY(-1px);
  }
  .tip-header {
    padding: 16px 20px;
    background: #FAF8F5;
    border-bottom: 1px solid #EEE7DF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  }
  .tip-header:hover {
    background: #F4EDE4;
  }
  .tip-content {
    padding: 20px;
    max-height: 1000px;
    overflow: hidden;
    transition: all 0.3s ease;
    opacity: 1;
  }
  .tip-card.collapsed .tip-content {
    max-height: 0;
    padding: 0 20px;
    opacity: 0;
  }
  .tip-main {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: '#3A2820';
    line-height: 1.7;
    font-weight: 300;
    margin-bottom: 16px;
  }
  .info-sections {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .info-item.pro-tip {
    background: #F0F7FF;
    border-left: 3px solid #5A7FA6;
  }
  .info-item.caution {
    background: #FFF5F5;
    border-left: 3px solid #E53E3E;
  }
  .info-item.fact {
    background: #F7FAFC;
    border-left: 3px solid #718096;
  }
  .info-item.benefit {
    background: #F0FFF4;
    border-left: 3px solid #38A169;
  }
  .info-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }
  .info-content {
    flex: 1;
  }
  .info-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .info-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    line-height: 1.6;
    font-weight: 300;
  }
  .chevron-icon {
    transition: transform 0.3s ease;
  }
  .tip-card.collapsed .chevron-icon {
    transform: rotate(-90deg);
  }
  .tip-card:not(.collapsed) .chevron-icon {
    transform: rotate(0deg);
  }
  .upload-tab-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #AA9688;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .upload-tab-btn.active {
    color: #B8895A;
    border-bottom-color: #B8895A;
  }
  .upload-tab-btn:hover {
    color: #B8895A;
  }
  .webcam-container {
    position: relative;
    background: #16100C;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .webcam-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
    display: block;
  }
  .webcam-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .face-guide {
    width: 200px;
    height: 240px;
    border: 2px solid rgba(184,137,90,0.7);
    border-radius: 50%;
    box-shadow: 0 0 0 2000px rgba(0,0,0,0.35);
  }
  @keyframes pulse-border {
    0%, 100% { border-color: rgba(184,137,90,0.7); }
    50%       { border-color: rgba(184,137,90,1);   }
  }
  .face-guide.ready {
    animation: pulse-border 1.5s ease-in-out infinite;
  }
  .webcam-capture-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #B8895A;
    border: 3px solid #FFFFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .webcam-capture-btn:hover {
    background: #A07040;
    transform: translateX(-50%) scale(1.05);
  }
  .webcam-capture-btn:active {
    transform: translateX(-50%) scale(0.95);
  }
  .webcam-flip-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s ease;
  }
  .webcam-flip-btn:hover {
    background: rgba(0,0,0,0.7);
  }
  .webcam-close-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s ease;
  }
  .webcam-close-btn:hover {
    background: rgba(150,56,56,0.7);
  }
  .input-luxury {
    width: 100%;
    height: 48px;
    padding: 12px 14px;
    border: 1px solid #E6DDD3;
    background: #FFFFFF;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #16100C;
    border-radius: 4px;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .input-luxury:hover {
    border-color: #D4C4B0;
  }
  .input-luxury:focus {
    outline: none;
    border-color: #B8895A;
    box-shadow: 0 0 0 3px rgba(184,137,90,0.1);
  }
  .input-luxury::placeholder {
    color: #AA9688;
  }
  .input-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #16100C;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: block;
    margin-bottom: 6px;
  }
  .gender-select-wrapper {
    position: relative;
    width: 100%;
  }
  .gender-select-wrapper select {
    width: 100%;
    height: 48px;
    padding: 12px 36px 12px 14px;
    border: 1px solid #E6DDD3;
    background: #FFFFFF;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #16100C;
    border-radius: 4px;
    cursor: pointer;
    appearance: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .gender-select-wrapper select:hover {
    border-color: #D4C4B0;
  }
  .gender-select-wrapper select:focus {
    outline: none;
    border-color: #B8895A;
    box-shadow: 0 0 0 3px rgba(184,137,90,0.1);
  }
  .gender-select-wrapper select option {
    color: #16100C;
    background: #FFFFFF;
    padding: 8px;
  }
  .gender-select-wrapper .chevron-select {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #AA9688;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 768px) {
    .skin-hero-grid { grid-template-columns: 1fr; gap: 24px; }
    .skin-legend { display: none; }
    .skin-how-grid { grid-template-columns: 1fr; }
    .skin-tips-grid { grid-template-columns: 1fr; }
    .skin-photo-tips { grid-template-columns: 1fr; }
    .skin-form-row { grid-template-columns: 1fr; }
    .face-guide { width: 160px; height: 200px; }
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
  { step: '01', icon: <Camera       size={18} strokeWidth={1.5} />, title: 'Upload or Capture', desc: 'Upload a photo or use your live camera'              },
  { step: '02', icon: <FlaskConical size={18} strokeWidth={1.5} />, title: 'AI Analyzes',        desc: 'Our model detects your skin type instantly'         },
  { step: '03', icon: <ShoppingBag  size={18} strokeWidth={1.5} />, title: 'Get Your Results',   desc: 'Personalized tips and matched product recommendations' },
]

const ERROR_CONFIG = {
  NO_FACE_DETECTED: {
    icon:  <UserX size={20} strokeWidth={1.5} />,
    color: '#963838', bg: '#FCF3F3', border:'#F5C4C4',
    title: 'No face detected',
    tips: ['Make sure your face is clearly visible','Face the camera directly (front-facing)','Ensure good lighting — avoid dark photos','Remove sunglasses, masks, or face coverings'],
  },
  MULTIPLE_FACES: {
    icon:  <Users size={20} strokeWidth={1.5} />,
    color: '#89670F', bg: '#FFFBF0', border:'#F5DFA0',
    title: 'Multiple faces detected',
    tips: ['Upload a photo with only your face','Make sure no other people are in the frame','Crop the photo to show just your face'],
  },
  LOW_CONFIDENCE: {
    icon:  <Lightbulb size={20} strokeWidth={1.5} />,
    color: '#89670F', bg: '#FFFBF0', border:'#F5DFA0',
    title: 'Image quality too low',
    tips: ['Use natural or bright lighting','Avoid heavy filters or editing','Make sure the photo is sharp and in focus','Remove heavy makeup if possible','Take the photo in front of a plain background'],
  },
  INVALID_IMAGE: {
    icon:  <ImageOff size={20} strokeWidth={1.5} />,
    color: '#963838', bg: '#FCF3F3', border:'#F5C4C4',
    title: 'Invalid image file',
    tips: ['Upload a valid JPG, PNG, or WEBP file','Make sure the file is not corrupted','Try taking a new photo and uploading again'],
  },
  IMAGE_TOO_BRIGHT: {
    icon:  <Sun size={20} strokeWidth={1.5} />,
    color: '#89670F', bg: '#FFFBF0', border:'#F5DFA0',
    title: 'Image too bright or overexposed',
    tips: ['Avoid taking the photo in direct sunlight','Turn off camera flash completely','Move to a shaded area with natural indirect light','Use indoor lighting — a well-lit room works best'],
  },
}

const LuxSelect = ({ value, onChange, children }) => (
  <div className="gender-select-wrapper">
    <select value={value} onChange={onChange} className="input-luxury">
      {children}
    </select>
    <div className="chevron-select">
      <ChevronDown size={16} strokeWidth={1.5} />
    </div>
  </div>
)

const ErrorBlock = ({ errorCode, errorMsg }) => {
  const cfg = ERROR_CONFIG[errorCode]
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
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400 }}>{cfg.title}</p>
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#7B6458', fontWeight: 300, marginBottom: '12px', lineHeight: 1.6 }}>{errorMsg}</p>
      <div style={{ borderTop: `1px solid ${cfg.border}`, paddingTop: '10px' }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: cfg.color, marginBottom: '8px', fontWeight: 400 }}>How to fix this</p>
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

// ════════════════════════════════════════════════════════════
// WEBCAM COMPONENT
// ════════════════════════════════════════════════════════════
const WebcamCapture = ({ onCapture, onClose }) => {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [ready,       setReady]       = useState(false)
  const [facingMode,  setFacingMode]  = useState('user')
  const [countdown,   setCountdown]   = useState(null)
  const [error,       setError]       = useState('')

  const startCamera = useCallback(async (mode = 'user') => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      setReady(false); setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => { videoRef.current.play(); setReady(true) }
      }
    } catch (err) {
      if (err.name === 'NotAllowedError')  setError('Camera access denied. Please allow camera permission and try again.')
      else if (err.name === 'NotFoundError') setError('No camera found on this device.')
      else setError('Could not start camera. Please try uploading a photo instead.')
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()) }
  }, [facingMode, startCamera])

  const startCountdown = () => {
    let count = 3
    setCountdown(count)
    const interval = setInterval(() => {
      count -= 1
      if (count === 0) { clearInterval(interval); setCountdown(null); capturePhoto() }
      else setCountdown(count)
    }, 1000)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) onCapture(new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }

  return (
    <div style={{ marginTop: '8px' }}>
      {error ? (
        <div style={{ background: '#FCF3F3', border: '1px solid #F5C4C4', padding: '20px', textAlign: 'center' }}>
          <VideoOff size={32} strokeWidth={1.5} style={{ color: '#963838', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#963838', marginBottom: '12px' }}>{error}</p>
          <button onClick={onClose} style={{ background: '#1A0F0A', color: '#fff', border: 'none', padding: '8px 20px', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Upload Photo Instead
          </button>
        </div>
      ) : (
        <div>
          <div className="webcam-container" style={{ height: '320px' }}>
            <video ref={videoRef} className="webcam-video" autoPlay playsInline muted />
            <div className="webcam-overlay">
              <div className={`face-guide ${ready ? 'ready' : ''}`} />
            </div>
            {countdown !== null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '96px', fontWeight: 400, color: '#B8895A', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{countdown}</span>
              </div>
            )}
            <button className="webcam-close-btn" onClick={onClose} title="Close camera"><X size={16} strokeWidth={2} /></button>
            <button className="webcam-flip-btn" onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} title="Flip camera"><RefreshCw size={16} strokeWidth={1.5} /></button>
            {ready && countdown === null && (
              <button className="webcam-capture-btn" onClick={startCountdown} title="Take photo">
                <Camera size={24} strokeWidth={1.5} color="#FFFFFF" />
              </button>
            )}
            {!ready && !error && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#B8895A', borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Starting camera...</p>
              </div>
            )}
          </div>
          {ready && (
            <div style={{ background: '#FAF8F5', border: '1px solid #E6DDD3', borderTop: 'none', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {['Center your face in the oval','Good lighting — face a window','Hold camera steady'].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={10} strokeWidth={1.5} style={{ color: '#B8895A', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', fontWeight: 300 }}>{tip}</span>
                </div>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', fontStyle: 'italic' }}>3-second timer before capture</span>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  )
}

const categorizeWarning = (warning) => {
  const w = warning.toLowerCase()
  if (['avoid','never','do not','stop','harsh','damage','harmful','irritation','allergic','burn'].some(k => w.includes(k)))
    return { type: 'caution', icon: <AlertCircle size={14} />, color: '#E53E3E', label: 'Caution' }
  if (['helps','improves','better','enhances','effective','best','optimal'].some(k => w.includes(k)))
    return { type: 'benefit', icon: <Star size={14} />, color: '#38A169', label: 'Benefit' }
  if (['skin loses','collagen','produces','research','study','percent','after age'].some(k => w.includes(k)))
    return { type: 'fact', icon: <Info size={14} />, color: '#718096', label: 'Did You Know?' }
  return { type: 'pro-tip', icon: <TrendingUp size={14} />, color: '#5A7FA6', label: 'Pro Tip' }
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function SkinAnalysis() {
  const { user }           = useAuth()
  const { fetchCartCount } = useCart()
  const navigate           = useNavigate()

  const [image,         setImage]         = useState(null)
  const [preview,       setPreview]       = useState(null)
  const [age,           setAge]           = useState('')
  const [gender,        setGender]        = useState('')
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(null)
  const [error,         setError]         = useState('')
  const [errorCode,     setErrorCode]     = useState('')
  const [addingId,      setAddingId]      = useState(null)
  const [dragOver,      setDragOver]      = useState(false)
  const [activeTab,     setActiveTab]     = useState('upload')
  const [showWebcam,    setShowWebcam]    = useState(false)
  const [captureSource, setCaptureSource] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    console.log('%c✅ SkinAnalysis component mounted', 'color: green; font-size: 14px; font-weight: bold;')
    console.log('%c🔗 API Base URL:', 'color: blue; font-weight: bold;', api.defaults.baseURL)
  }, [])

  const handleImage = (file) => {
    console.log('%c📸 handleImage called', 'color: purple; font-weight: bold;', file)
    if (!file || !file.type.startsWith('image/')) {
      console.error('❌ Invalid image file')
      setError('Please upload a valid image file (JPG, PNG, or WEBP).')
      setErrorCode('INVALID_IMAGE')
      return
    }
    setImage(file); setPreview(URL.createObjectURL(file))
    setResult(null); setError(''); setErrorCode('')
    console.log('✅ Image loaded successfully')
  }

  const handleWebcamCapture = (file) => {
    console.log('%c📷 Webcam capture successful', 'color: purple; font-weight: bold;')
    setShowWebcam(false); setCaptureSource('camera')
    handleImage(file); setActiveTab('upload')
  }

  const handleDrop = (e) => {
    console.log('%c🎯 File dropped', 'color: purple; font-weight: bold;')
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) { setCaptureSource('upload'); handleImage(file) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('%c🔍 handleSubmit called', 'color: blue; font-size: 14px; font-weight: bold;')
    console.log('%c📸 Image:', 'color: blue; font-weight: bold;', image)
    console.log('%c📅 Age:', 'color: blue; font-weight: bold;', age)
    console.log('%c👤 Gender:', 'color: blue; font-weight: bold;', gender)
    
    if (!image)  { 
      console.error('❌ No image selected')
      setError('Please upload or capture a face photo.'); 
      setErrorCode(''); 
      return 
    }
    if (!age)    { 
      console.error('❌ Age not provided')
      setError('Please enter your age.'); 
      setErrorCode(''); 
      return 
    }
    if (!gender) { 
      console.error('❌ Gender not selected')
      setError('Please select your gender.'); 
      setErrorCode(''); 
      return 
    }
    
    setLoading(true); setError(''); setErrorCode(''); setResult(null)
    
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 13) { 
      console.error('❌ Age validation failed: too young')
      setError('Age must be at least 13 years old.'); 
      setErrorCode(''); 
      setLoading(false); 
      return 
    }
    if (ageNum > 80) { 
      console.error('❌ Age validation failed: too old')
      setError('Age must be 80 or below.'); 
      setErrorCode(''); 
      setLoading(false); 
      return 
    }
    
    try {
      console.log('%c📤 Sending API request...', 'color: orange; font-size: 12px; font-weight: bold;')
      console.log('%c🔗 API Base URL:', 'color: orange; font-weight: bold;', api.defaults.baseURL)
      console.log('%c���� Full URL:', 'color: orange; font-weight: bold;', api.defaults.baseURL + '/skin-analysis/analyze/')
      
      const fd = new FormData()
      fd.append('image', image)
      fd.append('age', age)
      fd.append('gender', gender)
      
      console.log('%c📦 FormData created with:', 'color: orange; font-weight: bold;')
      console.log('  - Image:', image.name)
      console.log('  - Age:', age)
      console.log('  - Gender:', gender)
      
      const res = await api.post('/skin-analysis/analyze/', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      })
      
      console.log('%c✅ API Response Success!', 'color: green; font-size: 14px; font-weight: bold;')
      console.log('%c📊 Response Data:', 'color: green; font-weight: bold;', res.data)
      console.log('%c🎯 Skin Type:', 'color: green; font-weight: bold;', res.data?.analysis?.skin_type)
      
      setResult(res.data)
      setTimeout(() => {
        const section = document.getElementById('result-section')
        console.log('%c📍 Scrolling to result section...', 'color: green; font-weight: bold;')
        section?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
    } catch (err) {
      console.error('%c❌ API Error!', 'color: red; font-size: 14px; font-weight: bold;')
      console.error('%c🔴 Full Error:', 'color: red; font-weight: bold;', err)
      console.error('%c📝 Error Response Data:', 'color: red; font-weight: bold;', err.response?.data)
      console.error('%c🔗 Error Status:', 'color: red; font-weight: bold;', err.response?.status)
      console.error('%c🔗 Error Status Text:', 'color: red; font-weight: bold;', err.response?.statusText)
      console.error('%c💬 Error Message:', 'color: red; font-weight: bold;', err.message)
      
      const data = err.response?.data
      setErrorCode(data?.error_code || '')
      setError(data?.error || 'Analysis failed. Try a clearer, well-lit photo.')
      
      // Show toast notification
      toast.error(data?.error || 'Failed to analyze skin. Please try again.')
    } finally { 
      setLoading(false)
      console.log('%c⏹️  Loading finished', 'color: gray; font-weight: bold;')
    }
  }

  const addToCart = async (productId) => {
    console.log('%c🛒 Adding to cart:', 'color: teal; font-weight: bold;', productId)
    if (!user) { navigate('/login'); return }
    setAddingId(productId)
    try {
      await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 })
      await fetchCartCount()
      console.log('%c✅ Added to cart successfully', 'color: green; font-weight: bold;')
      toast.success('Added to cart')
    } catch (err) { 
      console.error('%c❌ Failed to add to cart', 'color: red; font-weight: bold;', err)
      toast.error(err.response?.data?.error || 'Failed to add.') 
    }
    finally { setAddingId(null) }
  }

  const buyNow = (product) => {
    console.log('%c⚡ Buy now:', 'color: teal; font-weight: bold;', product.name)
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { buyNow: { product_id: product.id, product, quantity: 1 } } })
  }

  const resetAnalysis = () => {
    console.log('%c🔄 Resetting analysis', 'color: gray; font-weight: bold;')
    setResult(null); setImage(null); setPreview(null)
    setAge(''); setGender(''); setError(''); setErrorCode('')
    setCaptureSource(''); setShowWebcam(false); setActiveTab('upload')
  }

  const cfg = result ? getSkinConfig(result.analysis.skin_type) : null

  return (
    <>
      <SEO title="Free Skin Analysis" description="Upload a photo or use your camera for AI skin type analysis in 30 seconds." url="/skin-analysis" />
      <style>{SKIN_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* ── Hero ── */}
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
                  Upload a face photo or use your live camera — our AI analyzes your skin in seconds and recommends products that genuinely work for your skin type.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Photo not stored after analysis','Results in seconds','Live camera supported','Personalized picks'].map((f,i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', border: '1px solid rgba(184,137,90,0.35)', background: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#7B6458', fontWeight: 300 }}>
                      <CheckCircle size={11} strokeWidth={1.5} style={{ color: '#B8895A' }} /> {f}
                    </div>
                  ))}
                </div>
              </div>
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

          {/* ── Upload / Camera Form ── */}
          {!result && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right,#B8895A,#D4A96A,#B8895A)' }} />
              <div style={{ padding: 'clamp(16px,3vw,28px) clamp(16px,3vw,32px)', borderBottom: '1px solid #EEE7DF', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8895A', background: '#FDFAF7', flexShrink: 0 }}>
                  <FlaskConical size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#16100C', fontWeight: 400 }}>Skin Analysis</h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300, marginTop: '2px' }}>Upload a photo or use your live camera</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: 'clamp(16px,3vw,32px)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="input-label">Face Photo <span style={{ color: '#963838' }}>*</span></label>

                  {!preview && (
                    <div style={{ display: 'flex', borderBottom: '1px solid #E6DDD3', marginTop: '8px' }}>
                      <button type="button" className={`upload-tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => { console.log('%c📁 Upload tab clicked', 'color: purple; font-weight: bold;'); setActiveTab('upload'); setShowWebcam(false) }}>
                        <Upload size={14} strokeWidth={1.5} /> Upload Photo
                      </button>
                      <button type="button" className={`upload-tab-btn ${activeTab === 'camera' ? 'active' : ''}`} onClick={() => { console.log('%c📷 Camera tab clicked', 'color: purple; font-weight: bold;'); setActiveTab('camera'); setShowWebcam(true) }}>
                        <Video size={14} strokeWidth={1.5} /> Use Camera
                      </button>
                    </div>
                  )}

                  {(activeTab === 'upload' || preview) && !showWebcam && (
                    <>
                      <div
                        onClick={() => !preview && fileRef.current.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        style={{ border: `1.5px dashed ${dragOver ? '#B8895A' : preview ? '#B8895A' : '#E6DDD3'}`, background: dragOver ? '#FFFCF9' : preview ? '#FDFAF7' : '#FAF8F5', cursor: preview ? 'default' : 'pointer', transition: 'all 0.2s' }}
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
                              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '15px', color: '#16100C', fontWeight: 400, marginBottom: '4px' }}>{captureSource === 'camera' ? 'Photo captured' : 'Photo uploaded'}</p>
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', fontWeight: 300, marginBottom: '12px' }}>{captureSource === 'camera' ? 'Taken with your camera' : image?.name}</p>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {captureSource === 'camera' ? (
                                  <button type="button" onClick={() => { console.log('%c🔄 Retake clicked', 'color: purple; font-weight: bold;'); setImage(null); setPreview(null); setShowWebcam(true); setActiveTab('camera') }} style={{ background: 'none', border: '1px solid #E6DDD3', padding: '5px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', cursor: 'pointer' }}>Retake</button>
                                ) : (
                                  <button type="button" onClick={() => { console.log('%c✏️ Change clicked', 'color: purple; font-weight: bold;'); fileRef.current.click() }} style={{ background: 'none', border: '1px solid #E6DDD3', padding: '5px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B6458', cursor: 'pointer' }}>Change</button>
                                )}
                                <button type="button" onClick={() => { console.log('%c🗑️ Remove clicked', 'color: purple; font-weight: bold;'); setImage(null); setPreview(null); setError(''); setErrorCode(''); setCaptureSource('') }} style={{ background: 'none', border: '1px solid #E6DDD3', padding: '5px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#963838', cursor: 'pointer' }}>Remove</button>
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
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { if (e.target.files[0]) { console.log('%c📁 File selected:', 'color: purple; font-weight: bold;', e.target.files[0].name); setCaptureSource('upload'); handleImage(e.target.files[0]) } }} style={{ display: 'none' }} />
                    </>
                  )}

                  {activeTab === 'camera' && showWebcam && !preview && (
                    <WebcamCapture onCapture={handleWebcamCapture} onClose={() => { console.log('%c❌ Camera closed', 'color: purple; font-weight: bold;'); setShowWebcam(false) }} />
                  )}
                </div>

                <div className="skin-form-row" style={{ marginBottom: '20px' }}>
                  <div>
                    <label className="input-label">Age <span style={{ color: '#963838' }}>*</span></label>
                    <input type="number" value={age} onChange={e => { console.log('%c📅 Age changed:', 'color: purple; font-weight: bold;', e.target.value); setAge(e.target.value) }} placeholder="13 – 80" min="13" max="80" className="input-luxury" style={{ marginTop: '8px' }} />
                  </div>
                  <div>
                    <label className="input-label">Gender <span style={{ color: '#963838' }}>*</span></label>
                    <div style={{ marginTop: '8px' }}>
                      <LuxSelect value={gender} onChange={e => { console.log('%c👤 Gender changed:', 'color: purple; font-weight: bold;', e.target.value); setGender(e.target.value) }}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </LuxSelect>
                    </div>
                  </div>
                </div>

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

                {error && <ErrorBlock errorCode={errorCode} errorMsg={error} />}

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '15px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  <FlaskConical size={16} strokeWidth={1.5} />
                  {loading ? 'Analyzing your skin...' : 'Analyze My Skin'}
                </button>
              </form>
            </div>
          )}

          {/* ── RESULTS ── */}
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

              {/* Tips / Routine */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEE7DF', background: '#FAF8F5' }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#16100C', fontWeight: 400, marginBottom: '4px' }}>Personalized Skincare Routine</h3>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300 }}>
                    Based on your {cfg.label.toLowerCase()} · age {result.analysis.age} · {result.analysis.gender}
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#B8895A' }}>· Click each step to expand</span>
                  </p>
                </div>
                <div style={{ padding: 'clamp(16px,3vw,24px) clamp(16px,3vw,28px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {getPersonalizedTips(result.analysis.skin_type, result.analysis.age, result.analysis.gender).map((item, i) => {
                    const allProducts  = result.recommendations?.products || []
                    const stepProducts = getProductsForStep(item.ingredients || [], allProducts)
                    
                    return (
                      <div 
                        key={i} 
                        className="tip-card collapsed"
                        id={`tip-card-${i}`}
                      >
                        <div 
                          className="tip-header" 
                          onClick={() => {
                            const card = document.getElementById(`tip-card-${i}`)
                            console.log(`%c📂 Step ${i + 1} toggled`, 'color: teal; font-weight: bold;')
                            card?.classList.toggle('collapsed')
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: cfg.accentLight, border: `1px solid ${cfg.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.accent, fontSize: '14px', fontWeight: '600' }}>
                              {i + 1}
                            </div>
                            <div>
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: cfg.accent, fontWeight: 600, marginBottom: '2px' }}>{item.step}</p>
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', fontWeight: 300 }}>{item.tip.substring(0, 60)}{item.tip.length > 60 ? '...' : ''}</p>
                            </div>
                          </div>
                          <ChevronDown size={18} strokeWidth={1.5} style={{ color: '#AA9688', flexShrink: 0 }} className="chevron-icon" />
                        </div>
                        <div className="tip-content" id={`tip-card-${i}`}>
                          <div className="tip-main">{item.tip}</div>
                          {stepProducts.length > 0 && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #EEE7DF' }}>
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: cfg.accent, fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ShoppingBag size={12} strokeWidth={1.5} /> Matched products for this step
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {stepProducts.map((rec, j) => (
                                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #EEE7DF', background: '#FDFAF7', borderRadius: '6px' }}>
                                    <div style={{ width: '48px', height: '48px', flexShrink: 0, background: '#F4EDE4', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px' }}>
                                      {rec.product.image ? <img src={getProductImageUrl(rec.product.image)} alt={rec.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} strokeWidth={1} style={{ color: '#D4C4B0' }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '2px' }}>{rec.product.brand}</p>
                                      <a href={`/products/${rec.product.slug}`} style={{ textDecoration: 'none' }}>
                                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '13px', color: '#16100C', fontWeight: 400, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.product.name}</p>
                                      </a>
                                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#7B6458', fontStyle: 'italic', fontWeight: 300, marginTop: '2px', lineHeight: 1.4 }}>{rec.reasoning?.split('.')[0]}.</p>
                                    </div>
                                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '14px', color: '#16100C', fontWeight: 400, marginBottom: '4px' }}>Rs. {rec.product.discounted_price}</p>
                                      <button onClick={() => addToCart(rec.product.id)} disabled={addingId === rec.product.id}
                                        style={{ background: cfg.accent, color: '#FFFFFF', border: 'none', padding: '6px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: '4px', opacity: addingId === rec.product.id ? 0.6 : 1 }}>
                                        {addingId === rec.product.id ? '...' : 'Add'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
                      <a href={`/products?suitable_skin_type=${result.analysis.skin_type}`} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: cfg.accent, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '5px', borderBottom: `1px solid ${cfg.accent}`, paddingBottom: '1px', whiteSpace: 'nowrap' }}>
                        Shop all {cfg.label} products <ChevronRight size={12} strokeWidth={2} />
                      </a>
                    </div>
                    <div style={{ padding: 'clamp(14px,2vw,20px)', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: '#E6DDD3' }}>
                      {top4.map((item, i) => {
                        const inStock = item.product.stock > 0 || item.product.stock_status === 'In Stock'
                        return (
                          <div key={i} style={{ background: '#FFFFFF', padding: 'clamp(14px,2vw,18px)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '12px', left: '12px', background: cfg.accent, color: '#FFFFFF', fontFamily: "'DM Sans',sans-serif", fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', zIndex: 1 }}>{rankLabel[i]}</div>
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
                              {item.reasoning && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', color: '#7B6458', lineHeight: 1.5, fontWeight: 300, fontStyle: 'italic' }}>{item.reasoning.split('.')[0]}.</p>}
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
                              <button onClick={() => addToCart(item.product.id)} disabled={addingId === item.product.id || !inStock} className="btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '5px', padding: '10px 8px', fontSize: '10px', opacity: !inStock ? 0.4 : addingId === item.product.id ? 0.6 : 1 }}>
                                <ShoppingBag size={12} strokeWidth={1.5} />
                                {addingId === item.product.id ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                              <button onClick={() => buyNow(item.product)} disabled={!inStock} className="btn-accent" style={{ flex: 1, justifyContent: 'center', gap: '5px', padding: '10px 8px', fontSize: '10px', opacity: !inStock ? 0.4 : 1 }}>
                                <Zap size={12} strokeWidth={1.5} />Buy Now
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #EEE7DF', textAlign: 'center' }}>
                      <a href={`/products?suitable_skin_type=${result.analysis.skin_type}`} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = cfg.accent}
                        onMouseLeave={e => e.currentTarget.style.color = '#7B6458'}>
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