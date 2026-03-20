// src/pages/Profile.jsx — SkinMedica Luxury Redesign + Mobile Responsive
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { ProfileSkeleton } from '../components/Skeleton'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import {
  User, ShoppingBag, DollarSign, Lock, Eye, EyeOff,
  Shield, CheckCircle, AlertCircle, LogOut,
  Edit3, Calendar,
} from 'lucide-react'

const PROFILE_CSS = `
  .profile-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 28px;
    align-items: flex-start;
  }
  .profile-name-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .profile-header-row {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  @media (max-width: 900px) {
    .profile-layout { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .profile-name-grid { grid-template-columns: 1fr; }
    .profile-header-row { gap: 14px; }
  }
`

const getStrength = (pw) => {
  if (!pw) return null
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const meta = [
    { label: 'Weak',   color: '#963838', width: '25%'  },
    { label: 'Fair',   color: '#89670F', width: '50%'  },
    { label: 'Good',   color: '#4A7A57', width: '75%'  },
    { label: 'Strong', color: '#4A7A57', width: '100%' },
  ]
  return { ...meta[s - 1], score: s }
}

const SectionCard = ({ title, icon, subtitle, children }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', overflow: 'hidden' }}>
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEE7DF', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ color: '#B8895A', flexShrink: 0 }}>{icon}</div>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#16100C', fontWeight: 400 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', color: '#AA9688', marginTop: '2px', fontWeight: 300 }}>{subtitle}</p>}
      </div>
    </div>
    <div style={{ padding: '24px' }}>{children}</div>
  </div>
)

