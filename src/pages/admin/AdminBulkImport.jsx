// src/pages/admin/AdminBulkImport.jsx
import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminBulkImport() {
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [message, setMessage]   = useState({ text: '', type: '' })
  const inputRef                = useRef()

  const showMsg = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) {
      showMsg('Please upload a CSV file only!', 'error')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleImport = async () => {
    if (!file) { showMsg('Please select a CSV file first!', 'error'); return }
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/products/bulk-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      showMsg(`Import complete! ${res.data.summary.created} products created.`, 'success')
    } catch (err) {
      showMsg(err.response?.data?.error || 'Import failed. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'name', 'brand', 'category', 'description', 'ingredients',
      'price', 'discount_percent', 'suitable_skin_type', 'skin_concern',
      'min_age', 'max_age', 'gender', 'stock', 'low_stock_threshold',
      'is_featured'
    ]
    const sample = [
      'Vitamin C Serum', 'Himalaya', 'Serum',
      'Brightening serum with Vitamin C', 'Vitamin C, Niacinamide',
      '450', '10', 'oily', 'brightening',
      '18', '45', 'female', '100', '10', 'false'
    ]
    const csv     = [headers.join(','), sample.join(',')].join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = 'skincare_products_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    if (status === 'success') return 'text-green-400'
    if (status === 'failed')  return 'text-red-400'
    return 'text-yellow-400'
  }

  const getStatusIcon = (status) => {
    if (status === 'success') return '✅'
    if (status === 'failed')  return '❌'
    return '⏭️'
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="text-gray-500 hover:text-white transition-colors">← Back</Link>
          <div>
            <h2 className="text-white font-bold text-xl">Bulk Import Products</h2>
            <p className="text-gray-500 text-sm">Upload a CSV file to add multiple products at once</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-3">
            📋 How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', icon: '📥', title: 'Download Template', desc: 'Get the CSV template with correct column headers' },
              { step: '2', icon: '📝', title: 'Fill Products', desc: 'Add your products in Excel or Google Sheets' },
              { step: '3', icon: '🚀', title: 'Upload & Import', desc: 'Upload the CSV and all products get created instantly' },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.icon} {item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSV Columns Guide */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-3">
            📊 CSV Column Guide
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 py-2 pr-4">Column</th>
                  <th className="text-left text-gray-400 py-2 pr-4">Required</th>
                  <th className="text-left text-gray-400 py-2 pr-4">Example</th>
                  <th className="text-left text-gray-400 py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {[
                  { col: 'name',               req: true,  ex: 'Vitamin C Serum',  note: 'Product name' },
                  { col: 'brand',              req: true,  ex: 'Himalaya',          note: 'Brand name' },
                  { col: 'category',           req: true,  ex: 'Serum',             note: 'Must match existing category name' },
                  { col: 'price',              req: true,  ex: '450',               note: 'Price in Rs.' },
                  { col: 'stock',              req: true,  ex: '100',               note: 'Stock quantity' },
                  { col: 'description',        req: false, ex: 'Great serum...',    note: 'Product description' },
                  { col: 'ingredients',        req: false, ex: 'Vitamin C, Niacin', note: 'Comma separated' },
                  { col: 'discount_percent',   req: false, ex: '10',               note: 'Default: 0' },
                  { col: 'suitable_skin_type', req: false, ex: 'oily',              note: 'oily/dry/normal/combination/sensitive/all' },
                  { col: 'skin_concern',       req: false, ex: 'brightening',       note: 'acne/aging/brightening/hydration/pigmentation/sensitivity/general' },
                  { col: 'min_age',            req: false, ex: '18',               note: 'Default: 13' },
                  { col: 'max_age',            req: false, ex: '45',               note: 'Default: 65' },
                  { col: 'gender',             req: false, ex: 'unisex',            note: 'male/female/unisex' },
                  { col: 'is_featured',        req: false, ex: 'false',            note: 'true/false' },
                  { col: 'low_stock_threshold',req: false, ex: '10',               note: 'Default: 10' },
                ].map(row => (
                  <tr key={row.col} className="border-b border-gray-800/50">
                    <td className="py-2 pr-4 font-mono text-purple-400">{row.col}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${row.req ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                        {row.req ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-400">{row.ex}</td>
                    <td className="py-2 text-gray-500">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-white font-bold text-sm">📤 Upload CSV File</h3>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">
              📥 Download Template
            </button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-purple-500 bg-purple-500/10'
                : file
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 hover:border-purple-500'
            }`}>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="space-y-2">
                <p className="text-3xl">📄</p>
                <p className="text-green-400 font-medium">{file.name}</p>
                <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setResult(null) }}
                  className="text-red-400 hover:text-red-300 text-xs underline">
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-4xl">📂</p>
                <p className="text-white font-medium">Drop CSV file here</p>
                <p className="text-gray-500 text-sm">or click to browse</p>
                <p className="text-gray-600 text-xs">Only .csv files accepted</p>
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Importing products...
              </>
            ) : (
              <>🚀 Import Products</>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3">
              📊 Import Results
            </h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Rows',  value: result.summary.total,   color: 'bg-gray-800' },
                { label: 'Created',     value: result.summary.created, color: 'bg-green-900/40' },
                { label: 'Failed',      value: result.summary.failed,  color: 'bg-red-900/40' },
                { label: 'Skipped',     value: result.summary.skipped, color: 'bg-yellow-900/40' },
              ].map(card => (
                <div key={card.label} className={`${card.color} rounded-xl p-3 text-center`}>
                  <p className="text-white font-bold text-2xl">{card.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Row by Row Results */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {result.results.map((row, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl text-xs ${
                  row.status === 'success' ? 'bg-green-900/20' :
                  row.status === 'failed'  ? 'bg-red-900/20'   : 'bg-yellow-900/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(row.status)}</span>
                    <span className="text-gray-400">Row {row.row}:</span>
                    <span className="text-white font-medium">{row.name || '(empty)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.reason && <span className="text-gray-500">{row.reason}</span>}
                    <span className={`font-medium capitalize ${getStatusColor(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons after import */}
            {result.summary.created > 0 && (
              <div className="flex gap-3 pt-2">
                <Link to="/admin/products"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm text-center font-medium transition-colors">
                  View Products →
                </Link>
                <button
                  onClick={() => { setFile(null); setResult(null) }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm transition-colors">
                  Import More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}