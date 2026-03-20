// src/pages/Login.jsx — Industry Standard Minimal Luxury
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import SEO from '../components/SEO'
import { Eye, EyeOff, ArrowRight, AlertCircle, Mail, Lock } from 'lucide-react'

const LOGIN_CSS = `
  .login-page {
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
  /* Subtle background texture */
  .login-page::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 50%, rgba(184,137,90,0.05) 0%, transparent 55%),
      radial-gradient(circle at 85% 20%, rgba(22,16,12,0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  .login-card {
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    animation: authFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes authFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes luxShake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-5px); }
    40%,80%  { transform: translateX(5px); }
  }
  .lux-shake { animation: luxShake 0.4s ease; }
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
  .auth-input:focus {
    border-color: #B8895A;
    box-shadow: 0 0 0 3px rgba(184,137,90,0.08);
  }
  .auth-input.error  { border-color: #963838; }
  .auth-input.pr { padding-right: 44px; padding-left: 42px; }
  .auth-divider {
    display: flex; align-items: center; gap: 14px; margin: 20px 0;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: #EEE7DF;
  }
`

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

// Shared icon-input wrapper
const IconInput = ({ icon: Icon, children, suffix }) => (
  <div style={{ position: 'relative' }}>
    <Icon size={15} strokeWidth={1.5} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#C4B8B0', pointerEvents: 'none', zIndex: 1 }} />
    {children}
    {suffix && <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>{suffix}</div>}
  </div>
)

