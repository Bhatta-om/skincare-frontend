// src/pages/Register.jsx — Industry Standard Minimal Luxury
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import SEO from '../components/SEO'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Mail, User, Phone, Lock } from 'lucide-react'

const REGISTER_CSS = `
  .reg-page {
    min-height: 100vh;
    background: #FDFAF7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
    overflow: hidden;
  }
  .reg-page::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 50%, rgba(184,137,90,0.05) 0%, transparent 55%),
      radial-gradient(circle at 85% 20%, rgba(22,16,12,0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  .reg-card {
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
    animation: authFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes authFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-input {
    width: 100%;
    background: #FFFFFF;
    border: 1px solid #E6DDD3;
    color: #16100C;
    padding: 13px 14px 13px 42px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 300;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    -webkit-appearance: none;
  }
  .auth-input:focus { border-color: #B8895A; box-shadow: 0 0 0 3px rgba(184,137,90,0.08); }
  .auth-input.error   { border-color: #963838; }
  .auth-input.success { border-color: #4A7A57; }
  .auth-input.pr { padding-right: 44px; }
  .reg-name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 420px) { .reg-name-row { grid-template-columns: 1fr; } }
  .auth-divider {
    display: flex; align-items: center; gap: 14px; margin: 20px 0;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: #EEE7DF;
  }
  /* OTP screen */
  .otp-grid { display: flex; gap: 10px; justify-content: center; }
  .otp-input {
    width: clamp(42px, 9vw, 52px);
    height: 60px;
    text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 400;
    border: 1.5px solid #E6DDD3;
    background: #FFFFFF;
    color: #16100C;
    outline: none;
    transition: all 0.2s;
  }
  .otp-input:focus { border-color: #B8895A; box-shadow: 0 0 0 3px rgba(184,137,90,0.08); }
`

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

const IconInput = ({ icon: Icon, children, suffix }) => (
  <div style={{ position: 'relative' }}>
    <Icon size={15} strokeWidth={1.5} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#C4B8B0', pointerEvents: 'none', zIndex: 1 }} />
    {children}
    {suffix && <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>{suffix}</div>}
  </div>
)

const FieldLabel = ({ children, required, optional }) => (
  <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400, marginBottom: '7px' }}>
    {children}
    {required && <span style={{ color: '#963838', marginLeft: '3px' }}>*</span>}
    {optional && <span style={{ color: '#C4B8B0', textTransform: 'none', letterSpacing: 0, marginLeft: '5px', fontWeight: 300, fontSize: '10px' }}>(optional)</span>}
  </label>
)

const FieldError = ({ msg }) => msg ? (
  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#963838', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 300 }}>
    <AlertCircle size={11} strokeWidth={1.5} />{msg}
  </p>
) : null

