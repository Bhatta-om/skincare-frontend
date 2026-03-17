// src/pages/Register.jsx — 100% Professional Split Layout
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Register() {
  const navigate                      = useNavigate()
  const { refreshUser, loginWithTokens } = useAuth()

  const [step, setStep]   = useState('register')
  const [email, setEmail] = useState('')
  const [form, setForm]   = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '', phone: '',
  })
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [otp, setOtp]               = useState(['','','','','',''])
  const [otpError, setOtpError]     = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [resending, setResending]   = useState(false)
  const [resendMsg, setResendMsg]   = useState('')
  const [timer, setTimer]           = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return
    const t = setInterval(() => setTimer(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [step, timer])

  const getStrength = (pw) => {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const strength = getStrength(form.password)
  const strengthMeta = [
    { label:'Very weak', color:'bg-red-400',   text:'text-red-500'    },
    { label:'Weak',      color:'bg-orange-400', text:'text-orange-500' },
    { label:'Good',      color:'bg-yellow-400', text:'text-yellow-600' },
    { label:'Strong',    color:'bg-green-500',  text:'text-green-600'  },
  ]

  // ── Google Signup ─────────────────────────────────────────
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setErrors({})
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())

        const res = await api.post('/users/google/', {
          token:      tokenResponse.access_token,
          email:      userInfo.email,
          first_name: userInfo.given_name  || '',
          last_name:  userInfo.family_name || '',
        })

        loginWithTokens(res.data.tokens.access, res.data.tokens.refresh)
        await refreshUser()
        navigate('/')
      } catch (err) {
        const msg = err.response?.data?.error || 'Google sign up failed. Please try again.'
        setErrors({ general: msg })
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => setErrors({ general: 'Google sign up cancelled or failed.' }),
    prompt: 'select_account',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) { setErrors({ confirm_password: 'Passwords do not match!' }); return }
    setLoading(true); setErrors({})
    try {
      await api.post('/users/register/', {
        first_name:       form.first_name,
        last_name:        form.last_name,
        email:            form.email,
        password:         form.password,
        confirm_password: form.confirm_password,
        phone:            form.phone,
      })
      setEmail(form.email); setStep('otp'); setTimer(60)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const fe = {}
        if (data.error?.details) {
          Object.keys(data.error.details).forEach(k => { const v = data.error.details[k]; fe[k] = Array.isArray(v) ? v.join(' ') : v })
        } else {
          Object.keys(data).forEach(k => { const v = data[k]; fe[k] = Array.isArray(v) ? v.join(' ') : String(v) })
        }
        setErrors(fe)
      } else setErrors({ general: 'Registration failed. Please try again.' })
    } finally { setLoading(false) }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp); setOtpError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newOtp.every(d => d !== '') && value) handleVerifyOtp(newOtp.join(''))
  }
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }
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
      if (res.data.tokens) {
        loginWithTokens(res.data.tokens.access, res.data.tokens.refresh)
      }
      await refreshUser(); navigate('/')
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Invalid OTP. Please try again.')
      setOtp(['','','','','','']); inputRefs.current[0]?.focus()
    } finally { setOtpLoading(false) }
  }
  const handleResend = async () => {
    if (timer > 0) return
    setResending(true); setResendMsg('')
    try {
      await api.post('/users/resend-otp/', { email })
      setResendMsg('success'); setOtp(['','','','','','']); setTimer(60); inputRefs.current[0]?.focus()
    } catch { setResendMsg('error') }
    finally { setResending(false) }
  }

  const sharedStyles = `
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .animate-fadeUp { animation:fadeUp .4s ease forwards }
    .animate-float  { animation:float 3s ease-in-out infinite }
    .input-field {
      width:100%; border:2px solid #e5e7eb; border-radius:14px;
      padding:12px 16px; font-size:14px; color:#111827;
      background:#f9fafb; outline:none; transition:all 0.2s;
    }
    .input-field:focus { border-color:#7c3aed; background:#fff; box-shadow:0 0 0 4px rgba(124,58,237,0.08) }
    .input-field.error   { border-color:#fca5a5; background:#fef2f2 }
    .input-field.success { border-color:#86efac; background:#f0fdf4 }
  `

  // ── Left panel ──────────────────────────────────────────
  const LeftPanel = () => (
    <div className="hidden lg:flex lg:w-[48%] bg-linear-to-br from-purple-700 via-purple-600 to-pink-500 relative overflow-hidden flex-col justify-between p-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-15 left-15 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl" />
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-300/60 rounded-full animate-float" style={{animationDelay:'0s'}} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/60 rounded-full animate-float" style={{animationDelay:'1s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-pink-300/60 rounded-full animate-float" style={{animationDelay:'2s'}} />
      </div>
      <div className="relative">
        <Link to="/" className="text-2xl font-black text-white">✨ SkinCare</Link>
      </div>
      <div className="relative text-white">
        <div className="text-6xl mb-6">🌸</div>
        <h2 className="text-4xl font-black leading-tight mb-4">
          Start your<br /><span className="text-yellow-300">glow journey.</span>
        </h2>
        <p className="text-purple-100 text-lg leading-relaxed mb-8 max-w-sm">
          Join thousands who've found their perfect skincare routine with AI-powered analysis.
        </p>
        <div className="space-y-3">
          {[
            '🔬 Free AI skin type analysis',
            '🧴 Personalized product picks',
            '📦 Fast delivery across Nepal',
            '💎 Verified skincare brands',
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-white/90 text-sm">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex gap-8">
        {[['10K+','Users'],['96%','Accuracy'],['500+','Products']].map(([val,label]) => (
          <div key={label}>
            <p className="text-2xl font-black text-white">{val}</p>
            <p className="text-purple-200 text-xs">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  // ── OTP SCREEN ───────────────────────────────────────────
  if (step === 'otp') {
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="min-h-screen flex">
          <LeftPanel />
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 bg-white overflow-y-auto">
            <div className="w-full max-w-100 animate-fadeUp text-center">
              <div className="lg:hidden text-center mb-8">
                <Link to="/" className="text-2xl font-black text-purple-600">✨ SkinCare</Link>
              </div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-3xl mb-5 text-4xl">
                📩
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Check your email</h1>
              <p className="text-gray-500 text-sm mb-1">We sent a 6-digit code to</p>
              <p className="font-bold text-purple-600 text-sm bg-purple-50 px-4 py-2 rounded-xl inline-block mb-7">{email}</p>

              <div className="flex gap-2.5 justify-center mb-5" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => inputRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-all
                      ${digit     ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : otpError  ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,58,237,0.08)]'}
                      ${otpLoading ? 'opacity-50' : ''}`}
                    disabled={otpLoading} autoFocus={i === 0}
                  />
                ))}
              </div>

              {otpError    && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">⚠️ {otpError}</div>}
              {resendMsg === 'success' && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">✅ New OTP sent!</div>}
              {resendMsg === 'error'   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">❌ Failed to resend.</div>}

              <button onClick={() => handleVerifyOtp()} disabled={otpLoading || otp.some(d => d === '')}
                className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200/60 disabled:shadow-none mb-3 text-sm">
                {otpLoading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Verifying...</span>
                  : 'Verify Email ✓'}
              </button>

              <button onClick={handleResend} disabled={timer > 0 || resending}
                className={`w-full py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  timer > 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
                {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : '🔄 Resend Code'}
              </button>

              <div className="mt-5 space-y-1">
                <p className="text-xs text-gray-400">Check spam/junk folder if not found</p>
                <button onClick={() => setStep('register')} className="text-sm text-purple-500 hover:text-purple-700 font-medium">
                  ← Use a different email
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── REGISTER FORM ────────────────────────────────────────
  return (
    <>
      <style>{sharedStyles}</style>
      <div className="min-h-screen flex">
        <LeftPanel />

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 bg-white overflow-y-auto">
          <div className="w-full max-w-105 animate-fadeUp">

            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="text-2xl font-black text-purple-600">✨ SkinCare</Link>
            </div>

            <div className="mb-7">
              <h1 className="text-3xl font-black text-gray-900 mb-1">Create account</h1>
              <p className="text-gray-500 text-sm">
                Already have one?{' '}
                <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700">Sign in →</Link>
              </p>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={() => googleSignup()}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-gray-700 font-semibold py-3.5 rounded-2xl transition-all mb-5 disabled:opacity-50">
              {googleLoading
                ? <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>}
              <span className="text-sm">{googleLoading ? 'Signing up...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100"/>
              <span className="text-xs text-gray-400 font-medium px-1">or</span>
              <div className="flex-1 h-px bg-gray-100"/>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 flex gap-2 items-center">
                <span className="text-red-400">⚠️</span>
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            )}
            {errors.email?.toLowerCase().includes('already') && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-base shrink-0">⚠️</div>
                <div>
                  <p className="font-bold text-orange-800 text-sm mb-1.5">Email already registered</p>
                  <Link to="/login" className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg inline-block transition-colors">Login instead →</Link>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                {[{name:'first_name',label:'First name',ph:'John'},{name:'last_name',label:'Last name',ph:'Doe'}].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                    <input type="text" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.ph} required
                      className={`input-field ${errors[f.name] ? 'error' : ''}`} />
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">⚠️ {errors[f.name]}</p>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required
                  className={`input-field ${errors.email ? 'error' : ''}`} />
                {errors.email && !errors.email.toLowerCase().includes('already') && <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX"
                  className={`input-field ${errors.phone ? 'error' : ''}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">⚠️ {errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    placeholder="Create a strong password" required
                    className={`input-field pr-11 ${errors.password ? 'error' : ''}`} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors">
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthMeta[strength-1]?.color : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    {strength > 0 && <p className={`text-xs font-semibold ${strengthMeta[strength-1]?.text}`}>{strengthMeta[strength-1]?.label}</p>}
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password}
                    onChange={handleChange} placeholder="Repeat your password" required
                    className={`input-field pr-11 ${errors.confirm_password ? 'error' : form.confirm_password && form.confirm_password === form.password ? 'success' : ''}`} />
                  <button type="button" onClick={() => setShowConfirm(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors">
                    {showConfirm
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                  </button>
                </div>
                {form.confirm_password && form.confirm_password === form.password && !errors.confirm_password && (
                  <p className="text-green-600 text-xs mt-1 font-semibold">✅ Passwords match</p>
                )}
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.confirm_password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200/60 disabled:shadow-none active:scale-[0.98] text-sm mt-1">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Creating account...</span>
                  : 'Create Account →'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              By registering, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-gray-600">Terms</span> &{' '}cls
              ]
              
              <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}