export default function Login() {
  const { login, loginWithTokens, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form,          setForm]          = useState({ email: '', password: '' })
  const [showPassword,  setShowPassword]  = useState(false)
  const [rememberMe,    setRememberMe]    = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [notFound,      setNotFound]      = useState(false)
  const [notVerified,   setNotVerified]   = useState(false)
  const [wrongPassword, setWrongPassword] = useState(false)
  const [generalError,  setGeneralError]  = useState('')
  const [resending,     setResending]     = useState(false)
  const [resendMsg,     setResendMsg]     = useState('')
  const [shake,         setShake]         = useState(false)

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500) }
  const clearErrors  = () => { setNotFound(false); setNotVerified(false); setWrongPassword(false); setGeneralError(''); setResendMsg('') }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true); clearErrors()
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())
        const res = await api.post('/users/google/', { token: tokenResponse.access_token, email: userInfo.email, first_name: userInfo.given_name||'', last_name: userInfo.family_name||'' })
        loginWithTokens(res.data.tokens.access, res.data.tokens.refresh)
        await refreshUser()
        const redirectTo = localStorage.getItem('redirect_after_login') || '/'
        localStorage.removeItem('redirect_after_login')
        navigate(redirectTo)
      } catch { setGeneralError('Google login failed. Please try again.') }
      finally { setGoogleLoading(false) }
    },
    onError: () => setGeneralError('Google login cancelled.'),
    prompt: 'select_account',
  })

  const handleChange = (e) => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); clearErrors() }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); clearErrors()
    try {
      await login(form.email, form.password, rememberMe)
      const redirectTo = localStorage.getItem('redirect_after_login') || '/'
      localStorage.removeItem('redirect_after_login')
      navigate(redirectTo)
    } catch (err) {
      const status = err.response?.status
      const data   = err.response?.data
      const error  = data?.error || ''
      const msg    = data?.message || data?.detail || ''
      if (status === 403 && error === 'email_not_verified') setNotVerified(true)
      else if (status === 401) setWrongPassword(true)
      else if (status === 404) setNotFound(true)
      else setGeneralError(msg || error || 'Login failed. Please try again.')
      triggerShake()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setResendMsg('')
    try { await api.post('/users/resend-otp/', { email: form.email }); setResendMsg('success') }
    catch { setResendMsg('error') }
    finally { setResending(false) }
  }

  const hasError = notFound || notVerified || wrongPassword || generalError

  return (
    <>
      <SEO title="Sign In" description="Sign in to your SkinCare account." url="/login" noIndex />
      <style>{LOGIN_CSS}</style>

      <div className="login-page">
        <div className="login-card">

          {/* ── Logo ── */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', color: '#16100C', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SkinCare</span>
              <span style={{ display: 'block', width: '24px', height: '1.5px', background: '#B8895A' }} />
            </Link>
          </div>

          {/* ── Heading ── */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#16100C', fontWeight: 400, marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#AA9688', fontWeight: 300 }}>
              New here?{' '}
              <Link to="/register" style={{ color: '#B8895A', textDecoration: 'none', fontWeight: 400, borderBottom: '1px solid rgba(184,137,90,0.35)', paddingBottom: '1px' }}>
                Create a free account
              </Link>
            </p>
          </div>

          {/* ── Google ── */}
          <button
            onClick={() => googleLogin()} disabled={googleLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#FFFFFF', border: '1px solid #E2D8D0', padding: '13px 20px', cursor: googleLoading ? 'wait' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: '#3A2820', fontWeight: 300, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(22,16,12,0.05)', marginBottom: '4px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8895A'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(184,137,90,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2D8D0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,16,12,0.05)' }}
          >
            {googleLoading ? <div className="spinner" style={{ width: '15px', height: '15px' }} /> : <GoogleIcon />}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* ── Divider ── */}
          <div className="auth-divider">
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#C4B8B0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              or continue with email
            </span>
          </div>

          {/* ── Errors ── */}
          {hasError && (
            <div className={shake ? 'lux-shake' : ''} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notFound && (
                <div className="alert-error">
                  <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span>No account found. <Link to="/register" style={{ color: '#963838', fontWeight: 400, textDecoration: 'underline' }}>Create one?</Link></span>
                </div>
              )}
              {notVerified && (
                <div className="alert-warning">
                  <Mail size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    Email not verified.{' '}
                    {resendMsg === 'success' && <span style={{ color: '#4A7A57' }}>OTP sent!</span>}
                    {resendMsg === 'error'   && <span style={{ color: '#963838' }}>Failed.</span>}
                    {!resendMsg && (
                      <button onClick={handleResend} disabled={resending}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#89670F', textDecoration: 'underline', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', padding: 0 }}>
                        {resending ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {wrongPassword && (
                <div className="alert-error">
                  <Lock size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  <span>Incorrect password. <Link to="/forgot-password" style={{ color: '#963838', textDecoration: 'underline' }}>Reset it?</Link></span>
                </div>
              )}
              {generalError && (
                <div className="alert-error">
                  <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />{generalError}
                </div>
              )}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400, marginBottom: '7px' }}>
                Email address
              </label>
              <IconInput icon={Mail}>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className={`auth-input ${notFound ? 'error' : ''}`}
                  onFocus={e => { if (!notFound) { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' } }}
                  onBlur={e  => { if (!notFound) { e.target.style.borderColor = '#E6DDD3'; e.target.style.boxShadow = 'none' } }}
                />
              </IconInput>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7B6458', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#B8895A', textDecoration: 'none', fontWeight: 400 }}>
                  Forgot?
                </Link>
              </div>
              <IconInput icon={Lock}
                suffix={
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#B8895A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#AA9688'}
                  >
                    {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                }
              >
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Enter your password" required
                  className={`auth-input pr ${wrongPassword ? 'error' : ''}`}
                  onFocus={e => { if (!wrongPassword) { e.target.style.borderColor = '#B8895A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,137,90,0.08)' } }}
                  onBlur={e  => { if (!wrongPassword) { e.target.style.borderColor = '#E6DDD3'; e.target.style.boxShadow = 'none' } }}
                />
              </IconInput>
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
              <div onClick={() => setRememberMe(s => !s)}
                style={{ width: '16px', height: '16px', border: `1.5px solid ${rememberMe ? '#B8895A' : '#D4C4B0'}`, background: rememberMe ? '#B8895A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                {rememberMe && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#7B6458', fontWeight: 300 }}>Keep me signed in</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#AA9688' : '#16100C', color: '#FAF8F5', border: 'none', padding: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.18em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s, transform 0.1s', marginTop: '4px' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#2A1A14'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#16100C'; e.currentTarget.style.transform = 'translateY(0)' } }}
              onMouseDown={e  => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={14} strokeWidth={1.5} /></>}
            </button>
          </form>

          {/* ── Footer ── */}
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#C4B8B0', textAlign: 'center', marginTop: '28px', lineHeight: 1.6, fontWeight: 300 }}>
            By signing in you agree to our{' '}
            <span style={{ color: '#AA9688', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}&amp;{' '}
            <span style={{ color: '#AA9688', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </>
  )
}