// src/pages/admin/AdminUsers.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { Search, X, ChevronDown, CheckCircle, XCircle, Shield, UserCheck } from 'lucide-react'

const AdminToast = ({ message }) => message.text ? (
  <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: message.type === 'success' ? A.success : A.danger, color: '#FFFFFF', padding: '12px 20px', fontFamily: A.sans, fontSize: '13px', fontWeight: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
    {message.text}
  </div>
) : null

export default function AdminUsers() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('')
  const [updating, setUpdating] = useState(null)
  const [message,  setMessage]  = useState({ text: '', type: '' })

  const fetchUsers = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (filter === 'verified')   params.append('is_verified', 'true')
    if (filter === 'unverified') params.append('is_verified', 'false')
    if (filter === 'admin')      params.append('is_staff', 'true')
    api.get(`/admin/users/?${params}`)
      .then(res => setUsers(res.data.users || []))
      .catch(() => showMsg('Failed to load users.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [search, filter])

  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000) }

  const toggleField = async (userId, field, currentValue) => {
    setUpdating(`${userId}-${field}`)
    try {
      await api.patch(`/admin/users/${userId}/`, { [field]: !currentValue })
      showMsg(`User ${field.replace('is_', '')} updated`, 'success')
      fetchUsers()
    } catch { showMsg('Failed to update user.', 'error') }
    finally { setUpdating(null) }
  }

  const inp = { background: A.surface, border: `1px solid ${A.border2}`, color: A.text, padding: '9px 14px', fontFamily: A.sans, fontSize: '12.5px', outline: 'none', transition: 'border-color 0.15s', fontWeight: 300 }

  const ToggleBtn = ({ userId, field, value, label, onColor }) => {
    const key = `${userId}-${field}`
    const isUpdating = updating === key
    return (
      <button onClick={() => toggleField(userId, field, value)} disabled={isUpdating}
        style={{
          padding: '4px 12px',
          border: `1px solid ${value ? onColor + '50' : A.border2}`,
          background: value ? onColor + '15' : 'transparent',
          color: value ? onColor : A.textDim,
          fontFamily: A.sans, fontSize: '10px',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          cursor: isUpdating ? 'wait' : 'pointer',
          transition: 'all 0.15s', fontWeight: 400,
          opacity: isUpdating ? 0.5 : 1,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!isUpdating) { e.currentTarget.style.borderColor = onColor; e.currentTarget.style.color = onColor } }}
        onMouseLeave={e => { if (!isUpdating) { e.currentTarget.style.borderColor = value ? onColor + '50' : A.border2; e.currentTarget.style.color = value ? onColor : A.textDim } }}
      >
        {isUpdating ? '...' : value ? `✓ ${label}` : `✗ ${label}`}
      </button>
    )
  }

  return (
    <AdminLayout>
      <AdminToast message={message} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: A.textDim, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email..."
              style={{ ...inp, width: '100%', paddingLeft: '34px' }}
              onFocus={e => e.target.style.borderColor = A.accent}
              onBlur={e  => e.target.style.borderColor = A.border2}
            />
          </div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ ...inp, paddingRight: '32px', appearance: 'none', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = A.accent}
              onBlur={e  => e.target.style.borderColor = A.border2}
            >
              <option value="">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown size={12} strokeWidth={1.5} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: A.textMid, pointerEvents: 'none' }} />
          </div>
          {(search || filter) && (
            <button onClick={() => { setSearch(''); setFilter('') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid ${A.border2}`, color: A.textMid, padding: '9px 14px', cursor: 'pointer', fontFamily: A.sans, fontSize: '12px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = A.text }}
              onMouseLeave={e => { e.currentTarget.style.color = A.textMid }}
            >
              <X size={12} strokeWidth={1.5} /> Clear
            </button>
          )}
        </div>

        <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>{users.length} users</p>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '32px', height: '32px', border: `1.5px solid ${A.border2}`, borderTopColor: A.accent, borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: A.surface, border: `1px solid ${A.border}` }}>
            <UserCheck size={32} strokeWidth={1} style={{ color: A.textDim, margin: '0 auto 16px' }} />
            <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textMid }}>No users found</p>
          </div>
        ) : (
          <div style={{ background: A.surface, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
            {/* Desktop header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '10px 18px', borderBottom: `1px solid ${A.border}`, background: A.bg }}>
              {['User', 'Verified', 'Active', 'Staff', 'Joined'].map(h => (
                <div key={h} style={{ fontFamily: A.sans, fontSize: '9.5px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 400, textAlign: h !== 'User' ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>

            <div>
              {users.map((user, i) => (
                <div key={user.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${A.border}` : 'none' }}>
                  {/* Desktop row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '12px 18px', alignItems: 'center' }}
                    className="admin-user-desktop-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(184,137,90,0.12)', border: '1px solid rgba(184,137,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.serif, fontSize: '13px', color: A.accent, flexShrink: 0 }}>
                        {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.first_name} {user.last_name}
                          {user.is_staff && <Shield size={11} strokeWidth={1.5} style={{ color: A.accent, display: 'inline', marginLeft: '5px', verticalAlign: 'middle' }} />}
                        </p>
                        <p style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ToggleBtn userId={user.id} field="is_verified" value={user.is_verified} label="Verified" onColor={A.success} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ToggleBtn userId={user.id} field="is_active"   value={user.is_active}   label="Active"   onColor={A.info}    />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ToggleBtn userId={user.id} field="is_staff"    value={user.is_staff}    label="Staff"    onColor={A.accent}  />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>
                        {new Date(user.date_joined).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div style={{ padding: '14px 16px' }} className="admin-user-mobile-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(184,137,90,0.12)', border: '1px solid rgba(184,137,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.serif, fontSize: '14px', color: A.accent, flexShrink: 0 }}>
                        {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.text, fontWeight: 400 }}>{user.first_name} {user.last_name}</p>
                        <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <ToggleBtn userId={user.id} field="is_verified" value={user.is_verified} label="Verified" onColor={A.success} />
                      <ToggleBtn userId={user.id} field="is_active"   value={user.is_active}   label="Active"   onColor={A.info}    />
                      <ToggleBtn userId={user.id} field="is_staff"    value={user.is_staff}    label="Staff"    onColor={A.accent}  />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-user-desktop-row { display: grid !important; }
        .admin-user-mobile-row  { display: none  !important; }
        @media (max-width: 768px) {
          .admin-user-desktop-row { display: none  !important; }
          .admin-user-mobile-row  { display: block !important; }
        }
      `}</style>
    </AdminLayout>
  )
}