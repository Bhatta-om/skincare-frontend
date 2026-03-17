// src/pages/admin/AdminLayout.jsx
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/admin',                label: 'Dashboard',   icon: '📊' },
  { path: '/admin/orders',         label: 'Orders',      icon: '📦' },
  { path: '/admin/users',          label: 'Users',       icon: '👥' },
  { path: '/admin/products',       label: 'Products',    icon: '🧴' },
  { path: '/admin/categories',     label: 'Categories',  icon: '📂' },
  { path: '/admin/products/stats', label: 'Stock Alerts',icon: '⚠️' },
  { path: '/admin/bulk-import', label: 'Bulk Import', icon: '📤' },
]

export default function AdminLayout({ children }) {
  const { user, logout }            = useAuth()
  const location                    = useLocation()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const currentLabel = navItems.find(n => isActive(n.path))?.label || 'Admin'

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── Sidebar Desktop ── */}
      <aside className={`hidden md:flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>

        <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
          <span className="text-2xl">✨</span>
          {!collapsed && <span className="text-white font-bold text-lg tracking-tight">SkinCare</span>}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}>
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.first_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center text-gray-500 hover:text-white text-xs py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            {collapsed ? '→' : '← Collapse'}
          </button>
          <button onClick={logout}
            className={`w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-gray-800 text-xs py-2 px-3 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-gray-900 flex flex-col">
            <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-white font-bold">SkinCare</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-2">
              {navItems.map(item => (
                <Link key={item.path} to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path) ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-800 p-3">
              <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 text-sm py-2 px-3 rounded-lg hover:bg-gray-800">
                <span>🚪</span><span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-400 text-xl">☰</button>
            <div>
              <h1 className="text-white font-bold text-lg">{currentLabel}</h1>
              <p className="text-gray-500 text-xs hidden sm:block">SkinCare Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank"
              className="text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-colors">
              View Site →
            </Link>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.first_name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}