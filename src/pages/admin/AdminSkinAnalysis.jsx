// src/pages/admin/AdminSkinAnalysis.jsx
import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import {
  FlaskConical, Users, CheckCircle, XCircle,
  Search, RefreshCw, Filter,
  Droplets, Leaf, Sun,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CSS = `
  .sa-stats  { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .sa-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .sa-table  { width: 100%; border-collapse: collapse; }
  .sa-table th, .sa-table td { padding: 11px 16px; text-align: left; border-bottom: 1px solid ${A.border}; white-space: nowrap; }
  .sa-table th { font-family: ${A.sans}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: ${A.textDim}; font-weight: 400; }
  .sa-table td { font-family: ${A.sans}; font-size: 12.5px; color: ${A.textMid}; font-weight: 300; }
  .sa-table tr:hover td { background: rgba(255,255,255,0.02); }
  @media (max-width: 1024px) {
    .sa-stats { grid-template-columns: repeat(2,1fr); }
    .sa-grid  { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .sa-stats { grid-template-columns: 1fr; }
  }
`

const SKIN_COLORS = { oily: '#B8895A', dry: '#5A7FA6', normal: '#4A7A57', '—': '#6B6B6B' }
const SKIN_ICONS  = { oily: <Droplets size={13} strokeWidth={1.5} />, dry: <Leaf size={13} strokeWidth={1.5} />, normal: <Sun size={13} strokeWidth={1.5} /> }
const PIE_COLORS  = ['#B8895A', '#5A7FA6', '#4A7A57', '#AA9688']

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div style={{ background: A.surface, border: `1px solid ${A.border}`, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
      <Icon size={18} strokeWidth={1.5} style={{ color: color || A.accent }} />
      {sub && <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>{sub}</span>}
    </div>
    <p style={{ fontFamily: A.serif, fontSize: '26px', color: A.text, fontWeight: 400, lineHeight: 1, marginBottom: '6px' }}>{value}</p>
    <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>{label}</p>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    completed: { bg: 'rgba(74,122,87,0.15)',  color: '#4A7A57', label: 'Completed' },
    processing: { bg: 'rgba(184,137,90,0.15)', color: '#B8895A', label: 'Processing' },
    failed:    { bg: 'rgba(150,56,56,0.15)',  color: '#963838', label: 'Failed'    },
    pending:   { bg: 'rgba(107,107,107,0.15)',color: '#AA9688', label: 'Pending'   },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ background: s.bg, color: s.color, fontFamily: A.sans, fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 10px' }}>
      {s.label}
    </span>
  )
}

const SkinTypeBadge = ({ type }) => {
  const color = SKIN_COLORS[type] || '#AA9688'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color, fontFamily: A.sans, fontSize: '12px', fontWeight: 400 }}>
      {SKIN_ICONS[type]}
      {type ? type.charAt(0).toUpperCase() + type.slice(1) : '—'}
    </span>
  )
}

