// src/pages/ForgotPassword.jsx — SkinMedica Luxury Redesign + Mobile Responsive + SEO
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import {
  Mail, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, ArrowLeft, Send,
} from 'lucide-react'

const FORGOT_CSS = `
  .forgot-otp-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 4px;
  }
  .forgot-otp-input {
    width: clamp(40px, 9vw, 48px);
    height: 56px;
    text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    border: 1.5px solid #E6DDD3;
    background: #FFFFFF;
    color: #16100C;
    outline: none;
    transition: all 0.2s ease;
  }
  .forgot-otp-input:focus { border-color: #B8895A; }
  @media (max-width: 380px) {
    .forgot-otp-row { gap: 6px; }
    .forgot-otp-input { height: 48px; font-size: 17px; }
  }
`

const steps = ['Enter Email', 'Verify OTP', 'New Password']

const StepBar = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '30px', height: '30px',
            border: `1px solid ${i <= current ? '#B8895A' : '#E6DDD3'}`,
            background: i < current ? '#B8895A' : i === current ? '#FFFCF9' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s',
          }}>
            {i < current
              ? <CheckCircle size={13} strokeWidth={1.5} style={{ color: '#FFFFFF' }} />
              : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: i === current ? '#B8895A' : '#D4C4B0', fontWeight: 400 }}>{i + 1}</span>}
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.12em', color: i <= current ? '#B8895A' : '#AA9688', fontWeight: 400, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div style={{ width: 'clamp(28px,5vw,52px)', height: '1px', background: i < current ? '#B8895A' : '#E6DDD3', margin: '0 4px 22px', transition: 'background 0.25s', flexShrink: 0 }} />
        )}
      </React.Fragment>
    ))}
  </div>
)

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step,       setStep]       = useState(0)
  const [email,      setEmail]      = useState('')
  const [otp,        setOtp]        = useState(['','','','','',''])
  const [resetToken, setResetToken] = useState('')
  const [passwords,  setPasswords]  = useState({ new_password: '', confirm_password: '' })
  const [showPass,   setShowPass]   = useState({ new: false, confirm: false })
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.post('/users/forgot-password/', { email })
      toast.success('OTP sent to your email')
      setStep(1)
    } catch (err) { setError(err.response?.data?.error || 'Failed to send OTP.') }
    finally { setLoading(false) }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp)
    if (value && index < 5) document.getElementById(`otp-fp-${index + 1}`)?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-fp-${index - 1}`)?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setOtp(pasted.split('')); document.getElementById('otp-fp-5')?.focus() }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/users/forgot-password/verify-otp/', { email, otp: code })
      setResetToken(res.data.reset_token)
      toast.success('OTP verified')
      setStep(2)
    } catch (err) { setError(err.response?.data?.error || 'Invalid OTP.') }
    finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) { setError('Passwords do not match'); return }
    if (passwords.new_password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/users/reset-password/', passwords, { headers: { Authorization: `Bearer ${resetToken}` } })
      toast.success('Password reset successfully')
      navigate('/login')
    } catch (err) { setError(err.response?.data?.error || 'Failed to reset password.') }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    try { await api.post('/users/forgot-password/', { email }); setOtp(['','','','','','']); toast.success('New OTP sent') }
    catch { toast.error('Failed to resend OTP.') }
  }

  return (
    <>
      <SEO title="Reset Password" description="Reset your SkinCare password" url="/forgot-password" noIndex />
      <style>{FORGOT_CSS}</style>

      <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px,4vw,32px) 16px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Link to="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#16100C', textDecoration: 'none', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>
              SkinCare
            </Link>
          </div>

          {/* Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', overflow: 'hidden' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right,#B8895A,#D4A96A,#B8895A)' }} />

            {/* Card header */}
            <div style={{ padding: 'clamp(20px,4vw,32px) clamp(20px,4vw,36px) 20px', borderBottom: '1px solid #EEE7DF', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#B8895A', background: '#FDFAF7' }}>
                {step < 2 ? <Mail size={18} strokeWidth={1.5} /> : <Lock size={18} strokeWidth={1.5} />}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,22px)', color: '#16100C', fontWeight: 400, marginBottom: '6px' }}>
                {step === 0 ? 'Forgot Password' : step === 1 ? 'Verify OTP' : 'New Password'}
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#7B6458', fontWeight: 300 }}>
                {step === 0 && 'Enter your email to receive a one-time password'}
                {step === 1 && `Enter the 6-digit code sent to ${email}`}
                {step === 2 && 'Create a new secure password for your account'}
              </p>
            </div>

            <div style={{ padding: 'clamp(20px,4vw,28px) clamp(20px,4vw,36px) clamp(24px,4vw,36px)' }}>
              <StepBar current={step} />

              {/* Error */}
              {error && (
                <div className="alert-error" style={{ marginBottom: '18px' }}>
                  <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* ── Step 0: Email ── */}
              {step === 0 && (
                <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="input-label">Email Address <span style={{ color: '#963838' }}>*</span></label>
                    <div style={{ position: 'relative', marginTop: '8px' }}>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" required
                        className="input-luxury" style={{ paddingLeft: '40px' }} />
                      <Mail size={14} strokeWidth={1.5} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#AA9688' }} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                    <Send size={14} strokeWidth={1.5} />
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <div style={{ textAlign: 'center' }}>
                    <Link to="/login" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#B8895A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 400 }}>
                      <ArrowLeft size={12} strokeWidth={1.5} /> Back to Sign In
                    </Link>
                  </div>
                </form>
              )}

              {/* ── Step 1: OTP ── */}
              {step === 1 && (
                <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="forgot-otp-row" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-fp-${index}`}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                        className="forgot-otp-input"
                        style={{
                          borderColor: digit ? '#B8895A' : error ? '#963838' : '#E6DDD3',
                          background: digit ? '#FFFCF9' : '#FFFFFF',
                        }}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '14px', opacity: otp.join('').length !== 6 ? 0.5 : 1 }}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button type="button" onClick={() => { setStep(0); setOtp(['','','','','','']); setError('') }}
                      className="btn-ghost" style={{ fontSize: '12px', gap: '4px' }}>
                      <ArrowLeft size={12} strokeWidth={1.5} /> Change Email
                    </button>
                    <button type="button" onClick={handleResend} className="btn-ghost" style={{ fontSize: '12px', color: '#B8895A' }}>
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {/* ── Step 2: New Password ── */}
              {step === 2 && (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* New password */}
                  <div>
                    <label className="input-label">New Password <span style={{ color: '#963838' }}>*</span></label>
                    <div style={{ position: 'relative', marginTop: '8px' }}>
                      <input type={showPass.new ? 'text' : 'password'} value={passwords.new_password}
                        onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                        placeholder="Minimum 8 characters" required className="input-luxury" style={{ paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0 }}>
                        {showPass.new ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {/* Rules */}
                    {passwords.new_password && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          { ok: passwords.new_password.length >= 8,  label: 'At least 8 characters' },
                          { ok: /[A-Z]/.test(passwords.new_password), label: 'One uppercase letter'  },
                          { ok: /[0-9]/.test(passwords.new_password), label: 'One number'            },
                        ].map((rule, i) => (
                          <p key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: rule.ok ? '#4A7A57' : '#AA9688', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 300 }}>
                            {rule.ok
                              ? <CheckCircle size={10} strokeWidth={1.5} style={{ color: '#4A7A57' }} />
                              : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid #D4C4B0', flexShrink: 0 }} />}
                            {rule.label}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="input-label">Confirm Password <span style={{ color: '#963838' }}>*</span></label>
                    <div style={{ position: 'relative', marginTop: '8px' }}>
                      <input type={showPass.confirm ? 'text' : 'password'} value={passwords.confirm_password}
                        onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                        placeholder="Re-enter your password" required className="input-luxury" style={{ paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0 }}>
                        {showPass.confirm ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {passwords.confirm_password && (
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 300, color: passwords.new_password === passwords.confirm_password ? '#4A7A57' : '#963838' }}>
                        {passwords.new_password === passwords.confirm_password
                          ? <><CheckCircle size={10} strokeWidth={1.5} /> Passwords match</>
                          : <><AlertCircle size={10} strokeWidth={1.5} /> Passwords do not match</>}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                    <Lock size={14} strokeWidth={1.5} />
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', textAlign: 'center', marginTop: '20px', fontWeight: 300 }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#B8895A', textDecoration: 'none', fontWeight: 400 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}