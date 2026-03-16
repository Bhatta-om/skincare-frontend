// src/components/SearchBox.jsx — 100% Professional Industry Standard

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getProductImageUrl } from '../utils/productImage'

// ── Constants ──────────────────────────────────────────────
const RECENT_KEY  = 'skincare_recent_searches'
const MAX_RECENT  = 5
const DEBOUNCE_MS = 320
const MIN_CHARS   = 3   // ✅ industry standard

// ── LocalStorage helpers (fallback for guests) ─────────────
const getLocalRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') }
  catch { return [] }
}
const saveLocalRecent = (q) => {
  if (!q?.trim() || q.trim().length < MIN_CHARS) return
  const prev    = getLocalRecent()
  const updated = [q.trim(), ...prev.filter(r => r.toLowerCase() !== q.trim().toLowerCase())]
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated.slice(0, MAX_RECENT)))
}
const removeLocalRecent = (q) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getLocalRecent().filter(r => r !== q)))
}
const clearLocalRecent = () => localStorage.removeItem(RECENT_KEY)

// ── Highlight matching text ────────────────────────────────
const Highlight = ({ text, query, className = '' }) => {
  if (!query || !text) return <span className={className}>{text}</span>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex   = new RegExp(`(${escaped})`, 'gi')
  const parts   = text.split(regex)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-yellow-100 text-yellow-800 font-bold rounded-sm px-0.5 not-italic">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}

// ══════════════════════════════════════════════════════════
// SearchBox Component
// ══════════════════════════════════════════════════════════
export default function SearchBox({
  variant      = 'navbar',   // 'navbar' | 'inline'
  placeholder  = 'Search products, brands...',
  initialValue = '',
  onSearch,
  autoFocus    = false,
}) {
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [query,       setQuery]       = useState(initialValue)
  const [suggestions, setSuggestions] = useState(null)
  const [recent,      setRecent]      = useState([])
  const [open,        setOpen]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)

  const inputRef    = useRef(null)
  const dropdownRef = useRef(null)
  const timerRef    = useRef(null)

  // ── Load recent history ──────────────────────────────
  const loadRecent = useCallback(async () => {
    if (user) {
      try {
        const res = await api.get('/users/search-history/')
        setRecent(res.data.history || [])
        return
      } catch {}
    }
    setRecent(getLocalRecent())
  }, [user])

  useEffect(() => { loadRecent() }, [loadRecent])
  useEffect(() => { setQuery(initialValue) }, [initialValue])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // ── Save search to backend or localStorage ───────────
  const saveSearch = useCallback(async (q) => {
    if (!q?.trim() || q.trim().length < MIN_CHARS) return
    if (user) {
      try {
        await api.post('/users/search-history/', { query: q.trim() })
        await loadRecent()
        return
      } catch {}
    }
    saveLocalRecent(q)
    setRecent(getLocalRecent())
  }, [user, loadRecent])

  // ── Remove one history item ──────────────────────────
  const removeSearch = useCallback(async (q) => {
    if (user) {
      try {
        await api.delete(`/users/search-history/?q=${encodeURIComponent(q)}`)
        await loadRecent()
        return
      } catch {}
    }
    removeLocalRecent(q)
    setRecent(getLocalRecent())
  }, [user, loadRecent])

  // ── Clear all history ────────────────────────────────
  const clearHistory = useCallback(async () => {
    if (user) {
      try {
        await api.delete('/users/search-history/')
        setRecent([])
        return
      } catch {}
    }
    clearLocalRecent()
    setRecent([])
  }, [user])

  // ── Debounced fetch — MIN_CHARS = 3 ─────────────────
  const fetchSuggestions = useCallback((q) => {
    clearTimeout(timerRef.current)
    if (q.trim().length < MIN_CHARS) {
      setSuggestions(null)
      setLoading(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search/suggestions/?q=${encodeURIComponent(q.trim())}`)
        setSuggestions(res.data)
      } catch {
        setSuggestions(null)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setActiveIdx(-1)
    fetchSuggestions(val)
    setOpen(true)
  }

  const handleFocus = () => {
    loadRecent()
    setOpen(true)
  }

  // ── Submit ───────────────────────────────────────────
  const submitSearch = useCallback((q) => {
    const trimmed = q?.trim()
    if (!trimmed) return
    saveSearch(trimmed)
    setOpen(false)
    setActiveIdx(-1)
    setQuery(trimmed)
    if (onSearch) {
      onSearch(trimmed)
    } else {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`)
    }
  }, [navigate, onSearch, saveSearch])

  // ── Item click ───────────────────────────────────────
  const handleItemClick = useCallback((item) => {
    saveSearch(item.label)
    setOpen(false)
    setActiveIdx(-1)
    setQuery(item.label)

    if (item.type === 'product') {
      navigate(`/products/${item.slug}`)
    } else if (item.type === 'brand') {
      if (onSearch) onSearch(item.label)
      else navigate(`/products?search=${encodeURIComponent(item.label)}`)
    } else if (item.type === 'category') {
      // ✅ Navigate with category id
      if (onSearch) onSearch(item.label)
      else navigate(`/products?category=${item.id}`)
    } else if (item.type === 'recent') {
      if (onSearch) onSearch(item.label)
      else navigate(`/products?search=${encodeURIComponent(item.label)}`)
    }
  }, [navigate, onSearch, saveSearch])

  // ── Keyboard navigation ──────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, dropdownItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && dropdownItems[activeIdx]) {
        handleItemClick(dropdownItems[activeIdx])
      } else {
        submitSearch(query)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  // ── Outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Flat items for keyboard nav ──────────────────────
  const dropdownItems = useMemo(() => {
    const items   = []
    const trimmed = query.trim()
    if (trimmed.length < MIN_CHARS) {
      recent.forEach(r => items.push({ type: 'recent', label: r }))
    } else if (suggestions) {
      suggestions.products.forEach(p => items.push({
        type: 'product', label: p.name, slug: p.slug,
        brand: p.brand, price: p.discounted_price, image: p.image,
      }))
      suggestions.brands.forEach(b => items.push({ type: 'brand', label: b }))
      suggestions.categories.forEach(c => items.push({ type: 'category', label: c.name, id: c.id }))
    }
    return items
  }, [query, suggestions, recent])

  const trimmedQuery = query.trim()
  const showRecent   = open && trimmedQuery.length < MIN_CHARS && recent.length > 0
  const showResults  = open && trimmedQuery.length >= MIN_CHARS
  const hasResults   = suggestions && (
    suggestions.products.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.categories.length > 0
  )

  // ── Styles ───────────────────────────────────────────
  const isNavbar = variant === 'navbar'

  const inputCls = isNavbar
    ? `w-full border-2 border-purple-200 rounded-xl px-4 py-2 pl-9 pr-9 text-sm
       text-gray-700 bg-purple-50 placeholder-gray-400
       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
       focus:bg-white transition-all`
    : `w-full border-2 border-purple-300 rounded-2xl px-4 py-3 pl-10 pr-9 text-sm
       text-gray-700 bg-white placeholder-gray-400
       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
       transition-all`

  // ── Render ───────────────────────────────────────────
  return (
    <div className="relative w-full">
      <form onSubmit={(e) => { e.preventDefault(); submitSearch(query) }}>
        <div className="relative">
          {/* Search icon */}
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
            className={inputCls}
          />

          {/* Right icon: spinner or clear */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <svg className="w-4 h-4 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : query ? (
              <button type="button"
                onClick={() => {
                  setQuery(''); setSuggestions(null); setOpen(false)
                  inputRef.current?.focus()
                  if (onSearch) onSearch('')
                }}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold">
                ✕
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* ── Dropdown ── */}
      {open && (showRecent || showResults) && (
        <div ref={dropdownRef}
          className="absolute top-full mt-2 left-0 right-0 z-[999] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">

          {/* ── MIN_CHARS hint ── */}
          {open && trimmedQuery.length > 0 && trimmedQuery.length < MIN_CHARS && (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">
              Type {MIN_CHARS - trimmedQuery.length} more character{MIN_CHARS - trimmedQuery.length > 1 ? 's' : ''} to search...
            </div>
          )}

          {/* ── Recent Searches ── */}
          {showRecent && (
            <>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {user ? '🕐 Recent Searches' : '🕐 Recent'}
                </span>
                <button onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                  Clear all
                </button>
              </div>
              {recent.map((r, i) => (
                <div key={r}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                    ${activeIdx === i ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => handleItemClick({ type: 'recent', label: r })}>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="text-sm text-gray-700 flex-1">{r}</span>
                  <button
                    onClick={e => { e.stopPropagation(); removeSearch(r) }}
                    className="text-gray-300 hover:text-red-400 text-xs transition-colors px-1">✕</button>
                </div>
              ))}
              <div className="h-px bg-gray-100 mx-4 my-1" />
            </>
          )}

          {/* ── Live Results ── */}
          {showResults && (
            <>
              {/* Loading skeleton */}
              {loading && !hasResults && (
                <div className="px-4 py-3 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full w-14 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {!loading && suggestions && !hasResults && (
                <div className="px-4 py-8 text-center">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-gray-600 mb-1">No results for "{trimmedQuery}"</p>
                  <p className="text-xs text-gray-400">Try different keywords or check spelling</p>
                  <button onClick={() => submitSearch(query)}
                    className="mt-3 inline-block bg-purple-50 text-purple-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-purple-100 transition-colors">
                    Search anyway →
                  </button>
                </div>
              )}

              {/* ── Products ── */}
              {suggestions?.products?.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Products</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {suggestions.products.map((p, i) => (
                    <div key={p.slug}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                        ${activeIdx === i ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => handleItemClick({ type: 'product', label: p.name, slug: p.slug })}>
                      <div className="w-10 h-10 bg-purple-50 rounded-xl overflow-hidden shrink-0 border border-purple-100">
                        {p.image
                          ? <img src={getProductImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🧴</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Highlight text={p.name}  query={trimmedQuery} className="text-sm font-semibold text-gray-800 block truncate" />
                        <Highlight text={p.brand} query={trimmedQuery} className="text-xs text-gray-400 block truncate" />
                      </div>
                      <span className="text-purple-600 text-sm font-bold shrink-0">Rs. {p.discounted_price}</span>
                    </div>
                  ))}
                </>
              )}

              {/* ── Brands ── */}
              {suggestions?.brands?.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 mx-4 mt-1" />
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brands</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {suggestions.brands.map((b, i) => {
                    const idx = (suggestions?.products?.length || 0) + i
                    return (
                      <div key={b}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                          ${activeIdx === idx ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleItemClick({ type: 'brand', label: b })}>
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 font-bold text-gray-500 text-sm">
                          {b[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Highlight text={b} query={trimmedQuery} className="text-sm font-semibold text-gray-800 block" />
                          <p className="text-xs text-gray-400">Browse all products</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </div>
                    )
                  })}
                </>
              )}

              {/* ── Categories ── */}
              {suggestions?.categories?.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 mx-4 mt-1" />
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {suggestions.categories.map((c, i) => {
                    const idx = (suggestions?.products?.length || 0) + (suggestions?.brands?.length || 0) + i
                    return (
                      <div key={c.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                          ${activeIdx === idx ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleItemClick({ type: 'category', label: c.name, id: c.id })}>
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 text-lg">📂</div>
                        <div className="flex-1 min-w-0">
                          <Highlight text={c.name} query={trimmedQuery} className="text-sm font-semibold text-gray-800 block" />
                          <p className="text-xs text-gray-400">Browse category</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </div>
                    )
                  })}
                </>
              )}

              {/* View all */}
              {hasResults && (
                <div className="border-t border-gray-100 px-4 py-3">
                  <button onClick={() => submitSearch(query)}
                    className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 text-xs font-bold transition-colors py-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    View all results for "{trimmedQuery}"
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}