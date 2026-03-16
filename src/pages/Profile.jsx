// src/pages/Profile.jsx
// Password change भएपछि auto logout — industry standard
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { ProfileSkeleton } from '../components/Skeleton'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout } = useAuth()
  const [form, setForm]           = useState({ first_name:'', last_name:'', phone:'' })
  const [pwForm, setPwForm]       = useState({ old_password:'', new_password:'', confirm_password:'' })
  const [loading, setLoading]     = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats]         = useState(null)
  const [showPw, setShowPw]       = useState({ old:false, new:false, confirm:false })

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name||'', last_name: user.last_name||'', phone: user.phone||'' })
  }, [user])

  useEffect(() => {
    api.get('/orders/my-orders/')
      .then(res => {
        const orders = res.data.orders || res.data.results || []
        const paid   = orders.filter(o => o.payment_status === 'paid').length
        const total  = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
        setStats({ total: orders.length, paid, totalSpent: total.toFixed(2) })
      })
      .catch(() => setStats({ total:0, paid:0, totalSpent:'0.00' }))
      .finally(() => setStatsLoading(false))
  }, [])

  const handleChange   = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/users/profile/', form)
      toast.success('Profile updated successfully! ✅')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    // ── Frontend validations (fast feedback) ──────────────
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters!')
      return
    }
    if (pwForm.new_password === pwForm.old_password) {
      toast.error('New password cannot be the same as your current password!')
      return
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match!')
      return
    }

    setPwLoading(true)
    try {
      await api.post('/users/change-password/', {
        old_password:         pwForm.old_password,
        new_password:         pwForm.new_password,
        confirm_new_password: pwForm.confirm_password,
      })

      // ✅ INDUSTRY STANDARD: logout after password change
      // All sessions invalidated on backend — force re-login
      toast.success('Password changed! Please login again for security. 🔒', { duration: 4000 })
      setTimeout(() => logout(), 2000)

    } catch (err) {
      const data = err.response?.data
      const msg  = typeof data === 'string'
        ? data
        : data?.error || data?.old_password?.[0] || data?.new_password?.[0] || 'Failed to change password.'
      toast.error(typeof msg === 'string' ? msg : 'Failed to change password.')
    } finally {
      setPwLoading(false)
    }
  }

  // Password strength checker
  const getStrength = (pw) => {
    if (!pw) return null
    let score = 0
    if (pw.length >= 8)          score++
    if (/[A-Z]/.test(pw))        score++
    if (/[0-9]/.test(pw))        score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { label:'Weak',   color:'bg-red-500',    width:'w-1/4',  text:'text-red-500'    }
    if (score === 2) return { label:'Fair',   color:'bg-yellow-500', width:'w-2/4',  text:'text-yellow-600' }
    if (score === 3) return { label:'Good',   color:'bg-blue-500',   width:'w-3/4',  text:'text-blue-600'   }
    return                        { label:'Strong', color:'bg-green-500',  width:'w-full', text:'text-green-600'  }
  }
  const strength = getStrength(pwForm.new_password)

  // Same as current password warning
  const isSameAsCurrent = pwForm.new_password && pwForm.new_password === pwForm.old_password

  const PasswordInput = ({ name, label, value, show, onToggle }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} name={name} value={value}
          onChange={handlePwChange} placeholder="••••••••"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )

  if (statsLoading) return <ProfileSkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-pink-500 text-white py-8 sm:py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold shrink-0">
            {user?.first_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold truncate">{user?.first_name} {user?.last_name}</h1>
            <p className="text-purple-100 text-sm sm:text-base truncate">{user?.email}</p>
            {user?.is_staff && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">👑 Admin</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label:'Total Orders', value: stats.total,              emoji:'📦' },
              { label:'Paid Orders',  value: stats.paid,               emoji:'✅' },
              { label:'Total Spent',  value:`Rs. ${stats.totalSpent}`, emoji:'💰' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-3 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl mb-1">{s.emoji}</div>
                <p className="text-lg sm:text-2xl font-bold text-purple-600 truncate">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Edit Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">✏️ Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="first_name" value={form.first_name} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="last_name" value={form.last_name} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user?.email||''} disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold px-8 py-3 rounded-xl transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">🔒 Change Password</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                After changing, you will be logged out from all devices for security.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput name="old_password" label="Current Password"
              value={pwForm.old_password} show={showPw.old}
              onToggle={() => setShowPw(s => ({ ...s, old: !s.old }))} />

            <PasswordInput name="new_password" label="New Password"
              value={pwForm.new_password} show={showPw.new}
              onToggle={() => setShowPw(s => ({ ...s, new: !s.new }))} />

            {/* Same as current — inline warning */}
            {isSameAsCurrent && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span>⚠️</span>
                <p className="text-red-600 text-sm font-medium">
                  New password cannot be the same as your current password!
                </p>
              </div>
            )}

            {/* Strength bar */}
            {pwForm.new_password && strength && !isSameAsCurrent && (
              <div className="space-y-1.5">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-semibold ${strength.text}`}>
                    Strength: {strength.label}
                  </p>
                  <p className="text-xs text-gray-400">Use A-Z, 0-9, symbols for Strong</p>
                </div>
              </div>
            )}

            <PasswordInput name="confirm_password" label="Confirm New Password"
              value={pwForm.confirm_password} show={showPw.confirm}
              onToggle={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} />

            {/* Match indicator */}
            {pwForm.confirm_password && (
              <p className={`text-xs font-semibold flex items-center gap-1 ${
                pwForm.new_password === pwForm.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
                {pwForm.new_password === pwForm.confirm_password
                  ? '✅ Passwords match'
                  : '❌ Passwords do not match'}
              </p>
            )}

            {/* Security notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-base mt-0.5">🔐</span>
              <p className="text-amber-700 text-xs">
                <strong>Security notice:</strong> Changing your password will log you out from all devices and sessions. A security alert will be sent to your email.
              </p>
            </div>

            <button type="submit"
              disabled={
                pwLoading ||
                !pwForm.old_password ||
                !pwForm.new_password ||
                !pwForm.confirm_password ||
                isSameAsCurrent ||
                pwForm.new_password !== pwForm.confirm_password
              }
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-colors">
              {pwLoading ? '🔄 Changing...' : '🔒 Change Password'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🛡️ Account Info</h2>
          <div className="space-y-0">
            {[
              { label:'Account Type',   value: user?.is_staff ? '👑 Admin' : '👤 Customer', color:'' },
              { label:'Email Verified', value: user?.is_verified ? '✅ Verified' : '❌ Not Verified', color: user?.is_verified ? 'text-green-600' : 'text-red-500' },
              { label:'Member Since',   value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-NP',{year:'numeric',month:'long'}) : 'N/A', color:'' },
            ].map((item, i, arr) => (
              <div key={i} className={`flex justify-between items-center py-3 ${i < arr.length-1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className={`font-medium text-sm ${item.color || 'text-gray-800'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-colors border-2 border-red-100">
          🚪 Logout
        </button>
      </div>
    </div>
  )
}