export default function Profile() {
  const { user, logout } = useAuth()
  const [form,      setForm]      = useState({ first_name: '', last_name: '', phone: '' })
  const [pwForm,    setPwForm]    = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [loading,   setLoading]   = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats,     setStats]     = useState(null)
  const [showPw,    setShowPw]    = useState({ old: false, new: false, confirm: false })

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' })
  }, [user])

  useEffect(() => {
    api.get('/orders/my-orders/')
      .then(res => {
        const orders = res.data.orders || res.data.results || []
        const paid   = orders.filter(o => o.payment_status === 'paid').length
        const total  = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
        setStats({ total: orders.length, paid, totalSpent: total.toFixed(2) })
      })
      .catch(() => setStats({ total: 0, paid: 0, totalSpent: '0.00' }))
      .finally(() => setStatsLoading(false))
  }, [])

  const handleChange   = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.patch('/users/profile/', form)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.')
    } finally { setLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password.length < 8)                  { toast.error('Password must be at least 8 characters'); return }
    if (pwForm.new_password === pwForm.old_password)     { toast.error('New password cannot be same as current'); return }
    if (pwForm.new_password !== pwForm.confirm_password) { toast.error('Passwords do not match'); return }
    setPwLoading(true)
    try {
      await api.post('/users/change-password/', {
        old_password: pwForm.old_password, new_password: pwForm.new_password, confirm_new_password: pwForm.confirm_password,
      })
      toast.success('Password changed. Please login again.', { duration: 4000 })
      setTimeout(() => logout(), 2000)
    } catch (err) {
      const data = err.response?.data
      const msg  = typeof data === 'string' ? data : data?.error || data?.old_password?.[0] || data?.new_password?.[0] || 'Failed to change password.'
      toast.error(typeof msg === 'string' ? msg : 'Failed to change password.')
    } finally { setPwLoading(false) }
  }

  const strength        = getStrength(pwForm.new_password)
  const isSameAsCurrent = pwForm.new_password && pwForm.new_password === pwForm.old_password

  const PasswordField = ({ name, label, value, show, onToggle }) => (
    <div>
      <label className="input-label">{label}</label>
      <div style={{ position: 'relative', marginTop: '8px' }}>
        <input type={show ? 'text' : 'password'} name={name} value={value}
          onChange={handlePwChange} placeholder="••••••••"
          className="input-luxury" style={{ paddingRight: '44px' }} />
        <button type="button" onClick={onToggle}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#AA9688', display: 'flex', padding: 0 }}>
          {show ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )

  if (statsLoading) return (
    <>
      <SEO title="My Profile" description="Manage your account" url="/profile" noIndex />
      <ProfileSkeleton />
    </>
  )

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'SC'

  return (
    <>
      <SEO title="My Profile" description="Manage your SkinCare account" url="/profile" noIndex />
      <style>{PROFILE_CSS}</style>

      <div style={{ background: '#FAF8F5', minHeight: '100vh' }}>

        {/* Dark header */}
        <div style={{ background: '#16100C', borderBottom: '1px solid #261710', padding: 'clamp(32px,5vw,56px) 0 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(184,137,90,0.08)', pointerEvents: 'none' }} />
          <div className="container-luxury" style={{ position: 'relative', zIndex: 1 }}>
            <div className="profile-header-row">
              <div style={{ width: 'clamp(52px,8vw,68px)', height: 'clamp(52px,8vw,68px)', border: '1px solid rgba(184,137,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,24px)', color: '#B8895A', background: 'rgba(184,137,90,0.08)', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#5A4A3A', marginBottom: '5px', fontWeight: 400 }}>My Account</p>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px,3vw,28px)', color: '#FAF8F5', fontWeight: 400, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.first_name} {user?.last_name}
                </h1>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: '#5A4A3A', marginTop: '3px', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                  {user?.is_staff && <span style={{ marginLeft: '10px', background: 'rgba(184,137,90,0.2)', color: '#B8895A', fontSize: '9px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-luxury" style={{ padding: 'clamp(24px,4vw,40px) 32px clamp(48px,6vw,80px)' }}>

          {/* Stats row */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#E6DDD3', marginBottom: '28px' }}>
              {[
                { icon: <ShoppingBag size={16} strokeWidth={1.5} />, label: 'Total Orders', value: stats.total            },
                { icon: <CheckCircle size={16} strokeWidth={1.5} />, label: 'Paid Orders',  value: stats.paid             },
                { icon: <DollarSign  size={16} strokeWidth={1.5} />, label: 'Total Spent',  value: `Rs. ${stats.totalSpent}` },
              ].map((s, i) => (
                <div key={i} style={{ background: '#FFFFFF', padding: 'clamp(14px,2vw,20px) clamp(14px,2vw,24px)', textAlign: 'center' }}>
                  <div style={{ color: '#B8895A', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{s.icon}</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,26px)', color: '#16100C', fontWeight: 400, lineHeight: 1, marginBottom: '6px' }}>{s.value}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10.5px', color: '#AA9688', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="profile-layout">

            {/* ── Left: Forms ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Edit Profile */}
              <SectionCard title="Edit Profile" icon={<Edit3 size={17} strokeWidth={1.5} />}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="profile-name-grid">
                    {[{ name: 'first_name', label: 'First Name' }, { name: 'last_name', label: 'Last Name' }].map(f => (
                      <div key={f.name}>
                        <label className="input-label">{f.label}</label>
                        <input type="text" name={f.name} value={form[f.name]} onChange={handleChange}
                          className="input-luxury" style={{ marginTop: '8px' }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="input-luxury"
                      style={{ marginTop: '8px', background: '#FAF8F5', color: '#AA9688', cursor: 'not-allowed' }} />
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', marginTop: '4px', fontWeight: 300 }}>Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input type="text" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="98XXXXXXXX" className="input-luxury" style={{ marginTop: '8px' }} />
                  </div>
                  <div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ gap: '8px', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </SectionCard>

              {/* Change Password */}
              <SectionCard title="Change Password" icon={<Lock size={17} strokeWidth={1.5} />}
                subtitle="You will be logged out after changing your password">
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <PasswordField name="old_password"     label="Current Password" value={pwForm.old_password}     show={showPw.old}     onToggle={() => setShowPw(s => ({ ...s, old: !s.old }))} />
                  <PasswordField name="new_password"     label="New Password"     value={pwForm.new_password}     show={showPw.new}     onToggle={() => setShowPw(s => ({ ...s, new: !s.new }))} />

                  {/* Same as current warning */}
                  {isSameAsCurrent && (
                    <div className="alert-error">
                      <AlertCircle size={12} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                      New password cannot be same as current
                    </div>
                  )}

                  {/* Strength bar */}
                  {strength && pwForm.new_password && !isSameAsCurrent && (
                    <div>
                      <div style={{ height: '3px', background: '#E6DDD3', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s ease, background 0.3s ease' }} />
                      </div>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: strength.color, fontWeight: 400 }}>
                        {strength.label} password
                      </p>
                    </div>
                  )}

                  <PasswordField name="confirm_password" label="Confirm Password"  value={pwForm.confirm_password} show={showPw.confirm} onToggle={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} />

                  {/* Match indicator */}
                  {pwForm.confirm_password && (
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: pwForm.new_password === pwForm.confirm_password ? '#4A7A57' : '#963838', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 300 }}>
                      {pwForm.new_password === pwForm.confirm_password
                        ? <><CheckCircle size={11} strokeWidth={1.5} /> Passwords match</>
                        : <><AlertCircle size={11} strokeWidth={1.5} /> Passwords do not match</>}
                    </p>
                  )}

                  <button type="submit"
                    disabled={pwLoading || !pwForm.old_password || !pwForm.new_password || !pwForm.confirm_password || isSameAsCurrent || pwForm.new_password !== pwForm.confirm_password}
                    className="btn-primary"
                    style={{ gap: '8px', opacity: pwLoading ? 0.7 : 1 }}>
                    <Lock size={14} strokeWidth={1.5} />
                    {pwLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </SectionCard>
            </div>

            {/* ── Right: Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Account Info */}
              <SectionCard title="Account Info" icon={<Shield size={17} strokeWidth={1.5} />}>
                <div>
                  {[
                    { label: 'Account Type',   value: user?.is_staff ? 'Administrator' : 'Customer',
                      color: user?.is_staff ? '#B8895A' : '#16100C' },
                    { label: 'Email Verified', value: user?.is_verified ? 'Verified' : 'Not Verified',
                      color: user?.is_verified ? '#4A7A57' : '#963838' },
                    { label: 'Member Since',   value: user?.date_joined
                        ? new Date(user.date_joined).toLocaleDateString('en-NP', { year: 'numeric', month: 'long' })
                        : 'N/A',
                      color: '#16100C' },
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #EEE7DF' : 'none', gap: '12px' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300 }}>{item.label}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: item.color, fontWeight: 400, textAlign: 'right' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Quick links */}
              <SectionCard title="Quick Links" icon={<User size={17} strokeWidth={1.5} />}>
                <div>
                  {[
                    { href: '/orders',   label: 'My Orders'   },
                    { href: '/wishlist', label: 'My Wishlist' },
                    { href: '/products', label: 'Shop Now'    },
                  ].map((link, i, arr) => (
                    <a key={i} href={link.href} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid #EEE7DF' : 'none',
                      fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px',
                      color: '#3A2820', textDecoration: 'none', fontWeight: 400,
                      transition: 'color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#B8895A'}
                      onMouseLeave={e => e.currentTarget.style.color = '#3A2820'}
                    >
                      {link.label}
                      <span style={{ color: '#D4C4B0', fontSize: '16px' }}>›</span>
                    </a>
                  ))}
                </div>
              </SectionCard>

              {/* Sign out */}
              <button onClick={logout} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'transparent', border: '1px solid #E6DDD3',
                padding: '13px', cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: '#963838', transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FCF3F3'; e.currentTarget.style.borderColor = '#963838' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E6DDD3' }}
              >
                <LogOut size={14} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}