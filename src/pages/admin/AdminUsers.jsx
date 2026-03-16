// src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('')
  const [updating, setUpdating] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const fetchUsers = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (filter === 'verified')   params.append('is_verified', 'true')
    if (filter === 'unverified') params.append('is_verified', 'false')
    if (filter === 'admin')      params.append('is_staff', 'true')
    api.get(`/admin/users/?${params}`)
      .then(res => setUsers(res.data.users || []))
      .catch(() => showMessage('Failed to load users.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [search, filter])

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const toggleField = async (userId, field, currentValue) => {
    setUpdating(`${userId}-${field}`)
    try {
      await api.patch(`/admin/users/${userId}/`, { [field]: !currentValue })
      showMessage(`User ${field} updated!`, 'success')
      fetchUsers()
    } catch {
      showMessage('Failed to update user.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Toast */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search email, name..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500">
            <option value="">All Users</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="admin">Admin</option>
          </select>
          {(search || filter) && (
            <button onClick={() => { setSearch(''); setFilter('') }}
              className="text-gray-400 hover:text-white border border-gray-700 px-4 py-2.5 rounded-xl text-sm">
              Clear
            </button>
          )}
        </div>

        <p className="text-gray-500 text-sm">{users.length} users found</p>

        {/* Users */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-5xl mb-3">👥</p>
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-gray-800 text-gray-600 text-xs font-medium uppercase tracking-wider">
              <div className="col-span-4">User</div>
              <div className="col-span-2 text-center">Verified</div>
              <div className="col-span-2 text-center">Active</div>
              <div className="col-span-2 text-center">Staff</div>
              <div className="col-span-2 text-center">Joined</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-800">
              {users.map(user => (
                <div key={user.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-gray-800/30 transition-colors">

                  {/* User info */}
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {user.first_name} {user.last_name}
                        {user.is_staff && <span className="ml-1 text-xs text-purple-400">👑</span>}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Toggle buttons */}
                  {[
                    { field: 'is_verified', value: user.is_verified, label: 'Verified',  on: 'bg-green-500/20 text-green-400 border border-green-500/30', off: 'bg-gray-800 text-gray-500 border border-gray-700' },
                    { field: 'is_active',   value: user.is_active,   label: 'Active',    on: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',   off: 'bg-gray-800 text-gray-500 border border-gray-700' },
                    { field: 'is_staff',    value: user.is_staff,    label: 'Staff',     on: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', off: 'bg-gray-800 text-gray-500 border border-gray-700' },
                  ].map(({ field, value, label, on, off }) => (
                    <div key={field} className="sm:col-span-2 flex sm:justify-center items-center gap-2">
                      <span className="sm:hidden text-gray-600 text-xs w-16">{label}:</span>
                      <button
                        onClick={() => toggleField(user.id, field, value)}
                        disabled={updating === `${user.id}-${field}`}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${value ? on : off}`}>
                        {updating === `${user.id}-${field}` ? '...' : value ? '✓ Yes' : '✗ No'}
                      </button>
                    </div>
                  ))}

                  {/* Date */}
                  <div className="sm:col-span-2 text-gray-500 text-xs sm:text-center">
                    {new Date(user.date_joined).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}