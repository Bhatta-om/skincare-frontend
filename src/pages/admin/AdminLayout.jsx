// src/pages/admin/AdminLayout.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  FolderOpen, AlertTriangle, Upload, LogOut,
  Menu, X, ChevronLeft, ExternalLink, FlaskConical,
} from 'lucide-react'

// ── Shared design tokens — import { A } from './AdminLayout' in all admin pages
export const A = {
  bg:        '#0D0D0D',
  surface:   '#141414',
  border:    '#1E1E1E',
  border2:   '#252525',
  muted:     '#3A3A3A',
  subtle:    '#4A4A4A',
  text:      '#E8E0D8',
  textMid:   '#8A8078',
  textDim:   '#4A4540',
  accent:    '#B8895A',
  accentHov: '#C49A6A',
  danger:    '#963838',
  success:   '#4A7A57',
  warning:   '#89670F',
  info:      '#2B5FA6',
  serif:     "'Playfair Display', serif",
  sans:      "'DM Sans', 'Inter', sans-serif",
}

const navItems = [
  { path: '/admin',                label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/admin/orders',         label: 'Orders',       icon: ShoppingBag     },
  { path: '/admin/users',          label: 'Users',        icon: Users           },
  { path: '/admin/products',       label: 'Products',     icon: Package         },
  { path: '/admin/categories',     label: 'Categories',   icon: FolderOpen      },
  { path: '/admin/products/stats', label: 'Stock Alerts', icon: AlertTriangle   },
  { path: '/admin/skin-analysis',  label: 'Skin Analysis',icon: FlaskConical    },
  { path: '/admin/bulk-import',    label: 'Bulk Import',  icon: Upload          },
]

export default function AdminLayout({ children }) {
  const { user, logout }            = useAuth()
  const location                    = useLocation()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path)

  const currentLabel = navItems.find(n => isActive(n.path))?.label || 'Admin'
  const initials     = user?.first_name?.[0]?.toUpperCase() || 'A'

  const NavLink = ({ item }) => {
    const Icon   = item.icon
    const active = isActive(item.path)
    return (
      <Link to={item.path} style={{
        display:       'flex',
        alignItems:    'center',
        gap:           collapsed ? 0 : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding:       collapsed ? '10px' : '10px 12px',
        borderRadius:  '6px',
        fontFamily:    A.sans,
        fontSize:      '12.5px',
        fontWeight:    400,
        letterSpacing: '0.01em',
        color:         active ? A.accent : A.textMid,
        background:    active ? 'rgba(184,137,90,0.1)' : 'transparent',
        borderLeft:    active ? `2px solid ${A.accent}` : '2px solid transparent',
        textDecoration:'none',
        transition:    'all 0.15s ease',
        whiteSpace:    'nowrap',
        overflow:      'hidden',
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = A.text; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = A.textMid; e.currentTarget.style.background = 'transparent' } }}
      >
        <Icon size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  const SidebarContent = ({ mobile = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: collapsed && !mobile ? 'center' : 'space-between', gap: '10px', flexShrink: 0 }}>
        {(!collapsed || mobile) && (
          <div>
            <span style={{ fontFamily: A.serif, fontSize: '17px', color: A.text, letterSpacing: '0.06em', fontWeight: 500 }}>SKINCARE</span>
            <span style={{ fontFamily: A.sans, fontSize: '9px', color: A.accent, textTransform: 'uppercase', letterSpacing: '0.16em', display: 'block', marginTop: '1px', fontWeight: 400 }}>Admin Panel</span>
          </div>
        )}
        {mobile ? (
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.textMid, display: 'flex', padding: '4px' }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        ) : (
          <button onClick={() => setCollapsed(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.textMid, display: 'flex', padding: '4px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = A.text}
            onMouseLeave={e => e.currentTarget.style.color = A.textMid}
          >
            <ChevronLeft size={16} strokeWidth={1.5} style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => <NavLink key={item.path} item={item} />)}
      </nav>

      {/* User + logout */}
      <div style={{ borderTop: `1px solid ${A.border}`, padding: '12px 8px', flexShrink: 0 }}>
        {(!collapsed || mobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '4px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(184,137,90,0.15)', border: '1px solid rgba(184,137,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.serif, fontSize: '13px', color: A.accent, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: A.sans, fontSize: '12px', color: A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 300 }}>
                {user?.email}
              </p>
            </div>
          </div>
        )}
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: collapsed && !mobile ? 0 : '8px',
          justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
          width: '100%', padding: '9px 12px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: A.sans, fontSize: '12px',
          color: A.danger, borderRadius: '6px',
          transition: 'background 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(150,56,56,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} strokeWidth={1.5} />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: A.bg, display: 'flex', fontFamily: A.sans }}>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        display:       'none',
        flexDirection: 'column',
        background:    A.surface,
        borderRight:   `1px solid ${A.border}`,
        width:         collapsed ? '56px' : '220px',
        transition:    'width 0.25s ease',
        flexShrink:    0,
        position:      'sticky',
        top:           0,
        height:        '100vh',
        overflowY:     'auto',
      }}
        className="admin-sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '240px', background: A.surface, borderRight: `1px solid ${A.border}`, display: 'flex', flexDirection: 'column' }}>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ background: A.surface, borderBottom: `1px solid ${A.border}`, padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.textMid, display: 'flex', padding: '4px' }}
              className="admin-mobile-menu-btn"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <div>
              <h1 style={{ fontFamily: A.sans, fontSize: '14px', color: A.text, fontWeight: 500, letterSpacing: '0.02em' }}>{currentLabel}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" target="_blank" style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontFamily: A.sans, fontSize: '11.5px', color: A.textMid,
              textDecoration: 'none', border: `1px solid ${A.border2}`,
              padding: '6px 12px', borderRadius: '4px',
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = A.text; e.currentTarget.style.borderColor = A.accent }}
              onMouseLeave={e => { e.currentTarget.style.color = A.textMid; e.currentTarget.style.borderColor = A.border2 }}
            >
              View Site <ExternalLink size={12} strokeWidth={1.5} />
            </Link>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(184,137,90,0.15)', border: '1px solid rgba(184,137,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.serif, fontSize: '13px', color: A.accent }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>
          {children}
        </main>
      </div>

      {/* Responsive CSS */}
      <style>{`
        .admin-sidebar-desktop { display: none !important; }
        .admin-mobile-menu-btn { display: flex !important; }
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: flex !important; }
          .admin-mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  )
}