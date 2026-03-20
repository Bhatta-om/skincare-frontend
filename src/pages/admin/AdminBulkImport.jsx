// src/pages/admin/AdminBulkImport.jsx — Professional Dark Admin
import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout, { A } from './AdminLayout'
import { ArrowLeft, Download, Upload, CheckCircle, XCircle, SkipForward, Package } from 'lucide-react'

const AdminToast = ({ message }) => message.text ? (
  <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: message.type === 'success' ? A.success : A.danger, color: '#FFFFFF', padding: '12px 20px', fontFamily: A.sans, fontSize: '13px', fontWeight: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
    {message.text}
  </div>
) : null

const SectionCard = ({ title, action, children }) => (
  <div style={{ background: A.surface, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
    <div style={{ padding: '12px 18px', borderBottom: `1px solid ${A.border}`, background: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h3 style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textMid, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 400 }}>{title}</h3>
      {action}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
)

const COLUMNS = [
  { col: 'name',                req: true,  ex: 'Vitamin C Serum',  note: 'Product name'                                        },
  { col: 'brand',               req: true,  ex: 'Himalaya',          note: 'Brand name'                                          },
  { col: 'category',            req: true,  ex: 'Serum',             note: 'Must match existing category name'                   },
  { col: 'price',               req: true,  ex: '450',               note: 'Price in Rs.'                                        },
  { col: 'stock',               req: true,  ex: '100',               note: 'Stock quantity'                                      },
  { col: 'description',         req: false, ex: 'Great serum...',    note: 'Product description'                                  },
  { col: 'ingredients',         req: false, ex: 'Vitamin C, Niacin', note: 'Comma separated'                                     },
  { col: 'discount_percent',    req: false, ex: '10',               note: 'Default: 0'                                           },
  { col: 'suitable_skin_type',  req: false, ex: 'oily',              note: 'oily / dry / normal / combination / sensitive / all' },
  { col: 'skin_concern',        req: false, ex: 'brightening',       note: 'acne / aging / brightening / hydration / general'    },
  { col: 'gender',              req: false, ex: 'unisex',            note: 'male / female / unisex'                              },
  { col: 'is_featured',         req: false, ex: 'false',            note: 'true / false'                                         },
  { col: 'low_stock_threshold', req: false, ex: '10',               note: 'Default: 10'                                          },
]

export default function AdminBulkImport() {
  const [file,     setFile]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [message,  setMessage]  = useState({ text: '', type: '' })
  const inputRef = useRef()

  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 4000) }

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) { showMsg('Please upload a CSV file only.', 'error'); return }
    setFile(f); setResult(null)
  }

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

  const handleImport = async () => {
    if (!file) { showMsg('Please select a CSV file first.', 'error'); return }
    setLoading(true); setResult(null)
    const formData = new FormData(); formData.append('file', file)
    try {
      const res = await api.post('/products/bulk-import/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      showMsg(`Import complete — ${res.data.summary.created} product${res.data.summary.created !== 1 ? 's' : ''} created`, 'success')
    } catch (err) { showMsg(err.response?.data?.error || 'Import failed. Please check your CSV.', 'error') }
    finally { setLoading(false) }
  }

  const downloadTemplate = () => {
    const headers = COLUMNS.map(c => c.col)
    const sample  = ['Vitamin C Serum','Himalaya','Serum','Brightening serum','Vitamin C, Niacinamide','450','10','oily','brightening','unisex','false','10']
    const csv     = [headers.join(','), sample.join(',')].join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href = url; a.download = 'skincare_products_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const statusIcon = (status) => {
    if (status === 'success') return <CheckCircle size={13} strokeWidth={1.5} style={{ color: A.success, flexShrink: 0 }} />
    if (status === 'failed')  return <XCircle     size={13} strokeWidth={1.5} style={{ color: A.danger,  flexShrink: 0 }} />
    return <SkipForward size={13} strokeWidth={1.5} style={{ color: A.warning, flexShrink: 0 }} />
  }

  const statusColor = (status) => status === 'success' ? A.success : status === 'failed' ? A.danger : A.warning

  return (
    <AdminLayout>
      <AdminToast message={message} />

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: A.sans, fontSize: '12px', color: A.textMid, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = A.text}
            onMouseLeave={e => e.currentTarget.style.color = A.textMid}
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </Link>
          <span style={{ color: A.border2 }}>|</span>
          <div>
            <p style={{ fontFamily: A.sans, fontSize: '14px', color: A.text, fontWeight: 500 }}>Bulk Import Products</p>
            <p style={{ fontFamily: A.sans, fontSize: '11.5px', color: A.textDim, fontWeight: 300, marginTop: '2px' }}>Upload a CSV to add multiple products at once</p>
          </div>
        </div>

        {/* How it works */}
        <SectionCard title="How It Works">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { step: '01', label: 'Download Template', desc: 'Get the CSV template with correct column headers' },
              { step: '02', label: 'Fill Your Products', desc: 'Add products in Excel or Google Sheets'          },
              { step: '03', label: 'Upload & Import',    desc: 'Upload CSV — all products created instantly'      },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', border: `1px solid ${A.accent}40`, background: 'rgba(184,137,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: A.serif, fontSize: '11px', color: A.accent, fontWeight: 400 }}>{item.step}</span>
                </div>
                <div>
                  <p style={{ fontFamily: A.sans, fontSize: '12.5px', color: A.text, fontWeight: 400, marginBottom: '3px' }}>{item.label}</p>
                  <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Column guide */}
        <SectionCard title="CSV Column Guide">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${A.border}` }}>
                  {['Column', 'Required', 'Example', 'Notes'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontFamily: A.sans, fontSize: '9.5px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '8px 12px 8px 0', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((row, i) => (
                  <tr key={row.col} style={{ borderBottom: `1px solid ${A.border}` }}>
                    <td style={{ padding: '8px 12px 8px 0' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '11px', color: A.accent }}>{row.col}</code>
                    </td>
                    <td style={{ padding: '8px 12px 8px 0' }}>
                      <span style={{ fontFamily: A.sans, fontSize: '9.5px', color: row.req ? A.danger : A.textDim, background: row.req ? 'rgba(150,56,56,0.12)' : A.bg, border: `1px solid ${row.req ? A.danger + '30' : A.border}`, padding: '2px 7px', letterSpacing: '0.06em' }}>
                        {row.req ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px 8px 0' }}>
                      <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textMid, fontWeight: 300 }}>{row.ex}</span>
                    </td>
                    <td style={{ padding: '8px 0' }}>
                      <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300 }}>{row.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Upload */}
        <SectionCard title="Upload CSV File" action={
          <button onClick={downloadTemplate} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'transparent', border: `1px solid ${A.border2}`,
            color: A.textMid, padding: '6px 12px', cursor: 'pointer',
            fontFamily: A.sans, fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = A.accent; e.currentTarget.style.color = A.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = A.border2; e.currentTarget.style.color = A.textMid }}
          >
            <Download size={12} strokeWidth={1.5} /> Template
          </button>
        }>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragging ? A.accent : file ? A.success : A.border2}`,
              background: dragging ? 'rgba(184,137,90,0.05)' : file ? 'rgba(74,122,87,0.05)' : A.bg,
              cursor: file ? 'default' : 'pointer',
              transition: 'all 0.2s', marginBottom: '16px',
              minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <CheckCircle size={28} strokeWidth={1.5} style={{ color: A.success, margin: '0 auto 12px' }} />
                <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.text, fontWeight: 400, marginBottom: '4px' }}>{file.name}</p>
                <p style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, marginBottom: '12px' }}>{(file.size/1024).toFixed(1)} KB</p>
                <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: A.sans, fontSize: '11px', color: A.danger, textDecoration: 'underline' }}>
                  Remove file
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                <Upload size={28} strokeWidth={1} style={{ color: A.textDim, margin: '0 auto 12px' }} />
                <p style={{ fontFamily: A.sans, fontSize: '13px', color: A.text, fontWeight: 400, marginBottom: '4px' }}>Drop CSV file here</p>
                <p style={{ fontFamily: A.sans, fontSize: '11.5px', color: A.textDim, fontWeight: 300, marginBottom: '8px' }}>or click to browse</p>
                <span style={{ fontFamily: A.sans, fontSize: '10px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', border: `1px solid ${A.border}`, padding: '3px 10px' }}>CSV files only</span>
              </div>
            )}
          </div>

          <button onClick={handleImport} disabled={!file || loading} style={{
            width: '100%', background: !file || loading ? A.muted : A.accent,
            color: '#FFFFFF', border: 'none', padding: '13px',
            fontFamily: A.sans, fontSize: '12px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            cursor: !file || loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => { if (file && !loading) e.currentTarget.style.background = A.accentHov }}
            onMouseLeave={e => { if (file && !loading) e.currentTarget.style.background = A.accent }}
          >
            {loading ? (
              <><div style={{ width: '14px', height: '14px', border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />Importing products...</>
            ) : (
              <><Upload size={14} strokeWidth={1.5} />Import Products</>
            )}
          </button>
        </SectionCard>

        {/* Results */}
        {result && (
          <SectionCard title="Import Results">
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Total Rows', value: result.summary.total,   color: A.textMid  },
                { label: 'Created',    value: result.summary.created, color: A.success  },
                { label: 'Failed',     value: result.summary.failed,  color: A.danger   },
                { label: 'Skipped',    value: result.summary.skipped, color: A.warning  },
              ].map(card => (
                <div key={card.label} style={{ background: A.bg, border: `1px solid ${A.border}`, padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontFamily: A.serif, fontSize: '24px', color: card.color, fontWeight: 400, lineHeight: 1, marginBottom: '6px' }}>{card.value}</p>
                  <p style={{ fontFamily: A.sans, fontSize: '9.5px', color: A.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400 }}>{card.label}</p>
                </div>
              ))}
            </div>

            {/* Row results */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              {result.results.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: row.status === 'success' ? 'rgba(74,122,87,0.06)' : row.status === 'failed' ? 'rgba(150,56,56,0.06)' : 'rgba(137,103,15,0.06)', border: `1px solid ${statusColor(row.status)}20` }}>
                  {statusIcon(row.status)}
                  <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.textDim, fontWeight: 300, flexShrink: 0 }}>Row {row.row}:</span>
                  <span style={{ fontFamily: A.sans, fontSize: '12px', color: A.text, fontWeight: 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name || '(empty)'}</span>
                  {row.reason && <span style={{ fontFamily: A.sans, fontSize: '10.5px', color: A.textDim, fontWeight: 300, flexShrink: 0, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.reason}</span>}
                  <span style={{ fontFamily: A.sans, fontSize: '10px', color: statusColor(row.status), textTransform: 'capitalize', letterSpacing: '0.06em', flexShrink: 0, fontWeight: 400 }}>{row.status}</span>
                </div>
              ))}
            </div>

            {result.summary.created > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/admin/products" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: A.accent, color: '#FFFFFF', padding: '11px', textDecoration: 'none', fontFamily: A.sans, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = A.accentHov}
                  onMouseLeave={e => e.currentTarget.style.background = A.accent}
                >
                  <Package size={13} strokeWidth={1.5} /> View Products
                </Link>
                <button onClick={() => { setFile(null); setResult(null) }} style={{ flex: 1, background: 'transparent', border: `1px solid ${A.border2}`, color: A.textMid, padding: '11px', cursor: 'pointer', fontFamily: A.sans, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = A.muted; e.currentTarget.style.color = A.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = A.border2; e.currentTarget.style.color = A.textMid }}
                >
                  Import More
                </button>
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </AdminLayout>
  )
}