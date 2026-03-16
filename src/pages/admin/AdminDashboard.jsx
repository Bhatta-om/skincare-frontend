// src/pages/admin/AdminDashboard.jsx — Mobile Polish
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'
import { AdminStatsSkeleton } from '../../components/Skeleton'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const StatCard = ({ emoji, label, value, sub, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xl sm:text-2xl">{emoji}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{sub}</span>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5">{value}</p>
    <p className="text-gray-500 text-xs">{label}</p>
  </div>
)

const ChartCard = ({ title, children, action }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-bold text-sm sm:text-base">{title}</h2>
      {action}
    </div>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label, prefix = 'Rs.' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-xs" style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' || p.name === 'Revenue'
            ? `${prefix} ${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  )
}

const PIE_COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  confirmed:  'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped:    'bg-indigo-500/20 text-indigo-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('revenue')

  useEffect(() => {
    api.get('/admin/stats/')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      {loading ? <AdminStatsSkeleton /> : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">{error}</div>
      ) : (
        <div className="space-y-5">

          {/* ── Stats Row 1 — 2 cols mobile, 4 desktop ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard emoji="👥" label="Total Users"
              value={stats.stats.users.total}
              sub={`+${stats.stats.users.new_this_month} mo`}
              color="bg-blue-500/20 text-blue-400" />
            <StatCard emoji="📦" label="Total Orders"
              value={stats.stats.orders.total}
              sub={`${stats.stats.orders.pending} pending`}
              color="bg-yellow-500/20 text-yellow-400" />
            <StatCard emoji="💰" label="Revenue"
              value={`Rs. ${Number(stats.stats.orders.total_revenue).toLocaleString()}`}
              sub={`Rs. ${Number(stats.stats.orders.monthly_revenue).toLocaleString()}/mo`}
              color="bg-green-500/20 text-green-400" />
            <StatCard emoji="🧴" label="Products"
              value={stats.stats.products.total}
              sub={`${stats.stats.products.low_stock} low`}
              color="bg-orange-500/20 text-orange-400" />
          </div>

          {/* ── Stats Row 2 ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard emoji="✅" label="Verified Users"
              value={stats.stats.users.verified}
              sub={`${stats.stats.users.total - stats.stats.users.verified} not`}
              color="bg-green-500/20 text-green-400" />
            <StatCard emoji="🔬" label="Analyses"
              value={stats.stats.analyses.total}
              sub="Total" color="bg-purple-500/20 text-purple-400" />
            <StatCard emoji="⚠️" label="Low Stock"
              value={stats.stats.products.low_stock}
              sub="Restock" color="bg-orange-500/20 text-orange-400" />
            <StatCard emoji="❌" label="Out of Stock"
              value={stats.stats.products.out_of_stock}
              sub="Unavailable" color="bg-red-500/20 text-red-400" />
          </div>

          {/* ── Revenue + Pie — stack on mobile ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartCard
                title="Last 7 Days"
                action={
                  <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
                    {['revenue', 'users'].map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                          tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                }>
                <ResponsiveContainer width="100%" height={200}>
                  {tab === 'revenue' ? (
                    <LineChart data={stats.charts?.revenue_7days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="revenue" name="revenue" stroke="#a855f7" strokeWidth={2}
                        dot={{ fill: '#a855f7', r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="orders" name="orders" stroke="#ec4899" strokeWidth={2}
                        dot={{ fill: '#ec4899', r: 2 }} />
                    </LineChart>
                  ) : (
                    <LineChart data={stats.charts?.users_7days || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} width={40} />
                      <Tooltip content={<CustomTooltip prefix="" />} />
                      <Line type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Order Status">
              {stats.stats.orders.by_status?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.stats.orders.by_status} dataKey="count" nameKey="status"
                      cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {stats.stats.orders.by_status.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#1f2937', border:'1px solid #374151', borderRadius:'10px', color:'#fff', fontSize:'12px' }} />
                    <Legend formatter={v => <span style={{ color:'#9ca3af', fontSize:'10px', textTransform:'capitalize' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No orders yet</div>
              )}
            </ChartCard>
          </div>

          {/* ── Monthly Bar Chart ── */}
          {stats.charts?.monthly_revenue?.length > 0 && (
            <ChartCard title="Monthly Revenue (Last 6 Months)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.charts.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ color:'#9ca3af', fontSize:'10px' }}>{v}</span>} />
                  <Bar dataKey="revenue" name="Revenue" fill="#a855f7" radius={[4,4,0,0]} />
                  <Bar dataKey="orders"  name="Orders"  fill="#ec4899" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* ── Bottom Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <ChartCard title="Recent Orders"
                action={<Link to="/admin/orders" className="text-purple-400 hover:text-purple-300 text-xs">View All →</Link>}>
                {stats.recent_orders?.length > 0 ? (
                  <div className="space-y-0">
                    {stats.recent_orders.map(order => (
                      <div key={order.id}
                        className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0 gap-3">
                        <div className="min-w-0">
                          <p className="text-white text-xs sm:text-sm font-medium">{order.order_number}</p>
                          <p className="text-gray-500 text-xs truncate">{order.full_name}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-700 text-gray-400'}`}>
                            {order.status}
                          </span>
                          <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">
                            Rs. {order.total_amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-6">No orders yet</p>
                )}
              </ChartCard>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Payment Methods */}
              {stats.charts?.payment_methods?.length > 0 && (
                <ChartCard title="Payment Methods">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={stats.charts.payment_methods} dataKey="count" nameKey="payment_method"
                        cx="50%" cy="50%" outerRadius={55} innerRadius={28}>
                        {stats.charts.payment_methods.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background:'#1f2937', border:'1px solid #374151', borderRadius:'10px', color:'#fff', fontSize:'11px' }} />
                      <Legend formatter={v => <span style={{ color:'#9ca3af', fontSize:'10px', textTransform:'uppercase' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Top Products */}
              {stats.charts?.top_products?.length > 0 && (
                <ChartCard title="🏆 Top Products">
                  <div className="space-y-3">
                    {stats.charts.top_products.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs w-4 shrink-0">{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{p.product__name}</p>
                          <p className="text-gray-600 text-xs truncate">{p.product__brand}</p>
                        </div>
                        <span className="text-purple-400 text-xs font-bold shrink-0">{p.total_sold} sold</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}

              {/* Quick Actions */}
              <ChartCard title="Quick Actions">
                <div className="space-y-1">
                  {[
                    { to:'/admin/orders',   icon:'📦', label:'Manage Orders'   },
                    { to:'/admin/users',    icon:'👥', label:'Manage Users'    },
                    { to:'/admin/products', icon:'🧴', label:'Manage Products' },
                  ].map(l => (
                    <Link key={l.to} to={l.to}
                      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2.5 border-b border-gray-800 last:border-0 transition-colors">
                      <span>{l.icon}</span><span>{l.label}</span>
                    </Link>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}