const getStrength = (pw) => {
  if (!pw) return 0; let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthMeta = [
  { label: 'Weak',   color: '#963838' },
  { label: 'Fair',   color: '#89670F' },
  { label: 'Good',   color: '#4A7A57' },
  { label: 'Strong', color: '#4A7A57' },
]

// Shared page logo
const PageLogo = () => (
  <div style={{ textAlign: 'center', marginBottom: '36px' }}>
    <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', color: '#16100C', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SkinCare</span>
      <span style={{ display: 'block', width: '24px', height: '1.5px', background: '#B8895A' }} />
    </Link>
  </div>
)

export default function Register() {
  const navigate                         = useNavigate()
  const { refreshUser, loginWithTokens } = useAuth()

  const [step,          setStep]         = useState('register')
  const [email,         setEmail]        = useState('')
  const [form,          setForm]         = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '', phone: '' })
  const [errors,        setErrors]       = useState({})
  const [loading,       setLoading]      = useState(false)
  const [googleLoading, setGoogleLoading]= useState(false)
  const [showPass,      setShowPass]     = useState(false)
  const [showConfirm,   setShowConfirm]  = useState(false)
  const [otp,           setOtp]          = useState(['','','','','',''])
  const [otpError,      setOtpError]     = useState('')
  const [otpLoading,    setOtpLoading]   = useState(false)
  const [resending,     setResending]    = useState(false)
  const [resendMsg,     setResendMsg]    = useState('')
  const [timer,         setTimer]        = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return
    const t = setInterval(() => setTimer(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [step, timer])

  const strength     = getStrength(form.password)
  const strengthInfo = strength > 0 ? strengthMeta[strength - 1] : null

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true); setErrors({})
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }).then(r => r.json())
        const res = await api.post('/users/google/', { token: tokenResponse.access_token, email: userInfo.email, first_name: userInfo.given_name||'', last_name: userInfo.family_name||'' })
        loginWithTokens(res.data.tokens.access, res.data.tokens.refresh)
        await refreshUser(); navigate('/')
      } catch (err) { setErrors({ general: err.response?.data?.error || 'Google sign up failed.' }) }
      finally { setGoogleLoading(false) }
    },
    onError: () => setErrors({ general: 'Google sign up cancelled.' }),
    prompt: 'select_account',
  })

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' })) }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) { setErrors({ confirm_password: 'Passwords do not match' }); return }
    setLoading(true); setErrors({})
    try {
      await api.post('/users/register/', { first_name: form.first_name, last_name: form.last_name, email: form.email, password: form.password, confirm_password: form.confirm_password, phone: form.phone })
      setEmail(form.email); setStep('otp'); setTimer(60)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const fe = {}
        if (data.error?.details) { Object.keys(data.error.details).forEach(k => { const v = data.error.details[k]; fe[k] = Array.isArray(v) ? v.join(' ') : v }) }
        else { Object.keys(data).forEach(k => { const v = data[k]; fe[k] = Array.isArray(v) ? v.join(' ') : String(v) }) }
        setErrors(fe)
      } else setErrors({ general: 'Registration failed. Please try again.' })
    } finally { setLoading(false) }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp); setOtpError('')
    if (value && index < 5) inputRefs.current[index+1]?.focus()
    if (newOtp.every(d => d !== '') && value) handleVerifyOtp(newOtp.join(''))
  }
  const handleOtpKeyDown = (index, e) => { if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index-1]?.focus() }
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (paste.length === 6) { setOtp(paste.split('')); inputRefs.current[5]?.focus(); handleVerifyOtp(paste) }
  }
  const handleVerifyOtp = async (otpCode) => {
    const code = otpCode || otp.join('')
    if (code.length !== 6) { setOtpError('Please enter the complete 6-digit code.'); return }
    setOtpLoading(true); setOtpError('')
    try {
      const res = await api.post('/users/verify-otp/', { email, otp: code })
      if (res.data.tokens) loginWithTokens(res.data.tokens.access, res.data.tokens.refresh)
      await refreshUser(); navigate('/')
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Invalid OTP. Please try again.')
      setOtp(['','','','','','']); inputRefs.current[0]?.focus()
    } finally { setOtpLoading(false) }
  }
  const handleResend = async () => {
    if (timer > 0) return
    setResending(true); setResendMsg('')
    try { await api.post('/users/resend-otp/', { email }); setResendMsg('success'); setOtp(['','','','','','']); setTimer(60); inputRefs.current[0]?.focus() }
    catch { setResendMsg('error') }
    finally { setResending(false) }
  }

  const submitBtn = (label, disabled) => ({
    width: '100%', background: disabled ? '#C4B8B0' : '#16100C', color: '#FAF8F5', border: 'none',
    padding: '15px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400,
    textTransform: 'uppercase', letterSpacing: '0.18em',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    transition: 'background 0.2s, transform 0.1s', marginTop: '6px',
  })

  // ── OTP Screen ────────────────────────────────────────────
  if (step === 'otp') return (
    <>
      <SEO title="Verify Email" url="/register" noIndex />
      <style>{REGISTER_CSS}</style>
      <div className="reg-page">
        <div className="reg-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <PageLogo />

          {/* Mail icon box */}
          <div style={{ width: '72px', height: '72px', border: '1px solid #E6DDD3', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#B8895A', boxShadow: '0 4px 20px rgba(184,137,90,0.1)' }}>
            <Mail size={28} strokeWidth={1.5} />
          </div>

          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px', fontWeight: 400 }}>
            Check your inbox
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', color: '#16100C', fontWeight: 400, marginBottom: '10px' }}>
            Verify your email
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#AA9688', fontWeight: 300, marginBottom: '8px' }}>
            We sent a 6-digit code to
          </p>
          <div style={{ display: 'inline-block', padding: '8px 18px', background: 'rgba(184,137,90,0.07)', border: '1px solid rgba(184,137,90,0.2)', marginBottom: '32px' }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#B8895A', fontWeight: 400 }}>{email}</span>
          </div>

          {/* OTP inputs */}
          <div className="otp-grid" onPaste={handleOtpPaste} style={{ marginBottom: '16px' }}>
            {otp.map((digit, i) => (
              <input key={i} ref={el => inputRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                autoFocus={i === 0} disabled={otpLoading}
                className="otp-input"
                style={{ borderColor: digit ? '#B8895A' : otpError ? '#963838' : '#E6DDD3', background: digit ? '#FFFCF9' : '#FFFFFF', opacity: otpLoading ? 0.5 : 1 }}
              />
            ))}
          </div>

          {otpError && (
            <div className="alert-error" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />{otpError}
            </div>
          )}
          {resendMsg === 'success' && <div className="alert-success" style={{ marginBottom: '12px' }}><CheckCircle size={13} strokeWidth={1.5} />New code sent!</div>}
          {resendMsg === 'error'   && <div className="alert-error"   style={{ marginBottom: '12px' }}><AlertCircle  size={13} strokeWidth={1.5} />Failed to resend.</div>}

          <button onClick={() => handleVerifyOtp()} disabled={otpLoading || otp.some(d => d === '')}
            style={submitBtn('Verify Email', otpLoading || otp.some(d => d === ''))}
            onMouseEnter={e => { if (!otpLoading && !otp.some(d => d === '')) { e.currentTarget.style.background = '#2A1A14'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { if (!otpLoading && !otp.some(d => d === '')) { e.currentTarget.style.background = '#16100C'; e.currentTarget.style.transform = 'translateY(0)' } }}
          >
            {otpLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          <button onClick={handleResend} disabled={timer > 0 || resending}
            style={{ width: '100%', marginTop: '10px', background: 'transparent', border: `1px solid ${timer > 0 ? '#EEE7DF' : '#E6DDD3'}`, color: timer > 0 ? '#C4B8B0' : '#7B6458', padding: '13px', cursor: timer > 0 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.14em', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (timer <= 0) e.currentTarget.style.borderColor = '#B8895A' }}
            onMouseLeave={e => e.currentTarget.style.borderColor = timer > 0 ? '#EEE7DF' : '#E6DDD3' }
          >
            {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#C4B8B0', fontWeight: 300 }}>
              Check spam/junk folder if not received
            </p>
            <button onClick={() => setStep('register')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#B8895A', fontWeight: 400 }}>
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    </>
  )

  // ── Register Form ─────────────────────────────────────────
  return (
    <>
      <SEO title="Create Account" description="Create your free SkinCare account." url="/register" />
      <style>{REGISTER_CSS}</style>

      <div className="reg-page">
        <div className="reg-card">
          <PageLogo />

          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#16100C', fontWeight: 400, marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Create account
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#AA9688', fontWeight: 300 }}>
              Already have one?{' '}
              <Link to="/login" style={{ color: '#B8895A', textDecoration: 'none', fontWeight: 400, borderBottom: '1px solid rgba(184,137,90,0.35)', paddingBottom: '1px' }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Google */}
          <button type="button" onClick={() => googleSignup()} disabled={googleLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#FFFFFF', border: '1px solid #E2D8D0', padding: '13px 20px', cursor: googleLoading ? 'wait' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#3A2820', fontWeight: 300, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(22,16,12,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8895A'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(184,137,90,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2D8D0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,16,12,0.05)' }}
          >
            {googleLoading ? <div className="spinner" style={{ width: '15px', height: '15px' }} /> : <GoogleIcon />}
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </button>

          <div className="auth-divider">
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#C4B8B0', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              or register with email
            </span>
          </div>

          {/* Errors */}
          {errors.general && <div className="alert-error" style={{ marginBottom: '16px' }}><AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />{errors.general}</div>}
          {errors.email?.toLowerCase().includes('already') && (
            <div className="alert-warning" style={{ marginBottom: '16px' }}>
              <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span>Email already exists.{' '}<Link to="/login" style={{ color: '#89670F', fontWeight: 400, textDecoration: 'underline' }}>Sign in instead</Link></span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* Name */}
            <div className="reg-name-row">
              {[{ name: 'first_name', label: 'First Name', ph: 'John', Icon: User }, { name: 'last_name', label: 'Last Name', ph: 'Doe', Icon: User }].map(f => (
                <div key={f.name}>
                  <FieldLabel required>{f.label}</FieldLabel>
                  <IconInput icon={f.Icon}>
                    <input type="text" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.ph} required
                      className={`auth-input ${errors[f.name] ? 'error' : ''}`}
                      onFocus={e => { if (!errors[f.name]) { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' } }}
                      onBlur={e  => { if (!errors[f.name]) { e.target.style.borderColor = '#E6DDD3'; e.target.style.boxShadow = 'none' } }}
                    />
                  </IconInput>
                  <FieldError msg={errors[f.name]} />
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <FieldLabel required>Email address</FieldLabel>
              <IconInput icon={Mail}>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className={`auth-input ${errors.email && !errors.email.toLowerCase().includes('already') ? 'error' : ''}`}
                  onFocus={e => { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = '#E6DDD3'; e.target.style.boxShadow = 'none' }}
                />
              </IconInput>
              {errors.email && !errors.email.toLowerCase().includes('already') && <FieldError msg={errors.email} />}
            </div>

            {/* Phone */}
            <div>
              <FieldLabel optional>Phone</FieldLabel>
              <IconInput icon={Phone}>
                <input type="text" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="98XXXXXXXX" className="auth-input"
                  onFocus={e => { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = '#E6DDD3'; e.target.style.boxShadow = 'none' }}
                />
              </IconInput>
            </div>

            {/* Password */}
            <div>
              <FieldLabel required>Password</FieldLabel>
              <IconInput icon={Lock}
                suffix={
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#B8895A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#AA9688'}
                  >
                    {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                }
              >
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="At least 8 characters" required
                  className={`auth-input pr ${errors.password ? 'error' : ''}`}
                  onFocus={e => { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = errors.password ? '#963838' : '#E6DDD3'; e.target.style.boxShadow = 'none' }}
                />
              </IconInput>
              {/* Strength */}
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '5px' }}>
                    {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: '2px', background: i < strength && strengthInfo ? strengthInfo.color : '#E6DDD3', transition: 'background 0.3s', borderRadius: '1px' }} />)}
                  </div>
                  {strengthInfo && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: strengthInfo.color, fontWeight: 400 }}>{strengthInfo.label} password</p>}
                </div>
              )}
              <FieldError msg={errors.password} />
            </div>

            {/* Confirm */}
            <div>
              <FieldLabel required>Confirm Password</FieldLabel>
              <IconInput icon={Lock}
                suffix={
                  <button type="button" onClick={() => setShowConfirm(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#B8895A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#AA9688'}
                  >
                    {showConfirm ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                }
              >
                <input type={showConfirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password} onChange={handleChange}
                  placeholder="Repeat your password" required
                  className={`auth-input pr ${errors.confirm_password ? 'error' : form.confirm_password && form.confirm_password === form.password ? 'success' : ''}`}
                  onFocus={e => { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' }}
                  onBlur={e  => { e.target.style.borderColor = errors.confirm_password ? '#963838' : form.confirm_password === form.password && form.confirm_password ? '#4A7A57' : '#E6DDD3'; e.target.style.boxShadow = 'none' }}
                />
              </IconInput>
              {form.confirm_password && form.confirm_password === form.password && !errors.confirm_password && (
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#4A7A57', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 300 }}>
                  <CheckCircle size={11} strokeWidth={1.5} /> Passwords match
                </p>
              )}
              <FieldError msg={errors.confirm_password} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={submitBtn('Create Account', loading)}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#2A1A14'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#16100C'; e.currentTarget.style.transform = 'translateY(0)' } }}
              onMouseDown={e  => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={14} strokeWidth={1.5} /></>}
            </button>
          </form>

          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#C4B8B0', textAlign: 'center', marginTop: '24px', lineHeight: 1.6, fontWeight: 300 }}>
            By registering you agree to our{' '}
            <span style={{ color: '#AA9688', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}&amp;{' '}
            <span style={{ color: '#AA9688', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </>
  )
}