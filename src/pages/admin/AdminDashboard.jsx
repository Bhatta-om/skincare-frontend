// src/pages/admin/AdminDashboard.jsx — Professional Dark Admin
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { AdminStatsSkeleton } from '../../components/Skeleton'
import {
  Users, ShoppingBag, DollarSign, Package,
  CheckCircle, FlaskConical, AlertTriangle, XCircle,
  ArrowRight, TrendingUp,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const DASH_CSS = `
  .dash-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .dash-chart-row  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .dash-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .dash-right-col  { display: flex; flex-direction: column; gap: 16px; }
  @media (max-width: 1024px) {
    .dash-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .dash-chart-row  { grid-template-columns: 1fr; }
    .dash-bottom-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .dash-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }
`

const StatCard = ({ icon: Icon, label, value, sub, accentColor = A.accent }) => (
  <div style={{ background: A.surface, border: `1px solid ${A.border}`, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
      <Icon size={18} strokeWidth={1.5} style={{ color: accentColor }} />
      <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>{sub}</span>
    </div>
    <p style={{ fontFamily: A.serif, fontSize: '26px', color: A.text, fontWeight: 400, lineHeight: 1, marginBottom: '6px' }}>{value}</p>
    <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>{label}</p>
  </div>
)

const Card = ({ title, action, children }) => (
  <div style={{ background: A.surface, border: `1px solid ${A.border}` }}>
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h3 style={{ fontFamily: A.sans, fontSize: '12px', color: A.text, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{title}</h3>
      {action}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A1A', border: `1px solid ${A.border2}`, padding: '10px 14px' }}>
      <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textMid, marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: A.sans, fontSize: '11px', color: p.color, fontWeight: 400 }}>
          {p.name}: {p.name.toLowerCase().includes('revenue') ? `Rs. ${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  )
}

const PIE_COLORS = [A.accent, '#4A7A57', '#2B5FA6', '#89670F', '#963838', '#5A4A9A']

const statusStyle = {
  pending:    { color: '#89670F', bg: 'rgba(137,103,15,0.12)'  },
  confirmed:  { color: '#2B5FA6', bg: 'rgba(43,95,166,0.12)'  },
  processing: { color: '#B8895A', bg: 'rgba(184,137,90,0.12)' },
  shipped:    { color: '#5A7FA6', bg: 'rgba(90,127,166,0.12)' },
  delivered:  { color: '#4A7A57', bg: 'rgba(74,122,87,0.12)'  },
  cancelled:  { color: '#963838', bg: 'rgba(150,56,56,0.12)'  },
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('revenue')

  useEffect(() => {
    api.get('/admin/stats/')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <style>{DASH_CSS}</style>

      {loading ? <AdminStatsSkeleton /> : error ? (
        <div style={{ background: 'rgba(150,56,56,0.1)', border: '1px solid rgba(150,56,56,0.3)', padding: '16px 20px', fontFamily: A.sans, fontSize: '13px', color: A.danger }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Stats row 1 */}
          <div className="dash-stats-grid">
            <StatCard icon={Users}        label="Total Users"    value={stats.stats.users.total}   sub={`+${stats.stats.users.new_this_month} this month`} accentColor={A.info}    />
            <StatCard icon={ShoppingBag}  label="Total Orders"   value={stats.stats.orders.total}  sub={`${stats.stats.orders.pending} pending`}           accentColor={A.warning} />
            <StatCard icon={DollarSign}   label="Revenue"        value={`Rs. ${Number(stats.stats.orders.total_revenue).toLocaleString()}`} sub={`Rs. ${Number(stats.stats.orders.monthly_revenue).toLocaleString()} / mo`} accentColor={A.success} />
            <StatCard icon={Package}      label="Products"       value={stats.stats.products.total} sub={`${stats.stats.products.low_stock} low stock`}    accentColor={A.accent}  />
          </div>

          {/* Stats row 2 */}
          <div className="dash-stats-grid">
            <StatCard icon={CheckCircle}  label="Verified Users" value={stats.stats.users.verified}          sub={`${stats.stats.users.total - stats.stats.users.verified} unverified`} accentColor={A.success} />
            <StatCard icon={FlaskConical} label="Skin Analyses"  value={stats.stats.analyses.total}          sub="All time"                                                              accentColor={A.accent}  />
            <StatCard icon={AlertTriangle}label="Low Stock"      value={stats.stats.products.low_stock}      sub="Need restock"                                                          accentColor={A.warning} />
            <StatCard icon={XCircle}      label="Out of Stock"   value={stats.stats.products.out_of_stock}   sub="Unavailable"                                                           accentColor={A.danger}  />
          </div>

          {/* Charts row */}
          <div className="dash-chart-row">
            {/* Line chart — spans 2 cols on desktop */}
            <div style={{ gridColumn: 'span 2' }}>
              <Card
                title="Last 7 Days"
                action={
                  <div style={{ display: 'flex', gap: '2px', background: A.bg, padding: '2px', border: `1px solid ${A.border}` }}>
                    {['revenue', 'users'].map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{
                        padding: '4px 12px',
                        background: tab === t ? A.accent : 'transparent',
                        color:      tab === t ? '#FFFFFF' : A.textMid,
                        border: 'none', cursor: 'pointer',
                        fontFamily: A.sans, fontSize: '10.5px',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        fontWeight: 400, transition: 'all 0.15s',
                      }}>
                        {t}
                      </button>
                    ))}
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={200}>
                  {tab === 'revenue' ? (
                    <LineChart data={stats.charts?.revenue_7days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke={A.border2} />
                      <XAxis dataKey="date" stroke={A.textDim} tick={{ fontSize: 10, fontFamily: A.sans, fill: A.textMid }} />
                      <YAxis stroke={A.textDim} tick={{ fontSize: 10, fontFamily: A.sans, fill: A.textMid }} width={44} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke={A.accent}   strokeWidth={1.5} dot={{ fill: A.accent,   r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="orders"  name="Orders"  stroke={A.success}  strokeWidth={1.5} dot={{ fill: A.success,  r: 2 }} />
                    </LineChart>
                  ) : (
                    <LineChart data={stats.charts?.users_7days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke={A.border2} />
                      <XAxis dataKey="date" stroke={A.textDim} tick={{ fontSize: 10, fontFamily: A.sans, fill: A.textMid }} />
                      <YAxis stroke={A.textDim} tick={{ fontSize: 10, fontFamily: A.sans, fill: A.textMid }} width={44} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="users" name="New Users" stroke={A.info} strokeWidth={1.5} dot={{ fill: A.info, r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Pie chart */}
            <Card title="Order Status">
              {stats.stats.orders.by_status?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.stats.orders.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={72} innerRadius={36}>
                      {stats.stats.orders.by_status.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1A1A1A', border: `1px solid ${A.border2}`, borderRadius: '0', color: A.text, fontSize: '11px', fontFamily: A.sans }} />
                    <Legend formatter={v => <span style={{ color: A.textMid, fontSize: '10px', textTransform: 'capitalize', fontFamily: A.sans }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.textDim, fontFamily: A.sans, fontSize: '13px' }}>
                  No orders yet
                </div>
              )}
            </Card>
          </div>

          {/* Monthly bar chart */}
          {stats.charts?.monthly_revenue?.length > 0 && (
            <Card title="Monthly Revenue — Last 6 Months">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.charts.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke={A.border2} />
                  <XAxis dataKey="month" stroke={A.textDim} tick={{ fontSize: 10, fontFamily: A.sans, fill: A.textMid }} />
                  <YAxis stroke={A.textDim} tick={{ fontSize: 10, fontFamily: A.sans, fill: A.textMid }} width={44} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ color: A.textMid, fontSize: '10px', fontFamily: A.sans }}>{v}</span>} />
                  <Bar dataKey="revenue" name="Revenue" fill={A.accent}  radius={[2,2,0,0]} />
                  <Bar dataKey="orders"  name="Orders"  fill={A.success} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Bottom row */}
          <div className="dash-bottom-row">

            {/* Recent orders — 2 col span */}
            <div style={{ gridColumn: 'span 2' }}>
              <Card title="Recent Orders" action={
                <Link to="/admin/orders" style={{ fontFamily: A.sans, fontSize: '11px', color: A.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View all <ArrowRight size={12} strokeWidth={1.5} />
                </Link>
              }>
                {stats.recent_orders?.length > 0 ? (
                  <div>
                    {stats.recent_orders.map((order, i) => {
                      const s = statusStyle[order.status] || { color: A.textMid, bg: A.border }
                      return (
                        <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < stats.recent_orders.length - 1 ? `1px solid ${A.border}` : 'none', gap: '12px' }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.order_number}</p>
                            <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.full_name}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <span style={{ fontFamily: A.sans, fontSize: '10px', textTransform: 'capitalize', letterSpacing: '0.08em', color: s.color, background: s.bg, padding: '3px 8px', fontWeight: 400 }}>
                              {order.status}
                            </span>
                            <span style={{ fontFamily: A.serif, fontSize: '14px', color: A.text, fontWeight: 400 }}>
                              Rs. {order.total_amount}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textDim, textAlign: 'center', padding: '24px 0' }}>No orders yet</p>
                )}
              </Card>
            </div>

            {/* Right column */}
            <div className="dash-right-col">
              {/* Top products */}
              {stats.charts?.top_products?.length > 0 && (
                <Card title="Top Products">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.charts.top_products.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: A.serif, fontSize: '13px', color: A.accent, width: '16px', flexShrink: 0, fontWeight: 400 }}>{i+1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: A.sans, fontSize: '12px', color: A.text, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product__name}</p>
                          <p style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product__brand}</p>
                        </div>
                        <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.accent, fontWeight: 400, flexShrink: 0 }}>{p.total_sold} sold</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Quick actions */}
              <Card title="Quick Actions">
                <div>
                  {[
                    { to: '/admin/orders',   icon: ShoppingBag, label: 'Manage Orders'   },
                    { to: '/admin/users',    icon: Users,       label: 'Manage Users'    },
                    { to: '/admin/products', icon: Package,     label: 'Manage Products' },
                  ].map((l, i, arr) => {
                    const Icon = l.icon
                    return (
                      <Link key={l.to} to={l.to} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 0',
                        borderBottom: i < arr.length - 1 ? `1px solid ${A.border}` : 'none',
                        fontFamily: A.sans, fontSize: '12.5px',
                        color: A.textMid, textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = A.text}
                        onMouseLeave={e => e.currentTarget.style.color = A.textMid}
                      >
                        <Icon size={15} strokeWidth={1.5} />
                        {l.label}
                        <ArrowRight size={12} strokeWidth={1.5} style={{ marginLeft: 'auto' }} />
                      </Link>
                    )
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}