export default function AdminSkinAnalysis() {
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [skinFilter,setSkinFilter]= useState('')
  const [statusFilter,setStatusFilter] = useState('')

  const fetchData = () => {
    setLoading(true); setError('')
    const params = new URLSearchParams()
    if (search)      params.append('search',    search)
    if (skinFilter)  params.append('skin_type', skinFilter)
    if (statusFilter)params.append('status',    statusFilter)
    api.get(`/admin/skin-analysis/?${params}`)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load skin analysis data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search, skinFilter, statusFilter])

  const completed  = data?.results?.filter(r => r.status === 'completed').length || 0
  const failed     = data?.results?.filter(r => r.status === 'failed').length || 0
  const guestCount = data?.results?.filter(r => r.user === 'Guest').length || 0

  // Pie chart data from distribution
  const pieData = (data?.distribution || []).map(d => ({
    name:  d.skin_type ? d.skin_type.charAt(0).toUpperCase() + d.skin_type.slice(1) : 'Unknown',
    value: d.count,
  }))

  // Status pie data
  const statusPieData = (data?.status_breakdown || []).map(d => ({
    name:  d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : 'Unknown',
    value: d.count,
  }))
  const STATUS_PIE_COLORS = ['#4A7A57', '#B8895A', '#963838', '#AA9688']

  return (
    <AdminLayout title="Skin Analysis">
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: A.serif, fontSize: '22px', color: A.text, fontWeight: 400, marginBottom: '4px' }}>Skin Analysis</h1>
          <p style={{ fontFamily: A.sans, fontSize: '12px', color: A.textDim, fontWeight: 300 }}>
            Overview of all AI skin analyses performed on the platform
          </p>
        </div>
        <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${A.border}`, padding: '8px 16px', cursor: 'pointer', fontFamily: A.sans, fontSize: '11px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = A.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = A.border}
        >
          <RefreshCw size={13} strokeWidth={1.5} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(150,56,56,0.1)', border: '1px solid rgba(150,56,56,0.3)', padding: '12px 16px', marginBottom: '20px', fontFamily: A.sans, fontSize: '13px', color: '#963838' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="sa-stats">
            {[1,2,3].map(i => <div key={i} style={{ background: A.surface, border: `1px solid ${A.border}`, height: '90px', animation: 'pulse 1.5s ease infinite' }} />)}
          </div>
          <div style={{ background: A.surface, border: `1px solid ${A.border}`, height: '280px' }} />
        </div>
      ) : data && (
        <>
          {/* Stat cards */}
          <div className="sa-stats" style={{ marginBottom: '20px' }}>
            <StatCard icon={FlaskConical} label="Total Analyses"  value={data.total}  sub="All time"                color={A.accent}  />
            <StatCard icon={CheckCircle}  label="Completed"       value={completed}   sub={`${data.total > 0 ? Math.round(completed/data.total*100) : 0}% success rate`} color="#4A7A57" />
            <StatCard icon={Users}        label="Guest Analyses"  value={guestCount}  sub="Without account"         color={A.info}    />
          </div>

          {/* Charts row */}
          <div className="sa-grid" style={{ marginBottom: '20px' }}>

            {/* Skin type distribution */}
            <div style={{ background: A.surface, border: `1px solid ${A.border}` }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${A.border}` }}>
                <h3 style={{ fontFamily: A.sans, fontSize: '11px', color: A.text, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Skin Type Distribution</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1A1A1A', border: `1px solid ${A.border}`, fontFamily: A.sans, fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontFamily: A.sans, fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Distribution list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      {data.distribution.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <SkinTypeBadge type={d.skin_type} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '80px', height: '3px', background: A.border2 }}>
                              <div style={{ height: '100%', width: `${data.total > 0 ? Math.round(d.count/data.total*100) : 0}%`, background: PIE_COLORS[i % PIE_COLORS.length], transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textMid, minWidth: '28px', textAlign: 'right' }}>
                              {data.total > 0 ? Math.round(d.count/data.total*100) : 0}%
                            </span>
                            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim }}>({d.count})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: A.textDim, fontFamily: A.sans, fontSize: '13px' }}>No data yet</div>
                )}
              </div>
            </div>

            {/* Status breakdown */}
            <div style={{ background: A.surface, border: `1px solid ${A.border}` }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${A.border}` }}>
                <h3 style={{ fontFamily: A.sans, fontSize: '11px', color: A.text, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Analysis Status</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {statusPieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                          {statusPieData.map((_, i) => <Cell key={i} fill={STATUS_PIE_COLORS[i % STATUS_PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1A1A1A', border: `1px solid ${A.border}`, fontFamily: A.sans, fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontFamily: A.sans, fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      {data.status_breakdown.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <StatusBadge status={d.status} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textMid }}>{d.count} analyses</span>
                            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim }}>
                              ({data.total > 0 ? Math.round(d.count/data.total*100) : 0}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: A.textDim, fontFamily: A.sans, fontSize: '13px' }}>No data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ background: A.surface, border: `1px solid ${A.border}`, marginBottom: '1px' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Filter size={13} strokeWidth={1.5} style={{ color: A.textDim }} />

              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: A.textDim }} />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by email..."
                  style={{ width: '100%', background: A.bg, border: `1px solid ${A.border}`, padding: '7px 12px 7px 30px', fontFamily: A.sans, fontSize: '12px', color: A.text, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Skin type filter */}
              <select value={skinFilter} onChange={e => setSkinFilter(e.target.value)}
                style={{ background: A.bg, border: `1px solid ${A.border}`, padding: '7px 12px', fontFamily: A.sans, fontSize: '12px', color: skinFilter ? A.text : A.textDim, outline: 'none', cursor: 'pointer' }}>
                <option value="">All Skin Types</option>
                <option value="oily">Oily</option>
                <option value="dry">Dry</option>
                <option value="normal">Normal</option>
              </select>

              {/* Status filter */}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: A.bg, border: `1px solid ${A.border}`, padding: '7px 12px', fontFamily: A.sans, fontSize: '12px', color: statusFilter ? A.text : A.textDim, outline: 'none', cursor: 'pointer' }}>
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>

              <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, marginLeft: 'auto' }}>
                {data.results.length} of {data.total} shown
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              {data.results.length > 0 ? (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Skin Type</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Confidence</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((row, i) => (
                      <tr key={row.id}>
                        <td style={{ color: A.textDim }}>{row.id}</td>
                        <td>
                          <div>
                            <p style={{ color: A.text, fontWeight: 400, marginBottom: '1px' }}>{row.user_name || 'Guest'}</p>
                            <p style={{ color: A.textDim, fontSize: '11px' }}>{row.user}</p>
                          </div>
                        </td>
                        <td><SkinTypeBadge type={row.skin_type} /></td>
                        <td>{row.age || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{row.gender || '—'}</td>
                        <td>
                          {row.confidence > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '50px', height: '3px', background: A.border2 }}>
                                <div style={{ height: '100%', width: `${Math.min(row.confidence, 100)}%`, background: A.accent }} />
                              </div>
                              <span style={{ fontSize: '11px' }}>{row.confidence}%</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td><StatusBadge status={row.status} /></td>
                        <td style={{ fontSize: '11px', color: A.textDim }}>
                          {new Date(row.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <FlaskConical size={32} strokeWidth={1} style={{ color: A.textDim, margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.textDim }}>No analyses found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}