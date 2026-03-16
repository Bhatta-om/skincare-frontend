// src/pages/ForgotPassword.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ── Step indicators ────────────────────────────────────────
const steps = ['Enter Email', 'Verify OTP', 'New Password']

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            i < current  ? 'bg-green-500 text-white'
            : i === current ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-400'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-medium ${i === current ? 'text-purple-600' : 'text-gray-400'}`}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`w-12 h-0.5 mb-5 transition-colors ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
)

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep]               = useState(0)
  const [email, setEmail]             = useState('')
  const [otp, setOtp]                 = useState(['', '', '', '', '', ''])
  const [resetToken, setResetToken]   = useState('')
  const [passwords, setPasswords]     = useState({ new_password: '', confirm_password: '' })
  const [showPass, setShowPass]       = useState({ new: false, confirm: false })
  const [loading, setLoading]         = useState(false)

  // ── Step 1: Send OTP ───────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/users/forgot-password/', { email })
      toast.success('OTP sent to your email! 📧')
      setStep(1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP input handlers ─────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      document.getElementById('otp-5')?.focus()
    }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Please enter the 6-digit OTP.'); return }
    setLoading(true)
    try {
      const res = await api.post('/users/forgot-password/verify-otp/', { email, otp: code })
      setResetToken(res.data.reset_token)
      toast.success('OTP verified! ✅')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Reset Password ─────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Passwords do not match!')
      return
    }
    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/reset-password/', passwords, {
        headers: { Authorization: `Bearer ${resetToken}` }
      })
      toast.success('Password reset successfully! 🎉')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/users/forgot-password/', { email })
      setOtp(['', '', '', '', '', ''])
      toast.success('New OTP sent! 📧')
    } catch {
      toast.error('Failed to resend OTP.')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 0 && "Enter your email to receive an OTP"}
            {step === 1 && "Enter the OTP sent to your email"}
            {step === 2 && "Create your new password"}
          </p>
        </div>

        <StepBar current={step} />

        {/* ── Step 0: Email ── */}
        {step === 0 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Sending OTP...
                </span>
              ) : 'Send OTP 📧'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-600 font-semibold hover:underline">Login</Link>
            </p>
          </form>
        )}

        {/* ── Step 1: OTP ── */}
        {step === 1 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 text-center mb-4">
                OTP sent to <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      digit ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300 text-gray-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading || otp.join('').length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Verifying...
                </span>
              ) : 'Verify OTP ✅'}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setStep(0)} className="text-gray-500 hover:text-gray-700">
                ← Change Email
              </button>
              <button type="button" onClick={handleResend} className="text-purple-600 hover:underline font-medium">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ── Step 2: New Password ── */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPass.new ? 'text' : 'password'}
                  value={passwords.new_password}
                  onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  {showPass.new ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password strength */}
              {passwords.new_password && (
                <div className="mt-2 space-y-1">
                  {[
                    { ok: passwords.new_password.length >= 8,  label: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(passwords.new_password), label: 'One uppercase letter' },
                    { ok: /[0-9]/.test(passwords.new_password), label: 'One number' },
                  ].map((rule, i) => (
                    <p key={i} className={`text-xs flex items-center gap-1 ${rule.ok ? 'text-green-600' : 'text-gray-400'}`}>
                      {rule.ok ? '✅' : '○'} {rule.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPass.confirm ? 'text' : 'password'}
                  value={passwords.confirm_password}
                  onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full border rounded-lg px-4 py-3 pr-12 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    passwords.confirm_password && passwords.new_password !== passwords.confirm_password
                      ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  {showPass.confirm ? '🙈' : '👁️'}
                </button>
              </div>
              {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                <p className="text-xs text-red-500 mt-1">❌ Passwords do not match</p>
              )}
              {passwords.confirm_password && passwords.new_password === passwords.confirm_password && (
                <p className="text-xs text-green-600 mt-1">✅ Passwords match</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Resetting...
                </span>
              ) : '🔐 Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}