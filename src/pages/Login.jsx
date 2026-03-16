// src/pages/Login.jsx — 100% Professional Split Layout
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const { login, loginWithTokens, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]                   = useState({ email: '', password: '' })
  const [showPassword, setShowPassword]   = useState(false)
  const [rememberMe, setRememberMe]       = useState(false)
  const [loading, setLoading]             = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [notFound, setNotFound]           = useState(false)
  const [notVerified, setNotVerified]     = useState(false)
  const [wrongPassword, setWrongPassword] = useState(false)
  const [generalError, setGeneralError]   = useState('')
  const [resending, setResending]         = useState(false)
  const [resendMsg, setResendMsg]         = useState('')
  const [shake, setShake]                 = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const clearErrors = () => {
    setNotFound(false); setNotVerified(false)
    setWrongPassword(false); setGeneralError(''); setResendMsg('')
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true); clearErrors()
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())
        const res = await api.post('/users/google/', {
          token: tokenResponse.access_token,
          email: userInfo.email,
          first_name: userInfo.given_name || '',
          last_name: userInfo.family_name || '',
        })
        loginWithTokens(res.data.tokens.access, res.data.tokens.refresh)
        await refreshUser()
        const redirectTo = localStorage.getItem('redirect_after_login') || '/'
        localStorage.removeItem('redirect_after_login')
        navigate(redirectTo)
      } catch { setGeneralError('Google login failed. Please try again.') }
      finally { setGoogleLoading(false) }
    },
    onError: () => setGeneralError('Google login cancelled or failed.'),
    prompt: 'select_account',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    clearErrors()
  }

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
      else if (status === 401) { setWrongPassword(true); triggerShake() }
      else if (status === 404) { setNotFound(true); triggerShake() }
      else setGeneralError(msg || error || 'Login failed. Please try again.')
      triggerShake()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setResendMsg('')
    try {
      await api.post('/users/resend-otp/', { email: form.email })
      setResendMsg('success')
    } catch { setResendMsg('error') }
    finally { setResending(false) }
  }

  const hasError = notFound || notVerified || wrongPassword || generalError

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          20%,60%  { transform: translateX(-6px) }
          40%,80%  { transform: translateX(6px) }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateX(-12px) }
          to   { opacity:1; transform:translateX(0) }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px) }
          50%     { transform:translateY(-8px) }
        }
        .animate-shake  { animation: shake 0.5s ease }
        .animate-fadeUp { animation: fadeUp 0.4s ease forwards }
        .animate-slideIn{ animation: slideIn 0.3s ease forwards }
        .animate-float  { animation: float 3s ease-in-out infinite }
        .input-field {
          width:100%; border:2px solid #e5e7eb; border-radius:14px;
          padding:12px 16px; font-size:14px; color:#111827;
          background:#f9fafb; outline:none; transition:all 0.2s;
        }
        .input-field:focus { border-color:#7c3aed; background:#fff; box-shadow:0 0 0 4px rgba(124,58,237,0.08) }
        .input-field.error { border-color:#fca5a5; background:#fef2f2 }
        .input-field.success { border-color:#86efac; background:#f0fdf4 }
      `}</style>

      <div className="min-h-screen flex">

        {/* ── LEFT PANEL (desktop only) ── */}
        <div className="hidden lg:flex lg:w-[52%] bg-linear-to-br from-purple-700 via-purple-600 to-pink-500 relative overflow-hidden flex-col justify-between p-12">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-15 left-15 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            {/* Floating circles */}
            <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-300/60 rounded-full animate-float" style={{animationDelay:'0s'}} />
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/60 rounded-full animate-float" style={{animationDelay:'1s'}} />
            <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-pink-300/60 rounded-full animate-float" style={{animationDelay:'2s'}} />
          </div>

          {/* Logo */}
          <div className="relative">
            <Link to="/" className="text-2xl font-black text-white">✨ SkinCare</Link>
          </div>

          {/* Center content */}
          <div className="relative text-white">
            <div className="text-6xl mb-6">🌸</div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Your skin deserves<br />
              <span className="text-yellow-300">the best care.</span>
            </h2>
            <p className="text-purple-100 text-lg leading-relaxed mb-8 max-w-sm">
              AI-powered skin analysis and personalized product recommendations — all in one place.
            </p>

            {/* Testimonial */}
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5 max-w-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-300 text-sm">★</span>)}
              </div>
              <p className="text-white text-sm leading-relaxed italic mb-3">
                "The AI analysis was spot-on! My skin has never looked better since following the recommendations."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">P</div>
                <div>
                  <p className="text-white text-xs font-bold">Priya S.</p>
                  <p className="text-purple-200 text-xs">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="relative flex gap-8">
            {[['10K+','Users'],['96%','Accuracy'],['500+','Products']].map(([val,label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-purple-200 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ── */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 bg-white overflow-y-auto">
          <div className="w-full max-w-100 animate-fadeUp">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="text-2xl font-black text-purple-600">✨ SkinCare</Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-1">Sign in</h1>
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
                  Create one free →
                </Link>
              </p>
            </div>

            {/* Google */}
            <button onClick={() => googleLogin()} disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-gray-700 font-semibold py-3.5 rounded-2xl transition-all mb-5 disabled:opacity-50">
              {googleLoading
                ? <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>}
              <span className="text-sm">{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium px-1">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Error alerts */}
            {hasError && (
              <div className={`mb-4 animate-slideIn ${shake ? 'animate-shake' : ''}`}>
                {notFound && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-base shrink-0">🤔</div>
                      <div className="flex-1">
                        <p className="font-bold text-orange-800 text-sm">Account not found</p>
                        <p className="text-orange-600 text-xs mt-0.5 mb-2">{form.email} is not registered.</p>
                        <Link to="/register" className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg inline-block transition-colors">
                          Create Account →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {notVerified && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-base shrink-0">📧</div>
                      <div className="flex-1">
                        <p className="font-bold text-amber-800 text-sm">Email not verified</p>
                        <p className="text-amber-700 text-xs mt-0.5 mb-2">Verify <span className="font-semibold">{form.email}</span> to continue.</p>
                        {resendMsg === 'success' && <p className="text-green-600 text-xs mb-1 font-medium">✅ OTP sent!</p>}
                        {resendMsg === 'error'   && <p className="text-red-500 text-xs mb-1">❌ Failed to resend.</p>}
                        <button onClick={handleResend} disabled={resending}
                          className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                          {resending ? 'Sending...' : '🔄 Resend OTP'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {wrongPassword && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-base shrink-0">🔑</div>
                    <div>
                      <p className="font-bold text-red-800 text-sm">Incorrect password</p>
                      <Link to="/forgot-password" className="text-red-600 text-xs underline">Reset password?</Link>
                    </div>
                  </div>
                )}
                {generalError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex gap-2 items-center">
                    <span className="text-red-400">⚠️</span>
                    <span className="text-red-700 text-sm">{generalError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com" required
                  className={`input-field ${notFound ? 'error' : notVerified ? 'error' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="Enter your password" required
                    className={`input-field pr-11 ${wrongPassword ? 'error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors">
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div className="relative" onClick={() => setRememberMe(s => !s)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-300'}`}>
                      {rememberMe && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200/60 disabled:shadow-none active:scale-[0.98] text-sm mt-2">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Signing in...</span>
                  : 'Sign In →'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              By signing in, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-gray-600">Terms</span> &{' '}
              <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}